/* SweetPop - Catálogo de dulces con asignación por pared de caja */

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

/* Construye el HTML de estado y botón para una tarjeta de producto. */
function buildProductActions(productId) {
  const candy = getCandyById(productId);
  if (!candy) {
    return "";
  }

  const draft = getBoxDraft();
  const stock = getStock(productId);
  const available = getAvailableStockForDraft(productId);

  if (!draft) {
    return `
      <p class="catalog-meta mb-2">Stock: ${stock}</p>
      <button type="button" class="btn btn-outline-light btn-sm" disabled>Elegir caja primero</button>
    `;
  }

  const compatible = isCandyCompatibleWithBox(candy.size, draft.boxId);
  const complete = isBoxDraftComplete(draft);
  const nextWall = getNextEmptyWall(draft);
  const nextLabel = nextWall ? nextWall.wallIndex : draft.wallsCount;

  let statusClass = "catalog-status-ok";
  let statusText = `Disponible: ${available} · Tamaño ${candy.size}`;

  if (!compatible) {
    statusClass = "catalog-status-blocked";
    statusText = `No cabe en ${draft.boxName} (tamaño ${candy.size})`;
  } else if (available < 1) {
    statusClass = "catalog-status-blocked";
    statusText = "Sin stock para asignar";
  } else if (complete) {
    statusClass = "catalog-status-info";
    statusText = "Caja completa. Agrega al carrito arriba.";
  }

  const disabled =
    !compatible || available < 1 || complete ? "disabled" : "";
  const buttonLabel = complete
    ? "Caja completa"
    : `Asignar a pared ${nextLabel}`;

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
