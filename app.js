/* ══════════════════════════════════════
   SHOPPY — app.js
   All JS: Navbar, Cart, Products, Filters
══════════════════════════════════════ */

'use strict';

// ── PRODUCT DATA ──────────────────────────────────────
const PRODUCTS = [
  // FASHION
  { id: 1,  category: 'fashion',     name: 'Classic White Tee',           price: 49.99,  rating: 4, img: 'images/pro41.jpeg' },
  { id: 2,  category: 'fashion',     name: 'Slim Fit Jeans',              price: 99.99,  rating: 4, img: 'images/pro39.jpeg' },
  { id: 3,  category: 'fashion',     name: 'Summer Floral Dress',         price: 29.99,  rating: 5, img: 'images/pro2.jpeg' },
  { id: 4,  category: 'fashion',     name: 'Leather Jacket',              price: 89.99,  rating: 4, img: 'images/pro37.jpeg' },
  { id: 5,  category: 'fashion',     name: 'Louis Vuitton Bag',             price: 49.99,  rating: 4, img: 'images/pro4.jpeg' },
  { id: 6,  category: 'fashion',     name: 'Gucci Hand Bag',               price: 59.99,  rating: 3, img: 'images/pro5.jpeg' },
  { id: 7,  category: 'fashion',     name: 'Nike Air Jordan 1',                price: 200.99,  rating: 4, img: 'images/pro6.jpeg'},
  { id: 8,  category: 'fashion',     name: 'Striped Polo Shirt',          price: 24.99,  rating: 4, img: 'images/pro38.jpeg' },

  // ELECTRONICS
  { id: 9,  category: 'electronics', name: 'Wireless Headphones',         price: 129.99, rating: 5, img: 'images/pro26.jpeg' },
  { id: 10, category: 'electronics', name: 'Bluetooth Speaker',           price: 79.99,  rating: 4, img: 'images/pro27.jpeg' },
  { id: 11, category: 'electronics', name: 'Wireless Mouse',                 price: 199.99, rating: 5, img: 'images/pro15.jpeg' },
  { id: 12, category: 'electronics', name: 'Laptop Stand',                price: 34.99,  rating: 4, img: 'images/pro31.jpeg' },
  { id: 13, category: 'electronics', name: 'Mechanical Keyboard',         price: 89.99,  rating: 5, img: 'images/pro36.jpeg' },
  { id: 14, category: 'electronics', name: 'USB-C Hub',                   price: 44.99,  rating: 4, img: 'images/pro35.jpeg' },
  { id: 15, category: 'electronics', name: 'Webcam HD 1080p',             price: 59.99,  rating: 4, img: 'images/pro32.jpeg' },
  { id: 16, category: 'electronics', name: 'Portable Charger',            price: 29.99,  rating: 4, img: 'images/pro13.jpeg' },

  // BOOKS
  { id: 17, category: 'books',       name: '48 Laws of Power',            price: 55.99,  rating: 5, img: 'images/pro17.jpeg' },
  { id: 18, category: 'books',       name: 'Think and Grow Rich',         price: 65.99,   rating: 5, img: 'images/pro18.jpeg' },
  { id: 19, category: 'books',       name: 'Good To Great',               price: 79.99,  rating: 5, img: 'images/pro30.jpeg' },
  { id: 20, category: 'books',       name: 'The 4-Hour Workweek',         price: 99.99,  rating: 4, img: 'images/pro20.jpeg' },
  { id: 21, category: 'books',       name: 'Rich Dad Poor Dad',           price: 49.99,  rating: 5, img: 'images/pro28.jpeg' },
  { id: 22, category: 'books',       name: 'Emotional Intelligence Habits',     price: 70.99,  rating: 5, img: 'images/pro29.jpeg' },

  // beauty
  {id: 23, category: 'Beauty', name: 'coconut moiturising cream & oil', price: 40.99, rating: 4, img: 'images/pro45.jpeg'},
  {id: 24, category: 'Beauty', name: 'Vaseline (cocoa glow)', price: 50.99, rating: 5, img: 'images/pro23.jpeg'},
  {id: 25, category: 'Beauty', name: 'NIVEA Express Hydration Body Lotion', price: 39.99, rating: 4, img: 'images/pro21.jpeg'},
  {id: 26, category: 'Beauty', name: 'Sweet Lips', price: 19.99, rating: 3, img: 'images/pro25.jpeg'},
  {id: 26, category: 'Beauty', name: 'DOVE', price: 120.99, rating: 5, img: 'images/pro24.jpeg'},
 
 
];

const PROMO_CODES = { SAVE10: 0.10, SAVE20: 0.20, SHOPPY5: 0.05 };
const DELIVERY_FEE = 5.00;
const FREE_DELIVERY_THRESHOLD = 50;

