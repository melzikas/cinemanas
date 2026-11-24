// Configurações: foto, bloqueio de categorias, e-mail/senha e modo escuro
const avatar = document.getElementById('avatar');

function aviso(id, texto, ok = true) {
  const el = document.getElementById(id);
  el.className = ok ? 'aviso-ok' : 'aviso-erro';
  el.textContent = texto;
  if (ok) setTimeout(() => { if (el.textContent === texto) el.textContent = ''; }, 3000);
}

// Abre/fecha cada item ao clicar no título
document.querySelectorAll('[data-abre]').forEach((botao) => {
  botao.setAttribute('aria-expanded', 'false');
  botao.addEventListener('click', () => {
    const corpo = document.getElementById(botao.dataset.abre);
    const abrir = corpo.classList.contains('oculto');
    corpo.classList.toggle('oculto', !abrir);
    botao.setAttribute('aria-expanded', String(abrir));
  });
});

// ---------- Foto ----------
document.getElementById('corpo-foto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const arquivo = document.getElementById('arquivo-foto').files[0];
  if (!arquivo) return aviso('aviso-foto', 'Escolha uma imagem.', false);
  const dados = new FormData();
  dados.append('foto', arquivo);
  try {
    const r = await api('/api/usuario/foto', { method: 'POST', body: dados });
    mostrarFoto(avatar, r.foto);
    aviso('aviso-foto', 'Foto atualizada!');
  } catch (erro) {
    aviso('aviso-foto', erro.message, false);
  }
});

// ---------- Bloqueios ----------
async function carregarBloqueios() {
  const categorias = await api('/api/usuario/bloqueios');
  document.getElementById('lista-bloqueios').innerHTML = categorias
    .map(
      (c) => `<label><input type="checkbox" value="${c.id}" ${c.bloqueada ? 'checked' : ''} /> ${escaparHTML(c.nome)}</label>`
    )
    .join('');
}

document.getElementById('corpo-bloqueio').addEventListener('submit', async (e) => {
  e.preventDefault();
  const ids = [...document.querySelectorAll('#lista-bloqueios input:checked')].map((i) => Number(i.value));
  try {
    await api('/api/usuario/bloqueios', { method: 'PUT', body: { categorias: ids } });
    aviso('aviso-bloqueio', 'Bloqueios salvos!');
  } catch (erro) {
    aviso('aviso-bloqueio', erro.message, false);
  }
});

// ---------- E-mail e senha ----------
document.getElementById('corpo-credenciais').addEventListener('submit', async (e) => {
  e.preventDefault();
  const senhaAtual = document.getElementById('senha-atual');
  const novaSenha = document.getElementById('nova-senha');
  try {
    await api('/api/usuario/credenciais', {
      method: 'PUT',
      body: {
        email: document.getElementById('novo-email').value,
        novaSenha: novaSenha.value,
        senhaAtual: senhaAtual.value,
      },
    });
    senhaAtual.value = '';
    novaSenha.value = '';
    aviso('aviso-credenciais', 'Dados atualizados!');
  } catch (erro) {
    aviso('aviso-credenciais', erro.message, false);
  }
});

// ---------- Modo escuro ----------
const chave = document.getElementById('chave-tema');
function mostrarTema(tema) {
  chave.checked = tema === 'escuro';
  document.getElementById('texto-tema').textContent = chave.checked ? 'Ligado' : 'Desligado';
}
chave.addEventListener('change', async () => {
  const tema = chave.checked ? 'escuro' : 'claro';
  aplicarTema(tema);
  mostrarTema(tema);
  try {
    await api('/api/usuario/tema', { method: 'PUT', body: { tema } });
  } catch (_) { /* fica salvo no navegador mesmo assim */ }
});

// ---------- Sair ----------
document.getElementById('sair').addEventListener('click', async () => {
  await api('/api/auth/logout', { method: 'POST' });
  location.href = '/login';
});

async function iniciar() {
  try {
    const usuario = await carregarUsuario();
    mostrarFoto(avatar, usuario.foto);
    document.getElementById('saudacao').textContent = `Olá, ${usuario.nome}!`;
    document.getElementById('novo-email').value = usuario.email;
    mostrarTema(usuario.tema);
    await carregarBloqueios();
  } catch (_) { /* 401 já redireciona */ }
}

iniciar();
