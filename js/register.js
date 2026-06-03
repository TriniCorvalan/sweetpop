/* SweetPop - Formulario de registro de usuarios (rol user) */

document.addEventListener("DOMContentLoaded", () => {
  /* Redirige si el visitante ya tiene sesión activa. */
  requireGuest();

  const form = document.getElementById("formRegistro");
  const fullNameInput = document.getElementById("fullName");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const birthdateInput = document.getElementById("birthdate");
  const passwordInput = document.getElementById("password");
  const passwordConfirmInput = document.getElementById("passwordConfirm");
  const addressInput = document.getElementById("address");
  const ALERT_ID = "alertRegistro";

  /* Envía el registro: valida, evita duplicados y guarda en sweetpop_users. */
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFormAlert(ALERT_ID);

    let formIsValid = true;

    if (!validateFullName(fullNameInput)) {
      formIsValid = false;
    }
    if (!validateUsername(usernameInput)) {
      formIsValid = false;
    }
    if (!validateEmail(emailInput)) {
      formIsValid = false;
    }
    if (!validatePasswords(passwordInput, passwordConfirmInput)) {
      formIsValid = false;
    }
    if (!validateBirthdate(birthdateInput)) {
      formIsValid = false;
    }

    if (!formIsValid) {
      showFormAlert(ALERT_ID, "danger", "Por favor, completa todos los campos requeridos correctamente.");
      return;
    }

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();

    if (username.toLowerCase() === "admin") {
      showFormAlert(ALERT_ID, "danger", "Ese nickname no está disponible para registro.");
      return;
    }

    /* Evita nickname o email ya registrados. */
    if (findUserByUsername(username)) {
      showFormAlert(ALERT_ID, "danger", "Ese nickname ya está registrado.");
      return;
    }

    if (findUserByEmail(email)) {
      showFormAlert(ALERT_ID, "danger", "Ese correo electrónico ya está registrado.");
      return;
    }

    /* Persiste el nuevo usuario con rol user en localStorage. */
    const users = getUsers();
    users.push({
      id: generateId("user"),
      fullName: fullNameInput.value.trim(),
      username,
      email,
      password: passwordInput.value,
      role: "user",
      birthdate: birthdateInput.value,
      address: addressInput.value.trim(),
      signupDate: new Date().toLocaleString(),
    });
    saveUsers(users);

    form.reset();
    clearValidityClasses(form);
    showFormAlert(
      ALERT_ID,
      "success",
      'Registro exitoso. <a href="login.html" class="alert-link">Inicia sesión aquí</a> para continuar.'
    );
  });

  /* Validación en tiempo real al escribir en cada campo. */
  fullNameInput.addEventListener("input", () => {
    clearValidityClasses(form);
    clearFormAlert(ALERT_ID);
    validateFullName(fullNameInput);
  });

  usernameInput.addEventListener("input", () => {
    clearValidityClasses(form);
    clearFormAlert(ALERT_ID);
    validateUsername(usernameInput);
  });

  emailInput.addEventListener("input", () => {
    clearValidityClasses(form);
    clearFormAlert(ALERT_ID);
    validateEmail(emailInput);
  });

  passwordInput.addEventListener("input", () => {
    clearValidityClasses(form);
    clearFormAlert(ALERT_ID);
    validatePasswords(passwordInput, passwordConfirmInput);
  });

  passwordConfirmInput.addEventListener("input", () => {
    clearValidityClasses(form);
    clearFormAlert(ALERT_ID);
    validatePasswords(passwordInput, passwordConfirmInput);
  });

  birthdateInput.addEventListener("input", () => {
    clearValidityClasses(form);
    clearFormAlert(ALERT_ID);
    validateBirthdate(birthdateInput);
  });

  /* Limpia alertas y clases visuales al resetear el formulario. */
  form.addEventListener("reset", () => {
    clearFormAlert(ALERT_ID);
    setTimeout(() => {
      clearValidityClasses(form);
    }, 50);
  });
});
