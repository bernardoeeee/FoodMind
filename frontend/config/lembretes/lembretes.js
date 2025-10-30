function GoToConfig() {
    window.location.href = "../config.html";
}

function GoToChanceProfile() {
    window.location.href = "../personalizar_perfil/personalizarPerfil.html";
}

function GoToMacro() {
    window.location.href = "../macronutrientes/macro.html";
}



const calendarBody = document.getElementById("calendar-body");
const monthYear = document.getElementById("monthYear");
const eventList = document.getElementById("event-list");
const noEventMsg = document.getElementById("no-event");

const modal = document.getElementById("modal");
const openForm = document.getElementById("openForm");
const closeForm = document.getElementById("closeForm");
const saveEvent = document.getElementById("saveEvent"); // Botão Salvar/Salvar Alterações

const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

// Campos do Modal
const eventDescriptionInput = document.getElementById("event-description");
const eventTimeInput = document.getElementById("event-time");
const eventDateInput = document.getElementById("event-date"); // Novo campo de data

let selectedDate = new Date();
let events = {}; // Cache de eventos

// --- Variável para o ID do usuário logado ---
const usuarioLogado = JSON.parse(localStorage.getItem("Informacoes"));
let email = null;

// if (usuarioLogado && usuarioLogado.id_usuario) {
//     ID_USUARIO = usuarioLogado.id_usuario;
// } else {
//     alert("Você precisa estar logada para acessar a agenda.");
//     // Opcional: window.location.href = "../login/login.html"; 
// }
// ----------------------------------------------------

// --- Ajuste para edição: Cria o campo oculto para o ID do Evento ---
const eventIdInput = document.createElement('input');
eventIdInput.type = 'hidden';
eventIdInput.id = 'edit-event-id';
// Adiciona o campo oculto dentro do modal-form
document.getElementById('modal-form').appendChild(eventIdInput);
// ------------------------------------------------------------------


// Gerar data
function generateCalendar(date) {
    calendarBody.innerHTML = "";
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    let row = document.createElement("tr");

    // Preenche dias vazios no início do mês
    for (let i = 0; i < firstDay; i++) {
        row.appendChild(document.createElement("td"));
    }

    // Preenche os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        if (row.children.length === 7) {
            calendarBody.appendChild(row);
            row = document.createElement("tr");
        }

        const cell = document.createElement("td");
        cell.textContent = day;
        cell.classList.add("day");

        const currentDate = new Date(year, month, day);
        const isToday = currentDate.toDateString() === new Date().toDateString();

        if (isToday) {
            cell.classList.add("today");
        }

        // Verifica se há eventos para este dia
        const eventKey = currentDate.toDateString();
        if (events[eventKey] && events[eventKey].length > 0) {
            cell.classList.add("has-event");
        }

        // Aplica a classe selected APÓS a verificação de today e has-event
        if (isSameDate(currentDate, selectedDate)) {
            cell.classList.add("selected");
        }


        cell.onclick = () => {
            // Remove a seleção anterior
            document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));

            selectedDate = currentDate;
            cell.classList.add("selected");
            displayEvents();
        };

        row.appendChild(cell);
    }

    // Preenche a última linha
    if (row.children.length > 0) {
        // Preenche dias vazios no final da última linha
        while (row.children.length < 7) {
            row.appendChild(document.createElement("td"));
        }
        calendarBody.appendChild(row);
    }
}


// Verifica se as duas datas são a mesma
function isSameDate(d1, d2) {
    return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();
}

// ----------------------------------------------------------
// FUNÇÕES DE EXIBIÇÃO DE EVENTOS
// ----------------------------------------------------------

