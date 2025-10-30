const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connection = require("./db_config.js");
const cors = require("cors");
const path = require("path");
const multer = require("multer");


const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`);
  },
});
const upload = multer({ storage });


app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));


app.post("/cadastro/signUp", (req, res) => {
  const { name, email, password } = req.body;
  const query = "INSERT INTO signUp(name, email, password) VALUES(?,?,?)";

  connection.query(query, [name, email, password], (err, results) => {
    if (results) {
      res.status(200).json({
        success: true,
        message: "Usuário cadastrado com sucesso!",
        data: { name, email, password },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Erro ao cadastrar usuário.",
        error: err,
      });
    }
  });
});

app.post("/cadastro/signIn", (req, res) => {
  const { email, password } = req.body;
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

app.delete("/remover/:email", (req, res) => {
  const { email } = req.params;
  const query = "DELETE FROM signUp WHERE email = ?;";

  connection.query(query, [email], (err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Erro ao remover usuário." });
    }
    res.json({ success: true, message: "Usuário removido com sucesso!" });
  });
});

// Replace the existing edit endpoint with this:
app.put("/edit/:email", upload.single('profile_image'), (req, res) => {
  const emailAntigo = req.params.email;
  const { name, email, password } = req.body;
  const profile_image = req.file ? `/uploads/${req.file.filename}` : null;

  console.log("Editing user:", {
    emailAntigo,
    name,
    email,
    password,
    profile_image
  });

  const query = "UPDATE signUp SET name = ?, email = ?, password = ?, profile_image = ? WHERE email = ?";

  connection.query(query, [name, email, password, profile_image, emailAntigo], (err) => {
    if (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({
        success: false,
        message: "Erro ao editar usuário.",
        error: err.message
      });
    }

    // Fetch updated user data
    connection.query("SELECT * FROM signUp WHERE email = ?", [email], (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).json({
          success: false,
          message: "Erro ao buscar usuário editado."
        });
      }
      res.json({
        success: true,
        message: "Usuário editado com sucesso!",
        data: results[0]
      });
    });
  });
});


app.post("/enviar/mensagem", upload.single("imagem"), (req, res) => {
  const sender = req.body.sender || null;
  const recipient = req.body.recipient || null;
  const message = req.body.texto || null;
  const filename = req.file ? req.file.filename : null;
  const image_path = filename ? `/uploads/${filename}` : null;

  const query =
    "INSERT INTO mensagem (sender, recipient, message, image_path) VALUES (?, ?, ?, ?)";

  connection.query(
    query,
    [sender, recipient, message, image_path],
    (err, results) => {
      if (err) {
        console.error("Erro ao inserir mensagem:", err);
        return res.status(500).json({
          success: false,
          message: "Erro ao enviar mensagem",
          error: err,
        });
      }


      connection.query(
        "SELECT * FROM mensagem WHERE id = ?",
        [results.insertId],
        (err2, rows) => {
          if (err2 || !rows || rows.length === 0) {
            // Fallback manual
            const msg = {
              id: results.insertId,
              sender,
              recipient,
              message,
              image: filename
                ? `${req.protocol}://${req.get("host")}${image_path}`
                : null,
              createdAt: new Date(),
            };
            io.emit("chat message", msg);
            return res.status(200).json({ success: true, data: msg });
          }

          const row = rows[0];
          const msg = {
            id: row.id,
            sender: row.sender,
            recipient: row.recipient,
            message: row.message,
            image: row.image_path
              ? `${req.protocol}://${req.get("host")}${row.image_path}`
              : null,
            createdAt: row.createdAt,
          };

          io.emit("chat message", msg);
          return res.status(200).json({
            success: true,
            message: "Mensagem enviada com sucesso",
            data: msg,
          });
        }
      );
    }
  );
});

app.get("/listar/mensagens", (req, res) => {
  const u1 = req.query.u1;
  const u2 = req.query.u2;

  if (!u1 || !u2) {
    return res
      .status(400)
      .json({ success: false, message: "Parâmetros faltando" });
  }

  const query = `
    SELECT s.name, s.id_user, m.message, m.image_path
    FROM mensagem AS m
    INNER JOIN signUp AS s ON s.email = m.sender
    WHERE (m.sender = ? AND m.recipient = ?)
       OR (m.sender = ? AND m.recipient = ?)
    ORDER BY m.createdAt ASC;
  `;

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



// AGENDA (EVENTOS)

// Criar
app.post('/eventos/salvar', (request, response) => {
  const { email, dia, hora, descricao } = request.body;

  if (!email || !dia || !hora || !descricao) {
    return response.status(400).json({
      success: false,
      message: "Dados incompletos para salvar o evento."
    });
  }

  const params = [id_usuario, dia, hora, descricao];
  const query = "INSERT INTO eventos (email, dia, hora, descricao) VALUES (?, ?, ?, ?);";

  connection.query(query, params, (err, results) => {
    if (results) {
      response
        .status(201)
        .json({
          success: true,
          message: "Evento salvo com sucesso!",
          data: { id: results.insertId, ...request.body }
        });
    } else {
      response.status(400).json({
        success: false,
        message: "Erro ao salvar evento no banco de dados.",
        data: err
      });
    }
  });
});

// Listar
app.get('/eventos/listar/:email', (request, response) => {
  const { email } = request.params;

  const query = "SELECT email, dia, hora, descricao FROM eventos WHERE email = ? ORDER BY dia, hora ASC;";

  connection.query(query, [email], (err, results) => {
    if (results) {
      response
        .status(200)
        .json({
          success: true,
          message: "Eventos carregados com sucesso.",
          data: results
        });
    } else {
      response
        .status(400)
        .json({
          success: false,
          message: "Erro ao buscar eventos.",
          data: err
        });
    }
  });
});

// Editar
app.put('/agenda/evento/editar/:id', (request, response) => {
  const id = request.params.id;
  const { dia, hora, descricao } = request.body;

  if (!dia || !hora || !descricao) {
    return response.status(400).json({
      success: false,
      message: "Dados incompletos para a edição do evento."
    });
  }

  const query = `
      UPDATE eventos
      SET dia = ?, hora = ?, descricao = ?
      WHERE id_evento = ?;
  `;

  connection.query(query, [dia, hora, descricao, id], (err, results) => {
    if (err) {
      return response.status(400).json({
        success: false,
        message: "Erro ao atualizar o evento",
        data: err
      });
    }
    response.status(200).json({
      success: true,
      message: "Evento atualizado com sucesso!",
      data: results
    });
  });
});

// Excluir
app.delete('/agenda/evento/deletar/:id', (request, response) => {
  let id = request.params.id;

  let query = "DELETE FROM eventos WHERE id_evento = ?;"

  connection.query(query, [id], (err, results) => {
    if (err) {
      return response.status(400).json({
        success: false,
        message: "Erro ao excluir evento",
        data: err
      });
    }

    if (results.affectedRows === 0) {
      return response.status(404).json({
        success: false,
        message: "Evento não encontrado."
      });
    }

    response.status(200).json({
      success: true,
      message: "Evento excluído com sucesso!",
      data: results
    });
  });
});


io.on("connection", (socket) => {
  console.log("Usuário conectado:", socket.id);

  socket.on("user login", (userData) => {

    connection.query("SELECT email, name FROM signUp", (err, users) => {
      if (!err) {
        io.emit("online users", users);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("Usuário desconectado:", socket.id);
  });
});


