/* SweetPop - Catálogo de dulces con asignación por pared de caja */

/* Escapa texto para insertarlo de forma segura en HTML. */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Muestra un mensaje temporal en #catalogAlert. */
function showCatalogAlert(type, message) {
  const alertEl = document.getElementById("catalogAlert");
  if (!alertEl) {
    return;
  }
  alertEl.innerHTML = `<div class="alert alert-${type} mb-4" role="alert">${message}</div>`;
}

/* Limpia el mensaje de #catalogAlert. */
function clearCatalogAlert() {
  const alertEl = document.getElementById("catalogAlert");
  if (alertEl) {
    alertEl.innerHTML = "";
  }
}

/* Construye el HTML de una tarjeta de producto desde el catálogo en storage. */
function buildProductCard(candy) {
  const sizeLabel = getSizeLabel(candy.size);
  const discountText =
    candy.discountLabel === "no disponible"
      ? "Descuento: no disponible"
      : `Descuento: ${candy.discountLabel}`;

  return `
    <div class="col">
      <article class="card h-100 sweetpop-card" data-product-id="${candy.id}">
        <img src="${escapeHtml(candy.image)}" class="card-img-top" alt="${escapeHtml(candy.name)}">
        <div class="card-body">
          <h3 class="card-title h5">${escapeHtml(candy.name)}</h3>
          <p class="card-text">${escapeHtml(candy.description)}</p>
          <p class="card-text">Tamaño ${escapeHtml(sizeLabel)}. ${formatPrice(candy.price)}</p>
          <p class="card-text">${escapeHtml(discountText)}</p>
          <div class="catalog-product-actions mt-2"></div>
        </div>
      </article>
    </div>
  `;
}

/* Renderiza las tarjetas de la categoría indicada en #categoryProducts. */
function renderCategoryProducts(category) {
  const container = document.getElementById("categoryProducts");
  if (!container) {
    return;
  }

  const candies = getCandiesByCategory(category);

  if (candies.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <p class="text-center py-4">No hay productos en esta categoría.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = candies.map(buildProductCard).join("");
}

/* Construye el HTML de estado y botón para una tarjeta de producto. */
function buildProductActions(productId) {
  const candy = getCandyById(productId);
  if (!candy) {
    return "";
  }

  const draft = getBoxDraft();
  const available = getAvailableStockForDraft(productId);
  const unitsPerWall = getWallQuantityBySize(candy.size);

  if (!draft) {
    return `
      <button type="button" class="btn btn-outline-light btn-sm" disabled>Elegir caja primero</button>
    `;
  }

  const compatible = isCandyCompatibleWithBox(candy.size, draft.boxId);
  const complete = isBoxDraftComplete(draft);
  const nextWall = getNextEmptyWall(draft);
  const nextLabel = nextWall ? nextWall.wallIndex : draft.wallsCount;

  let statusClass = "catalog-status-ok";
  let statusText = `Tamaño ${getSizeLabel(candy.size)} · ${unitsPerWall} u. por pared`;

  if (!compatible) {
    statusClass = "catalog-status-blocked";
    statusText = `No cabe en ${draft.boxName} (tamaño ${getSizeLabel(candy.size)})`;
  } else if (available < unitsPerWall) {
    statusClass = "catalog-status-blocked";
    statusText = "No disponible en este momento";
  } else if (complete) {
    statusClass = "catalog-status-info";
    statusText = "Caja completa. Agrega al carrito arriba.";
  }

  const disabled =
    !compatible || available < unitsPerWall || complete ? "disabled" : "";
  const buttonLabel = complete
    ? "Caja completa"
    : `Asignar a pared ${nextLabel} (${unitsPerWall} u.)`;

  return `
    <p class="catalog-meta mb-1 ${statusClass}">${statusText}</p>
    <button type="button" class="btn btn-sweetpop btn-sm catalog-assign-btn"
      data-product-id="${productId}" ${disabled}>${buttonLabel}</button>
  `;
}

/* Actualiza acciones de todas las tarjetas con data-product-id. */
function refreshCatalogCards() {
  document.querySelectorAll("[data-product-id]").forEach((card) => {
    const productId = card.getAttribute("data-product-id");
    const actionsEl = card.querySelector(".catalog-product-actions");
    const draft = getBoxDraft();
    const candy = getCandyById(productId);
    const blocked =
      draft &&
      candy &&
      (!isCandyCompatibleWithBox(candy.size, draft.boxId) ||
        getAvailableStockForDraft(productId) < getWallQuantityBySize(candy.size));

    card.classList.toggle("catalog-card-blocked", Boolean(blocked));

    if (actionsEl) {
      actionsEl.innerHTML = buildProductActions(productId);
    }
  });
}

/* Maneja el click en asignar dulce a la pared activa. */
function handleAssignClick(event) {
  const productId = event.currentTarget.getAttribute("data-product-id");
  const result = assignCandyToWall(productId);

  if (!result.success) {
    if (result.redirect) {
      showCatalogAlert(
        "warning",
        `${result.message} <a href="${result.redirect}" class="alert-link">Continuar</a>.`
      );
    } else {
      showCatalogAlert("danger", result.message);
    }
    return;
  }

  showCatalogAlert("success", result.message);
  initBoxDraftBar();
  refreshCatalogCards();

  if (result.complete) {
    showCatalogAlert(
      "success",
      `${result.message} Ya puedes agregar la caja al carrito.`
    );
  }
}

/* Inicializa la página de categoría de dulces. */
function initCatalogPage() {
  const category = document.body.dataset.category;
  renderCategoryProducts(category);
  refreshCatalogCards();

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".catalog-assign-btn");
    if (!button || button.disabled) {
      return;
    }
    handleAssignClick({ currentTarget: button });
  });

  if (!getBoxDraft()) {
    showCatalogAlert(
      "info",
      'Selecciona una caja en <a href="boxes.html" class="alert-link">Cajas</a> antes de asignar dulces.'
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "category") {
    initCatalogPage();
  }
});
