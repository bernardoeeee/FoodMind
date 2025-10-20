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

function GoToMacro() {
    window.location.href = "../macronutrientes/macro.html";
}

// document.addEventListener("DOMContentLoaded", () => {
//     const checkboxes = document.querySelectorAll('input[type="checkbox"]');

//     // Carrega os valores salvos do localStorage
//     checkboxes.forEach(checkbox => {
//         const saved = localStorage.getItem(checkbox.id);
//         if (saved === "true") {
//             checkbox.checked = true;
//         }
//     });

//     // Salva o valor ao mudar
//     checkboxes.forEach(checkbox => {
//         checkbox.addEventListener("change", () => {
//             localStorage.setItem(checkbox.id, checkbox.checked);
//         });
//     });
// });