CREATE DATABASE FoodMind;
USE FoodMind;

CREATE TABLE signUp (
    id_user INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(10) NOT NULL,
    profile_image TEXT
);

CREATE TABLE mensagem(
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender VARCHAR(50) NOT NULL,
    recipient VARCHAR(50) NOT NULL,
    message TEXT,
    image_path TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender) REFERENCES signUp(email),
    FOREIGN KEY (recipient) REFERENCES signUp(email)
);

CREATE TABLE eventos (
	id_evento int auto_increment primary key,
	email varchar(255),
    dia date not null,
    hora time not null,
    descricao varchar(255) not null,
    FOREIGN KEY (email) REFERENCES signUp(email)

);
 
select * from signUp;
select * from mensagem;
select * from eventos;
select s.name, m.sender, m.recipient 
from mensagem AS m
INNER JOIN signUp AS s
ON s.email = m.sender;

select s.name, m.message, m.image_path
from mensagem AS m
INNER JOIN signUp AS s
ON s.email = m.sender;