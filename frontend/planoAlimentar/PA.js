function SignUp() {
    const logado = localStorage.getItem("Informacoes");
    if (logado) {
        window.location.href = "../pagina_principal/user/user.html";
    } else {
        window.location.href = "../signUp/SignUp.html";
    }
}


const alimentos = {
    "Arroz": { carboidratos: 28, proteinas: 2.5, gordura: 0.3 },
    "Feijão": { carboidratos: 14, proteinas: 4.8, gordura: 0.5 },
    "Frango": { carboidratos: 0, proteinas: 27, gordura: 3.6 },
    "Ovo": { carboidratos: 1.1, proteinas: 6.3, gordura: 5.3 },
    "Batata": { carboidratos: 17, proteinas: 2, gordura: 0.1 },
    "Peito de frango": { carboidratos: 0, proteinas: 27, gordura: 3.6 },
    "Salmão": { carboidratos: 0, proteinas: 22, gordura: 13 },
    "Batata doce": { carboidratos: 20, proteinas: 1.6, gordura: 0.1 },
    "Banana": { carboidratos: 22, proteinas: 1.1, gordura: 0.3 },
    "Amêndoas": { carboidratos: 21, proteinas: 21, gordura: 49 },
    "Abacaxi": { carboidratos: 13.1, proteinas: 0.5, gordura: 0.1 },
    "Melancia": { carboidratos: 7.6, proteinas: 0.6, gordura: 0.2 },
    "Camarão": { carboidratos: 0, proteinas: 20, gordura: 0.9 },
    "Ostras": { carboidratos: 5.4, proteinas: 9, gordura: 2.5 },
    "Lagosta": { carboidratos: 0, proteinas: 19, gordura: 1 }
    // "Mulher": { carboidratos: 0, proteinas: 10000000000, gordura: 0 }
};

function adicionarAlimento() {
    let input = document.getElementById("alimento").value.trim();
    let tabela = document.getElementById("tabela");

    // Verifica se o alimento existe na base de dados
    if (alimentos[input]) {
        // Verifica se já foi adicionado
        if (![...tabela.children].some(row => row.cells[0].textContent === input)) {
            let alimento = alimentos[input];
            
            // Criando nova linha
            let row = tabela.insertRow();
            row.insertCell(0).textContent = input;
            row.insertCell(1).textContent = alimento.carboidratos;
            row.insertCell(2).textContent = alimento.proteinas;
            row.insertCell(3).textContent = alimento.gordura;

            // Criando botão de remover
            let btnRemover = document.createElement("button");
            btnRemover.textContent = "X";
            btnRemover.style.backgroundColor = "red";
            btnRemover.style.color = "white";
            btnRemover.style.border = "none";
            btnRemover.style.cursor = "pointer";
            btnRemover.onclick = function () {
                tabela.deleteRow(row.rowIndex - 1);
            };

            row.insertCell(4).appendChild(btnRemover);
        } else {
            alert("Esse alimento já foi adicionado!");
        }
    } else {
        alert("Alimento não encontrado na base de dados.");
    }

    // Limpar input
    document.getElementById("alimento").value = "";
}

