const express = require('express');
const db = require('../db');
const { exigirLogin } = require('../middlewares/auth');
const preferencias = require('../util/preferencias');
const {
  TABELAS, SQL_TITULOS, SQL_FAVORITOS, SQL_ASSISTIDOS, SQL_CATEGORIAS_DO_TITULO,
  lerId, posterDe, listarCategorias,
} = require('../util/catalogo');

const router = express.Router();
router.use(exigirLogin);

// Confere se o título existe. Devolve { T, ref, tipo } ou null
async function acharTitulo(idTexto) {
  const ident = lerId(idTexto);
  if (!ident) return null;
  const T = TABELAS[ident.tipo];
  const [linhas] = await db.query(`SELECT 1 FROM ${T.tabela} WHERE ${T.pk} = ?`, [ident.ref]);
  return linhas.length ? { T, ref: ident.ref, tipo: ident.tipo } : null;
}

// GET /api/titulos?tipo=filme|serie&categoria=slug&q=texto&lista=favoritos|assistidos
router.get('/', async (req, res, next) => {
  try {
    const uid = req.session.usuarioId;
    const { tipo, categoria, q, lista } = req.query;

    const juncoes = [];
    const filtros = [];
    const params = []; // na mesma ordem em que os "?" aparecem no SQL

    if (lista === 'favoritos') {
      juncoes.push(`JOIN ${SQL_FAVORITOS} l ON l.tid = t.id AND l.id_usuario = ?`);
      params.push(uid);
    } else if (lista === 'assistidos') {
      juncoes.push(`JOIN ${SQL_ASSISTIDOS} l ON l.tid = t.id AND l.id_usuario = ?`);
      params.push(uid);
    }

    // esconde títulos de categorias bloqueadas pela usuária
    const bloqueadas = preferencias.obter(uid).bloqueios;
    if (bloqueadas.length) {
      filtros.push(`NOT EXISTS (SELECT 1 FROM ${SQL_CATEGORIAS_DO_TITULO} b WHERE b.tid = t.id AND b.id_categoria IN (?))`);
      params.push(bloqueadas);
    }
    if (tipo === 'filme' || tipo === 'serie') {
      filtros.push('t.tipo = ?');
      params.push(tipo);
    }
    if (categoria) {
      const cat = (await listarCategorias()).find((c) => c.slug === String(categoria));
      if (!cat) return res.json([]);
      filtros.push(`EXISTS (SELECT 1 FROM ${SQL_CATEGORIAS_DO_TITULO} c WHERE c.tid = t.id AND c.id_categoria = ?)`);
      params.push(cat.id);
    }
    if (q && String(q).trim()) {
      filtros.push('t.nome LIKE ?');
      params.push(`%${String(q).trim()}%`);
    }

    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
    const [linhas] = await db.query(
      `SELECT t.id, t.nome, t.ano, t.tipo FROM ${SQL_TITULOS} t ${juncoes.join(' ')} ${where} ORDER BY t.nome`,
      params
    );
    res.json(linhas.map((t) => ({ ...t, poster: posterDe(t.nome) })));
  } catch (e) {
    next(e);
  }
});

// GET /api/titulos/:id  -> detalhes de um título
router.get('/:id', async (req, res, next) => {
  try {
    const uid = req.session.usuarioId;
    const achado = await acharTitulo(req.params.id);
    if (!achado) return res.status(404).json({ erro: 'Título não encontrado.' });
    const { T, ref } = achado;
    const id = `${T.prefixo}${ref}`;

    const [[titulo]] = await db.query(
      `SELECT t.id, t.nome, t.ano, t.tipo, t.sinopse, t.temporadas, t.duracao_min FROM ${SQL_TITULOS} t WHERE t.id = ?`,
      [id]
    );

    const [cats] = await db.query(
      `SELECT c.id_categoria AS id, c.categoria AS nome
         FROM ${T.categorias} x JOIN categoria c ON c.id_categoria = x.id_categoria
        WHERE x.${T.pk} = ?`,
      [ref]
    );
    const bloqueadas = preferencias.obter(uid).bloqueios;
    if (cats.some((c) => bloqueadas.includes(c.id))) {
      return res.status(403).json({ erro: 'Este conteúdo está bloqueado nas suas configurações.' });
    }

    const [atores] = await db.query(
      `SELECT e.ator
         FROM ${T.elenco} x JOIN elenco e ON e.id_elenco = x.id_elenco
        WHERE x.${T.pk} = ? AND e.ator IS NOT NULL
        ORDER BY e.id_elenco`,
      [ref]
    );
    const [fav] = await db.query(`SELECT 1 FROM ${T.favoritos} WHERE id_usuario = ? AND ${T.pk} = ?`, [uid, ref]);

    res.json({
      ...titulo,
      poster: posterDe(titulo.nome),
      categorias: cats.map((c) => c.nome).sort((a, b) => a.localeCompare(b, 'pt-BR')).join(', '),
      elenco: atores.map((a) => a.ator).join(', ') || null,
      favorito: fav.length > 0,
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/titulos/:id/favorito  -> adiciona ou remove dos favoritos
router.post('/:id/favorito', async (req, res, next) => {
  try {
    const uid = req.session.usuarioId;
    const achado = await acharTitulo(req.params.id);
    if (!achado) return res.status(404).json({ erro: 'Título não encontrado.' });
    const { T, ref } = achado;

    const [apagado] = await db.query(`DELETE FROM ${T.favoritos} WHERE id_usuario = ? AND ${T.pk} = ?`, [uid, ref]);
    if (apagado.affectedRows > 0) return res.json({ favorito: false });

    await db.query(`INSERT INTO ${T.favoritos} (id_usuario, ${T.pk}) VALUES (?, ?)`, [uid, ref]);
    res.json({ favorito: true });
  } catch (e) {
    next(e);
  }
});

// POST /api/titulos/:id/assistido  -> registra no histórico "Já vistos por você"
router.post('/:id/assistido', async (req, res, next) => {
  try {
    const uid = req.session.usuarioId;
    const achado = await acharTitulo(req.params.id);
    if (!achado) return res.status(404).json({ erro: 'Título não encontrado.' });
    const { T, ref } = achado;

    await db.query(`INSERT IGNORE INTO ${T.assistidos} (id_usuario, ${T.pk}) VALUES (?, ?)`, [uid, ref]);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
