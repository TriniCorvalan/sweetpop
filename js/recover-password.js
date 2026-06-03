/* SweetPop - Recuperación de contraseña para cuentas user */

document.addEventListener("DOMContentLoaded", () => {
  /* Redirige si el visitante ya tiene sesión activa. */
  requireGuest();

  const ALERT_ID = "alertRecuperar";
  const emailForm = document.getElementById("formRecuperarEmail");
  const passwordForm = document.getElementById("formRecuperarPassword");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const passwordConfirmInput = document.getElementById("passwordConfirm");
  const introEl = document.getElementById("recuperarIntro");

  /* Correo verificado en el paso 1; se usa en el paso 2 para actualizar la clave. */
  let recoveryEmail = "";

  /* Paso 1: verifica que el correo pertenezca a un usuario client (no admin). */
  emailForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFormAlert(ALERT_ID);
    clearValidityClasses(emailForm);

    if (!validateEmail(emailInput)) {
      showFormAlert(ALERT_ID, "danger", "Ingresa un correo electrónico válido.");
      return;
    }

    const user = findUserByEmail(emailInput.value);

    if (!user) {
      showFormAlert(ALERT_ID, "danger", "No encontramos una cuenta con ese correo.");
      return;
    }

    if (user.role === "admin") {
      showFormAlert(
        ALERT_ID,
        "danger",
        "La recuperación de contraseña no está disponible para cuentas de administrador."
      );
      return;
    }

    recoveryEmail = user.email;
    emailForm.classList.add("d-none");
    passwordForm.classList.remove("d-none");
    introEl.textContent = `Crea una nueva contraseña para ${user.email}.`;
    showFormAlert(ALERT_ID, "info", "Correo verificado. Ahora define tu nueva contraseña.");
  });

  /* Paso 2: valida y guarda la nueva contraseña en sweetpop_users. */
  passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFormAlert(ALERT_ID);
    clearValidityClasses(passwordForm);

    if (!validatePasswords(passwordInput, passwordConfirmInput)) {
      showFormAlert(ALERT_ID, "danger", "Revisa los requisitos de la nueva contraseña.");
      return;
    }

    const users = getUsers();
    const userIndex = users.findIndex(
      (user) => user.email.toLowerCase() === recoveryEmail.toLowerCase()
    );

    if (userIndex === -1) {
      showFormAlert(ALERT_ID, "danger", "No fue posible actualizar la contraseña. Intenta de nuevo.");
      return;
    }

    users[userIndex].password = passwordInput.value;
    saveUsers(users);

    passwordForm.classList.add("d-none");
    introEl.textContent = "Tu contraseña fue actualizada correctamente.";
    showFormAlert(
      ALERT_ID,
      "success",
      'Contraseña actualizada. <a href="login.html" class="alert-link">Inicia sesión aquí</a>.'
    );
  });

  /* Validación en tiempo real en ambos pasos del flujo. */
  emailInput.addEventListener("input", () => {
    clearFormAlert(ALERT_ID);
    clearValidityClasses(emailForm);
  });

  passwordInput.addEventListener("input", () => {
    clearFormAlert(ALERT_ID);
    clearValidityClasses(passwordForm);
    validatePasswords(passwordInput, passwordConfirmInput);
  });

  passwordConfirmInput.addEventListener("input", () => {
    clearFormAlert(ALERT_ID);
    clearValidityClasses(passwordForm);
    validatePasswords(passwordInput, passwordConfirmInput);
  });
});
