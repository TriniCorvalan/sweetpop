/* SweetPop - Personalización de cajas (borrador por paredes) */

/* Cuenta cuántas paredes del borrador ya tienen dulce asignado. */
function getFilledWallsCount(draft) {
  const currentDraft = draft || getBoxDraft();
  if (!currentDraft) {
    return 0;
  }
  return currentDraft.walls.filter((wall) => wall.productId).length;
}

/* Indica si todas las paredes del borrador tienen un dulce asignado. */
function isBoxDraftComplete(draft) {
  const currentDraft = draft || getBoxDraft();
  if (!currentDraft) {
    return false;
  }
  return getFilledWallsCount(currentDraft) === currentDraft.wallsCount;
}

/* Retorna la primera pared sin dulce, o null si no quedan libres. */
function getNextEmptyWall(draft) {
  const currentDraft = draft || getBoxDraft();
  if (!currentDraft) {
    return null;
  }
  return currentDraft.walls.find((wall) => !wall.productId) || null;
}

/* Cuenta cuántas veces un dulce ya está asignado en el borrador actual. */
function countProductInDraft(productId, draft) {
  const currentDraft = draft || getBoxDraft();
  if (!currentDraft) {
    return 0;
  }
  return currentDraft.walls.filter((wall) => wall.productId === productId).length;
}

/* Stock disponible para asignar considerando lo ya usado en el borrador. */
function getAvailableStockForDraft(productId) {
  return getStock(productId) - countProductInDraft(productId);
}

/* Inicia o reinicia el borrador de caja en sessionStorage. */
function startBoxDraft(boxId, forceReplace) {
  if (!hasRole("user")) {
    return {
      success: false,
      message: "Debes iniciar sesión como cliente para personalizar una caja.",
      redirect: "login.html",
    };
  }

  const box = getBoxById(boxId);
  if (!box) {
    return { success: false, message: "La caja seleccionada no existe." };
  }

  const existing = getBoxDraft();
  if (
    existing &&
    !isBoxDraftComplete(existing) &&
    existing.boxId !== boxId &&
    !forceReplace
  ) {
    return {
      success: false,
      needsConfirm: true,
      message: `Ya estás personalizando una ${existing.boxName}. ¿Deseas reemplazarla por ${box.name}?`,
      boxId,
    };
  }

  const walls = [];
  for (let index = 1; index <= box.wallsCount; index += 1) {
    walls.push({
      wallIndex: index,
      productId: null,
      productName: null,
      price: null,
      size: null,
    });
  }

  saveBoxDraft({
    boxId: box.id,
    boxName: box.name,
    wallsCount: box.wallsCount,
    boxPrice: box.boxPrice,
    discount: box.discount,
    walls,
  });

  return {
    success: true,
    message: `${box.name} seleccionada. Asigna un dulce por pared.`,
  };
}

/* Asigna un dulce a la siguiente pared libre del borrador. */
function assignCandyToWall(productId) {
  if (!hasRole("user")) {
    return {
      success: false,
      message: "Debes iniciar sesión como cliente.",
      redirect: "login.html",
    };
  }

  const draft = getBoxDraft();
  if (!draft) {
    return {
      success: false,
      message: "Primero elige una caja en el catálogo de cajas.",
      redirect: "boxes.html",
    };
  }

  if (isBoxDraftComplete(draft)) {
    return {
      success: false,
      message: "Todas las paredes ya tienen dulce. Agrega la caja al carrito o elige otra caja.",
    };
  }

  const candy = getCandyById(productId);
  if (!candy) {
    return { success: false, message: "El dulce seleccionado no existe." };
  }

  if (!isCandyCompatibleWithBox(candy.size, draft.boxId)) {
    return {
      success: false,
      message: `${candy.name} (tamaño ${candy.size}) no cabe en ${draft.boxName}.`,
    };
  }

  if (getAvailableStockForDraft(productId) < 1) {
    return {
      success: false,
      message: `No hay stock suficiente de ${candy.name}.`,
    };
  }

  const nextWall = getNextEmptyWall(draft);
  nextWall.productId = candy.id;
  nextWall.productName = candy.name;
  nextWall.price = candy.price;
  nextWall.size = candy.size;

  saveBoxDraft(draft);

  const filled = getFilledWallsCount(draft);
  return {
    success: true,
    message: `${candy.name} asignado a la pared ${nextWall.wallIndex} de ${draft.wallsCount}.`,
    filled,
    complete: isBoxDraftComplete(draft),
  };
}

