// Bloqueia as rotas para quem não fez login
function exigirLogin(req, res, next) {
  if (req.session && req.session.usuarioId) return next();
  return res.status(401).json({ erro: 'Faça login para continuar.' });
}

// Para páginas HTML: manda para o login em vez de devolver erro
function exigirLoginPagina(req, res, next) {
  if (req.session && req.session.usuarioId) return next();
  return res.redirect('/login');
}

module.exports = { exigirLogin, exigirLoginPagina };
