CREATE DATABASE FoodMind;
USE FoodMind;

CREATE TABLE signUp (
    id_user INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(10) NOT NULL,
    profile_image VARCHAR(255)
);

CREATE TABLE mensagem(
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender VARCHAR(50) NOT NULL,
    recipient VARCHAR(50) NOT NULL,
    message TEXT,
    image_path VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender) REFERENCES signUp(email),
    FOREIGN KEY (recipient) REFERENCES signUp(email)
);
select * from signUp;
