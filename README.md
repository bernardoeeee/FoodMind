
# FOODMIND

## 1. Introdução

O **FoodMind** é uma aplicação web desenvolvida em JavaScript com arquitetura cliente-servidor, voltada para o acompanhamento nutricional, controle de hábitos alimentares e gestão de lembretes e eventos pessoais, além de integrar funcionalidades de comunicação e personalização de perfil.  
O sistema foi construído utilizando **Node.js** no backend e uma interface web estruturada em **HTML, CSS e JavaScript** no frontend.  

O presente documento descreve a organização do sistema, com ênfase no módulo **server.js**, responsável pelo gerenciamento do servidor, rotas HTTP, integração com banco de dados MySQL e comunicação em tempo real via **Socket.IO**.

---

## 2. Estrutura do Projeto

A estrutura de diretórios é organizada conforme o padrão **Model-View-Controller simplificado**, dividindo backend e frontend de forma clara:

```plaintext
FoodMind/
│
├── backend/
│   ├── node_modules/              
│   ├── src/
│   │   ├── db_config.js           
│   │   ├── multer.js              
│   │   ├── router.js              
│   │   └── server.js              
│   ├── uploads/                   
│   ├── .gitignore
│   ├── FoodMind.sql               
│   ├── package.json               
│   └── package-lock.json
│
└── frontend/
    ├── assets/                    
    ├── chat/                      
    │   ├── chat.css
    │   ├── chat.html
    │   └── chat.js
    ├── config/                    
    │   ├── lembretes/
    │   │   ├── lembretes.css
    │   │   ├── lembretes.html
    │   │   └── lembretes.js
    │   ├── macronutrientes/
    │   │    ├── macro.css
    │   │    ├── macro.html
    │   │    └── macro.js
    │   ├── personalizar_perfil/       
    │   │    ├── personalizarPerfil.css
    │   │    ├── personalizarPerfil.html
    │   │    └── personalizarPerfil.js
    │   └── config.html 
    │   └── config.css 
    │   └── config.js 
    │
    ├── pagina_principal/
    │   ├── user/
    │   │   ├── user.html
    │   │   ├── user.css
    │   │   ├── user.js
    │   ├── script.js
    │   ├── index.html
    │   └── style.css
    ├── planoAlimentar/
    │   ├── PA.css
    │   ├── PA.html
    │   └── PA.js
    ├── signUp/
    │   ├── SignUp.css
    │   ├── SignUp.html
    │   └── SignUp.js
    └

```

---

## 3. Backend

O **backend** do FoodMind é desenvolvido com **Node.js** e utiliza os seguintes módulos principais:

- **Express.js**: Gerencia as rotas HTTP e middleware.  
- **MySQL2** (importado via `db_config.js`): Realiza a conexão e execução de queries SQL.  
- **Multer**: Responsável pelo armazenamento e nomeação de arquivos enviados.  
- **Socket.IO**: Fornece comunicação em tempo real para o chat.  
- **CORS**: Libera o acesso entre o frontend e o backend hospedados em origens distintas.  
- **HTTP**: Cria o servidor base para integração com o Express e Socket.IO.

### 3.1 Configuração do Servidor

```javascript
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
```

O **Socket.IO** é configurado para aceitar conexões de qualquer origem:

```javascript
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
```

### 3.2 Middleware e Uploads

Arquivos enviados são armazenados no diretório `/uploads`, com nomes formatados para evitar espaços e duplicações:

```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`);
  },
});
```

---

## 4. Funcionalidades Principais

### 4.1 Autenticação de Usuário

| Método | Rota | Função |
|--------|------|--------|
| POST | `/cadastro/signUp` | Cadastra novo usuário |
| POST | `/cadastro/signIn` | Realiza login do usuário |
| DELETE | `/remover/:email` | Remove usuário pelo e-mail |
| PUT | `/edit/:email` | Edita dados e imagem de perfil |

### 4.2 Comunicação em Tempo Real (Chat)

| Método | Rota | Função |
|--------|------|--------|
| POST | `/enviar/mensagem` | Envia mensagem (texto e imagem) |
| GET | `/listar/mensagens` | Lista histórico de mensagens entre dois usuários |

O **Socket.IO** é utilizado para emitir mensagens em tempo real:

```javascript
io.emit("chat message", msg);
```

### 4.3 Agenda de Eventos

| Método | Rota | Função |
|--------|------|--------|
| POST | `/eventos/salvar` | Cria novo evento |
| GET | `/eventos/listar/:email` | Lista eventos do usuário |
| PUT | `/agenda/evento/editar/:id` | Atualiza evento existente |
| DELETE | `/agenda/evento/deletar/:id` | Exclui evento |

---

## 5. Banco de Dados

O sistema utiliza **MySQL**, conforme estrutura definida em `FoodMind.sql`.  
As principais tabelas incluem:

- `signUp`: informações de usuários (nome, e-mail, senha, imagem de perfil).  
- `mensagem`: histórico de mensagens trocadas.  
- `eventos`: lembretes e compromissos individuais.  

---

## 6. Frontend

O **frontend** é construído com **HTML, CSS e JavaScript** puro, sem frameworks adicionais, garantindo leveza e compatibilidade.  
Cada módulo (chat, personalização, plano alimentar, lembretes etc.) possui seus próprios arquivos `.html`, `.css` e `.js`, mantendo isolamento e organização funcional.

---

## 7. Como Executar o Projeto

### 7.1 Requisitos

- Node.js (v18 ou superior)
- MySQL Server
- NPM ou Yarn

### 7.2 Instalação

Clone o repositório:

```bash
git clone https://github.com/bernardoeeee/FoodMind.git
cd FoodMind/backend
```

Instale as dependências:

```bash
npm install
```

Configure o banco de dados no arquivo `src/db_config.js` com suas credenciais MySQL.

### 7.3 Execução

Inicie o servidor backend:

```bash
node src/server.js
```

O servidor rodará na porta `3001` por padrão.

Abra o frontend (localmente) em `frontend/index.html` utilizando a extensão **Live Server** no VSCode.

---

## 8. Considerações Finais

O **FoodMind** foi projetado para oferecer uma solução integrada de **acompanhamento nutricional**, **organização pessoal** e **comunicação via chat**, com uma arquitetura modular e escalável.  
O código adota boas práticas de separação de responsabilidades, permitindo futuras expansões, como autenticação JWT, encriptação de senhas e integração com APIs de nutrição ou saúde mental.


