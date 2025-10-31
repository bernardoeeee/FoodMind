function SignUp() {
    const logado = localStorage.getItem("Informacoes");
    if (logado) {
        window.location.href = "../pagina_principal/user/user.html";  
    } else {
        window.location.href = "../signUp/SignUp.html";
    }
}


function GoToProfileChanges(){
    window.location.href = "../config/personalizar_perfil/personalizarPerfil.html";
}

function GoToMacro() {
    window.location.href = "../config/macronutrientes/macro.html";
}
function GoToReminders() {
    window.location.href = "../config/lembretes/lembretes.html";
}