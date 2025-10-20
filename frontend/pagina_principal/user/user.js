document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("load", () => {
        if (localStorage.getItem("Informacoes")) {
            let dados = JSON.parse(localStorage.getItem('Informacoes'));

            const container = document.querySelector(".container");

            const infoHtml = `
                <div id="Informacoes" class="description">
                    <h2>Nome: ${dados.name}</h2>
                    <h2>Email: ${dados.email}</h2>
                    <h2>Senha: ${dados.password}</h2>
                </div>
            `;

            const botoesHtml = `
                <div class="botoes">
                    <button onclick="remover('${dados.email}')">
                        <i class="fa-solid fa-trash fa-2xl" style="color: #ff0000;"></i>
                    </button>
                    <button id="botaoEditar">
                        <i class="fa-solid fa-user-pen fa-2xl" style="color: #4CAF50;"></i>
                    </button>
                </div>
            `;

            container.innerHTML = `
                <img class="photo" src="/frontend/assets/25.jpg" alt="imagem usuario" draggable="false">
                ${infoHtml}
                ${botoesHtml}
            `;

            // Add this block to handle modal opening
            const closeBtn = document.getElementById('closeModal');
            const botaoEditar = document.getElementById('botaoEditar');
            const modal = document.getElementById('modal');
            botaoEditar.addEventListener('click', () => {
                modal.style.display = 'block';
            });
            function fecharModal() {
                modal.style.display = 'none';
            }
            closeBtn.addEventListener('click', fecharModal);
        }
        window.addEventListener('click', (e) => {
            if (e.target == modal) {
                fecharModal();
            }
        });
    });
});



async function remover(email) {
    console.log(email); 
    const response = await fetch(`http://localhost:3001/remover/${email}`, {
        method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
        localStorage.removeItem("Informacoes");
        window.location.href = "../index.html";
    } else {
        alert(result.message || 'Erro ao remover o usuário!');
    }
}


async function edit(event) {
    event.preventDefault();
    const name = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('senha').value;
    const data = { name, email, password }
    const response = await fetch(`http://localhost:3001/edit/${localStorage.getItem("Informacoes") ? JSON.parse(localStorage.getItem("Informacoes")).email : email}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const results = await response.json();

    if (results.success) {
        localStorage.setItem("Informacoes", JSON.stringify(results.data));
        window.location.href = "../index.html";
    } else {
        alert(results.message || 'Erro ao editar o usuário!');
    }
}