/* SweetPop - Capa de almacenamiento (localStorage / sessionStorage) */

/* Claves usadas en localStorage y sessionStorage. */
const STORAGE_KEYS = {
  users: "sweetpop_users",
  session: "sweetpop_session",
  inventory: "sweetpop_inventory",
  cart: "sweetpop_cart",
  boxDraft: "sweetpop_box_draft",
};

/* Stock inicial por dulce al crear el inventario por primera vez. */
const INITIAL_STOCK = 20;

/* Catálogo estático de cajas: paredes, precio base y descuento. */
const BOX_CATALOG = [
  {
    id: "box-simple",
    name: "Caja simple",
    wallsCount: 4,
    boxPrice: 8990,
    discount: 0.1,
    image: "img/cajas/caja-nivel-1.jpg",
  },
  {
    id: "box-double",
    name: "Caja doble",
    wallsCount: 8,
    boxPrice: 14990,
    discount: 0.15,
    image: "img/cajas/caja-nivel-2.jpg",
  },
  {
    id: "box-triple",
    name: "Caja triple",
    wallsCount: 12,
    boxPrice: 21990,
    discount: 0.2,
    image: "img/cajas/caja-nivel-3.jpg",
  },
];

/* Catálogo estático de dulces: nombre, categoría, tamaño, precio e imagen. */
const CANDY_CATALOG = [
  {
    id: "gom-gummy-bears",
    name: "Gummy Bears",
    category: "gomitas",
    size: "small",
    price: 2990,
    image: "img/categorias/gomitas/dulce-gummy-bears.jpg",
    description: "Tiernos ositos de gomita de colores.",
    discountLabel: "10%",
  },
  {
    id: "gom-jelly-beans",
    name: "Jelly Beans",
    category: "gomitas",
    size: "small",
    price: 2790,
    image: "img/categorias/gomitas/dulce-jelly-beans.jpg",
    description: "Deliciosas gomitas en forma de semillas.",
    discountLabel: "no disponible",
  },
  {
    id: "gom-worms",
    name: "Worms de azúcar",
    category: "gomitas",
    size: "small",
    price: 2590,
    image: "img/categorias/gomitas/dulce-worms.jpg",
    description: "Entretenidas gomitas en forma de serpientes.",
    discountLabel: "15%",
  },
  {
    id: "cho-kisses",
    name: "Chocolate Kisses",
    category: "chocolate",
    size: "small",
    price: 3490,
    image: "img/categorias/chocolate/dulce-choco-kisses.jpg",
    description: "Románticos besitos de chocolate.",
    discountLabel: "no disponible",
  },
  {
    id: "cho-pb-cup",
    name: "Peanut Butter Cup",
    category: "chocolate",
    size: "medium",
    price: 3290,
    image: "img/categorias/chocolate/dulce-peanut-cup.jpg",
    description: "Delicioso chocolate con mantequilla de maní.",
    discountLabel: "10%",
  },
  {
    id: "cho-trufa",
    name: "Trufa Gourmet",
    category: "chocolate",
    size: "large",
    price: 5990,
    image: "img/categorias/chocolate/dulce-trufa.jpg",
    description: "Tradicionales trufas de chocolate.",
    discountLabel: "20%",
  },
  {
    id: "car-lollipop",
    name: "Lollipop",
    category: "caramelos",
    size: "medium",
    price: 1990,
    image: "img/categorias/caramelos/dulce-lollipop.jpg",
    description: "Clásicos caramelos en forma de paleta.",
    discountLabel: "5%",
  },
  {
    id: "car-chew",
    name: "Caramel Chew",
    category: "caramelos",
    size: "medium",
    price: 2490,
    image: "img/categorias/caramelos/dulce-caramel.jpg",
    description: "Deliciosos caramelos masticables.",
    discountLabel: "no disponible",
  },
  {
    id: "car-fruit-drop",
    name: "Fruit Drop",
    category: "caramelos",
    size: "large",
    price: 4490,
    image: "img/categorias/caramelos/dulce-fruit-drop.jpg",
    description: "Caramelos de fruta.",
    discountLabel: "10%",
  },
  {
    id: "bar-candy",
    name: "Candy Bar",
    category: "barritas",
    size: "large",
    price: 4990,
    image: "img/categorias/barritas/dulce-candy-bar.jpg",
    description: "Barrita de chocolate con chispas de chocolate.",
    discountLabel: "15%",
  },
  {
    id: "bar-nougat",
    name: "Nougat Bar",
    category: "barritas",
    size: "large",
    price: 4290,
    image: "img/categorias/barritas/dulce-nougat.jpg",
    description: "Barrita de chocolate con nuez.",
    discountLabel: "10%",
  },
  {
    id: "bar-crispy",
    name: "Crispy Bar",
    category: "barritas",
    size: "large",
    price: 3890,
    image: "img/categorias/barritas/dulce-crispy.jpg",
    description: "Barrita de chocolate con chispas de chocolate.",
    discountLabel: "no disponible",
  },
];

