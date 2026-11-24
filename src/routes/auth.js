const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const preferencias = require('../util/preferencias');

const router = express.Router();
const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const senha = String(req.body.senha || '');
    if (!email || !senha) return res.status(400).json({ erro: 'Preencha e-mail e senha.' });

    // a coluna "senha" guarda o hash bcrypt (60 caracteres)
    const [linhas] = await db.query('SELECT id_usuario, senha FROM usuario WHERE email = ?', [email]);
    const usuario = linhas[0];
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    req.session.usuarioId = usuario.id_usuario;
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/cadastro
router.post('/cadastro', async (req, res, next) => {
  try {
    const nome = String(req.body.nome || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const senha = String(req.body.senha || '');

    if (!nome) return res.status(400).json({ erro: 'Informe seu nome.' });
    if (nome.length > 50) return res.status(400).json({ erro: 'O nome pode ter no máximo 50 caracteres.' });
    if (!emailValido(email)) return res.status(400).json({ erro: 'E-mail inválido.' });
    if (email.length > 50) return res.status(400).json({ erro: 'O e-mail pode ter no máximo 50 caracteres.' });
    if (senha.length < 6) return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });

    const [existe] = await db.query('SELECT id_usuario FROM usuario WHERE email = ?', [email]);
    if (existe.length) return res.status(409).json({ erro: 'Esse e-mail já está cadastrado.' });

    const hash = await bcrypt.hash(senha, 10);
    const [resultado] = await db.query(
      'INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, hash]
    );
    req.session.usuarioId = resultado.insertId;
    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// GET /api/auth/me  -> dados da usuária logada
router.get('/me', async (req, res, next) => {
  try {
    if (!req.session.usuarioId) return res.status(401).json({ erro: 'Não logado.' });
    const [linhas] = await db.query(
      'SELECT id_usuario AS id, nome, email FROM usuario WHERE id_usuario = ?',
      [req.session.usuarioId]
    );
    if (!linhas[0]) return res.status(401).json({ erro: 'Não logado.' });

    const { foto, tema } = preferencias.obter(linhas[0].id);
    res.json({ ...linhas[0], foto, tema });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
