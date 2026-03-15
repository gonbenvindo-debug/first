// ===================================
// PRINTCRAFT CATALOG JAVASCRIPT
// ===================================

// Supabase Configuration
const SUPABASE_URL = 'https://sgoafvyygsmucmzssraa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnb2Fmdnl5Z3NtdWNtenNzcmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTAxODQsImV4cCI6MjA4ODk4NjE4NH0.JvxNdhCO-ucRtr2ew0M-TQHdsoMW4BzzUaRtXsl9HDM';

// State
let cart = [];
let products = [];
let currentCategory = 'all';

// Get category from URL
function getCategoryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    return category || 'all';
}

// Init
document.addEventListener('DOMContentLoaded', function() {
    currentCategory = getCategoryFromURL();
    initCategoryButtons();
    loadProducts();
    loadCart();
    setupEventListeners();
    updateCartCount();
});

// Setup category buttons
function initCategoryButtons() {
    // Remove all existing listeners first
    document.querySelectorAll('.category-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });
    
    // Add fresh listeners
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const category = this.dataset.category;
            if (category === currentCategory) return; // Already selected
            
            // Update active state immediately
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update category and load
            currentCategory = category;
            loadProducts();
            
            // Update URL
            const url = new URL(window.location);
            if (category === 'all') {
                url.searchParams.delete('category');
            } else {
                url.searchParams.set('category', category);
            }
            window.history.replaceState({}, '', url);
        });
    });
    
    // Set initial active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === currentCategory) {
            btn.classList.add('active');
        }
    });
}

// Load Products
async function loadProducts() {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;
    
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';
    
    try {
        let url = `${SUPABASE_URL}/rest/v1/products?in_stock=eq.true&order=created_at.desc`;
        if (currentCategory !== 'all') {
            url += `&category=eq.${currentCategory}`;
        }
        
        const res = await fetch(url, {
            headers: { 
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        products = await res.json();
        renderProducts();
    } catch (err) {
        console.error('Erro:', err);
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#ef4444">Erro ao carregar produtos</p>';
    }
}

// Render Products
function renderProducts() {
    const grid = document.getElementById('catalog-grid');
    const count = document.getElementById('products-count');
    if (!grid) return;
    
    // Update count
    if (count) {
        count.textContent = products.length;
    }
    
    if (!products.length) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#64748b">Nenhum produto encontrado</p>';
        return;
    }
    
    grid.innerHTML = products.map(p => `
        <div class="product-card" onclick="goToProduct('${p.slug}')">
            <div class="product-image">
                <img src="${p.image_url || 'https://via.placeholder.com/400x300?text=Produto'}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/400x300?text=Produto'">
            </div>
            <div class="product-info">
                <span class="product-category-tag">${getCategoryLabel(p.category)}</span>
                <h3>${p.name}</h3>
                <p>${p.description || ''}</p>
                <div class="product-price">Desde €${parseFloat(p.price).toFixed(2)}</div>
                <button type="button" class="add-to-cart" onclick="event.stopPropagation(); goToProduct('${p.slug}')">
                    <i class="fas fa-palette"></i> Personalizar
                </button>
            </div>
        </div>
    `).join('');
}

// Category Label
function getCategoryLabel(cat) {
    const labels = { 'flybanners': 'Flybanners', 'rollups': 'Roll-ups', 'xbanners': 'X-Banners', 'lonas': 'Lonas' };
    return labels[cat] || cat;
}

// Go to Product
function goToProduct(slug) {
    window.location.href = `produto.html?slug=${slug}`;
}

// Cart Functions (reused from main script)
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    renderCart();
    showToast('Produto adicionado ao carrinho!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCart();
    showToast('Produto removido do carrinho', 'error');
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCart();
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        renderCart();
    }
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const element = document.getElementById('cart-count');
    if (element) {
        element.textContent = count;
    }
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; padding: 2rem; color: #64748b;">O seu carrinho está vazio</p>';
        if (cartTotal) cartTotal.textContent = '€0.00';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">` : ''}
                <i class="fas ${item.icon}"></i>
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">€${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">Remover</button>
                </div>
            </div>
        </div>
    `).join('');
    
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `€${total.toFixed(2)}`;
    }
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('active');
    }
}

function checkout() {
    if (cart.length === 0) {
        showToast('O seu carrinho está vazio', 'error');
        return;
    }
    
    showToast('Pedido finalizado! Entraremos em contacto em breve.');
    
    cart = [];
    saveCart();
    updateCartCount();
    renderCart();
    toggleCart();
}

// Navigation Functions
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

// Form Handling
function setupEventListeners() {
    // Close cart when clicking outside
    document.addEventListener('click', function(e) {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartBtn = document.querySelector('.cart-btn');
        
        if (cartSidebar && cartBtn && !cartSidebar.contains(e.target) && !cartBtn.contains(e.target)) {
            cartSidebar.classList.remove('active');
        }
    });
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu) {
                    navMenu.classList.remove('active');
                }
            }
        });
    });
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast show';
    
    if (type === 'error') {
        toast.classList.add('error');
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