function displayEvents() {
    const key = selectedDate.toDateString(); // Ex: "Tue Oct 21 2025"
    const currentEvents = events[key] || [];

    eventList.innerHTML = ""; // Limpa a lista antes de preencher

    if (currentEvents.length > 0) {
        noEventMsg.style.display = 'none'; // Esconde a mensagem "Nenhum evento..."

        // Ordena por hora
        currentEvents.sort((a, b) => a.time.localeCompare(b.time));

        currentEvents.forEach(event => {
            const listItem = document.createElement("li");

            // Formatando a data do evento para o padrão '21 de Novembro'
            const formattedDate = selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

            // HTML atualizado para o estilo e botões (Ponto 1 e 2)
            // A função openEditModal recebe: id, descrição, hora, data_ISO (para preencher o campo date)
            listItem.innerHTML = `
                <div class="event-details">
                    <p>${formattedDate} - ${event.desc}, ${event.time}</p>
                </div>
                <div class="event-actions">
                    <button class="edit-btn" onclick="openEditModal(${event.id}, '${event.desc.replace(/'/g, "\\'")}', '${event.time}', '${selectedDate.toISOString().split('T')[0]}')">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteEvent(${event.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            eventList.appendChild(listItem);
        });

    } else {
        noEventMsg.style.display = 'flex'; // Mostra a mensagem "Nenhum evento..."
    }
}


// ----------------------------------------------------------
// FUNÇÃO DE CARREGAMENTO DE EVENTOS (BUSCA NO DB)
// ----------------------------------------------------------

async function fetchAllUserEvents() {
    if (!email) return;

    try {
        // Rota no server.js: app.get('/eventos/listar/:id_usuario'
        const response = await fetch(`http://localhost:3001/eventos/listar/${email}`);
        const result = await response.json();

        if (result.success) {
            events = {}; // Limpa o cache

            result.data.forEach(ev => {
                const [year, month, day] = ev.dia.split('T')[0].split('-');
                // Cria a data localmente correta
                const correctDate = new Date(year, month - 1, day);

                const key = correctDate.toDateString();

                if (!events[key]) {
                    events[key] = [];
                }

                const time = ev.hora.substring(0, 5);

                events[key].push({
                    desc: ev.descricao,
                    time: time,
                    id: ev.id_evento // GUARDA O ID
                });
            });

            // Regenera o calendário para aplicar a classe 'has-event'
            generateCalendar(selectedDate);
            displayEvents();
        } else {
            console.error("Erro ao carregar eventos:", result.message);
        }
    } catch (error) {
        console.error("Erro de rede ao carregar eventos:", error);
    }
}

// ----------------------------------------------------------
// FUNÇÕES DO MODAL/CRUD
// ----------------------------------------------------------

// 1. Função para Resetar o Modal para Adicionar (Chamada após Fechar ou Editar)
function resetModalForAdd() {
    // Limpa os campos
    eventDescriptionInput.value = '';
    eventTimeInput.value = '';
    eventDateInput.value = selectedDate.toISOString().split('T')[0]; // Preenche com a data selecionada

    // Reseta o ID de edição
    eventIdInput.value = '';

    // Reseta o título e o handler do botão de salvar para a lógica de adição
    document.querySelector('.modal-content h3').textContent = 'Adicionar Evento';
    saveEvent.textContent = 'Salvar';
    saveEvent.onclick = saveNewEvent;
}

// 2. Função para Abrir o Modal de Adicionar
openForm.onclick = function () {
    resetModalForAdd(); // Garante que está no modo de Adicionar
    modal.style.display = "block";
}

// 3. Função para Fechar Modal
closeForm.onclick = function () {
    modal.style.display = "none";
    resetModalForAdd();
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
        resetModalForAdd();
    }
}

// 4. Função para Salvar Novo Evento (Atualizada para usar os novos IDs)
async function saveNewEvent() {
    if (!email) {
        alert("email do usuário não encontrado. Faça login novamente.");
        return;
    }

    const dia = eventDateInput.value;
    const hora = eventTimeInput.value;
    const descricao = eventDescriptionInput.value;

    if (!dia || !hora || !descricao) {
        alert("Todos os campos são obrigatórios.");
        return;
    }

    try {
        // Rota no server.js: app.post('/eventos/salvar'
        const response = await fetch('http://localhost:3001/eventos/salvar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                dia,
                hora,
                descricao
            })
        });

        const result = await response.json();

        if (result.success) {
            alert("Evento salvo com sucesso!");
            modal.style.display = 'none';
            // Recarrega todos os eventos para atualizar cache e calendário
            fetchAllUserEvents();
        } else {
            alert(`Erro ao salvar evento: ${result.message}`);
        }
    } catch (error) {
        console.error("Erro de rede ao salvar evento:", error);
        alert("Erro de conexão com o servidor ao salvar evento.");
    }
}

