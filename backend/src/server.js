const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connection = require("./db_config.js");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

// Express setup
const app = express();
app.use(express.json());
app.use(cors());

// HTTP Server setup
const server = http.createServer(app);
// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`);
  },
});
const upload = multer({ storage });

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Socket handlers
io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  socket.on("user login", (userData) => {
    // envia lista de usuários (todos) — front filtra se quiser
    connection.query("SELECT email, name FROM signUp", (err, users) => {
      if (!err) {
        io.emit("online users", users);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

// rota para enviar mensagem (texto + opcional imagem + sender + recipient)
app.post("/enviar/mensagem", upload.single("imagem"), (request, response) => {
  const sender = request.body.sender || null;
  const recipient = request.body.recipient || null;
  const message = request.body.texto || null;
  const filename = request.file ? request.file.filename : null;
  const image_path = filename ? `/uploads/${filename}` : null;

  const query =
    "INSERT INTO mensagem (sender, recipient, message, image_path) VALUES (?, ?, ?, ?)";
  connection.query(
    query,
    [sender, recipient, message, image_path],
    (err, results) => {
      if (err) {
        console.error("Erro ao inserir mensagem:", err);
        return response.status(500).json({
          success: false,
          message: "Erro ao enviar mensagem",
          error: err,
        });
      }

      // If you want accurate createdAt from DB, fetch the inserted row
      connection.query(
        "SELECT * FROM mensagem WHERE id = ?",
        [results.insertId],
        (err2, rows) => {
          if (err2 || !rows || rows.length === 0) {
            const msg = {
              id: results.insertId,
              sender,
              recipient,
              message,
              image: image_path,
              createdAt: new Date(),
            };
            io.emit("chat message", msg);
            return response.status(200).json({ success: true, data: msg });
          }

          const row = rows[0];
          const msg = {
            id: row.id,
            sender: row.sender,
            recipient: row.recipient,
            message: row.message,
            image: row.image_path,
            createdAt: row.createdAt,
          };
          // emite para todos; front filtra por conversa ativa
          io.emit("chat message", msg);

          response.status(200).json({
            success: true,
            message: "Mensagem enviada com sucesso",
            data: msg,
          });
        }
      );
    }
  );
});

// rota para listar mensagens entre dois usuários
app.get("/listar/mensagens", (req, res) => {
  const u1 = req.query.u1;
  const u2 = req.query.u2;
  if (!u1 || !u2)
    return res
      .status(400)
      .json({ success: false, message: "Parâmetros faltando" });

  const query = `select s.name, m.message, m.image_path
                    from mensagem AS m
                    INNER JOIN signUp AS s
                    ON s.email = m.sender
                    WHERE (m.sender = ? AND m.recipient = ?) OR (m.sender = ? AND m.recipient = ?) ORDER BY createdAt ASC;`;
  connection.query(query, [u1, u2, u2, u1], (err, results) => {
    if (err) {
      console.error("Erro ao listar mensagens:", err);
      return res
        .status(500)
        .json({ success: false, message: "Erro ao listar mensagens" });
    }
    res.json({ success: true, data: results });
  });
});

// Authentication routes
app.post("/cadastro/signUp", (request, response) => {
  const { name, email, password } = request.body;
  const query = "INSERT INTO signUp(name, email, password) VALUES(?,?,?)";

  connection.query(query, [name, email, password], (err, results) => {
    if (results) {
      response.status(200).json({
        success: true,
        message: "Usuario cadastrado com sucesso!",
        data: { name, email, password },
      });
    } else {
      response.status(400).json({
        success: false,
        message: "Erro ao cadastrar usuario.",
        error: err,
      });
    }
  });
});

app.post("/cadastro/signIn", (request, res) => {
  const { email, password } = request.body;
  const query = "SELECT * FROM signUp WHERE email = ? AND password = ?";

  connection.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Erro no servidor.",
      });
    }
    if (results.length > 0) {
      res.json({
        success: true,
        message: "Login bem-sucedido!",
        user: results[0],
      });
    } else {
      res.json({
        success: false,
        message: "Usuário ou senha incorretos!",
      });
    }
  });
});

app.delete('/remover/:email', (request, response) => {
  const { email } = request.params;
  const query = 'DELETE FROM signUp WHERE email = ?;';
  connection.query(query, [email], (err) => {
    if (err) {
      return response.status(500).json({ success: false, message: 'Erro ao remover usuario.' });
    }
    response.json({ success: true, message: 'Usuario removido com sucesso!' });
  });
});

app.put('/edit/:email', (req, res) => {
  const emailAntigo = req.params.email;
  const { name, email, password } = req.body;
  console.log('Recebendo requisição para editar:', { name, email, password, emailAntigo });
  const query = 'UPDATE signUp SET name = ?, email = ?, password = ? WHERE email = ?;'
  connection.query(query, [name, email, password, emailAntigo], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao editar usuario(server).' });
    }
    // Fetch updated user
    connection.query('SELECT * FROM signUp WHERE email = ?', [email], (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).json({ success: false, message: 'Erro ao buscar usuário editado.' });
      }
      res.json({ success: true, message: 'Usuario editado com sucesso!(server)', data: results[0] });
    });
  });
});

// Chat routes
app.post("/enviar/mensagem", upload.single("imagem"), (request, response) => {
  const params = [
    request.body.texto || null,
    request.file ? request.file.filename : null,
  ];

  const query = "INSERT INTO mensagem(texto, imagem) VALUES(?,?)";
  connection.query(query, params, (err, results) => {
    if (results) {
      const msg = {
        texto: request.body.texto || null,
        imagem: request.file ? request.file.filename : null,
      };
      io.emit("chat message", msg);

      response.status(200).json({
        success: true,
        message: "Mensagem enviada com sucesso",
        data: msg,
      });
    } else {
      response.status(400).json({
        success: false,
        message: "Erro ao enviar mensagem",
        error: err,
      });
    }
  });
});
