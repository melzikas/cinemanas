-- =========================================================
--  CineManas - Novos títulos (lote de 26/11/2026)
--  Rode DEPOIS do schema.sql e do seed.sql, UMA vez só:
--    mysql -u root -p < database/novos-titulos.sql
--
--  Não usa ids fixos: o MySQL gera os ids e as ligações
--  (categorias e elenco) são feitas pelo NOME do título.
--  Obs.: filmes.horas guarda a duração em MINUTOS.
-- =========================================================

USE cinemanaas;
SET NAMES utf8mb4;

-- Elenco novo (Jennifer Aniston e Danielle Winits já existem no seed)
INSERT INTO elenco (ator) VALUES
('Michael Johnston'),
('Inde Navarrette'),
('Cooper Tomlinson'),
('Megan Lawless'),
('Andy Richter'),
('Marlon Brando'),
('Al Pacino'),
('James Caan'),
('Robert Duvall'),
('Diane Keaton'),
('Michael J. Fox'),
('Christopher Lloyd'),
('Lea Thompson'),
('Crispin Glover'),
('Thomas F. Wilson'),
('Adam Sandler'),
('Mark Strong'),
('Luis Gerardo Méndez'),
('Jodie Turner-Smith'),
('Mia Wasikowska'),
('Johnny Depp'),
('Helena Bonham Carter'),
('Anne Hathaway'),
('Yuria Nara'),
('Hiroki Doi'),
('Tomoko Yamaguchi'),
('Yuki Amami'),
('George Tokoro'),
('Tom Hanks'),
('Mariana Treviño'),
('Rachel Keller'),
('Manuel Garcia-Rulfo'),
('Winona Ryder'),
('Dianne Wiest'),
('Anthony Michael Hall'),
('Alan Arkin'),
('Vincent Price'),
('Steve Carell'),
('Morgan Freeman'),
('Lauren Graham'),
('John Goodman'),
('Wanda Sykes'),
('Maurício Manfrini'),
('Cacau Protásio'),
('Antônio Fragoso'),
('Charles Paraventi'),
('Adriana Caselotti'),
('Harry Stockwell'),
('Lucille La Verne'),
('Roy Atwell'),
('Pinto Colvig'),
('Felipe Castanhari'),
('Bruno Miranda'),
('Lilian Regina');

-- Filmes
INSERT INTO filmes (nome, horas, sinopse, dataa) VALUES
('Obsessão', 109, 'Bear é apaixonado por Nikki, sua amiga de infância. Quando um desejo sobrenatural faz com que ela passe a amá-lo de forma obsessiva, a devoção sai do controle e termina em tragédia.', '2026-01-01'),
('O Poderoso Chefão', 175, 'A saga da família Corleone, uma das mais poderosas da máfia de Nova York. Quando o patriarca Vito é ferido, o filho Michael é arrastado para o mundo do crime e assume o comando do império.', '1972-01-01'),
('De Volta para o Futuro', 116, 'O adolescente Marty McFly viaja de 1985 a 1955 na máquina do tempo do cientista Doc Brown e precisa fazer seus pais se apaixonarem, ou deixará de existir.', '1985-01-01'),
('O Mistério em Paris', 90, 'Nick e Audrey, agora detetives, vão a um casamento de luxo, mas o noivo é sequestrado. A busca pelo culpado leva o casal a uma aventura cheia de reviravoltas que termina em Paris.', '2023-01-01'),
('Alice no País das Maravilhas', 108, 'Aos 19 anos, Alice volta ao País das Maravilhas, que visitou na infância sem lembrar, e se une ao Chapeleiro Maluco para enfrentar a tirana Rainha de Copas.', '2010-01-01'),
('Ponyo', 101, 'Ponyo, uma peixinha mágica, foge do fundo do mar e é salva pelo menino Sosuke. Ela decide virar humana, o que desequilibra a natureza e provoca um grande maremoto.', '2008-01-01'),
('O Pior Vizinho do Mundo', 126, 'Otto, um viúvo ranzinza que reclama de tudo, tem a rotina virada de cabeça para baixo quando uma família simpática se muda para a casa ao lado e se recusa a deixá-lo sozinho.', '2022-01-01'),
('Edward Mãos de Tesoura', 105, 'Edward, criação inacabada de um inventor, tem tesouras no lugar das mãos. Acolhido por uma família do subúrbio, conquista a vizinhança e se apaixona por Kim, mas ser diferente tem seu preço.', '1990-01-01'),
('A Volta do Todo Poderoso', 96, 'O recém-eleito deputado Evan Baxter recebe de Deus a missão de construir uma arca gigante. Enquanto a família estranha a barba e os animais, ele precisa decidir se acredita.', '2007-01-01'),
('Os Farofeiros', 103, 'Colegas de trabalho em crise decidem passar o réveillon numa casa na praia, e a festa vira uma grande confusão por causa de um segredo que envolve todo mundo.', '2018-01-01'),
('Branca de Neve e os Sete Anões', 83, 'A jovem Branca de Neve foge da malvada Rainha, que tem inveja de sua beleza, e encontra abrigo na casa de sete anões. Mas a madrasta não desiste e prepara uma maçã envenenada.', '1937-01-01');

