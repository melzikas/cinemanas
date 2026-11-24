// Streaming de vídeo: envia o arquivo em pedaços (HTTP Range),
// assim o navegador pode começar a tocar antes de baixar tudo e permite avançar/voltar.
const fs = require('fs');
const express = require('express');
const db = require('../db');
const { exigirLogin } = require('../middlewares/auth');
const { TABELAS, lerId, videoDe } = require('../util/catalogo');

const router = express.Router();

router.get('/:id', exigirLogin, async (req, res, next) => {
  try {
    const ident = lerId(req.params.id);
    if (!ident) return res.status(404).json({ erro: 'Vídeo não encontrado.' });
    const T = TABELAS[ident.tipo];
    const [linhas] = await db.query(`SELECT nome FROM ${T.tabela} WHERE ${T.pk} = ?`, [ident.ref]);
    if (!linhas[0]) return res.status(404).json({ erro: 'Vídeo não encontrado.' });

    // videos/<nome-do-titulo>.mp4, ou videos/exemplo.mp4 se não existir
    const arquivo = videoDe(linhas[0].nome);
    if (!fs.existsSync(arquivo)) return res.status(404).json({ erro: 'Arquivo de vídeo não está na pasta /videos.' });

    const tamanho = fs.statSync(arquivo).size;
    const range = req.headers.range;

    if (!range) {
      res.writeHead(200, { 'Content-Length': tamanho, 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes' });
      return fs.createReadStream(arquivo).pipe(res);
    }

    // Ex.: "bytes=1000-" ou "bytes=1000-2000"
    const [inicioTxt, fimTxt] = range.replace(/bytes=/, '').split('-');
    const inicio = parseInt(inicioTxt, 10);
    const PEDACO = 1024 * 1024; // 1 MB por vez
    const fim = fimTxt ? parseInt(fimTxt, 10) : Math.min(inicio + PEDACO, tamanho - 1);

    if (isNaN(inicio) || inicio >= tamanho || fim >= tamanho || inicio > fim) {
      res.writeHead(416, { 'Content-Range': `bytes */${tamanho}` });
      return res.end();
    }

    res.writeHead(206, {
      'Content-Range': `bytes ${inicio}-${fim}/${tamanho}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': fim - inicio + 1,
      'Content-Type': 'video/mp4',
    });
    fs.createReadStream(arquivo, { start: inicio, end: fim }).pipe(res);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
