


const menu = [
  { id: 1, name: "Paneer Tikka", category: "Starters", price: 220, emoji: "🧆", veg: true, desc: "Grilled cottage cheese with spices" },
  { id: 2, name: "Chicken Wings", category: "Starters", price: 260, emoji: "🍗", veg: false, desc: "Crispy spicy wings with dip" },
  { id: 3, name: "Veg Spring Roll", category: "Starters", price: 150, emoji: "🥟", veg: true, desc: "Crunchy rolls with veggie filling" },

  { id: 4, name: "Butter Chicken", category: "Main Course", price: 320, emoji: "🍛", veg: false, desc: "Creamy tomato gravy with chicken" },
  { id: 5, name: "Paneer Butter Masala", category: "Main Course", price: 280, emoji: "🥘", veg: true, desc: "Soft paneer in rich gravy" },
  { id: 6, name: "Veg Biryani", category: "Main Course", price: 240, emoji: "🍚", veg: true, desc: "Fragrant rice with vegetables" },
  { id: 7, name: "Chicken Biryani", category: "Main Course", price: 300, emoji: "🍲", veg: false, desc: "Hyderabadi style dum biryani" },

  { id: 8, name: "Margherita Pizza", category: "Fast Food", price: 249, emoji: "🍕", veg: true, desc: "Cheese and tomato classic" },
  { id: 9, name: "Veg Burger", category: "Fast Food", price: 129, emoji: "🍔", veg: true, desc: "Crispy patty with fresh veggies" },
  { id: 10, name: "French Fries", category: "Fast Food", price: 99, emoji: "🍟", veg: true, desc: "Golden salted fries" },

  { id: 11, name: "Gulab Jamun", category: "Desserts", price: 90, emoji: "🍮", veg: true, desc: "Soft sweet balls in sugar syrup" },
  { id: 12, name: "Chocolate Brownie", category: "Desserts", price: 140, emoji: "🍫", veg: true, desc: "Warm brownie with chocolate sauce" },
  { id: 13, name: "Ice Cream Sundae", category: "Desserts", price: 120, emoji: "🍨", veg: true, desc: "Vanilla ice cream with toppings" },

  { id: 14, name: "Cold Coffee", category: "Drinks", price: 110, emoji: "🥤", veg: true, desc: "Chilled creamy coffee" },
  { id: 15, name: "Fresh Lime Soda", category: "Drinks", price: 70, emoji: "🍹", veg: true, desc: "Sweet or salted, your choice" },
  { id: 16, name: "Masala Chai", category: "Drinks", price: 50, emoji: "☕", veg: true, desc: "Hot Indian spiced tea" }
];

const GST_RATE = 0.05;
const CART_KEY = "restaurantCart";

let cart = loadCart(); // array of { id, qty }
let currentCategory = "All";


const categoriesEl = document.getElementById("categories");
const menuGrid = document.getElementById("menuGrid");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const cartItemsEl = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartFooter = document.getElementById("cartFooter");


function loadCart() {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function findItem(id) {
  return menu.find(function (m) { return m.id === id; });
}

// ----- Categories & menu -----
function renderCategories() {
  const cats = ["All"];
  menu.forEach(function (m) {
    if (!cats.includes(m.category)) cats.push(m.category);
  });

  categoriesEl.innerHTML = "";
  cats.forEach(function (cat) {
    const btn = document.createElement("button");
    btn.className = "cat-btn" + (cat === currentCategory ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", function () {
      currentCategory = cat;
      renderCategories();
      renderMenu();
    });
    categoriesEl.appendChild(btn);
  });
}

function renderMenu() {
  menuGrid.innerHTML = "";
  const items = menu.filter(function (m) {
    return currentCategory === "All" || m.category === currentCategory;
  });

  items.forEach(function (item) {
    const card = document.createElement("div");
    card.className = "food-card";
    card.innerHTML =
      '<div class="food-emoji">' + item.emoji + "</div>" +
      '<span class="veg-tag ' + (item.veg ? "veg" : "nonveg") + '">' + (item.veg ? "VEG" : "NON-VEG") + "</span>" +
      "<h4>" + item.name + "</h4>" +
      '<p class="desc">' + item.desc + "</p>" +
      '<div class="food-bottom"><span class="price">₹' + item.price + "</span>" +
      '<button class="add-btn">Add +</button></div>';

    card.querySelector(".add-btn").addEventListener("click", function () {
      addToCart(item.id);
    });
    menuGrid.appendChild(card);
  });
}


function addToCart(id) {
  const existing = cart.find(function (c) { return c.id === id; });
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: id, qty: 1 });
  }
  saveCart();
  renderCart();
}

function changeQty(id, change) {
  const entry = cart.find(function (c) { return c.id === id; });
  if (!entry) return;
  entry.qty += change;
  if (entry.qty <= 0) {
    cart = cart.filter(function (c) { return c.id !== id; });
  }
  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(function (c) { return c.id !== id; });
  saveCart();
  renderCart();
}

