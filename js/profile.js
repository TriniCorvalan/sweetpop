/* SweetPop - Edición de perfil de usuario (solo rol user con sesión activa) */

document.addEventListener("DOMContentLoaded", () => {
  if (!requireRole(["user"])) {
    return;
  }

  const form = document.getElementById("formPerfil");
  const fullNameInput = document.getElementById("fullName");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const birthdateInput = document.getElementById("birthdate");
  const addressInput = document.getElementById("address");
  const signupDateInput = document.getElementById("signupDate");
  const ALERT_ID = "alertPerfil";

  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  loadProfileForm(currentUser);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFormAlert(ALERT_ID);

    const users = getUsers();
    const userIndex = users.findIndex((user) => user.id === currentUser.id);
    if (userIndex === -1) {
      showFormAlert(ALERT_ID, "danger", "No se encontró tu cuenta. Inicia sesión nuevamente.");
      return;
    }

    users[userIndex].address = addressInput.value.trim();
    saveUsers(users);

    loadProfileForm(users[userIndex]);
    showFormAlert(ALERT_ID, "success", "Dirección de despacho actualizada correctamente.");
  });

  function loadProfileForm(user) {
    fullNameInput.value = user.fullName || "";
    usernameInput.value = user.username || "";
    emailInput.value = user.email || "";
    birthdateInput.value = user.birthdate || "";
    addressInput.value = user.address || "";
    signupDateInput.value = user.signupDate || "";
  }
});
