function SignUp() {
    const logado = localStorage.getItem("Informacoes");
    if (logado) {
        window.location.href = "./user/user.html";
    } else {
        window.location.href = "../signUp/SignUp.html";
    }
}

function GoToInstagram(url) {
    window.open(url, '_blank')
}


function GoToGitHub(url) {
    window.open(url, '_blank');

}
// Add to your script.js

const receitas = [
    {
        titulo: "Frango grelhado com folhas de alface",
        topico: "Ingredientes:",
        ingredientes: [
            "2 peitos de frango",
            "½ xícara de iogurte natural(ou grego)",
            "Suco de 1 limão",
            "2 colheres de sopa de azeite de oliva",
            "2 dentes de alho picados",
            "1 colher de chá de orégano seco",
        ],
        preparo: "Marine o frango por 30 min com iogurte, limão, azeite e temperos. Grelhe até dourar, fatie e monte com vegetais e feta. Regue com o molho feito da marinada reservada."
    },
    {
        titulo: "Tigela de sorvete com framboesa pêssego e manga",
        topico: "Ingredientes:",
        ingredientes: [
            "Bata as frutas congeladas no liquidificador.",
            "Despeje na tigela.",
            "Decore com mais frutas por cima e sirva gelado."
        ],
        preparo: "Bata as frutas congeladas com iogurte até formar um creme espesso. Ajuste a consistência, sirva na tigela e decore com frutas, coco e amêndoas."
    },
    {
        titulo: "Burrito de frango com salada",
        topico: "Ingredientes:",
        ingredientes: [
            "Cozinhe o frango e desfie.",
            "Misture com alface, tomate e molho.",
            "Enrole na tortilha e sirva."
        ],
        preparo: "Misture frango desfiado com iogurte, mostarda e temperos. Adicione aipo, cranberries e nozes. Recheie o wrap com folhas verdes, enrole e sirva."
    }
];

const cards = document.querySelectorAll('.card');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalTopics = document.getElementById('modalTopics');
const modalHowToMake = document.getElementById('modalHowToMake');
const modalSteps = document.getElementById('modalSteps');
const closeBtn = document.getElementById('closeModal');

modal.addEventListener('show', () => document.body.classList.add('modal-open'));
modal.addEventListener('hide', () => document.body.classList.remove('modal-open'));

cards.forEach((card, index) => {
    card.addEventListener('click', () => {
        const receita = receitas[index];
        modalTitle.innerText = receita.titulo;
        modalTopics.innerText = receita.topico;
        modalSteps.innerHTML = receita.ingredientes.map(ingredientes => `<li>${ingredientes}</li>`).join('');
        modalHowToMake.innerText = receita.preparo;
        modal.style.display = 'block';
    });
});


function fecharModal() {
    modal.style.display = 'none';
}

closeBtn.addEventListener('click', fecharModal);

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
    if (e.target == modal) {
        fecharModal();
    }
});