/* small y medium caben en todas; large no cabe en caja simple */
const SIZE_COMPATIBILITY = {
  small: ["box-simple", "box-double", "box-triple"],
  medium: ["box-simple", "box-double", "box-triple"],
  large: ["box-double", "box-triple"],
};

/* Unidades de dulce que ocupa cada pared según el tamaño del producto. */
const WALL_QUANTITY_BY_SIZE = {
  small: 10,
  medium: 7,
  large: 4,
};

/* Retorna cuántas unidades de un dulce se asignan al cubrir una pared. */
function getWallQuantityBySize(size) {
  return WALL_QUANTITY_BY_SIZE[size] || 4;
}

/* Etiqueta en español del tamaño para mostrar en la UI (datos internos en inglés). */
function getSizeLabel(size) {
  const labels = {
    small: "pequeño",
    medium: "medio",
    large: "grande",
  };
  return labels[size] || size;
}

/* Lee y parsea JSON desde localStorage o sessionStorage.
   Retorna fallback si la clave no existe o el JSON es inválido. */
function readJson(storage, key, fallback) {
  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/* Serializa un valor como JSON y lo guarda en el storage indicado. */
function writeJson(storage, key, value) {
  storage.setItem(key, JSON.stringify(value));
}

/* Genera un identificador único con prefijo (ej. user-..., cart-...). */
function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/* Inicializa datos base del sitio: admin, inventario y carrito vacío. */
function initAppData() {
  ensureAdminUser();
  ensureInventory();
  syncInventorySizesFromCatalog();
  ensureCart();
}

/* Crea el usuario admin precargado si aún no existe en localStorage. */
function ensureAdminUser() {
  const users = getUsers();
  const adminExists = users.some((user) => user.role === "admin");

  if (!adminExists) {
    users.push({
      id: "admin-1",
      username: "admin",
      email: "admin@sweetpop.cl",
      password: "Admin123",
      role: "admin",
      fullName: "Administrador SweetPop",
      birthdate: "",
      address: "",
      signupDate: new Date().toLocaleString(),
    });
    saveUsers(users);
  }
}

/* Crea el inventario inicial de 12 dulces si no hay datos guardados. */
function ensureInventory() {
  const existing = readJson(localStorage, STORAGE_KEYS.inventory, null);

  if (existing !== null && Array.isArray(existing) && existing.length > 0) {
    return;
  }

  const inventory = CANDY_CATALOG.map((candy) => ({
    productId: candy.id,
    name: candy.name,
    category: candy.category,
    size: candy.size,
    price: candy.price,
    image: candy.image,
    stock: INITIAL_STOCK,
  }));

  saveInventory(inventory);
}

/* Actualiza tamaños del inventario guardado si cambió el catálogo base. */
function syncInventorySizesFromCatalog() {
  const inventory = getInventory();
  if (inventory.length === 0) {
    return;
  }

  let changed = false;
  inventory.forEach((item) => {
    const candy = getCandyById(item.productId);
    if (candy && item.size !== candy.size) {
      item.size = candy.size;
      changed = true;
    }
  });

  if (changed) {
    saveInventory(inventory);
  }
}

/* Asegura que exista un carrito vacío en localStorage. */
function ensureCart() {
  const cart = readJson(localStorage, STORAGE_KEYS.cart, null);
  if (cart === null || !Array.isArray(cart)) {
    saveCart([]);
  }
}

/* Obtiene la lista de usuarios registrados desde localStorage. */
function getUsers() {
  return readJson(localStorage, STORAGE_KEYS.users, []);
}

/* Guarda la lista completa de usuarios en localStorage. */
function saveUsers(users) {
  writeJson(localStorage, STORAGE_KEYS.users, users);
}

/* Busca un usuario por nickname (sin distinguir mayúsculas). Retorna undefined si no existe. */
function findUserByUsername(username) {
  const normalized = username.trim().toLowerCase();
  return getUsers().find(
    (user) => user.username.toLowerCase() === normalized
  );
}

/* Busca un usuario por correo electrónico. Retorna undefined si no existe. */
function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return getUsers().find((user) => user.email.toLowerCase() === normalized);
}

