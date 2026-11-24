// O modelo do banco (database/schema.sql) não tem colunas para foto de perfil,
// tema (claro/escuro) nem categorias bloqueadas. Esses dados ficam num arquivo
// JSON simples (data/preferencias.json), guardados pelo id da usuária.
const fs = require('fs');
const path = require('path');

const ARQUIVO = path.join(__dirname, '..', '..', 'data', 'preferencias.json');
let cache = null;

function carregar() {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'));
  } catch (_) {
    cache = {};
  }
  return cache;
}

function salvar() {
  fs.mkdirSync(path.dirname(ARQUIVO), { recursive: true });
  const temporario = ARQUIVO + '.tmp';
  fs.writeFileSync(temporario, JSON.stringify(cache, null, 2));
  fs.renameSync(temporario, ARQUIVO);
}

// Devolve { foto, tema, bloqueios } com valores padrão
function obter(usuarioId) {
  const d = carregar()[usuarioId] || {};
  return {
    foto: d.foto || null,
    tema: d.tema === 'escuro' ? 'escuro' : 'claro',
    bloqueios: Array.isArray(d.bloqueios) ? d.bloqueios.map(Number) : [],
  };
}

// Atualiza só os campos informados, ex.: atualizar(1, { tema: 'escuro' })
function atualizar(usuarioId, parte) {
  const dados = carregar();
  dados[usuarioId] = { ...(dados[usuarioId] || {}), ...parte };
  salvar();
}

module.exports = { obter, atualizar };
