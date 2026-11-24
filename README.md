# CineManas 🎬💖

Plataforma de streaming feita para a matéria de **Sistemas Web**.
Backend em **Node.js + Express**, banco **MySQL** e frontend em **HTML, CSS e JavaScript puro**.

## O que tem

- Login, cadastro e sair da conta (senha criptografada com bcrypt e sessão no servidor)
- Catálogo com abas **Geral, Filmes, Séries e Assistidos**
- Filtro por **categoria**, **pesquisa** por nome (ignora acentos) e lista de **Favoritos**
- Página do título com sinopse, temporadas/duração, elenco e botões **Assistir** e **Favoritos**
- **Player** com streaming de verdade (o servidor manda o vídeo em pedaços via HTTP Range)
- O que você assiste entra em **"Já vistos por você"**
- **Configurações**: trocar foto de perfil, bloquear categorias, trocar e-mail e senha
- **Modo escuro** (roxo) e modo claro (rosa), salvos na conta

## Como rodar

1. Instale o [Node.js](https://nodejs.org) (versão 18 ou mais nova) e o MySQL.
2. Crie o banco rodando `database/schema.sql` (tabelas) e depois `database/seed.sql` (dados iniciais):
   - No **MySQL Workbench**: File → Open SQL Script → escolha o arquivo → clique no raio ⚡ (um de cada vez, schema primeiro)
   - Ou no terminal:
     ```bash
     mysql -u root -p < database/schema.sql
     mysql -u root -p < database/seed.sql
     ```
3. Copie o arquivo `.env.example` para `.env` e coloque a senha do seu MySQL em `DB_PASSWORD`.
4. No terminal, dentro da pasta do projeto:
   ```bash
   npm install
   npm start
   ```
5. Abra **http://localhost:3000** no navegador.

**Usuária de teste:** `princesa@cinemanas.com` / `HarryStyles123`

## Estrutura

```
cinemanas/
├── server.js              # servidor Express (rotas das páginas e da API)
├── database/schema.sql    # criação das tabelas (banco cinemanaas)
├── database/seed.sql      # dados iniciais (usuária de teste, filmes, séries...)
├── data/preferencias.json # foto, tema e bloqueios (criado sozinho; ver abaixo)
├── src/
│   ├── db.js              # conexão com o MySQL
│   ├── middlewares/auth.js
│   └── routes/            # auth, titulos, categorias, usuario, stream
├── views/                 # páginas HTML
├── public/                # CSS, JavaScript do navegador e imagens
├── uploads/avatars/       # fotos de perfil enviadas
└── videos/                # vídeos que o player transmite
```

## Banco de dados

O banco se chama `cinemanaas` e tem estas tabelas:

| Tabela | Para que serve |
|---|---|
| `usuario` | contas (nome, e-mail, senha criptografada com bcrypt, tipo) |
| `categoria` | categorias (coluna ENUM) |
| `filmes` / `series` | o catálogo (`filmes.horas` guarda a duração em **minutos**) |
| `elenco` | atores e diretores |
| `categoria_has_filmes` / `categoria_has_series` | liga categorias ao catálogo (N:N) |
| `filmes_has_elenco` / `series_has_elenco` | liga elenco ao catálogo (N:N) |
| `favoritos_filmes` / `favoritos_series` | favoritos de cada usuária |
| `assistidos_filmes` / `assistidos_series` | histórico do que cada usuária viu |

**O que não está no banco:** o modelo não tem colunas para foto de perfil, tema (claro/escuro) e categorias bloqueadas. Isso fica em `data/preferencias.json`, por id de usuária. Se você recriar o banco, apague esse arquivo para não sobrar dado de usuárias antigas.

**Pôster e vídeo** também não são colunas: o servidor procura `public/img/posters/<nome-do-titulo>.jpg` e `videos/<nome-do-titulo>.mp4` (ex.: `outlander.mp4`). Se não achar, usa o logo e o `videos/exemplo.mp4`.

**Ids na API:** como filmes e séries são tabelas separadas, o id de um título é `f1` (filme 1) ou `s3` (série 3).

## Rotas da API

| Método | Rota | O que faz |
|---|---|---|
| POST | `/api/auth/login` | entrar |
| POST | `/api/auth/cadastro` | criar conta |
| POST | `/api/auth/logout` | sair |
| GET | `/api/auth/me` | dados da usuária logada |
| GET | `/api/categorias` | categorias (sem as bloqueadas) |
| GET | `/api/titulos?tipo=&categoria=&q=&lista=` | catálogo com filtros |
| GET | `/api/titulos/:id` | detalhes do título |
| POST | `/api/titulos/:id/favorito` | favoritar / desfavoritar |
| POST | `/api/titulos/:id/assistido` | marcar como assistido |
| GET | `/stream/:id` | vídeo do título (streaming) |
| POST | `/api/usuario/foto` | trocar foto de perfil |
| PUT | `/api/usuario/tema` | modo claro/escuro |
| PUT | `/api/usuario/credenciais` | trocar e-mail e senha |
| GET/PUT | `/api/usuario/bloqueios` | ver / salvar categorias bloqueadas |

## Trocando os vídeos

Todos os títulos usam o vídeo de exemplo `videos/exemplo.mp4`. Para colocar outro, salve o `.mp4` na pasta `videos/` com o nome do título, por exemplo `videos/outlander.mp4` ou `videos/tropa-de-elite.mp4`. O servidor encontra sozinho, sem mexer no banco.
