/* SweetPop - Autenticación y control de acceso por rol */

/* Valida credenciales contra localStorage y crea la sesión en sessionStorage.
   Retorna { success, message, user? }. */
function login(usernameOrEmail, password) {
  const credential = usernameOrEmail.trim();
  const users = getUsers();

  const user = users.find(
    (item) =>
      item.username.toLowerCase() === credential.toLowerCase() ||
      item.email.toLowerCase() === credential.toLowerCase()
  );

  if (!user) {
    return {
      success: false,
      message: "Usuario o correo no encontrado.",
    };
  }

  if (user.password !== password) {
    return {
      success: false,
      message: "Contraseña incorrecta.",
    };
  }

  setSession({
    userId: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
  });

  return {
    success: true,
    message: "Inicio de sesión exitoso.",
    user,
  };
}

/* Cierra sesión, limpia el borrador de caja y opcionalmente redirige a otra página. */
function logout(redirectTo) {
  clearSession();
  clearBoxDraft();

  if (redirectTo) {
    window.location.href = redirectTo;
  }
}

/* Indica si hay una sesión activa en sessionStorage. */
function isLoggedIn() {
  return getSession() !== null;
}

/* Comprueba si el usuario en sesión tiene el rol indicado (admin o user). */
function hasRole(role) {
  const session = getSession();
  return session !== null && session.role === role;
}

/* Combina datos de sesión con el usuario completo de localStorage.
   Retorna null si no hay sesión o el usuario ya no existe. */
function getCurrentUser() {
  const session = getSession();
  if (!session) {
    return null;
  }

  const user = findUserById(session.userId);
  if (!user) {
    clearSession();
    return null;
  }

  return {
    ...user,
    sessionRole: session.role,
  };
}

/* Protege una página: redirige si no hay sesión o el rol no está permitido.
   Retorna true solo cuando el acceso es válido. */
function requireRole(allowedRoles, redirectTo) {
  const session = getSession();
  const loginPage = redirectTo || "login.html";

  if (!session) {
    window.location.href = loginPage;
    return false;
  }

  if (!allowedRoles.includes(session.role)) {
    if (session.role === "admin") {
      window.location.href = "inventario.html";
    } else {
      window.location.href = "index.html";
    }
    return false;
  }

  return true;
}

/* Para login/registro: redirige si ya hay sesión activa.
   Retorna true solo cuando el visitante no está autenticado. */
function requireGuest(redirectTo) {
  const session = getSession();

  if (!session) {
    return true;
  }

  if (session.role === "admin") {
    window.location.href = redirectTo || "inventario.html";
  } else {
    window.location.href = redirectTo || "index.html";
  }

  return false;
}
