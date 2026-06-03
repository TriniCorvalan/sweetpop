/* SweetPop - Formulario de inicio de sesión */

document.addEventListener("DOMContentLoaded", () => {
  /* Redirige si el visitante ya tiene sesión activa. */
  requireGuest();

  const form = document.getElementById("formLogin");
  const credentialInput = document.getElementById("credential");
  const passwordInput = document.getElementById("password");
  const ALERT_ID = "alertLogin";

  /* Valida campos, autentica y redirige según rol (admin o user). */
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFormAlert(ALERT_ID);

    let formIsValid = true;

    if (credentialInput.value.trim() === "") {
      markAsInvalid(credentialInput, "Ingresa tu nickname o correo electrónico.");
      formIsValid = false;
    } else {
      markAsValid(credentialInput);
    }

    if (passwordInput.value === "") {
      markAsInvalid(passwordInput, "Ingresa tu contraseña.");
      formIsValid = false;
    } else {
      markAsValid(passwordInput);
    }

    if (!formIsValid) {
      showFormAlert(ALERT_ID, "danger", "Completa todos los campos requeridos.");
      return;
    }

    const result = login(credentialInput.value, passwordInput.value);

    if (!result.success) {
      showFormAlert(ALERT_ID, "danger", result.message);
      return;
    }

    showFormAlert(ALERT_ID, "success", `${result.message} Redirigiendo...`);

    /* Admin va al inventario; user al inicio del sitio. */
    setTimeout(() => {
      if (result.user.role === "admin") {
        window.location.href = "inventory.html";
      } else {
        window.location.href = "index.html";
      }
    }, 800);
  });

  /* Limpia alertas y estados visuales mientras el usuario escribe. */
  credentialInput.addEventListener("input", () => {
    clearFormAlert(ALERT_ID);
    clearValidityClasses(form);
  });

  passwordInput.addEventListener("input", () => {
    clearFormAlert(ALERT_ID);
    clearValidityClasses(form);
  });
});
