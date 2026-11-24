const express = require('express');
const { exigirLogin } = require('../middlewares/auth');
const preferencias = require('../util/preferencias');
const { listarCategorias } = require('../util/catalogo');

const router = express.Router();

// GET /api/categorias  -> categorias que a usuária NÃO bloqueou
router.get('/', exigirLogin, async (req, res, next) => {
  try {
    const bloqueadas = new Set(preferencias.obter(req.session.usuarioId).bloqueios);
    const categorias = await listarCategorias();
    res.json(categorias.filter((c) => !bloqueadas.has(c.id)));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
