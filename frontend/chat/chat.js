// Esta função fica no escopo global para ser acessada pelo 'onclick'
function SignUp() {
    const logado = localStorage.getItem("Informacoes");
    if (logado) {
        window.location.href = "../pagina_principal/user/user.html";
    } else {
        window.location.href = "../signUp/SignUp.html";
    }
}

// Adiciona um listener para garantir que todo o HTML foi carregado
document.addEventListener("DOMContentLoaded", () => {

    // --- DECLARAÇÃO DE VARIÁVEIS ---
    const socket = io("http://localhost:3001");
    const userInfo = JSON.parse(localStorage.getItem("Informacoes") || "null");
    const chatForm = document.getElementById("chatForm");
    const messageInput = document.getElementById("message-input");
    const imageInput = document.getElementById("image-input");
    const messages = document.getElementById("messages"); // A <ul>
    const messageContainer = document.getElementById("FileiraTextos"); // O <div> com scroll
    const sidebar = document.querySelector(".sidebar");
    const chatHeader = document.createElement("div");
    chatHeader.className = "chat-header";
    document.querySelector(".FileiraTextos").prepend(chatHeader);
    const chatWindow = document.getElementById("chat-window");

    // --- DIAGNÓSTICO REFRESH ---
    console.log("Elemento #chatForm encontrado:", chatForm);

    // --- CORREÇÃO SCROLL (Função Helper) ---
    // Esta função rola para o fim do container de mensagens.
    // O setTimeout dá tempo ao DOM para atualizar o 'scrollHeight'.
    function scrollToBottom() {
        setTimeout(() => {
            if (messageContainer) {
                messageContainer.scrollTop = messageContainer.scrollHeight;
                console.log("Scroll attempt:", messageContainer.scrollTop, messageContainer.scrollHeight);
            }
        }, 50); // 50ms de delay é geralmente suficiente
    }

    // --- LÓGICA DO CHAT ---
    if (userInfo) {
        socket.emit("user login", userInfo);
    }

    // ... (socket.on("online users") - seu código está ok) ...
    socket.on("online users", (users) => {
        const userList = document.getElementById("user-list");
        if (!userList) return;
        userList.innerHTML = "";
        users.forEach((user) => {
            if (!user.email) return;
            if (userInfo && user.email === userInfo.email) return;
            const div = document.createElement("div");
            div.className = "online-user";
            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = user.name;
            btn.onclick = () => selectRecipient(user, btn);
            div.appendChild(btn);
            userList.appendChild(div);
        });
    });

    let selectedRecipient = null;

    function selectRecipient(user, btn) {
        selectedRecipient = user;
        chatHeader.textContent = `Conversando com: ${user.name}`;
        document.querySelectorAll(".online-user button").forEach((b) => b.classList.remove("selected"));
        if (btn) btn.classList.add("selected");
        if (chatWindow) chatWindow.classList.remove("hidden");
        messages.innerHTML = "";
        loadConversation(user);
    }

    async function loadConversation(user) {
        if (!user || !user.email || !userInfo) return;
        try {
            const res = await fetch(
                `http://localhost:3001/listar/mensagens?u1=${encodeURIComponent(userInfo.email)}&u2=${encodeURIComponent(user.email)}`);
            const json = await res.json();
            if (json.success) {
                messages.innerHTML = "";
                json.data.forEach(renderMessage);
                // A função renderMessage agora cuida do scroll
            }
        } catch (err) {
            console.error("Erro ao carregar conversa", err);
        }
    }

    // --- CORREÇÃO REFRESH (Wrapper) ---
    if (chatForm) {
        chatForm.addEventListener("submit", async (e) => {
            // CORREÇÃO REFRESH v2: Mais robusto
            e.preventDefault();
            e.stopPropagation();

            // DIAGNÓSTICO: Esta mensagem PRECISA aparecer no console
            console.log("Formulário capturado! Prevenindo refresh.");

            if (!selectedRecipient) {
                alert("Selecione um usuário para enviar a mensagem");
                return false;
            }

            const text = messageInput.value.trim();
            const imageFile = imageInput.files[0];

            if (!text && !imageFile) {
                alert("Digite uma mensagem ou selecione uma imagem");
                return false;
            }

            try {
                // ... (seu código FormData e fetch) ...
                const formData = new FormData();
                formData.append("sender", userInfo.email);
                formData.append("recipient", selectedRecipient.email);
                if (text) formData.append("texto", text);
                if (imageFile) formData.append("imagem", imageFile);

                const response = await fetch("http://localhost:3001/enviar/mensagem", {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();

                if (result.success) {
                    messageInput.value = "";
                    imageInput.value = "";
                    renderMessage({
                        ...result.data,
                        sender: userInfo.email,
                        recipient: selectedRecipient.email,
                        name: userInfo.name
                    });
                } else {
                    console.error("Erro do servidor:", result);
                    alert("Erro ao enviar mensagem: " + (result.message || "erro desconhecido"));
                }
            } catch (error) {
                console.error("Erro ao enviar mensagem:", error);
                alert("Erro ao enviar mensagem");
                return false; // Adiciona return false no catch
            }
            return false; // Adiciona return false no final do handler
        });
    } else {
        console.error("ERRO CRÍTICO: O formulário #chatForm não foi encontrado. O envio de mensagens causará um refresh na página.");
    }


    socket.on("chat message", (msg) => {
        if (!selectedRecipient || !userInfo) return;
        const isBetween =
            (msg.sender === userInfo.email &&
                msg.recipient === selectedRecipient.email) ||
            (msg.sender === selectedRecipient.email &&
                msg.recipient === userInfo.email);

        if (isBetween) {
            const exists = messages.querySelector(`[data-id="${msg.id}"]`);
            if (!exists) {
                renderMessage(msg);
                // A função renderMessage agora cuida do scroll
            }
        }
    });

    function renderMessage(msg) {
        // ... (seu código para IDs, classes, 'sent'/'recived', etc. está ok) ...
        const id = msg.id || msg._id || msg.message_id || msg.id_message;
        if (id && messages.querySelector(`[data-id="${id}"]`)) return;
        const li = document.createElement("li");
        li.className = "mensagem";
        if (id) li.dataset.id = id;
        const senderEmail = msg.sender || msg.from || msg.email;
        const senderId = msg.id_user || msg.sender_id || msg.user_id;
        const text = msg.message || msg.text || msg.texto || msg.mensagem;
        const imagePath = msg.image || msg.image_path || msg.imagem || msg.path;
        const senderNameField = msg.name || msg.nome || msg.senderName;
        const isSentById = userInfo && senderId && userInfo.id_user === senderId;
        const isSentByEmail = userInfo && senderEmail && userInfo.email === senderEmail;
        const isSentByMe = isSentById || isSentByEmail;
        li.classList.add(isSentByMe ? "sent" : "recived");

        // Cria e anexa Meta (Nome, Data)
        const meta = document.createElement("div");
        meta.className = "msg-meta";
        const rawDate = msg.createdAt || msg.created_at || msg.date;
        const date = rawDate ? new Date(rawDate) : new Date();
        const senderName = isSentByMe ? "Você" : (senderNameField || senderEmail || "Anônimo");
        meta.textContent = `${senderName} • ${date.toLocaleString()}`;
        li.appendChild(meta);

        // Cria e anexa Texto
        if (text) {
            const textEl = document.createElement("div");
            textEl.className = "msg-text";
            textEl.textContent = text;
            li.appendChild(textEl);
        }

        // Anexa o LI ao DOM *antes* de lidar com a imagem
        messages.appendChild(li);

        // Cria e anexa Imagem (se houver)
        if (imagePath) {
            const img = document.createElement("img");
            let src = imagePath;
            // ... (sua lógica de URL está ok) ...
            if (src.startsWith("/")) {
                src = `http://localhost:3001${src}`;
            } else if (!/^https?:\/\//i.test(src)) {
                src = `http://localhost:3001/${src}`;
            }
            img.src = src;
            img.alt = senderName + " - imagem";
            img.className = "chat-image";
            img.style.maxWidth = "300px";
            img.style.cursor = "zoom-in";
            img.onclick = () => openImageModal(img.src);

            // --- CORREÇÃO SCROLL v2 ---
            // Rola a tela APENAS DEPOIS que a imagem carregar
            img.onload = () => {
                console.log("Imagem carregada, rolando para o fim.");
                scrollToBottom();
            };
            // Se a imagem falhar, role mesmo assim
            img.onerror = () => {
                console.warn("Imagem falhou ao carregar, rolando mesmo assim.");
                scrollToBottom();
            };

            li.appendChild(img); // Anexa a imagem ao LI
            console.log("Imagem adicionada à mensagem:", img.src);
        } else {
            // --- CORREÇÃO SCROLL v2 ---
            // Se não há imagem, pode rolar imediatamente
            scrollToBottom();
        }
    }

    // ... (seu código openImageModal e listener do modal está ok) ...
    function openImageModal(imageSrc) {
        const modal = document.getElementById("imageModal");
        const modalImg = document.getElementById("modalImg");
        modal.style.display = "flex";
        modalImg.src = imageSrc;
    }

    const imageModal = document.getElementById("imageModal");
    if (imageModal) {
        imageModal.addEventListener("click", function (e) {
            if (e.target === this) {
                this.style.display = "none";
                document.getElementById("modalImg").src = "";
            }
        });
    }

}); // --- FIM DO 'DOMContentLoaded' ---