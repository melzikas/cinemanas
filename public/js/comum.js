// Funções usadas em todas as páginas

// Chama a API do servidor e já trata erros e login expirado
async function api(caminho, opcoes = {}) {
  const config = { credentials: 'same-origin', ...opcoes, headers: { ...(opcoes.headers || {}) } };
  if (config.body && !(config.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(config.body);
  }
  const resposta = await fetch(caminho, config);
  let dados = null;
  try { dados = await resposta.json(); } catch (_) { /* sem corpo */ }

  if (resposta.status === 401 && !caminho.startsWith('/api/auth/login')) {
    if (!location.pathname.startsWith('/login') && !location.pathname.startsWith('/cadastro')) {
      location.href = '/login';
    }
  }
  if (!resposta.ok) {
    const erro = new Error((dados && dados.erro) || 'Algo deu errado. Tente de novo.');
    erro.status = resposta.status;
    throw erro;
  }
  return dados;
}

// Modo claro / escuro
function aplicarTema(tema) {
  const t = tema === 'escuro' ? 'escuro' : 'claro';
  document.documentElement.dataset.tema = t;
  localStorage.setItem('tema', t);
}

// Pega os dados da usuária logada e sincroniza o tema salvo no banco
async function carregarUsuario() {
  const usuario = await api('/api/auth/me');
  aplicarTema(usuario.tema);
  return usuario;
}

// Coloca a foto de perfil (ou deixa o círculo escuro do mockup)
function mostrarFoto(elemento, foto) {
  elemento.style.backgroundImage = foto ? `url("${foto}")` : '';
}

// Evita que textos vindos do banco virem HTML
function escaparHTML(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
