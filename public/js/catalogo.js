// Página principal: abas (Geral, Filmes, Séries, Assistidos), categorias, busca e favoritos

const TITULOS_SECAO = {
  geral: 'Títulos',
  filmes: 'Filmes',
  series: 'Séries',
  assistidos: 'Já vistos por você',
  favoritos: 'Favoritados',
};
const VAZIO_SECAO = {
  assistidos: 'Você ainda não assistiu nada. Escolha um título e dê o play!',
  favoritos: 'Você ainda não favoritou nenhum título.',
};

const grade = document.getElementById('grade');
const vazio = document.getElementById('vazio');
const tituloSecao = document.getElementById('titulo-secao');
const campoBusca = document.getElementById('busca');

// Lê o estado atual da URL (ex.: /?aba=filmes&categoria=comedia&q=friends)
function estado() {
  const p = new URLSearchParams(location.search);
  const aba = TITULOS_SECAO[p.get('aba')] ? p.get('aba') : 'geral';
  return { aba, categoria: p.get('categoria') || '', q: p.get('q') || '' };
}

function montarURL({ aba, categoria, q }) {
  const p = new URLSearchParams();
  if (aba && aba !== 'geral') p.set('aba', aba);
  if (categoria) p.set('categoria', categoria);
  if (q) p.set('q', q);
  const qs = p.toString();
  return '/' + (qs ? '?' + qs : '');
}

function atualizarLinks() {
  const { aba, categoria, q } = estado();

  document.querySelectorAll('#abas a').forEach((a) => {
    a.classList.toggle('ativo', a.dataset.aba === aba);
    a.href = montarURL({ aba: a.dataset.aba, categoria, q: '' });
  });
  document.getElementById('link-favoritos').classList.toggle('ativo', aba === 'favoritos');

  document.querySelectorAll('#lista-categorias a').forEach((a) => {
    const ativa = a.dataset.slug === categoria;
    a.classList.toggle('ativo', ativa);
    // clicar de novo na categoria ativa tira o filtro
    a.href = montarURL({ aba, categoria: ativa ? '' : a.dataset.slug, q });
  });

  let titulo = TITULOS_SECAO[aba];
  if (q) titulo = `Resultados para "${q}"`;
  tituloSecao.textContent = titulo;
  document.title = `${TITULOS_SECAO[aba]} | CineManas`;
}

async function carregarCategorias() {
  const categorias = await api('/api/categorias');
  document.getElementById('lista-categorias').innerHTML = categorias
    .map((c) => `<li><a data-slug="${escaparHTML(c.slug)}" href="#">${escaparHTML(c.nome)}</a></li>`)
    .join('');
}

async function carregarTitulos() {
  const { aba, categoria, q } = estado();
  const p = new URLSearchParams();
  if (aba === 'filmes') p.set('tipo', 'filme');
  if (aba === 'series') p.set('tipo', 'serie');
  if (aba === 'assistidos' || aba === 'favoritos') p.set('lista', aba);
  if (categoria) p.set('categoria', categoria);
  if (q) p.set('q', q);

  const titulos = await api('/api/titulos?' + p.toString());

  grade.innerHTML = titulos
    .map(
      (t) => `
      <a class="cartao" href="/titulo?id=${t.id}">
        <div class="poster"><img src="${escaparHTML(t.poster)}" referrerpolicy="no-referrer" alt="Pôster de ${escaparHTML(t.nome)}" loading="lazy" /></div>
        <span>${escaparHTML(t.nome)} | ${t.ano}</span>
      </a>`
    )
    .join('');

  vazio.classList.toggle('oculto', titulos.length > 0);
  vazio.textContent = q || categoria
    ? 'Nenhum título encontrado.'
    : VAZIO_SECAO[aba] || 'Nenhum título por aqui ainda.';
}

// Busca: atualiza a lista enquanto digita (com um pequeno atraso)
let espera;
campoBusca.addEventListener('input', () => {
  clearTimeout(espera);
  espera = setTimeout(() => {
    const atual = estado();
    history.replaceState(null, '', montarURL({ ...atual, q: campoBusca.value.trim() }));
    atualizarLinks();
    carregarTitulos();
  }, 300);
});

async function iniciar() {
  try {
    const usuario = await carregarUsuario();
    mostrarFoto(document.getElementById('avatar'), usuario.foto);
    campoBusca.value = estado().q;
    await carregarCategorias();
    atualizarLinks();
    await carregarTitulos();
  } catch (erro) {
    if (erro.status !== 401) {
      vazio.classList.remove('oculto');
      vazio.textContent = erro.message;
    }
  }
}

iniciar();
