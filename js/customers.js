/* SweetPop - Lista de clientes registrados (solo admin) */

document.addEventListener("DOMContentLoaded", () => {
  if (!requireRole(["admin"])) {
    return;
  }

  renderCustomersTable();
});

/* Escapa texto para insertarlo de forma segura en HTML. */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Construye una fila HTML para un usuario cliente. */
function buildCustomerRow(user) {
  const address = user.address && user.address.trim() !== "" ? user.address : "—";

  return `
    <tr>
      <td>${escapeHtml(user.fullName)}</td>
      <td>${escapeHtml(user.username)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(user.signupDate || "—")}</td>
      <td>${escapeHtml(address)}</td>
    </tr>
  `;
}

/* Renderiza la tabla de clientes (role user) en #customersTableBody. */
function renderCustomersTable() {
  const tableBody = document.getElementById("customersTableBody");
  if (!tableBody) {
    return;
  }

  const customers = getUsers().filter((user) => user.role === "user");

  if (customers.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4">Aún no hay clientes registrados.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = customers.map(buildCustomerRow).join("");
}