function calculateTotals() {
  let subtotal = 0;
  cart.forEach(function (c) {
    subtotal += findItem(c.id).price * c.qty;
  });
  const gst = Math.round(subtotal * GST_RATE);
  return { subtotal: subtotal, gst: gst, total: subtotal + gst };
}

function renderCart() {
  cartItemsEl.innerHTML = "";

  let count = 0;
  cart.forEach(function (c) { count += c.qty; });
  cartCount.textContent = count;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="empty-cart">Your cart is empty 🛒<br>Add some tasty food!</p>';
    cartFooter.style.display = "none";
    return;
  }

  cartFooter.style.display = "block";

  cart.forEach(function (c) {
    const item = findItem(c.id);
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML =
      '<div class="ci-emoji">' + item.emoji + "</div>" +
      '<div class="ci-info"><div class="ci-name">' + item.name + "</div>" +
      '<div class="ci-price">₹' + item.price + " x " + c.qty + " = ₹" + item.price * c.qty + "</div></div>" +
      '<div class="qty"><button class="minus">-</button><span>' + c.qty + '</span><button class="plus">+</button></div>' +
      '<button class="remove" title="Remove">🗑</button>';

    row.querySelector(".minus").addEventListener("click", function () { changeQty(c.id, -1); });
    row.querySelector(".plus").addEventListener("click", function () { changeQty(c.id, 1); });
    row.querySelector(".remove").addEventListener("click", function () { removeItem(c.id); });
    cartItemsEl.appendChild(row);
  });

  const t = calculateTotals();
  document.getElementById("subtotal").textContent = "₹" + t.subtotal;
  document.getElementById("gst").textContent = "₹" + t.gst;
  document.getElementById("total").textContent = "₹" + t.total;
}


function openCart() {
  cartPanel.classList.add("open");
  overlay.classList.add("show");
}

function closeCart() {
  cartPanel.classList.remove("open");
  overlay.classList.remove("show");
}

document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

document.getElementById("clearCart").addEventListener("click", function () {
  cart = [];
  saveCart();
  renderCart();
});

document.getElementById("checkoutBtn").addEventListener("click", function () {
  closeCart();
  document.getElementById("formError").textContent = "";
  document.getElementById("checkoutModal").classList.add("show");
});

document.querySelectorAll("[data-close]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.getElementById(btn.getAttribute("data-close")).classList.remove("show");
  });
});


document.getElementById("checkoutForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const method = document.getElementById("payMethod").value;
  const error = document.getElementById("formError");

  if (name === "" || phone === "" || address === "") {
    error.textContent = "Please fill all the fields.";
    return;
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    error.textContent = "Enter a valid 10 digit phone number.";
    return;
  }
  error.textContent = "";

  // simulate payment processing
  const placeBtn = document.getElementById("placeBtn");
  placeBtn.textContent = "Processing payment...";
  placeBtn.disabled = true;

  setTimeout(function () {
    placeBtn.textContent = "Place Order";
    placeBtn.disabled = false;
    showSummary(name, phone, address, method);
  }, 1800);
});
function showSummary(name, phone, address, method) {
  const orderId = "SG" + Math.floor(100000 + Math.random() * 900000);
  const t = calculateTotals();

  document.getElementById("orderId").textContent = orderId;

  const details = document.getElementById("summaryDetails");
  details.innerHTML = "";
  [["Name", name], ["Phone", phone], ["Address", address], ["Payment", method]].forEach(function (pair) {
    const line = document.createElement("div");
    const label = document.createElement("strong");
    label.textContent = pair[0] + ": ";
    line.appendChild(label);
    line.appendChild(document.createTextNode(pair[1])); // safe text
    details.appendChild(line);
  });

  const itemsEl = document.getElementById("summaryItems");
  itemsEl.innerHTML = "";
  cart.forEach(function (c) {
    const item = findItem(c.id);
    const row = document.createElement("div");
    row.className = "summary-item";
    row.innerHTML = "<span>" + item.name + " x " + c.qty + "</span><span>₹" + item.price * c.qty + "</span>";
    itemsEl.appendChild(row);
  });

  document.getElementById("sSub").textContent = "₹" + t.subtotal;
  document.getElementById("sGst").textContent = "₹" + t.gst;
  document.getElementById("sTotal").textContent = "₹" + t.total;

  document.getElementById("checkoutModal").classList.remove("show");
  document.getElementById("summaryModal").classList.add("show");

  
  cart = [];
  saveCart();
  renderCart();
  document.getElementById("checkoutForm").reset();
}

document.getElementById("doneBtn").addEventListener("click", function () {
  document.getElementById("summaryModal").classList.remove("show");
});


renderCategories();
renderMenu();
renderCart();