// ── CART STATE (localStorage) ─────────────────────────
function getCart() {
  try { return JSON.parse(localStorage.getItem('shoppy_cart')) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem('shoppy_cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  let cart = getCart();
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, qty: 1 });
  }

  saveCart(cart);
  showToast(`"${product.name}" added to cart!`);
}

function removeFromCart(productId) {
  let cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  renderCartPage();
}

function updateQty(productId, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, Math.min(20, item.qty + delta));
  saveCart(cart);
  renderCartPage();
}

function clearCart() {
  if (!confirm('Are you sure you want to clear your cart?')) return;
  saveCart([]);
  renderCartPage();
  showToast('Cart cleared.');
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('#cartBadge').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

// ── NAVBAR ────────────────────────────────────────────
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (!navbar) return;

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  // Hamburger toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
  }
}

function closeMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger) hamburger.classList.remove('active');
  if (navLinks)  navLinks.classList.remove('open');
  document.body.style.overflow = '';
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  const navLinks  = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  if (!navLinks || !hamburger) return;
  if (navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)) {
    closeMenu();
  }
});

// ── AUTH HANDLER ──────────────────────────────────────
function handleAuth(select) {
  const val = select.value;
  if (!val) return;
  showToast(val === 'signup' ? 'Sign up coming soon!' : 'Login coming soon!');
  select.value = '';
}

