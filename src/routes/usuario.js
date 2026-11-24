const fs = require('fs');
const path = require('path');
const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const db = require('../db');
const { exigirLogin } = require('../middlewares/auth');
const preferencias = require('../util/preferencias');
const { listarCategorias } = require('../util/catalogo');

const router = express.Router();
router.use(exigirLogin);

// ---------- Upload da foto de perfil ----------
const PASTA_FOTOS = path.join(__dirname, '..', '..', 'uploads', 'avatars');
fs.mkdirSync(PASTA_FOTOS, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: PASTA_FOTOS,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `usuario-${req.session.usuarioId}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype);
    cb(ok ? null : Object.assign(new Error('Formato inválido'), { status: 400, mensagem: 'Envie uma imagem JPG, PNG, WEBP ou GIF.' }), ok);
  },
});

// POST /api/usuario/foto
router.post('/foto', (req, res, next) => {
  upload.single('foto')(req, res, async (erro) => {
    if (erro) {
      const mensagem = erro.code === 'LIMIT_FILE_SIZE' ? 'A imagem pode ter no máximo 2 MB.' : erro.mensagem || 'Não foi possível enviar a imagem.';
      return res.status(400).json({ erro: mensagem });
    }
    if (!req.file) return res.status(400).json({ erro: 'Escolha uma imagem.' });
    try {
      const uid = req.session.usuarioId;
      const antiga = preferencias.obter(uid).foto;
      const foto = `/uploads/avatars/${req.file.filename}`;
      preferencias.atualizar(uid, { foto });

      // apaga a foto anterior para não acumular arquivos
      if (antiga) {
        fs.unlink(path.join(PASTA_FOTOS, path.basename(antiga)), () => {});
      }
      res.json({ foto });
    } catch (e) {
      next(e);
    }
  });
});

// PUT /api/usuario/tema  { tema: 'claro' | 'escuro' }
router.put('/tema', async (req, res, next) => {
  try {
    const tema = req.body.tema === 'escuro' ? 'escuro' : 'claro';
    preferencias.atualizar(req.session.usuarioId, { tema });
    res.json({ tema });
  } catch (e) {
    next(e);
  }
});

// PUT /api/usuario/credenciais  { email, senhaAtual, novaSenha }
router.put('/credenciais', async (req, res, next) => {
  try {
    const uid = req.session.usuarioId;
    const email = String(req.body.email || '').trim().toLowerCase();
    const senhaAtual = String(req.body.senhaAtual || '');
    const novaSenha = String(req.body.novaSenha || '');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ erro: 'E-mail inválido.' });
    if (email.length > 50) return res.status(400).json({ erro: 'O e-mail pode ter no máximo 50 caracteres.' });
    if (novaSenha && novaSenha.length < 6) return res.status(400).json({ erro: 'A nova senha precisa ter pelo menos 6 caracteres.' });

    const [linhas] = await db.query('SELECT senha FROM usuario WHERE id_usuario = ?', [uid]);
    if (!linhas[0] || !(await bcrypt.compare(senhaAtual, linhas[0].senha))) {
      return res.status(401).json({ erro: 'Senha atual incorreta.' });
    }

    const [outro] = await db.query('SELECT id_usuario FROM usuario WHERE email = ? AND id_usuario <> ?', [email, uid]);
    if (outro.length) return res.status(409).json({ erro: 'Esse e-mail já está em uso.' });

    if (novaSenha) {
      const hash = await bcrypt.hash(novaSenha, 10);
      await db.query('UPDATE usuario SET email = ?, senha = ? WHERE id_usuario = ?', [email, hash, uid]);
    } else {
      await db.query('UPDATE usuario SET email = ? WHERE id_usuario = ?', [email, uid]);
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// GET /api/usuario/bloqueios  -> todas as categorias com a marcação de bloqueada
router.get('/bloqueios', async (req, res, next) => {
  try {
    const bloqueadas = new Set(preferencias.obter(req.session.usuarioId).bloqueios);
    const categorias = await listarCategorias();
    res.json(categorias.map((c) => ({ id: c.id, nome: c.nome, bloqueada: bloqueadas.has(c.id) })));
  } catch (e) {
    next(e);
  }
});

// PUT /api/usuario/bloqueios  { categorias: [1, 3] }
router.put('/bloqueios', async (req, res, next) => {
  try {
    const pedidas = Array.isArray(req.body.categorias) ? req.body.categorias.map(Number) : [];
    const existentes = new Set((await listarCategorias()).map((c) => c.id));
    const ids = [...new Set(pedidas.filter((n) => existentes.has(n)))];
    preferencias.atualizar(req.session.usuarioId, { bloqueios: ids });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
