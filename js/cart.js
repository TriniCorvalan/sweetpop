/* SweetPop - Carrito de compras y pago simulado (solo user) */

document.addEventListener("DOMContentLoaded", () => {
  if (!requireRole(["user"])) {
    return;
  }

  renderCartPage();

  document.addEventListener("click", (event) => {
    const removeBtn = event.target.closest("[data-remove-cart-item]");
    if (removeBtn) {
      removeCartItem(removeBtn.getAttribute("data-remove-cart-item"));
      return;
    }

    const payBtn = event.target.closest("#payCartBtn");
    if (payBtn) {
      processCartPayment();
    }
  });
});

/* Muestra un mensaje en #cartAlert. */
function showCartAlert(type, message) {
  const alertEl = document.getElementById("cartAlert");
  if (!alertEl) {
    return;
  }
  alertEl.innerHTML = `<div class="alert alert-${type} mb-4" role="alert">${message}</div>`;
}

/* Limpia el mensaje de #cartAlert. */
function clearCartAlert() {
  const alertEl = document.getElementById("cartAlert");
  if (alertEl) {
    alertEl.innerHTML = "";
  }
}

/* Formatea el descuento de caja como porcentaje visible. */
function formatDiscountPercent(discount) {
  return `${Math.round(discount * 100)}%`;
}

/* Suma las unidades requeridas por productId en todas las cajas del carrito. */
function getStockNeededFromCart(cart) {
  const stockNeeded = {};

  cart.forEach((item) => {
    item.walls.forEach((wall) => {
      const quantity = wall.quantity || getWallQuantityBySize(wall.size);
      stockNeeded[wall.productId] = (stockNeeded[wall.productId] || 0) + quantity;
    });
  });

  return stockNeeded;
}

/* Valida que el inventario cubra todas las cajas del carrito. */
function validateCartStock(cart) {
  const stockNeeded = getStockNeededFromCart(cart);

  for (const [productId, quantity] of Object.entries(stockNeeded)) {
    if (getStock(productId) < quantity) {
      const candy = getCandyById(productId);
      return {
        valid: false,
        message: `${candy ? candy.name : "Un dulce"} no está disponible en la cantidad necesaria.`,
      };
    }
  }

  return { valid: true };
}

/* Descuenta del inventario las unidades de un carrito pagado. */
function deductInventoryForCart(cart) {
  const stockNeeded = getStockNeededFromCart(cart);

  Object.entries(stockNeeded).forEach(([productId, quantity]) => {
    const currentStock = getStock(productId);
    updateStock(productId, currentStock - quantity);
  });
}

/* Elimina una caja del carrito por cartItemId. */
function removeCartItem(cartItemId) {
  const cart = getCart().filter((item) => item.cartItemId !== cartItemId);
  saveCart(cart);
  clearCartAlert();

  if (typeof renderMainNav === "function") {
    renderMainNav();
  }

  renderCartPage();
  showCartAlert("info", "Caja eliminada del carrito.");
}

/* Procesa el pago simulado: valida stock, descuenta inventario y vacía el carrito. */
function processCartPayment() {
  clearCartAlert();

  const cart = getCart();

  if (cart.length === 0) {
    showCartAlert("warning", "Tu carrito está vacío.");
    return;
  }

  const validation = validateCartStock(cart);
  if (!validation.valid) {
    showCartAlert("danger", validation.message);
    return;
  }

  deductInventoryForCart(cart);
  saveCart([]);

  if (typeof renderMainNav === "function") {
    renderMainNav();
  }

  renderCartPage();
  showCartAlert(
    "success",
    "¡Pago realizado con éxito! Gracias por tu compra en SweetPop."
  );
}

/* Construye el HTML del detalle de paredes de una caja en el carrito. */
function buildCartWallsList(walls) {
  return walls
    .map((wall) => {
      const quantity = wall.quantity || getWallQuantityBySize(wall.size);
      const lineTotal = wall.price * quantity;
      return `<li>Pared ${wall.wallIndex}: ${wall.productName} × ${quantity} (${formatPrice(lineTotal)})</li>`;
    })
    .join("");
}

/* Construye el HTML de una caja personalizada en el carrito. */
function buildCartItemCard(item) {
  const discountAmount = Math.round(
    (item.boxPrice + item.candiesSubtotal) * item.discount
  );

  return `
    <article class="cart-item-card mb-4" data-cart-item-id="${item.cartItemId}">
      <div class="cart-item-header d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <h2 class="h5 mb-0">${item.boxName}</h2>
        <button type="button" class="btn btn-outline-light btn-sm"
          data-remove-cart-item="${item.cartItemId}">Eliminar</button>
      </div>
      <ul class="cart-item-walls small mb-3">${buildCartWallsList(item.walls)}</ul>
      <dl class="row cart-item-summary mb-0 small">
        <dt class="col-sm-6">Subtotal dulces</dt>
        <dd class="col-sm-6 text-sm-end">${formatPrice(item.candiesSubtotal)}</dd>
        <dt class="col-sm-6">Precio caja</dt>
        <dd class="col-sm-6 text-sm-end">${formatPrice(item.boxPrice)}</dd>
        <dt class="col-sm-6">Descuento caja (${formatDiscountPercent(item.discount)})</dt>
        <dd class="col-sm-6 text-sm-end">−${formatPrice(discountAmount)}</dd>
        <dt class="col-sm-6 fw-semibold">Total caja</dt>
        <dd class="col-sm-6 text-sm-end fw-semibold">${formatPrice(item.total)}</dd>
      </dl>
    </article>
  `;
}

/* Calcula el total general del carrito. */
function getCartGrandTotal(cart) {
  return cart.reduce((sum, item) => sum + item.total, 0);
}

/* Renderiza el contenido completo del carrito. */
function renderCartPage() {
  const container = document.getElementById("cartContent");
  if (!container) {
    return;
  }

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <p class="text-center py-4 mb-3">No tienes cajas en el carrito.</p>
      <div class="cart-empty-actions text-center">
        <a href="boxes.html" class="btn btn-sweetpop w-100">Personalizar una caja</a>
      </div>
    `;
    return;
  }

  const grandTotal = getCartGrandTotal(cart);

  container.innerHTML = `
    ${cart.map(buildCartItemCard).join("")}
    <div class="cart-grand-total cart-pay-bar d-flex flex-wrap justify-content-between align-items-center gap-3 pt-3 border-top border-light border-opacity-25">
      <p class="h5 mb-0">Total a pagar: ${formatPrice(grandTotal)}</p>
      <button type="button" class="btn btn-sweetpop" id="payCartBtn">Pagar</button>
    </div>
  `;
}
