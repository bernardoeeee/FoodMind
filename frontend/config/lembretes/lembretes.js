function GoToConfig() {
    window.location.href = "../config.html";
}

function GoToChanceProfile() {
    window.location.href = "../personalizar_perfil/personalizarPerfil.html";
}

function GoToMacro() {
    window.location.href = "../macronutrientes/macro.html";
}

function SignUp() {
    const logado = localStorage.getItem("Informacoes");
    if (logado) {
        window.location.href = "/frontend/pagina_principal/user/user.html";
    } else {
        window.location.href = "/frontend/signUp/SignUp.html";
    }
}
document.addEventListener('DOMContentLoaded', () => {

    const calendarBody = document.getElementById("calendar-body");
    const monthYear = document.getElementById("monthYear");
    const eventList = document.getElementById("event-list");
    const noEventMsg = document.getElementById("no-event");

    const modal = document.getElementById("modal");
    const openForm = document.getElementById("openForm");
    const closeForm = document.getElementById("closeForm");
    const saveEvent = document.getElementById("saveEvent");

    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");

    const eventDescriptionInput = document.getElementById("event-description");
    const eventTimeInput = document.getElementById("event-time");
    const eventDateInput = document.getElementById("event-date");

    let selectedDate = new Date();
    let events = {};

    const usuarioLogado = JSON.parse(localStorage.getItem("Informacoes"));
    let email = null;

    if (usuarioLogado) {
        email = usuarioLogado.email ||
            (usuarioLogado.user && usuarioLogado.user.email) ||
            (usuarioLogado.data && usuarioLogado.data.email) ||
            null;
        if (!email) {
            console.warn("Informacoes encontrado no localStorage, mas sem campo email.");
        }
    } else {
        console.warn("Informacoes não encontrado no localStorage.");
    }

    const eventIdInput = document.createElement('input');
    eventIdInput.type = 'hidden';
    eventIdInput.id = 'edit-event-id';

    const modalFormElem = document.getElementById('modal-form');
    if (modalFormElem) {
        modalFormElem.appendChild(eventIdInput);
    } else {
        console.warn("Elemento #modal-form não encontrado — verifique o HTML.");
    }

    function generateCalendar(date) {
        calendarBody.innerHTML = "";
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        monthYear.textContent = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        let row = document.createElement("tr");

        for (let i = 0; i < firstDay; i++) {
            row.appendChild(document.createElement("td"));
        }

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

            const eventKey = currentDate.toDateString();
            if (events[eventKey] && events[eventKey].length > 0) {
                cell.classList.add("has-event");
            }

            if (isSameDate(currentDate, selectedDate)) {
                cell.classList.add("selected");
            }

            cell.addEventListener('click', () => {
                document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
                selectedDate = currentDate;
                cell.classList.add("selected");
                displayEvents();
            });

            row.appendChild(cell);
        }

        if (row.children.length > 0) {
            while (row.children.length < 7) {
                row.appendChild(document.createElement("td"));
            }
            calendarBody.appendChild(row);
        }
    }

    function isSameDate(d1, d2) {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    }

    function displayEvents() {
        const key = selectedDate.toDateString();
        const currentEvents = events[key] || [];

        eventList.innerHTML = "";

        if (currentEvents.length > 0) {
            noEventMsg.style.display = 'none';

            currentEvents.sort((a, b) => a.time.localeCompare(b.time));

            currentEvents.forEach(event => {
                const listItem = document.createElement("li");

                const formattedDate = selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

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
            noEventMsg.style.display = 'flex';
        }
    }

    async function fetchAllUserEvents() {
        if (!email) {
            console.warn("Email do usuário não definido. Ignorando carregamento de eventos.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/eventos/listar/${email}`);
            const result = await response.json();

            if (result.success) {
                events = {};
                result.data.forEach(ev => {
                    // dia pode vir como 'YYYY-MM-DD' ou ISO
                    let diaStr = "";
                    if (ev.dia instanceof Date) {
                        diaStr = ev.dia.toISOString().split('T')[0];
                    } else if (typeof ev.dia === 'string') {
                        diaStr = ev.dia.includes('T') ? ev.dia.split('T')[0] : ev.dia.split(' ')[0];
                    } else {
                        diaStr = String(ev.dia);
                    }

                    const parts = diaStr.split('-');
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10);
                    const day = parseInt(parts[2], 10);

                    const correctDate = new Date(year, month - 1, day);
                    const key = correctDate.toDateString();

                    if (!events[key]) {
                        events[key] = [];
                    }

                    const time = ev.hora ? String(ev.hora).substring(0, 5) : '00:00';

                    // usar id_evento (o backend agora envia)
                    events[key].push({
                        desc: ev.descricao,
                        time: time,
                        id: ev.id_evento || ev.id
                    });
                });

                generateCalendar(selectedDate);
                displayEvents();
            } else {
                console.error("Erro ao carregar eventos:", result.message);
            }
        } catch (error) {
            console.error("Erro de rede ao carregar eventos:", error);
        }
    }

    function resetModalForAdd() {
        eventDescriptionInput.value = '';
        eventTimeInput.value = '';
        eventDateInput.value = selectedDate.toISOString().split('T')[0];
        eventIdInput.value = '';

        const title = document.querySelector('.modal-content h3');
        if (title) title.textContent = 'Adicionar Evento';
        if (saveEvent) saveEvent.textContent = 'Salvar';
        if (saveEvent) saveEvent.onclick = saveNewEvent;
    }

    if (openForm) {
        openForm.addEventListener('click', () => {
            resetModalForAdd();
            if (modal) {
                modal.classList.add('open');
            } else {
                console.warn("Elemento #modal não encontrado.");
            }
        });
    }

    if (closeForm) {
        closeForm.addEventListener('click', () => {
            if (modal) {
                modal.classList.remove('open');
                resetModalForAdd();
            }

        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            if (modal) {
                modal.classList.remove('open');
                resetModalForAdd();
            }
        }
    });

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
                if (modal) {
                    modal.classList.remove('open');
                    fetchAllUserEvents();
                }
            } else {
                alert(`Erro ao salvar evento: ${result.message}`);
            }
        } catch (error) {
            console.error("Erro de rede ao salvar evento:", error);
            alert("Erro de conexão com o servidor ao salvar evento.");
        }
    }

    if (saveEvent) saveEvent.onclick = saveNewEvent;

    window.openEditModal = function openEditModal(id, desc, time, date) {
        const title = document.querySelector('.modal-content h3');
        if (title) title.textContent = 'Editar Evento';

        eventDescriptionInput.value = desc;
        eventTimeInput.value = time;
        eventDateInput.value = date;

        eventIdInput.value = id;

        if (saveEvent) saveEvent.textContent = 'Salvar';
        if (saveEvent) saveEvent.onclick = saveEditedEvent;

        if (modal) modal.classList.add('open');
    };

    async function saveEditedEvent() {
        const id = eventIdInput.value;
        const dia = eventDateInput.value;
        const hora = eventTimeInput.value;
        const descricao = eventDescriptionInput.value;

        if (!id || !dia || !hora || !descricao) {
            alert("Erro: Dados incompletos para edição.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/agenda/evento/editar/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dia, hora, descricao })
            });

            const result = await response.json();

            if (result.success) {
                alert("Evento editado com sucesso!");
                if (modal) modal.classList.remove('open');
                fetchAllUserEvents();
                resetModalForAdd();
            } else {
                alert(`Erro ao editar evento: ${result.message}`);
            }
        } catch (error) {
            console.error("Erro de rede ao editar evento:", error);
            alert("Erro de conexão com o servidor ao editar evento.");
        }
    }

    window.deleteEvent = async function deleteEvent(eventId) {
        if (!confirm("Tem certeza que deseja excluir este evento?")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/agenda/evento/deletar/${eventId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            if (result.success) {
                alert("Evento excluído com sucesso!");
                fetchAllUserEvents();
            } else {
                alert(`Erro ao excluir evento: ${result.message}`);
            }
        } catch (error) {
            console.error("Erro de rede ao deletar evento:", error);
            alert("Erro de conexão com o servidor ao deletar evento.");
        }
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            selectedDate.setMonth(selectedDate.getMonth() - 1);
            generateCalendar(selectedDate);
            displayEvents();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            selectedDate.setMonth(selectedDate.getMonth() + 1);
            generateCalendar(selectedDate);
            displayEvents();
        });
    }

    fetchAllUserEvents();
});
