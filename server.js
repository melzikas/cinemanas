// =========================================================
//  CineManas - servidor Node.js + Express
// =========================================================
require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const { exigirLoginPagina } = require('./src/middlewares/auth');

const app = express();
const PORTA = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'segredo_temporario_cinemanas_123',
  resave: false,
  saveUninitialized: false
}));
// Arquivos estáticos (CSS, JS, imagens) e fotos de perfil enviadas
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- API ----------
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/categorias', require('./src/routes/categorias'));
app.use('/api/titulos', require('./src/routes/titulos'));
app.use('/api/usuario', require('./src/routes/usuario'));
app.use('/stream', require('./src/routes/stream'));
app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

// ---------- Páginas ----------
const pagina = (arquivo) => (req, res) => res.sendFile(path.join(__dirname, 'views', arquivo));

app.get('/login', (req, res, next) => (req.session.usuarioId ? res.redirect('/') : next()), pagina('login.html'));
app.get('/cadastro', (req, res, next) => (req.session.usuarioId ? res.redirect('/') : next()), pagina('cadastro.html'));
app.get('/', exigirLoginPagina, pagina('index.html'));
app.get('/titulo', exigirLoginPagina, pagina('titulo.html'));
app.get('/assistir', exigirLoginPagina, pagina('assistir.html'));
app.get('/configuracoes', exigirLoginPagina, pagina('configuracoes.html'));

app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'views', '404.html')));

// Tratamento de erros (ex.: banco fora do ar)
app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith('/api') || req.path.startsWith('/stream')) {
    return res.status(err.status || 500).json({ erro: err.mensagem || 'Erro interno no servidor.' });
  }
  res.status(500).send('Erro interno no servidor.');
});

app.listen(PORTA, () => {
  console.log(`CineManas rodando em http://localhost:${PORTA}`);
});
