/* SweetPop - Validaciones reutilizables para formularios */

/* Limpia el mensaje de alerta de un formulario por id de contenedor. */
function clearFormAlert(alertId) {
  const alertEl = document.getElementById(alertId);
  if (alertEl) {
    alertEl.innerHTML = "";
  }
}

/* Muestra un mensaje de alerta Bootstrap en el contenedor indicado. */
function showFormAlert(alertId, type, message) {
  const alertEl = document.getElementById(alertId);
  if (!alertEl) {
    return;
  }
  alertEl.innerHTML = `<div class="alert alert-${type} mb-0" role="alert">${message}</div>`;
}

/* Valida que el nombre completo esté presente. Retorna false si falla. */
function validateFullName(fullNameInput) {
  if (fullNameInput.value.trim() === "") {
    markAsInvalid(fullNameInput, "El nombre completo es obligatorio.");
    return false;
  }
  markAsValid(fullNameInput);
  return true;
}

/* Valida formato de correo electrónico. Retorna false si falla. */
function validateEmail(emailInput) {
  if (!emailInput.value.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    markAsInvalid(emailInput, "Ingresa un correo electrónico válido.");
    return false;
  }
  markAsValid(emailInput);
  return true;
}

/* Valida nickname: longitud y caracteres permitidos. Retorna false si falla. */
function validateUsername(usernameInput) {
  if (usernameInput.value.trim() === "") {
    markAsInvalid(usernameInput, "El nickname es obligatorio.");
    return false;
  }
  if (usernameInput.value.length < 6 || usernameInput.value.length > 20) {
    markAsInvalid(usernameInput, "El nickname debe tener entre 6 y 20 caracteres.");
    return false;
  }
  if (!usernameInput.value.match(/^[a-zA-Z0-9._-]+$/)) {
    markAsInvalid(usernameInput, "El nickname debe contener solo letras, números, puntos, guiones y guiones bajos.");
    return false;
  }
  markAsValid(usernameInput);
  return true;
}

/* Valida contraseña y confirmación según reglas del sitio.
   passwordConfirmInput es opcional (solo valida coincidencia si se envía). Retorna false si falla. */
function validatePasswords(passwordInput, passwordConfirmInput) {
  const errors = { password: [], passwordConfirm: [] };

  if (passwordInput.value.length < 6) {
    errors.password.push("La contraseña debe tener al menos 6 caracteres.");
  }
  if (passwordInput.value.length > 18) {
    errors.password.push("La contraseña debe tener menos de 18 caracteres.");
  }
  if (!passwordInput.value.match(/[0-9]/)) {
    errors.password.push("La contraseña debe incluir un número.");
  }
  if (!passwordInput.value.match(/[A-Z]/)) {
    errors.password.push("La contraseña debe incluir una letra mayúscula.");
  }
  if (!passwordInput.value.match(/[a-z]/)) {
    errors.password.push("La contraseña debe incluir una letra minúscula.");
  }
  if (passwordConfirmInput && passwordConfirmInput.value !== passwordInput.value) {
    errors.passwordConfirm.push("Las contraseñas no coinciden.");
  }

  if (errors.password.length > 0 || errors.passwordConfirm.length > 0) {
    if (errors.password.length > 0) {
      markAsInvalid(passwordInput, errors.password.join("\n"));
    }
    if (passwordConfirmInput && errors.passwordConfirm.length > 0) {
      markAsInvalid(passwordConfirmInput, errors.passwordConfirm.join("\n"));
    }
    return false;
  }

  markAsValid(passwordInput);
  if (passwordConfirmInput) {
    markAsValid(passwordConfirmInput);
  }
  return true;
}

/* Valida edad mínima de 13 años. Retorna false si falla. */
function validateBirthdate(birthdateInput) {
  const birthdate = new Date(birthdateInput.value);
  if (birthdate.toString() === "Invalid Date") {
    markAsInvalid(birthdateInput, "Ingresa una fecha de nacimiento válida.");
    return false;
  }

  if (calculateAge(birthdate) < 13) {
    markAsInvalid(birthdateInput, "Debes tener al menos 13 años.");
    return false;
  }

  markAsValid(birthdateInput);
  return true;
}

/* Calcula la edad en años a partir de una fecha de nacimiento. */
function calculateAge(birthdate) {
  const todayDate = new Date();
  const birthdateDate = new Date(birthdate);
  let age = todayDate.getFullYear() - birthdateDate.getFullYear();
  const monthDifference = todayDate.getMonth() - birthdateDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && todayDate.getDate() < birthdateDate.getDate())
  ) {
    age--;
  }

  return age;
}

/* Limpia las clases is-valid e is-invalid de todos los inputs del formulario. */
function clearValidityClasses(form) {
  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    input.classList.remove("is-valid");
    input.classList.remove("is-invalid");
  });
}

/* Marca un input como válido y limpia su mensaje de error. */
function markAsValid(input) {
  input.classList.add("is-valid");
  const feedback = input.parentElement.querySelector(".invalid-feedback");
  if (feedback) {
    feedback.innerHTML = "";
  }
}

/* Marca un input como inválido y muestra el mensaje de error. */
function markAsInvalid(input, message) {
  input.classList.add("is-invalid");
  const feedback = input.parentElement.querySelector(".invalid-feedback");
  if (feedback) {
    feedback.innerHTML = message;
  }
}
