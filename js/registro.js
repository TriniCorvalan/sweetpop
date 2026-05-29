document.addEventListener("DOMContentLoaded", () => {
  // Obtener los elementos del formulario
  const form = document.getElementById("formRegistro");
  const fullNameInput = document.getElementById("fullName");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const birthdateInput = document.getElementById("birthdate");
  const passwordInput = document.getElementById("password");
  const passwordConfirmInput = document.getElementById("passwordConfirm");
  const addressInput = document.getElementById("address");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearAlert();

    let formIsValid = true;
    // Validar el nombre
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
      showAlert("danger", "Por favor, completa todos los campos requeridos correctamente.");
      return;
    }

    /* Si llegamos aquí, todos los campos son válidos 
    se almacenan los datos del usuario en el localStorage */
    const userData = {
      fullName: fullNameInput.value.trim(),
      username: usernameInput.value.trim(),
      email: emailInput.value.trim(),
      birthdate: birthdateInput.value,
      address: addressInput.value.trim(),
      signupDate: new Date().toLocaleString()
    };
    localStorage.setItem("userData", JSON.stringify(userData));
    form.reset();
    clearValidityClasses(form);
    showAlert("success", "Registro exitoso. Por favor, inicia sesión para continuar.");
  });

  fullNameInput.addEventListener("input", () => {
    clearValidityClasses(form);
    clearAlert();
    validateFullName(fullNameInput);
  });

  usernameInput.addEventListener("input", () => {
    clearValidityClasses(form);
    clearAlert();
    validateUsername(usernameInput);
  });
  
  emailInput.addEventListener("input", () => {
    clearValidityClasses(form);
    clearAlert();
    validateEmail(emailInput);
  });

  passwordInput.addEventListener("input", () => {
    clearValidityClasses(form);
    clearAlert();
    validatePasswords(passwordInput, passwordConfirmInput);
  });

  passwordConfirmInput.addEventListener("input", () => {
    clearValidityClasses(form);
    clearAlert();
    validatePasswords(passwordInput, passwordConfirmInput);
  });

  birthdateInput.addEventListener("input", () => {
    clearValidityClasses(form);
    clearAlert();
    validateBirthdate(birthdateInput);
  });

  form.addEventListener("reset", function () {
    clearAlert();

    /*
      Usamos setTimeout para esperar a que el navegador limpie los campos
      y luego quitamos las clases visuales.
    */
    setTimeout(function () {
      clearValidityClasses(form);
    }, 50);
  });

  
});

/* Limpia el mensaje de alerta */
function clearAlert() {
  const alertEl = document.getElementById("alertRegistro");
  if (alertEl) {
    alertEl.innerHTML = "";
  }
}

/* Muestra un mensaje de alerta en el formulario */
function showAlert(type, message) {
  const alertEl = document.getElementById("alertRegistro");
  if (!alertEl) {
    return;
  }
  alertEl.innerHTML = `<div class="alert alert-${type} mb-0" role="alert">${message}</div>`;
}

/* Validar que el nombre completo este presente
  agrega mensaje de error si corresponde y retorna false */
function validateFullName(fullNameInput) {
  if (fullNameInput.value.trim() === "") {
    markAsInvalid(fullNameInput, "El nombre completo es obligatorio.");
    return false;
  }
  markAsValid(fullNameInput);
  return true;
}

/* Validar que el email tenga un formato válido 
  agrega mensaje de error si corresponde y retorna false */
function validateEmail(emailInput) {
  if (!emailInput.value.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    markAsInvalid(emailInput, "Ingresa un correo electrónico válido.");
    return false;
  }
  markAsValid(emailInput);
  return true;
}

/* Validar que el nickname este presente y tenga un formato válido
  agrega mensaje de error si corresponde y retorna false */
function validateUsername(usernameInput) {
  if (usernameInput.value.trim() === "") {
    markAsInvalid(usernameInput, "El nickname es obligatorio.");
    return false;
  } else if (usernameInput.value.length < 6 || usernameInput.value.length > 20) {
    markAsInvalid(usernameInput, "El nickname debe tener entre 6 y 20 caracteres.");
    return false;
  } else if (!usernameInput.value.match(/^[a-zA-Z0-9._-]+$/)) {
    markAsInvalid(usernameInput, "El nickname debe contener solo letras, números, puntos, guiones y guiones bajos.");
    return false;
  }
  markAsValid(usernameInput);
  return true;
}

/* Valida que ambas contraseñas coincidan y que cumplan con los requisitos de seguridad
  agrega mensajes de error si corresponde y retorna false */
function validatePasswords(passwordInput, passwordConfirmInput) {
  let errors = {password: [], passwordConfirm: []}; 
  if (passwordInput.value.length < 6) {
    errors.password.push("La contraseña debe tener al menos 6 caracteres.");
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
  if (passwordConfirmInput.value !== passwordInput.value) {
    errors.passwordConfirm.push("Las contraseñas no coinciden.");
  }
  if (errors.password.length > 0 || errors.passwordConfirm.length > 0) {
    if (errors.password.length > 0) {
      passwordErrors = errors.password.join("\n");
      markAsInvalid(passwordInput, passwordErrors);
    }
    if (errors.passwordConfirm.length > 0) {
      passwordConfirmErrors = errors.passwordConfirm.join("\n");
      markAsInvalid(passwordConfirmInput, passwordConfirmErrors);
    }
    return false;
  }
  markAsValid(passwordInput);
  markAsValid(passwordConfirmInput);
  return true;
}

/* Valida que la fecha de nacimiento sea mayor a 13 años
  agrega mensaje de error si corresponde y retorna false */
function validateBirthdate(birthdateInput) {
  let birthdate = new Date(birthdateInput.value);
  if (birthdate == "Invalid Date") {
    markAsInvalid(birthdateInput, "Ingresa una fecha de nacimiento válida.");
    return false;
  } else {
    let age = calculateAge(birthdate);
    if (age < 13) {
      markAsInvalid(birthdateInput, "Debes tener al menos 13 años.");
      return false;
    }
    markAsValid(birthdateInput);
    return true;
  }
}

/* Calcula la edad a partir de la fecha de nacimiento
  retorna la edad */
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

/* Limpia las clases is-valid e is-invalid de todos los inputs del formulario */
function clearValidityClasses(form) {
  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach(input => {
    input.classList.remove("is-valid");
    input.classList.remove("is-invalid");
  });
}

/* Marca un input como válido */
function markAsValid(input) {
  input.classList.add("is-valid");
  input.parentElement.querySelector(".invalid-feedback").innerHTML = "";
}

function markAsInvalid(input, message) {
  input.classList.add("is-invalid");
  input.parentElement.querySelector(".invalid-feedback").innerHTML = message;
}