-- Séries
INSERT INTO series (nome, temps, sinopse, dataa) VALUES
('Mundo Mistério', 1, 'O youtuber Felipe Castanhari e seus amigos desvendam, com humor e ciência, mistérios como o Triângulo das Bermudas, a Grande Peste e a viagem no tempo, em oito episódios.', '2020-01-01');

-- Filmes x Categorias
INSERT INTO categoria_has_filmes (id_categoria, id_filmes)
SELECT c.id_categoria, f.id_filmes FROM filmes f JOIN categoria c ON c.categoria IN ('Terror / Horror', 'Suspense')
WHERE f.nome = 'Obsessão';
INSERT INTO categoria_has_filmes (id_categoria, id_filmes)
SELECT c.id_categoria, f.id_filmes FROM filmes f JOIN categoria c ON c.categoria IN ('Drama', 'Suspense', 'Nostálgico')
WHERE f.nome = 'O Poderoso Chefão';
INSERT INTO categoria_has_filmes (id_categoria, id_filmes)
SELECT c.id_categoria, f.id_filmes FROM filmes f JOIN categoria c ON c.categoria IN ('Ficção Científica (Sci-Fi)', 'Comédia', 'Ação', 'Família', 'Nostálgico')
WHERE f.nome = 'De Volta para o Futuro';
INSERT INTO categoria_has_filmes (id_categoria, id_filmes)
SELECT c.id_categoria, f.id_filmes FROM filmes f JOIN categoria c ON c.categoria IN ('Suspense', 'Comédia', 'Ação')
WHERE f.nome = 'O Mistério em Paris';
INSERT INTO categoria_has_filmes (id_categoria, id_filmes)
SELECT c.id_categoria, f.id_filmes FROM filmes f JOIN categoria c ON c.categoria IN ('Fantasia', 'Família', 'Nostálgico')
WHERE f.nome = 'Alice no País das Maravilhas';
INSERT INTO categoria_has_filmes (id_categoria, id_filmes)
SELECT c.id_categoria, f.id_filmes FROM filmes f JOIN categoria c ON c.categoria IN ('Animação', 'Cinekids', 'Fantasia', 'Família', 'Para aquecer o coração', 'Nostálgico')
WHERE f.nome = 'Ponyo';
INSERT INTO categoria_has_filmes (id_categoria, id_filmes)
SELECT c.id_categoria, f.id_filmes FROM filmes f JOIN categoria c ON c.categoria IN ('O choro é livre', 'Drama', 'Comédia', 'Para aquecer o coração')
WHERE f.nome = 'O Pior Vizinho do Mundo';
INSERT INTO categoria_has_filmes (id_categoria, id_filmes)
SELECT c.id_categoria, f.id_filmes FROM filmes f JOIN categoria c ON c.categoria IN ('Para aquecer o coração', 'Fantasia', 'Romance', 'Drama', 'Nostálgico')
WHERE f.nome = 'Edward Mãos de Tesoura';
INSERT INTO categoria_has_filmes (id_categoria, id_filmes)
SELECT c.id_categoria, f.id_filmes FROM filmes f JOIN categoria c ON c.categoria IN ('Risadinha', 'Comédia', 'Fantasia', 'Família', 'Nostálgico')
WHERE f.nome = 'A Volta do Todo Poderoso';
INSERT INTO categoria_has_filmes (id_categoria, id_filmes)
SELECT c.id_categoria, f.id_filmes FROM filmes f JOIN categoria c ON c.categoria IN ('Família', 'Comédia', 'Risadinha')
WHERE f.nome = 'Os Farofeiros';
INSERT INTO categoria_has_filmes (id_categoria, id_filmes)
SELECT c.id_categoria, f.id_filmes FROM filmes f JOIN categoria c ON c.categoria IN ('Cinekids', 'Animação', 'Fantasia', 'Família', 'Romance', 'Nostálgico')
WHERE f.nome = 'Branca de Neve e os Sete Anões';

-- Séries x Categorias
INSERT INTO categoria_has_series (id_categoria, id_series)
SELECT c.id_categoria, s.id_series FROM series s JOIN categoria c ON c.categoria IN ('Documentário', 'Família')
WHERE s.nome = 'Mundo Mistério';

