const container = document.getElementById("container")
const registerBtn = document.getElementById("register")
const loginBtn = document.getElementById("login")

registerBtn.addEventListener("click", () => {
    container.classList.add("active")
})
loginBtn.addEventListener("click", () => {
    container.classList.remove("active")
})



async function signUp(event) {
    event.preventDefault()
    const name = document.getElementById("nameCadastro").value
    const email = document.getElementById("emailCadastro").value
    const password = document.getElementById("passwordCadastro").value

    const data = { name, email, password }
    console.log(data)

    const response = await fetch('http://localhost:3001/cadastro/signUp', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })

    console.log(response)
    const results = await response.json();
    console.log(results)

    if (results.success) {
        alert(results.message)
        // localStorage.setItem("Informacoes", JSON.stringify(results.data))
    } else {
        console.log(message)
    }
};

async function signIn(event) {
    event.preventDefault()
    const name = document.getElementById("nameLogin").value;
    const email = document.getElementById("emailLogin").value;
    const password = document.getElementById("passwordLogin").value;

    const usuario = { name, email, password };

    await fetch('http://localhost:3001/cadastro/signIn', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario)
    })
        .then(response => response.json())
        .then(resultado => {
            if (resultado.success) {
                alert(resultado.message);

                console.log(resultado.user.id_user);

                const { id_user, name, email, password, profile_image } = resultado.user;

                localStorage.setItem("Informacoes", JSON.stringify({ id_user, name, email, password, profile_image }));

                window.location.href = '../pagina_principal/index.html';
            } else {
                alert(resultado.message || "Login falhou.");
            }
        })
        .catch(error => {
            console.error("Erro ao fazer login:", error);
        });
};