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

            const imageHtml = dados.profile_image
                ? `<img class="photo" src="http://localhost:3001${dados.profile_image}" alt="imagem usuario" draggable="false">`
                : `<img class="photo" src="/frontend/assets/max.jpg" alt="imagem usuario" draggable="false">`;

            container.innerHTML = `
                        ${imageHtml}
                        ${infoHtml}
                        ${botoesHtml}`;

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
    const imageFile = document.getElementById('image-input').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    if (imageFile) {
        formData.append('profile_image', imageFile);
    }

    const currentEmail = JSON.parse(localStorage.getItem("Informacoes"))?.email || email;

    try {
        const response = await fetch(`http://localhost:3001/edit/${currentEmail}`, {
            method: 'PUT',
            body: formData
        });

        const results = await response.json();
        console.log('Edit response:', results);

        if (results.success) {
            localStorage.setItem("Informacoes", JSON.stringify(results.data));
            window.location.href = "../index.html";
        } else {
            alert(results.message || 'Erro ao editar o usuário!');
        }
    } catch (error) {
        console.error('Error editing profile:', error);
        alert('Erro ao editar o perfil');
    }
}