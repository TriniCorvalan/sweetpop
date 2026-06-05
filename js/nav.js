/* SweetPop - Menú de navegación dinámico según sesión y rol */

document.addEventListener("DOMContentLoaded", () => {
  /* Construye el menú al cargar cada página que incluya #mainNavItems. */
  renderMainNav();
});

/* Obtiene el nombre del archivo HTML actual (ej. index.html). */
function getCurrentPage() {
  const parts = window.location.pathname.split("/");
  return parts[parts.length - 1] || "index.html";
}

/* Indica si un ítem del menú debe marcarse como página activa. */
function isNavItemActive(href, currentPage) {
  if (href === currentPage) {
    return true;
  }
  if (href === "candies.html" && currentPage.startsWith("category-")) {
    return true;
  }
  return false;
}

/* Construye la lista de ítems del menú según la sesión activa. */
function buildNavItems(session) {
  const commonLinks = [
    { label: "Inicio", href: "index.html" },
    { label: "Cajas", href: "boxes.html" },
    { label: "Dulces", href: "candies.html" },
  ];

  if (!session) {
    return [
      ...commonLinks,
      { label: "Iniciar sesión", href: "login.html" },
      { label: "Registro", href: "register.html" },
    ];
  }

  if (session.role === "admin") {
    return [
      ...commonLinks,
      { label: "Inventario", href: "inventory.html" },
      { label: "Clientes", href: "customers.html" },
      { label: "Cerrar sesión", action: "logout" },
    ];
  }

  const cartCount = getCart().length;
  const cartLabel = cartCount > 0 ? `Carrito (${cartCount})` : "Carrito";

  return [
    ...commonLinks,
    { label: cartLabel, href: "cart.html" },
    { label: "Mi perfil", href: "profile.html" },
    { label: "Cerrar sesión", action: "logout" },
  ];
}

/* Renderiza el HTML del menú principal en #mainNavItems. */
function renderMainNav() {
  const navContainer = document.getElementById("mainNavItems");
  if (!navContainer) {
    return;
  }

  const currentPage = getCurrentPage();
  const session = getSession();
  const items = buildNavItems(session);

  navContainer.innerHTML = items
    .map((item) => {
      if (item.action === "logout") {
        return `<li class="nav-item"><a class="nav-link" href="#" data-nav-action="logout">${item.label}</a></li>`;
      }

      const isActive = isNavItemActive(item.href, currentPage);
      const activeAttrs = isActive ? ' active" aria-current="page"' : '"';

      return `<li class="nav-item"><a class="nav-link${activeAttrs} href="${item.href}">${item.label}</a></li>`;
    })
    .join("");

  const logoutLink = navContainer.querySelector('[data-nav-action="logout"]');
  if (logoutLink) {
    /* Cierra sesión sin recargar manualmente la página de destino. */
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();
      logout("index.html");
    });
  }
}
