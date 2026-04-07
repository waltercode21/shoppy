/* ══════════════════════════════════════
   SHOPPY — app.js
   All JS: Navbar, Cart, Products, Filters
══════════════════════════════════════ */

'use strict';

// ── PRODUCT DATA ──────────────────────────────────────
let PRODUCTS = []; // Now fetched from Supabase

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

// ── AUTH LOGIC ────────────────────────────────────────
let authMode = 'login'; // 'login' or 'signup'

function handleAuth(select) {
  const val = select.value;
  if (!val) return;
  
  if (val === 'logout') {
    handleSignOut();
  } else if (val === 'orders') {
    window.location.href = 'orders.html';
  } else if (val === 'admin') {
    window.location.href = 'admin.html';
  } else {
    openAuthModal(val);
  }
  select.value = '';
}

function openAuthModal(mode = 'login') {
  authMode = mode;
  const modal = document.getElementById('authModal');
  if (!modal) return;
  
  updateAuthUI();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function toggleAuthMode() {
  authMode = authMode === 'login' ? 'signup' : 'login';
  updateAuthUI();
}

function updateAuthUI() {
  const title = document.getElementById('authTitle');
  const subtitle = document.getElementById('authSubtitle');
  const submitBtn = document.getElementById('authSubmitBtn');
  const switchText = document.getElementById('authSwitchText');

  if (authMode === 'login') {
    title.textContent = 'Log In';
    subtitle.textContent = 'Welcome back! Please enter your details.';
    submitBtn.textContent = 'Log In';
    switchText.innerHTML = `Don't have an account? <a href="#" onclick="toggleAuthMode()">Sign Up</a>`;
  } else {
    title.textContent = 'Sign Up';
    subtitle.textContent = 'Join Shoppy today and start shopping!';
    submitBtn.textContent = 'Create Account';
    switchText.innerHTML = `Already have an account? <a href="#" onclick="toggleAuthMode()">Log In</a>`;
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const submitBtn = document.getElementById('authSubmitBtn');

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Processing...';

  try {
    let result;
    if (authMode === 'login') {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({ email, password });
    }

    if (result.error) throw result.error;

    showToast(authMode === 'login' ? 'Logged in successfully!' : 'Account created!');
    closeAuthModal();
  } catch (err) {
    console.error('Auth error:', err.message);
    showToast(`Error: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = authMode === 'login' ? 'Log In' : 'Create Account';
  }
}

async function handleSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    showToast(`Logout error: ${error.message}`);
  } else {
    showToast('Logged out successfully.');
  }
}

// ── SESSION MANAGEMENT ────────────────────────────────
function initAuthListener() {
  supabase.auth.onAuthStateChange((event, session) => {
    updateNavbarAuthUI(session?.user);
  });
}

function updateNavbarAuthUI(user) {
  const selects = document.querySelectorAll('.auth-select');
  selects.forEach(select => {
    if (user) {
      // User is logged in
      select.innerHTML = `
        <option value="">${user.email}</option>
        ${user.email === 'officialwalter188@gmail.com' ? '<option value="admin">Admin Dashboard</option>' : ''}
        <option value="orders">My Orders</option>
        <option value="logout">Log Out</option>
      `;
    } else {
      // User is logged out
      select.innerHTML = `
        <option value="">Account</option>
        <option value="signup">Sign Up</option>
        <option value="login">Log In</option>
      `;
    }
  });
}

// ── ORDERS PAGE LOGIC ─────────────────────────────────
async function renderOrdersPage() {
  const listContainer = document.getElementById('ordersList');
  if (!listContainer) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    listContainer.innerHTML = `
      <div class="empty-orders">
        <i class="ri-user-forbid-line"></i>
        <p>Please log in to view your order history.</p>
        <button class="btn btn-primary" onclick="openAuthModal('login')">Log In Now</button>
      </div>
    `;
    return;
  }

  try {
    // Fetch orders and items using a join or two queries
    // We'll fetch orders first, then items for each
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    if (!orders || orders.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-orders">
          <i class="ri-inbox-line"></i>
          <p>You haven't placed any orders yet.</p>
          <a href="product.html" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
      return;
    }

    // Fetch all items for these orders
    const orderIds = orders.map(o => o.id);
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    if (itemsError) throw itemsError;

    listContainer.innerHTML = orders.map(order => {
      const orderItems = items.filter(i => i.order_id === order.id);
      const date = new Date(order.created_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      return `
        <div class="order-card">
          <div class="order-id-row">
            <div>
              <span class="order-id">ORD-${order.id.slice(0, 8).toUpperCase()}</span>
              <span class="order-date">${date}</span>
            </div>
            <span class="order-status status-${order.status}">${order.status}</span>
          </div>
          <div class="order-items-list">
            ${orderItems.map(item => `
              <div class="item-row">
                <div class="item-info">
                  ${item.product_name} <span class="item-qty">x${item.quantity}</span>
                </div>
                <span class="item-price">₵${item.price_at_purchase.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div class="order-total-row">
            <span class="total-label">Order Total</span>
            <span class="total-value">₵${order.total_price.toFixed(2)}</span>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading orders:', err);
    listContainer.innerHTML = `<p style="text-align:center; color:red;">Failed to load orders: ${err.message}</p>`;
  }
}

// ── ADMIN DASHBOARD LOGIC ─────────────────────────────
async function initAdminDashboard() {
  const table = document.getElementById('adminProductTable');
  if (!table) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== 'officialwalter188@gmail.com') {
    alert('Unauthorized. Redirecting...');
    window.location.href = 'index.html';
    return;
  }

  renderAdminTable();
  updateAdminStats();
  initAdminCharts(); // Initial load of charts
  initRealtimeOrders(); // Activate live alerts
}

function initRealtimeOrders() {
  supabase
    .channel('admin-orders')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'orders' 
    }, payload => {
      handleNewOrderAlert(payload.new);
    })
    .subscribe();
}

function handleNewOrderAlert(order) {
  // 1. Play Notification Sound
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  audio.play().catch(e => console.log('Audio play blocked/failed:', e));
  
  // 2. Visual Toast
  showToast(`💰 NEW ORDER! ₵${order.total_price.toFixed(2)} just received!`);
  
  // 3. Live UI Refresh
  updateAdminStats();
  initAdminCharts(); // Live update charts
}

// ── ANALYTICS LOGIC ───────────────────────────────────
let revenueChart, categoryChart;

async function initAdminCharts() {
  if (!document.getElementById('revenueChart')) return;

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('total_price, created_at')
    .order('created_at', { ascending: true });

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('product_name, price_at_purchase, quantity');

  if (ordersError || itemsError) return;

  renderRevenueChart(orders);
  renderCategoryChart(items);
  updateRevenueToday(orders);
}

function updateRevenueToday(orders) {
    const today = new Date().toLocaleDateString();
    const todaySales = orders
        .filter(o => new Date(o.created_at).toLocaleDateString() === today)
        .reduce((sum, o) => sum + Number(o.total_price), 0);
    
    const el = document.getElementById('statTotalRevenue');
    if (el) el.textContent = `₵${todaySales.toFixed(2)}`;
}

function renderRevenueChart(orders) {
  const ctx = document.getElementById('revenueChart')?.getContext('2d');
  if (!ctx) return;

  const labels = [];
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    labels.push(dateStr);
    
    const dayTotal = orders
      .filter(o => new Date(o.created_at).toLocaleDateString() === d.toLocaleDateString())
      .reduce((sum, o) => sum + Number(o.total_price), 0);
    data.push(dayTotal);
  }

  if (revenueChart) revenueChart.destroy();
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Revenue (₵)',
        data,
        borderColor: '#ff4500',
        backgroundColor: 'rgba(255, 69, 0, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { grid: { display: false }, ticks: { color: '#888' } }
      }
    }
  });
}

function renderCategoryChart(items) {
  const ctx = document.getElementById('categoryChart')?.getContext('2d');
  if (!ctx) return;

  const itemMap = {};
  items.forEach(i => {
    itemMap[i.product_name] = (itemMap[i.product_name] || 0) + (i.price_at_purchase * i.quantity);
  });

  const labels = Object.keys(itemMap).slice(0, 5);
  const data = labels.map(l => itemMap[l]);

  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#ff4500', '#3498db', '#9b59b6', '#2ecc71', '#f1c40f'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#888', font: { size: 10 } } }
      }
    }
  });
}

async function updateAdminStats() {
    const { count: pCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: oCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    
    if (document.getElementById('statTotalProducts')) document.getElementById('statTotalProducts').textContent = pCount || 0;
    if (document.getElementById('statTotalOrders')) document.getElementById('statTotalOrders').textContent = oCount || 0;
}

async function renderAdminTable() {
  const tableBody = document.getElementById('adminProductTable');
  if (!tableBody) return;

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    tableBody.innerHTML = products.map(p => `
      <tr>
        <td>
          <div class="admin-product-cell">
            <img src="${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/50'"/>
            <div>
              <strong>${p.name}</strong>
              <div style="font-size: 0.75rem; color: #888;">ID: ${p.id}</div>
            </div>
          </div>
        </td>
        <td><span class="category">${p.category}</span></td>
        <td>₵${p.price.toFixed(2)}</td>
        <td>${p.rating} ⭐</td>
        <td>
          <div class="admin-actions">
            <button class="action-btn btn-edit-item" onclick="openProductModal(${p.id})" title="Edit"><i class="ri-edit-line"></i></button>
            <button class="action-btn btn-delete-item" onclick="handleDeleteProduct(${p.id})" title="Delete"><i class="ri-delete-bin-line"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Admin Table Error:', err.message);
  }
}

function openProductModal(productId = null) {
  const modal = document.getElementById('productModal');
  const title = document.getElementById('modalProductTitle');
  const form = modal.querySelector('form');
  
  form.reset();
  document.getElementById('editProductId').value = '';

  if (productId) {
    title.textContent = 'Edit Product';
    const p = PRODUCTS.find(prod => prod.id === productId);
    if (p) {
      document.getElementById('editProductId').value = p.id;
      document.getElementById('pName').value = p.name;
      document.getElementById('pPrice').value = p.price;
      document.getElementById('pCategory').value = p.category;
      document.getElementById('pImg').value = p.img;
      document.getElementById('pRating').value = p.rating;
    }
  } else {
    title.textContent = 'Add New Product';
  }

  modal.classList.add('active');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
}

async function handleProductSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('editProductId').value;
  const fileInput = document.getElementById('pImgFile');
  let imageUrl = document.getElementById('pImg').value;

  const btn = document.getElementById('productSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Processing...';

  try {
    // 1. Handle File Upload if present
    if (fileInput.files.length > 0) {
      imageUrl = await uploadProductImage(fileInput.files[0]);
    }

    if (!imageUrl) {
        throw new Error('Please provide an image URL or upload a file.');
    }

    const productData = {
      name: document.getElementById('pName').value,
      price: parseFloat(document.getElementById('pPrice').value),
      category: document.getElementById('pCategory').value,
      img: imageUrl,
      rating: parseInt(document.getElementById('pRating').value)
    };

    let error;
    if (id) {
       const res = await supabase.from('products').update(productData).eq('id', id);
       error = res.error;
    } else {
       const res = await supabase.from('products').insert([productData]);
       error = res.error;
    }

    if (error) throw error;

    showToast(id ? 'Product updated!' : 'Product added!');
    closeProductModal();
    await fetchProducts(); 
    renderAdminTable();
    updateAdminStats();
  } catch (err) {
    console.error('Save error:', err);
    showToast(`Error: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Product';
  }
}

async function uploadProductImage(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (error) throw error;

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
}

async function handleDeleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;

    showToast('Product deleted.');
    await fetchProducts();
    renderAdminTable();
    updateAdminStats();
  } catch (err) {
    showToast(`Error: ${err.message}`);
  }
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

async function handleCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }

  // 1. Check if logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showToast('Please log in to complete your checkout.');
    openAuthModal('login');
    return;
  }

  showToast('Processing your order...');

  try {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const delivery = subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
    const discount = Math.round(subtotal * promoDiscount * 100) / 100;
    const total = Math.max(0, subtotal + delivery - discount);

    // 2. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_price: total,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Create Order Items
    const itemsToInsert = cart.map(item => ({
      order_id: order.id,
      product_name: item.name,
      quantity: item.qty,
      price_at_purchase: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    // 4. Success!
    saveCart([]); // Clear cart
    renderCartPage();
    showToast('Order placed successfully! Thank you for shopping.');
  } catch (err) {
    console.error('Checkout error:', err.message);
    showToast(`Checkout failed: ${err.message}`);
  }
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

// ── FETCH PRODUCTS FROM SUPABASE ─────────────────────
async function fetchProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) throw error;
    PRODUCTS = data;
    
    // Once products are loaded, initialize UI
    initProductPage();
    initFeatured();
  } catch (err) {
    console.error('Error fetching products:', err);
    showToast('Failed to load products. Using local data...');
  }
}

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();
  initAuthListener(); // Start listening for auth changes
  updateCartBadge();
  await fetchProducts(); // Fetch data first
  renderCartPage();
});
