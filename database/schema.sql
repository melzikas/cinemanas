CREATE DATABASE IF NOT EXISTS cinemanaas;
USE cinemanaas;

-- 1. Tabela de Usuários
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    tipo_usuario INT NOT NULL DEFAULT 1,
    CONSTRAINT chk_tamanho_senha
        CHECK (CHAR_LENGTH(senha) >= 8)
);

-- 2. Tabela de Categorias
CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    categoria ENUM(
        'Ação',
        'Comédia',
        'Drama',
        'Ficção Científica (Sci-Fi)',
        'Terror / Horror',
        'Suspense',
        'Romance',
        'Documentário',
        'Fantasia',
        'Animação',
        'O choro é livre',
        'Para aquecer o coração',
        'Nostálgico',
        'Queer',
        'Risadinha',
        'Família',
        'Cinekids'
    ) NOT NULL UNIQUE
);

-- 3. Tabela de Elenco
CREATE TABLE elenco (
    id_elenco INT AUTO_INCREMENT PRIMARY KEY,
    ator VARCHAR(100),
    diretor VARCHAR(100)
);

-- 4. Tabela de Filmes
CREATE TABLE filmes (
    id_filmes INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    horas INT,
    sinopse VARCHAR(200),
    dataa DATE,
    classificacao INT
);

-- 5. Tabela de Séries
CREATE TABLE series (
    id_series INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    temps INT,
    classificacao INT,
    sinopse VARCHAR(200),
    dataa DATE
);

-- --- TABELAS ASSOCIATIVAS (CATÁLOGO) ---

CREATE TABLE categoria_has_filmes (
    id_categoria INT NOT NULL,
    id_filmes INT NOT NULL,
    PRIMARY KEY (id_categoria, id_filmes),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE CASCADE,
    FOREIGN KEY (id_filmes) REFERENCES filmes(id_filmes) ON DELETE CASCADE
);

CREATE TABLE categoria_has_series (
    id_categoria INT NOT NULL,
    id_series INT NOT NULL,
    PRIMARY KEY (id_categoria, id_series),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE CASCADE,
    FOREIGN KEY (id_series) REFERENCES series(id_series) ON DELETE CASCADE
);

CREATE TABLE filmes_has_elenco (
    id_filmes INT NOT NULL,
    id_elenco INT NOT NULL,
    PRIMARY KEY (id_filmes, id_elenco),
    FOREIGN KEY (id_filmes) REFERENCES filmes(id_filmes) ON DELETE CASCADE,
    FOREIGN KEY (id_elenco) REFERENCES elenco(id_elenco) ON DELETE CASCADE
);

CREATE TABLE series_has_elenco (
    id_series INT NOT NULL,
    id_elenco INT NOT NULL,
    PRIMARY KEY (id_series, id_elenco),
    FOREIGN KEY (id_series) REFERENCES series(id_series) ON DELETE CASCADE,
    FOREIGN KEY (id_elenco) REFERENCES elenco(id_elenco) ON DELETE CASCADE
);

-- --- TABELAS ASSOCIATIVAS (INTERAÇÃO DO UTILIZADOR) ---

CREATE TABLE favoritos_filmes (
    id_usuario INT NOT NULL,
    id_filmes INT NOT NULL,
    PRIMARY KEY (id_usuario, id_filmes),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_filmes) REFERENCES filmes(id_filmes) ON DELETE CASCADE
);

CREATE TABLE favoritos_series (
    id_usuario INT NOT NULL,
    id_series INT NOT NULL,
    PRIMARY KEY (id_usuario, id_series),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_series) REFERENCES series(id_series) ON DELETE CASCADE
);

CREATE TABLE assistidos_filmes (
    id_usuario INT NOT NULL,
    id_filmes INT NOT NULL,
    PRIMARY KEY (id_usuario, id_filmes),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_filmes) REFERENCES filmes(id_filmes) ON DELETE CASCADE
);

CREATE TABLE assistidos_series (
    id_usuario INT NOT NULL,
    id_series INT NOT NULL,
    PRIMARY KEY (id_usuario, id_series),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_series) REFERENCES series(id_series) ON DELETE CASCADE
);