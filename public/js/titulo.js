// Página de detalhes do título
const id = new URLSearchParams(location.search).get('id');
const botaoFav = document.getElementById('botao-favorito');
const estrela = document.getElementById('estrela-fav');

function mostrarFavorito(favorito) {
  botaoFav.textContent = favorito ? 'Favoritado' : 'Favoritos';
  botaoFav.setAttribute('aria-pressed', String(favorito));
  estrela.classList.toggle('apagada', !favorito);
  estrela.alt = favorito ? 'Está nos favoritos' : '';
}

async function iniciar() {
  const mensagem = document.getElementById('mensagem');
  try {
    await carregarUsuario();
    const t = await api('/api/titulos/' + encodeURIComponent(id));

    document.title = `${t.nome} (${t.ano}) | CineManas`;
    document.getElementById('poster').referrerPolicy = 'no-referrer';
    document.getElementById('poster').src = t.poster;
    document.getElementById('poster').alt = `Pôster de ${t.nome}`;
    document.getElementById('nome').textContent = `${t.nome.toUpperCase()} (${t.ano})`;
    document.getElementById('sinopse').textContent = t.sinopse;

    const info = document.getElementById('info-extra');
    if (t.tipo === 'serie' && t.temporadas) info.textContent = `${t.temporadas} ${t.temporadas === 1 ? 'temporada' : 'temporadas'}`;
    else if (t.duracao_min) info.textContent = `Filme • ${Math.floor(t.duracao_min / 60)}h${String(t.duracao_min % 60).padStart(2, '0')}`;

    document.getElementById('etiquetas').innerHTML = (t.categorias || '')
      .split(', ')
      .filter(Boolean)
      .map((c) => `<span>${escaparHTML(c)}</span>`)
      .join('');

    document.getElementById('botao-assistir').href = `/assistir?id=${t.id}`;
    mostrarFavorito(t.favorito);

    if (t.elenco) {
      document.getElementById('elenco').textContent = t.elenco;
      document.getElementById('bloco-elenco').classList.remove('oculto');
    }
    document.getElementById('detalhe').classList.remove('oculto');
  } catch (erro) {
    if (erro.status !== 401) mensagem.textContent = erro.message;
  }
}

botaoFav.addEventListener('click', async () => {
  botaoFav.disabled = true;
  try {
    const r = await api(`/api/titulos/${encodeURIComponent(id)}/favorito`, { method: 'POST' });
    mostrarFavorito(r.favorito);
  } catch (erro) {
    alert(erro.message);
  } finally {
    botaoFav.disabled = false;
  }
});

iniciar();
