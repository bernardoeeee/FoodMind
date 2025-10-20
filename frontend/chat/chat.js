function SignUp() {
    const logado = localStorage.getItem("Informacoes");
    if (logado) {
        window.location.href = "../pagina_principal/user/user.html";
    } else {
        window.location.href = "../signUp/SignUp.html";
    }
}


const socket = io('http://localhost:3001');
const userInfo = JSON.parse(localStorage.getItem('Informacoes') || 'null');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('message-input');
const imageInput = document.getElementById('image-input');
const messages = document.getElementById('messages');
const sidebar = document.querySelector('.sidebar');
const chatHeader = document.createElement('div');
chatHeader.className = 'chat-header';
document.querySelector('.FileiraTextos').prepend(chatHeader);

const chatWindow = document.getElementById('chat-window');

if (userInfo) {
    socket.emit('user login', userInfo);
}

socket.on('online users', (users) => {
    const userList = document.getElementById('user-list');
    if (!userList) return;
    userList.innerHTML = '';
    users.forEach(user => {
        if (!user.email) return;
        // skip self
        if (userInfo && user.email === userInfo.email) return;
        const div = document.createElement('div');
        div.className = 'online-user';
        const btn = document.createElement('button');
        btn.type = 'button';
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

    document.querySelectorAll('.online-user button').forEach(b => b.classList.remove('selected'));
    if (btn) btn.classList.add('selected');

    // show chat controls
    if (chatWindow) chatWindow.classList.remove('hidden');

    // limpa mensagens atuais e carrega histórico
    messages.innerHTML = '';
    loadConversation(user);
}

async function loadConversation(user) {
    if (!user || !user.email || !userInfo) return;
    try {
        const res = await fetch(`http://localhost:3001/listar/mensagens?u1=${encodeURIComponent(userInfo.email)}&u2=${encodeURIComponent(user.email)}`);
        const json = await res.json();
        if (json.success) {
            messages.innerHTML = '';
            json.data.forEach(renderMessage);
            messages.scrollTop = messages.scrollHeight;
            console.log(json.data);
        }
    } catch (err) {
        console.error('Erro ao carregar conversa', err);
    }
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedRecipient) {
        alert('Selecione um usuário para enviar a mensagem');
        return;
    }

    const text = messageInput.value.trim();
    const imageFile = imageInput.files[0]; // Get the first selected file

    if (!text && !imageFile) {
        alert('Digite uma mensagem ou selecione uma imagem');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('sender', userInfo.email);
        formData.append('recipient', selectedRecipient.email);

        if (text) {
            formData.append('texto', text);
        }

        if (imageFile) {
            formData.append('imagem', imageFile); // 'imagem' must match server's multer field name
            console.log('Imagem anexada:', imageFile.name); // Debug log
        }

        const response = await fetch('http://localhost:3001/enviar/mensagem', {
            method: 'POST',
            body: formData // Don't set Content-Type header - FormData sets it automatically
        });

        const result = await response.json();

        if (result.success) {
            messageInput.value = '';
            imageInput.value = '';
        } else {
            console.error('Erro do servidor:', result);
            alert('Erro ao enviar mensagem: ' + (result.message || 'erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        alert('Erro ao enviar mensagem');
    }
});

// socket receives new messages; render only if belongs to current conversation
socket.on('chat message', (msg) => {
    if (!selectedRecipient || !userInfo) return;
    const isBetween = (msg.sender === userInfo.email && msg.recipient === selectedRecipient.email)
        || (msg.sender === selectedRecipient.email && msg.recipient === userInfo.email);
    if (isBetween) {
        // avoid duplicate if already rendered
        const exists = messages.querySelector(`[data-id="${msg.id}"]`);
        if (!exists) {
            renderMessage(msg);
            messages.scrollTop = messages.scrollHeight;
        }
    }
});

function renderMessage(msg) {
    const li = document.createElement('li');
    li.className = 'mensagem';
    // li.dataset.id = msg.id || '';

    // Check if the message is from the current user
    const isSentByMe = userInfo && msg.sender === userInfo.email;

    // Add the correct class
    li.classList.add(isSentByMe ? 'sent' : 'received');

    // Create message content
    const meta = document.createElement('div');
    meta.className = 'msg-meta';
    const date = msg.createdAt ? new Date(msg.createdAt) : new Date();
    // Show just the name, not the email
    const senderName = isSentByMe ? 'You' : (msg.name || 'Other');
    meta.textContent = `${senderName} • ${date.toLocaleString()}`;
    li.appendChild(meta);

    if (msg.message) {
        const textEl = document.createElement('div');
        textEl.className = 'msg-text';
        textEl.textContent = msg.message;
        li.appendChild(textEl);
    }

    if (msg.image) {
        const img = document.createElement('img');
        img.src = msg.image && msg.image.startsWith('http') ? msg.image : `http://localhost:3001${msg.image}`;
        img.className = 'chat-image';
        img.style.maxWidth = '300px';
        img.style.cursor = 'zoom-in';
        img.onclick = () => openImageModal(img.src);
        li.appendChild(img);
    }

    messages.appendChild(li);
}

// Image modal functions
function openImageModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    modal.style.display = 'flex';
    modalImg.src = imageSrc;
}

// close modal on click outside
const imageModal = document.getElementById('imageModal');
if (imageModal) {
    imageModal.addEventListener('click', function (e) {
        if (e.target === this) {
            this.style.display = 'none';
            document.getElementById('modalImg').src = '';
        }
    });
}