// ── TOAST ─────────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── RENDER STARS ──────────────────────────────────────
function renderStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<i class="${i <= rating ? 'ri-star-fill' : 'ri-star-line'}"></i>`;
  }
  return stars;
}

// ── RENDER PRODUCT CARD ──────────────────────────────
function productCard(product) {
  return `
    <div class="product" data-id="${product.id}" data-category="${product.category}" data-name="${product.name.toLowerCase()}" data-price="${product.price}">
      <img src="${product.img}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/250x200/555/fff?text=Product'"/>
      <div class="product-info">
        <span class="category">${product.category}</span>
        <h5>${product.name}</h5>
        <div class="rating">${renderStars(product.rating)}</div>
        <span class="price">₵${product.price.toFixed(2)}</span>
        <button class="btn btn-primary" onclick="addToCart(${product.id})">
          <i class="ri-shopping-cart-line"></i> Add to Cart
        </button>
      </div>
    </div>`;
}

// ── PRODUCT PAGE ──────────────────────────────────────
function initProductPage() {
  const fashionGrid     = document.getElementById('fashion-grid');
  const electronicsGrid = document.getElementById('electronics-grid');
  const booksGrid       = document.getElementById('books-grid');
  const BeautyGrid       = document.getElementById('Beauty-grid');


  if (!fashionGrid) return;

  const fashion     = PRODUCTS.filter(p => p.category === 'fashion');
  const electronics = PRODUCTS.filter(p => p.category === 'electronics');
  const books       = PRODUCTS.filter(p => p.category === 'books');
  const Beauty      = PRODUCTS.filter(p => p.category === 'Beauty');

  fashionGrid.innerHTML     = fashion.map(productCard).join('');
  electronicsGrid.innerHTML = electronics.map(productCard).join('');
  booksGrid.innerHTML       = books.map(productCard).join('');
  BeautyGrid.innerHTML      = Beauty.map(productCard).join('');
}

// ── SEARCH / FILTER / SORT ────────────────────────────
function filterProducts() {
  const query    = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const category = document.getElementById('categoryFilter')?.value || 'all';
  const sort     = document.getElementById('sortFilter')?.value || 'default';

  const sections  = ['fashion', 'electronics', 'books','Beauty'];
  const allCards  = document.querySelectorAll('.product');
  let   anyVisible = false;

  // Get cards as array, sort them
  let cards = Array.from(allCards);

  if (sort === 'price-low') {
    cards.sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
  } else if (sort === 'price-high') {
    cards.sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
  } else if (sort === 'name') {
    cards.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
  }

  // Re-insert sorted cards into their grids
  ['fashion', 'electronics', 'books', 'beauty'].forEach(cat => {
    const grid = document.getElementById(`${cat}-grid`);
    if (!grid) return;
    const catCards = cards.filter(c => c.dataset.category === cat);
    catCards.forEach(c => grid.appendChild(c));
  });

  // Show/hide based on search + category
  cards.forEach(card => {
    const matchSearch   = !query || card.dataset.name.includes(query);
    const matchCategory = category === 'all' || card.dataset.category === category;
    const visible = matchSearch && matchCategory;
    card.style.display = visible ? 'flex' : 'none';
    if (visible) anyVisible = true;
  });

  // Show/hide section headers based on category filter
  sections.forEach(cat => {
    const section = document.getElementById(`${cat}-section`);
    if (!section) return;
    const hasCatCards = category === 'all' || category === cat;
    const hasSomeVisible = Array.from(section.querySelectorAll('.product'))
      .some(c => c.style.display !== 'none');
    section.style.display = hasCatCards && hasSomeVisible ? 'block' : 'none';
  });

  const noResults = document.getElementById('noResults');
  if (noResults) noResults.style.display = anyVisible ? 'none' : 'block';
}

// ── FEATURED (on index.html) ──────────────────────────
function initFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  // Pick 4 featured: top rated across categories
  const featured = [PRODUCTS[0], PRODUCTS[8], PRODUCTS[16], PRODUCTS[18]];
  grid.innerHTML = featured.map(productCard).join('');
}

// ── CART PAGE ─────────────────────────────────────────
let promoDiscount = 0;

function renderCartPage() {
  const container = document.getElementById('cartItemsContainer');
  const emptyCart = document.getElementById('emptyCart');
  const cartActions = document.getElementById('cartActions');
  if (!container) return;

  const cart = getCart();
  container.innerHTML = '';

  if (cart.length === 0) {
    emptyCart.style.display = 'block';
    if (cartActions) cartActions.style.display = 'none';
    updateSummary(0);
    return;
  }

  emptyCart.style.display = 'none';
  if (cartActions) cartActions.style.display = 'flex';

  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item-row';
    row.innerHTML = `
      <div class="cart-product-info">
        <img src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/70x80/555/fff?text=Img'"/>
        <div>
          <h4>${item.name}</h4>
          <p>Unit price: ₵${item.price.toFixed(2)}</p>
        </div>
      </div>
      <span class="cart-price">₵${item.price.toFixed(2)}</span>
      <div class="cart-qty-control">
        <button class="qty-btn" onclick="updateQty(${item.id}, -1)">−</button>
        <span class="qty-display">${item.qty}</span>
        <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
      </div>
      <span class="cart-item-total">₵${(item.price * item.qty).toFixed(2)}</span>
      <button class="remove-item-btn" onclick="removeFromCart(${item.id})" title="Remove item">
        <i class="ri-delete-bin-5-line"></i>
      </button>`;
    container.appendChild(row);
  });

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  updateSummary(subtotal);
}

function updateSummary(subtotal) {
  const delivery = subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
  const discount = Math.round(subtotal * promoDiscount * 100) / 100;
  const total    = Math.max(0, subtotal + delivery - discount);

  const el = id => document.getElementById(id);
  if (el('summarySubtotal')) el('summarySubtotal').textContent = `₵${subtotal.toFixed(2)}`;
  if (el('summaryDelivery')) el('summaryDelivery').textContent = delivery === 0 && subtotal > 0
    ? 'FREE 🎉' : `₵${delivery.toFixed(2)}`;
  if (el('summaryTotal'))    el('summaryTotal').textContent    = `₵${total.toFixed(2)}`;

  if (discount > 0) {
    if (el('discountRow'))    el('discountRow').style.display    = 'flex';
    if (el('summaryDiscount')) el('summaryDiscount').textContent = `-₵${discount.toFixed(2)}`;
  }
}

function applyPromo() {
  const input = document.getElementById('promoInput');
  const msg   = document.getElementById('promoMsg');
  if (!input || !msg) return;

  const code = input.value.trim().toUpperCase();
  if (PROMO_CODES[code]) {
    promoDiscount = PROMO_CODES[code];
    msg.textContent = `✓ "${code}" applied — ${promoDiscount * 100}% off!`;
    msg.style.color = '#4caf50';
    const cart = getCart();
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    updateSummary(subtotal);
    showToast(`Promo code applied — ${promoDiscount * 100}% off!`);
  } else {
    msg.textContent = '✗ Invalid promo code. Try SAVE10, SAVE20, or SHOPPY5';
    msg.style.color = '#e74c3c';
  }
}

function handleCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }
  showToast('Redirecting to secure checkout…');
  // In a real app: window.location.href = '/checkout';
}

// ── CONTACT FORM ──────────────────────────────────────
function handleContactForm(e) {
  e.preventDefault();
  const success = document.getElementById('formSuccess');
  if (success) {
    success.style.display = 'block';
    e.target.reset();
    setTimeout(() => success.style.display = 'none', 4000);
  }
  showToast('Message sent successfully!');
}

// ── SMOOTH SCROLL (anchor links) ─────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  updateCartBadge();
  initProductPage();
  initFeatured();
  renderCartPage();
});