-- Filmes x Elenco
INSERT INTO filmes_has_elenco (id_filmes, id_elenco)
SELECT f.id_filmes, e.id_elenco FROM filmes f JOIN elenco e ON e.ator IN ('Michael Johnston', 'Inde Navarrette', 'Cooper Tomlinson', 'Megan Lawless', 'Andy Richter')
WHERE f.nome = 'Obsessão';
INSERT INTO filmes_has_elenco (id_filmes, id_elenco)
SELECT f.id_filmes, e.id_elenco FROM filmes f JOIN elenco e ON e.ator IN ('Marlon Brando', 'Al Pacino', 'James Caan', 'Robert Duvall', 'Diane Keaton')
WHERE f.nome = 'O Poderoso Chefão';
INSERT INTO filmes_has_elenco (id_filmes, id_elenco)
SELECT f.id_filmes, e.id_elenco FROM filmes f JOIN elenco e ON e.ator IN ('Michael J. Fox', 'Christopher Lloyd', 'Lea Thompson', 'Crispin Glover', 'Thomas F. Wilson')
WHERE f.nome = 'De Volta para o Futuro';
INSERT INTO filmes_has_elenco (id_filmes, id_elenco)
SELECT f.id_filmes, e.id_elenco FROM filmes f JOIN elenco e ON e.ator IN ('Adam Sandler', 'Jennifer Aniston', 'Mark Strong', 'Luis Gerardo Méndez', 'Jodie Turner-Smith')
WHERE f.nome = 'O Mistério em Paris';
INSERT INTO filmes_has_elenco (id_filmes, id_elenco)
SELECT f.id_filmes, e.id_elenco FROM filmes f JOIN elenco e ON e.ator IN ('Mia Wasikowska', 'Johnny Depp', 'Helena Bonham Carter', 'Anne Hathaway', 'Crispin Glover')
WHERE f.nome = 'Alice no País das Maravilhas';
INSERT INTO filmes_has_elenco (id_filmes, id_elenco)
SELECT f.id_filmes, e.id_elenco FROM filmes f JOIN elenco e ON e.ator IN ('Yuria Nara', 'Hiroki Doi', 'Tomoko Yamaguchi', 'Yuki Amami', 'George Tokoro')
WHERE f.nome = 'Ponyo';
INSERT INTO filmes_has_elenco (id_filmes, id_elenco)
SELECT f.id_filmes, e.id_elenco FROM filmes f JOIN elenco e ON e.ator IN ('Tom Hanks', 'Mariana Treviño', 'Rachel Keller', 'Manuel Garcia-Rulfo')
WHERE f.nome = 'O Pior Vizinho do Mundo';
INSERT INTO filmes_has_elenco (id_filmes, id_elenco)
SELECT f.id_filmes, e.id_elenco FROM filmes f JOIN elenco e ON e.ator IN ('Johnny Depp', 'Winona Ryder', 'Dianne Wiest', 'Anthony Michael Hall', 'Alan Arkin', 'Vincent Price')
WHERE f.nome = 'Edward Mãos de Tesoura';
INSERT INTO filmes_has_elenco (id_filmes, id_elenco)
SELECT f.id_filmes, e.id_elenco FROM filmes f JOIN elenco e ON e.ator IN ('Steve Carell', 'Morgan Freeman', 'Lauren Graham', 'John Goodman', 'Wanda Sykes')
WHERE f.nome = 'A Volta do Todo Poderoso';
INSERT INTO filmes_has_elenco (id_filmes, id_elenco)
SELECT f.id_filmes, e.id_elenco FROM filmes f JOIN elenco e ON e.ator IN ('Maurício Manfrini', 'Cacau Protásio', 'Danielle Winits', 'Antônio Fragoso', 'Charles Paraventi')
WHERE f.nome = 'Os Farofeiros';
INSERT INTO filmes_has_elenco (id_filmes, id_elenco)
SELECT f.id_filmes, e.id_elenco FROM filmes f JOIN elenco e ON e.ator IN ('Adriana Caselotti', 'Harry Stockwell', 'Lucille La Verne', 'Roy Atwell', 'Pinto Colvig')
WHERE f.nome = 'Branca de Neve e os Sete Anões';

-- Séries x Elenco
INSERT INTO series_has_elenco (id_series, id_elenco)
SELECT s.id_series, e.id_elenco FROM series s JOIN elenco e ON e.ator IN ('Felipe Castanhari', 'Bruno Miranda', 'Lilian Regina')
WHERE s.nome = 'Mundo Mistério';
