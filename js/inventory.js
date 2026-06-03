/* SweetPop - Vista de inventario (solo admin) */

const CATEGORY_LABELS = {
  gomitas: "Gomitas",
  chocolate: "Chocolate",
  caramelos: "Caramelos",
  barritas: "Barritas",
};

document.addEventListener("DOMContentLoaded", () => {
  if (!requireRole(["admin"])) {
    return;
  }

  renderInventoryTable();
});

/* Traduce el id interno de categoría a texto legible. */
function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || category;
}

/* Retorna el texto y clase CSS del estado según el stock. */
function getStockStatus(stock) {
  if (stock > 0) {
    return {
      label: "Disponible",
      badgeClass: "badge-stock-available",
    };
  }

  return {
    label: "Agotado",
    badgeClass: "badge-stock-empty",
  };
}

/* Construye una fila HTML para un ítem del inventario. */
function buildInventoryRow(item) {
  const status = getStockStatus(item.stock);
  const rowClass = item.stock === 0 ? "table-row-out-of-stock" : "";

  return `
    <tr class="${rowClass}">
      <td>${item.name}</td>
      <td>${getCategoryLabel(item.category)}</td>
      <td>${getSizeLabel(item.size)}</td>
      <td>${formatPrice(item.price)}</td>
      <td>${item.stock}</td>
      <td><span class="badge ${status.badgeClass}">${status.label}</span></td>
    </tr>
  `;
}

/* Renderiza la tabla completa de inventario en #inventoryTableBody. */
function renderInventoryTable() {
  const tableBody = document.getElementById("inventoryTableBody");
  if (!tableBody) {
    return;
  }

  const inventory = getInventory();

  if (inventory.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4">No hay productos en inventario.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = inventory.map(buildInventoryRow).join("");
}