// Define o handler inicial para o botão de salvar
saveEvent.onclick = saveNewEvent;

// ----------------------------------------------------------
// NOVO: Funções para Editar e Deletar Eventos (Ponto 2)
// ----------------------------------------------------------

// 5. Função para Abrir o Modal de Edição (Reutiliza o modal existente)
function openEditModal(id, desc, time, date) {
    // 1. Muda o título do modal
    document.querySelector('.modal-content h3').textContent = 'Editar Evento';

    // 2. Preenche os campos do formulário
    eventDescriptionInput.value = desc;
    eventTimeInput.value = time;
    eventDateInput.value = date;

    // 3. Salva o ID do evento em um campo oculto
    eventIdInput.value = id;

    // 4. Muda o texto e o handler do botão de salvar
    saveEvent.textContent = 'Salvar';
    saveEvent.onclick = saveEditedEvent; // Define a nova função ao clicar em Salvar

    // 5. Exibe o modal
    modal.style.display = 'block';
}


// 6. Função para Salvar Evento Editado
async function saveEditedEvent() {
    const id = eventIdInput.value;
    const dia = eventDateInput.value;
    const hora = eventTimeInput.value;
    const descricao = eventDescriptionInput.value;

    if (!id || !dia || !hora || !descricao) {
        alert("Erro: Dados incompletos para edição.");
        return;
    }

    // if (!confirm("Confirmar edição do evento?")) {
    //     return;
    // }

    try {
        // Rota no server.js: app.put('/agenda/evento/editar/:id'
        const response = await fetch(`http://localhost:3001/agenda/evento/editar/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dia, hora, descricao })
        });

        const result = await response.json();

        if (result.success) {
            alert("Evento editado com sucesso!");
            modal.style.display = 'none';
            // Recarrega todos os eventos
            fetchAllUserEvents();
            // Reseta o modal para a próxima adição/abertura
            resetModalForAdd();
        } else {
            alert(`Erro ao editar evento: ${result.message}`);
        }
    } catch (error) {
        console.error("Erro de rede ao editar evento:", error);
        alert("Erro de conexão com o servidor ao editar evento.");
    }
}


// 7. Função para Deletar Evento
async function deleteEvent(eventId) {
    if (!confirm("Tem certeza que deseja excluir este evento?")) {
        return;
    }

    try {
        // Rota no server.js: app.delete('/agenda/evento/deletar/:id'
        const response = await fetch(`http://localhost:3001/agenda/evento/deletar/${eventId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.success) {
            alert("Evento excluído com sucesso!");
            // Recarrega todos os eventos do DB e atualiza o calendário/lista
            fetchAllUserEvents();
        } else {
            alert(`Erro ao excluir evento: ${result.message}`);
        }
    } catch (error) {
        console.error("Erro de rede ao deletar evento:", error);
        alert("Erro de conexão com o servidor ao deletar evento.");
    }
}


// Navegação de meses
prevMonthBtn.onclick = () => {
    selectedDate.setMonth(selectedDate.getMonth() - 1);
    generateCalendar(selectedDate);
    displayEvents();
};

nextMonthBtn.onclick = () => {
    selectedDate.setMonth(selectedDate.getMonth() + 1);
    generateCalendar(selectedDate);
    displayEvents();
};


// Inicialização
// O fetchAllUserEvents() chama generateCalendar(selectedDate) e displayEvents() após carregar os dados.
fetchAllUserEvents();