// Ajuda a juntar FILMES e SÉRIES (tabelas separadas no banco) num catálogo só,
// do jeito que o front-end espera: um "título" com id, tipo, pôster etc.
//
// O id de um título na API é uma string: "f1" = filme 1, "s3" = série 3.
const fs = require('fs');
const path = require('path');
const db = require('../db');

const RAIZ = path.join(__dirname, '..', '..');
const PASTA_POSTERS = path.join(RAIZ, 'public', 'img', 'posters');
const PASTA_VIDEOS = path.join(RAIZ, 'videos');

// Nomes de tabelas/colunas de cada tipo (valores fixos, nunca vêm do usuário)
const TABELAS = {
  filme: { prefixo: 'f', tabela: 'filmes', pk: 'id_filmes', categorias: 'categoria_has_filmes', elenco: 'filmes_has_elenco', favoritos: 'favoritos_filmes', assistidos: 'assistidos_filmes' },
  serie: { prefixo: 's', tabela: 'series', pk: 'id_series', categorias: 'categoria_has_series', elenco: 'series_has_elenco', favoritos: 'favoritos_series', assistidos: 'assistidos_series' },
};

// ---------- Trechos SQL que "unem" filmes e séries ----------
// duracao_min vem de filmes.horas (guardada em minutos) e temporadas de series.temps
const SQL_TITULOS = `(
  SELECT CONCAT('f', id_filmes) AS id, id_filmes AS ref, 'filme' AS tipo, nome, YEAR(dataa) AS ano,
         sinopse, NULL AS temporadas, horas AS duracao_min
    FROM filmes
  UNION ALL
  SELECT CONCAT('s', id_series), id_series, 'serie', nome, YEAR(dataa),
         sinopse, temps, NULL
    FROM series
)`;
const SQL_FAVORITOS = `(
  SELECT id_usuario, CONCAT('f', id_filmes) AS tid FROM favoritos_filmes
  UNION ALL
  SELECT id_usuario, CONCAT('s', id_series) FROM favoritos_series
)`;
const SQL_ASSISTIDOS = `(
  SELECT id_usuario, CONCAT('f', id_filmes) AS tid FROM assistidos_filmes
  UNION ALL
  SELECT id_usuario, CONCAT('s', id_series) FROM assistidos_series
)`;
const SQL_CATEGORIAS_DO_TITULO = `(
  SELECT id_categoria, CONCAT('f', id_filmes) AS tid FROM categoria_has_filmes
  UNION ALL
  SELECT id_categoria, CONCAT('s', id_series) FROM categoria_has_series
)`;

// ---------- Utilidades ----------
// "O Auto da Compadecida" -> "o-auto-da-compadecida"
function slugify(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Lê "f1" / "s3" e devolve { tipo: 'filme', ref: 1 } (ou null se inválido)
function lerId(texto) {
  const m = /^([fs])(\d+)$/.exec(String(texto));
  if (!m) return null;
  return { tipo: m[1] === 'f' ? 'filme' : 'serie', ref: Number(m[2]) };
}

// Procura na pasta um arquivo cujo nome (sem extensão) combine com o título.
// Ex.: "The Big Bang Theory" encontra big-bang-theory.jpg
function acharArquivo(pasta, nome, extensoes) {
  let arquivos;
  try { arquivos = fs.readdirSync(pasta); } catch (_) { return null; }
  const slug = slugify(nome);
  const candidatos = arquivos
    .filter((f) => extensoes.includes(path.extname(f).toLowerCase()))
    .map((f) => ({ f, base: slugify(path.basename(f, path.extname(f))) }));
  const exato = candidatos.find((c) => c.base === slug);
  if (exato) return exato.f;
  const parcial = candidatos.find((c) => c.base && slug.endsWith('-' + c.base));
  return parcial ? parcial.f : null;
}

// Pôsteres que vêm de um link da internet: src/util/posters-externos.json
// (formato: "slug-do-titulo": "https://...jpg"). Lido uma vez ao ligar o servidor.
let POSTERS_EXTERNOS = {};
try {
  POSTERS_EXTERNOS = JSON.parse(fs.readFileSync(path.join(__dirname, 'posters-externos.json'), 'utf8'));
} catch (_) { /* sem o arquivo, só vale a pasta de pôsteres */ }

// Pôster, nesta ordem: 1) public/img/posters/<nome-do-titulo>.jpg
// 2) link em posters-externos.json  3) logo do site
function posterDe(nome) {
  const arquivo = acharArquivo(PASTA_POSTERS, nome, ['.jpg', '.jpeg', '.png', '.webp']);
  if (arquivo) return `/img/posters/${arquivo}`;
  return POSTERS_EXTERNOS[slugify(nome)] || '/img/logo.png';
}

// Vídeo: videos/<nome-do-titulo>.mp4 (ou exemplo.mp4, se não existir)
function videoDe(nome) {
  const arquivo = acharArquivo(PASTA_VIDEOS, nome, ['.mp4']);
  return path.join(PASTA_VIDEOS, arquivo || 'exemplo.mp4');
}

// Todas as categorias, com o slug usado nos filtros do front
async function listarCategorias() {
  const [linhas] = await db.query('SELECT id_categoria AS id, categoria AS nome FROM categoria');
  return linhas
    .map((c) => ({ id: c.id, nome: c.nome, slug: slugify(c.nome) }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

module.exports = {
  TABELAS, SQL_TITULOS, SQL_FAVORITOS, SQL_ASSISTIDOS, SQL_CATEGORIAS_DO_TITULO,
  slugify, lerId, posterDe, videoDe, listarCategorias,
};
