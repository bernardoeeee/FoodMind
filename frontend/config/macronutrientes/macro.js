function SignUp() {
    const logado = localStorage.getItem("Informacoes");
    if (logado) {
        window.location.href = "/frontend/pagina_principal/user/user.html";
    } else {
        window.location.href = "/frontend/signUp/SignUp.html";
    }
}

function GoToConfig() {
    window.location.href = "../config.html";
}

function GoToChanceProfile() {
    window.location.href = "../personalizar_perfil/personalizarPerfil.html";
}

const ctx = document.getElementById('graficoMacronutrientes').getContext('2d');
new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Carboidratos', 'Proteínas', 'Gorduras boas'],
        datasets: [{
            label: 'Consumo diário',
            data: [50, 30, 20],
            backgroundColor: ['#f5c361', '#88b04b', '#a4c2a8'],
        }]
    }
});

function sugerirRefeicao() {
    const opcoes = [
        "Arroz integral + frango grelhado + abobrinha refogada",
        "Ovo cozido + batata doce + brócolis",
        "Iogurte natural + granola + banana",
        "Pão integral + pasta de amendoim + mamão",
        "Salada com grão-de-bico, atum e azeite de oliva"
    ];
    const random = Math.floor(Math.random() * opcoes.length);
    document.getElementById("sugestaoRefeicao").textContent = opcoes[random];
}