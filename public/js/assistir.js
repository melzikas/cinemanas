// Player: toca o vídeo pelo streaming do servidor e marca como "assistido"
const id = new URLSearchParams(location.search).get('id');
const video = document.getElementById('video');
let jaMarcado = false;

async function iniciar() {
  try {
    await carregarUsuario();
    const t = await api('/api/titulos/' + encodeURIComponent(id));
    document.getElementById('nome').textContent = `${t.nome} (${t.ano})`;
    document.getElementById('voltar').href = `/titulo?id=${t.id}`;
    document.title = `Assistindo ${t.nome} | CineManas`;
    video.src = `/stream/${t.id}`;
  } catch (erro) {
    if (erro.status !== 401) document.getElementById('nome').textContent = erro.message;
  }
}

// Quando começar a tocar, entra em "Já vistos por você"
video.addEventListener('play', async () => {
  if (jaMarcado) return;
  jaMarcado = true;
  try {
    await api(`/api/titulos/${encodeURIComponent(id)}/assistido`, { method: 'POST' });
  } catch (_) {
    jaMarcado = false;
  }
});

video.addEventListener('error', () => {
  document.getElementById('nome').textContent = 'Não foi possível carregar o vídeo deste título.';
});

iniciar();