/* Calcula subtotal de dulces, total con descuento y persiste la caja en el carrito. */
function addCompletedBoxToCart() {
  if (!hasRole("user")) {
    return {
      success: false,
      message: "Debes iniciar sesión como cliente.",
      redirect: "login.html",
    };
  }

  const draft = getBoxDraft();
  if (!draft) {
    return {
      success: false,
      message: "No hay una caja en personalización.",
      redirect: "boxes.html",
    };
  }

  if (!isBoxDraftComplete(draft)) {
    return {
      success: false,
      message: `Completa las ${draft.wallsCount} paredes antes de agregar al carrito.`,
    };
  }

  const stockNeeded = {};
  draft.walls.forEach((wall) => {
    stockNeeded[wall.productId] = (stockNeeded[wall.productId] || 0) + 1;
  });

  for (const [productId, quantity] of Object.entries(stockNeeded)) {
    if (getStock(productId) < quantity) {
      const candy = getCandyById(productId);
      return {
        success: false,
        message: `Stock insuficiente de ${candy ? candy.name : productId}.`,
      };
    }
  }

  const candiesSubtotal = draft.walls.reduce((sum, wall) => sum + wall.price, 0);
  const total = Math.round((draft.boxPrice + candiesSubtotal) * (1 - draft.discount));

  const cart = getCart();
  cart.push({
    cartItemId: generateId("cart"),
    boxId: draft.boxId,
    boxName: draft.boxName,
    boxPrice: draft.boxPrice,
    discount: draft.discount,
    walls: draft.walls.map((wall) => ({ ...wall })),
    candiesSubtotal,
    total,
  });

  saveCart(cart);
  clearBoxDraft();

  if (typeof renderMainNav === "function") {
    renderMainNav();
  }

  return {
    success: true,
    message: `${draft.boxName} agregada al carrito.`,
    redirect: "cart.html",
  };
}

/* Renderiza la barra de progreso de personalización en el contenedor indicado. */
function renderBoxProgress(container) {
  if (!container) {
    return;
  }

  const draft = getBoxDraft();

  if (!draft) {
    container.innerHTML = `
      <div class="alert alert-sweetpop box-draft-bar mb-4" role="region">
        <p class="mb-2">Para asignar dulces, primero elige una caja.</p>
        <a href="boxes.html" class="btn btn-sweetpop btn-sm">Ir a cajas</a>
      </div>
    `;
    return;
  }

  const filled = getFilledWallsCount(draft);
  const complete = isBoxDraftComplete(draft);
  const progressPercent = Math.round((filled / draft.wallsCount) * 100);
  const assignedList = draft.walls
    .filter((wall) => wall.productId)
    .map(
      (wall) =>
        `<li>Pared ${wall.wallIndex}: ${wall.productName} (${formatPrice(wall.price)})</li>`
    )
    .join("");

  const addToCartButton = complete
    ? `<button type="button" class="btn btn-sweetpop btn-sm" id="addBoxToCartBtn">Agregar caja al carrito</button>`
    : `<a href="candies.html" class="btn btn-outline-light btn-sm">Ver categorías de dulces</a>`;

  container.innerHTML = `
    <div class="box-draft-bar mb-4" role="region" aria-label="Progreso de caja personalizada">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
        <div>
          <h2 class="h5 mb-1">${draft.boxName}</h2>
          <p class="mb-0 small">Paredes completadas: ${filled} de ${draft.wallsCount}</p>
        </div>
        <a href="boxes.html" class="btn btn-outline-light btn-sm">Cambiar caja</a>
      </div>
      <div class="progress box-draft-progress mb-3" role="progressbar"
        aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar" style="width: ${progressPercent}%">${progressPercent}%</div>
      </div>
      ${assignedList ? `<ul class="box-draft-list small mb-3">${assignedList}</ul>` : ""}
      <div class="d-flex flex-wrap gap-2">
        ${addToCartButton}
      </div>
      <div class="mt-2" id="boxDraftFeedback"></div>
    </div>
  `;

  const addBtn = container.querySelector("#addBoxToCartBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const result = addCompletedBoxToCart();
      const feedback = container.querySelector("#boxDraftFeedback");

      if (!result.success) {
        if (feedback) {
          feedback.innerHTML = `<div class="alert alert-danger mb-0 py-2">${result.message}</div>`;
        }
        return;
      }

      if (feedback) {
        feedback.innerHTML = `<div class="alert alert-success mb-0 py-2">${result.message} Redirigiendo...</div>`;
      }

      setTimeout(() => {
        window.location.href = result.redirect || "cart.html";
      }, 800);
    });
  }
}

/* Inicializa botones de personalización en boxes.html. */
function initBoxesPage() {
  document.querySelectorAll("[data-customize-box]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
      }

      if (!hasRole("user")) {
        window.alert("Solo los clientes registrados pueden personalizar cajas.");
        return;
      }

      const boxId = button.getAttribute("data-customize-box");
      const existing = getBoxDraft();
      let forceReplace = false;

      if (
        existing &&
        !isBoxDraftComplete(existing) &&
        existing.boxId !== boxId
      ) {
        forceReplace = window.confirm(
          `Ya estás personalizando una ${existing.boxName}. ¿Deseas reemplazarla?`
        );
        if (!forceReplace) {
          return;
        }
      }

      const result = startBoxDraft(boxId, forceReplace);
      if (!result.success) {
        window.alert(result.message);
        return;
      }

      window.location.href = "candies.html";
    });
  });
}

/* Inicializa la barra de borrador en páginas de catálogo (candies y categorías). */
function initBoxDraftBar() {
  const container = document.getElementById("boxDraftBar");
  if (container) {
    renderBoxProgress(container);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "boxes") {
    initBoxesPage();
  }

  if (
    document.body.dataset.page === "candies" ||
    document.body.dataset.page === "category"
  ) {
    initBoxDraftBar();
  }
});