/* Busca un usuario por su id interno. Retorna undefined si no existe. */
function findUserById(userId) {
  return getUsers().find((user) => user.id === userId);
}

/* Obtiene la sesión activa desde sessionStorage. Retorna null si no hay sesión. */
function getSession() {
  return readJson(sessionStorage, STORAGE_KEYS.session, null);
}

/* Guarda los datos de la sesión activa en sessionStorage. */
function setSession(session) {
  writeJson(sessionStorage, STORAGE_KEYS.session, session);
}

/* Elimina la sesión activa de sessionStorage. */
function clearSession() {
  sessionStorage.removeItem(STORAGE_KEYS.session);
}

/* Obtiene el inventario de dulces desde localStorage. */
function getInventory() {
  return readJson(localStorage, STORAGE_KEYS.inventory, []);
}

/* Guarda el inventario completo en localStorage. */
function saveInventory(inventory) {
  writeJson(localStorage, STORAGE_KEYS.inventory, inventory);
}

/* Obtiene un ítem del inventario por productId. Retorna undefined si no existe. */
function getInventoryItem(productId) {
  return getInventory().find((item) => item.productId === productId);
}

/* Retorna las unidades disponibles de un dulce. Retorna 0 si no está en inventario. */
function getStock(productId) {
  const item = getInventoryItem(productId);
  return item ? item.stock : 0;
}

/* Actualiza el stock de un dulce. Retorna false si el producto no existe. */
function updateStock(productId, newStock) {
  const inventory = getInventory();
  const index = inventory.findIndex((item) => item.productId === productId);

  if (index === -1) {
    return false;
  }

  inventory[index].stock = Math.max(0, newStock);
  saveInventory(inventory);
  return true;
}

/* Obtiene las cajas personalizadas guardadas en el carrito (localStorage). */
function getCart() {
  return readJson(localStorage, STORAGE_KEYS.cart, []);
}

/* Guarda el carrito completo en localStorage. */
function saveCart(cart) {
  writeJson(localStorage, STORAGE_KEYS.cart, cart);
}

/* Obtiene el borrador de caja en personalización (sessionStorage). Retorna null si no hay borrador. */
function getBoxDraft() {
  return readJson(sessionStorage, STORAGE_KEYS.boxDraft, null);
}

/* Guarda el borrador de caja en sessionStorage mientras el usuario asigna dulces por pared. */
function saveBoxDraft(draft) {
  writeJson(sessionStorage, STORAGE_KEYS.boxDraft, draft);
}

/* Elimina el borrador de caja de sessionStorage. */
function clearBoxDraft() {
  sessionStorage.removeItem(STORAGE_KEYS.boxDraft);
}

/* Busca una caja del catálogo por id. Retorna null si no existe. */
function getBoxById(boxId) {
  return BOX_CATALOG.find((box) => box.id === boxId) || null;
}

/* Busca un dulce del catálogo por id. Retorna null si no existe. */
function getCandyById(productId) {
  return CANDY_CATALOG.find((candy) => candy.id === productId) || null;
}

/* Obtiene los dulces de una categoría del catálogo base. */
function getCandiesByCategory(category) {
  return CANDY_CATALOG.filter((candy) => candy.category === category);
}

/* Indica si un dulce del tamaño dado cabe en la caja seleccionada. */
function isCandyCompatibleWithBox(candySize, boxId) {
  const allowedBoxes = SIZE_COMPATIBILITY[candySize];
  if (!allowedBoxes) {
    return false;
  }
  return allowedBoxes.includes(boxId);
}

/* Formatea un monto numérico como precio en pesos chilenos (ej. $2.990). */
function formatPrice(amount) {
  return `$${Number(amount).toLocaleString("es-CL")}`;
}

/* Ejecuta el sembrado inicial al incluir este script en cualquier página. */
initAppData();
