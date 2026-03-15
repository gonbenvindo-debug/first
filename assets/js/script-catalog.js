// ===================================
// PRINTCRAFT CATALOG JAVASCRIPT
// ===================================

// Supabase Configuration
const SUPABASE_URL = 'https://sgoafvyygsmucmzssraa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnb2Fmdnl5Z3NtdWNtenNzcmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTAxODQsImV4cCI6MjA4ODk4NjE4NH0.JvxNdhCO-ucRtr2ew0M-TQHdsoMW4BzzUaRtXsl9HDM';

// State
let cart = [];
let products = [];
let filteredProducts = [];
let currentCategory = 'all';
let currentPage = 1;
let productsPerPage = 12;
let currentSort = 'created_at-desc';
let currentView = 'grid';
let searchTerm = '';

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

// Setup category dropdown
function initCategoryButtons() {
    // Set initial dropdown state based on URL
    updateDropdownFromURL();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('category-dropdown');
        const selected = document.querySelector('.dropdown-selected');
        
        if (dropdown && selected && !selected.contains(e.target) && !dropdown.contains(e.target)) {
            closeDropdown();
        }
    });
}

// Toggle dropdown
function toggleDropdown() {
    const dropdown = document.getElementById('category-dropdown');
    const selected = document.querySelector('.dropdown-selected');
    
    if (dropdown.classList.contains('show')) {
        closeDropdown();
    } else {
        openDropdown();
    }
}

// Open dropdown
function openDropdown() {
    const dropdown = document.getElementById('category-dropdown');
    const selected = document.querySelector('.dropdown-selected');
    
    dropdown.classList.add('show');
    selected.classList.add('active');
}

// Close dropdown
function closeDropdown() {
    const dropdown = document.getElementById('category-dropdown');
    const selected = document.querySelector('.dropdown-selected');
    
    dropdown.classList.remove('show');
    selected.classList.remove('active');
}

// Select category from dropdown
function selectCategory(category, text, iconClass) {
    // Update selected display
    document.getElementById('selected-text').textContent = text;
    document.getElementById('selected-icon').className = iconClass;
    
    // Update active state in dropdown
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Update category and apply filters
    if (category !== currentCategory) {
        currentCategory = category;
        applyFilters();
        
        // Update URL
        const url = new URL(window.location);
        if (category === 'all') {
            url.searchParams.delete('category');
        } else {
            url.searchParams.set('category', category);
        }
        window.history.replaceState({}, '', url);
    }
    
    // Close dropdown
    closeDropdown();
}

// Update dropdown from URL
function updateDropdownFromURL() {
    const category = getCategoryFromURL();
    currentCategory = category;
    
    // Update dropdown based on category
    const categoryInfo = {
        'all': { text: 'Todos', icon: 'fas fa-th-large' },
        'flybanners': { text: 'Flybanners', icon: 'fas fa-flag' },
        'rollups': { text: 'Roll-ups', icon: 'fas fa-scroll' },
        'xbanners': { text: 'X-Banners', icon: 'fas fa-times' },
        'lonas': { text: 'Lonas', icon: 'fas fa-rectangle-wide' }
    };
    
    const info = categoryInfo[category] || categoryInfo['all'];
    document.getElementById('selected-text').textContent = info.text;
    document.getElementById('selected-icon').className = info.icon;
    
    // Update active state
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.category === category) {
            item.classList.add('active');
        }
    });
}

// Load Products
async function loadProducts() {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;
    
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';
    
    try {
        let url = `${SUPABASE_URL}/rest/v1/products?in_stock=eq.true`;
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
        applyFilters();
    } catch (err) {
        console.error('Erro:', err);
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#ef4444">Erro ao carregar produtos</p>';
    }
}

// Apply filters, sorting and search
function applyFilters() {
    // Start with all products
    filteredProducts = [...products];
    
    // Apply category filter
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
    }
    
    // Apply search filter
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(term) ||
            (p.description && p.description.toLowerCase().includes(term)) ||
            p.category.toLowerCase().includes(term)
        );
    }
    
    // Apply sorting
    const [field, order] = currentSort.split('-');
    filteredProducts.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        
        if (field === 'price') {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
        }
        
        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    // Reset to first page when filters change
    currentPage = 1;
    
    renderProducts();
    renderPagination();
}

// Render Products
function renderProducts() {
    const grid = document.getElementById('catalog-grid');
    const count = document.getElementById('products-count');
    if (!grid) return;
    
    // Update count with filtered products
    if (count) {
        count.textContent = filteredProducts.length;
    }
    
    if (!filteredProducts.length) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#64748b">Nenhum produto encontrado</p>';
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Set view class
    grid.className = currentView === 'list' ? 'catalog-grid list-view' : 'catalog-grid';
    
    // Render products
    grid.innerHTML = paginatedProducts.map(p => `
        <div class="product-card ${currentView === 'list' ? 'list-view' : ''}" onclick="goToProduct('${p.slug}')">
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

// Render Pagination
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `<button onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-info">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" ${i === currentPage ? 'class="active"' : ''}>
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-info">...</span>`;
        }
        paginationHTML += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // Next button
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    // Info
    const startItem = (currentPage - 1) * productsPerPage + 1;
    const endItem = Math.min(currentPage * productsPerPage, filteredProducts.length);
    paginationHTML += `
        <span class="pagination-info">
            ${startItem}-${endItem} de ${filteredProducts.length}
        </span>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderProducts();
    renderPagination();
    
    // Scroll to top of products
    document.querySelector('.catalog-section').scrollIntoView({ behavior: 'smooth' });
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

// Sort Products
function sortProducts() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        currentSort = sortSelect.value;
        applyFilters();
    }
}

// Search Products
function searchProducts() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchTerm = searchInput.value.trim();
        applyFilters();
    }
}

// Change View
function changeView(view) {
    currentView = view;
    
    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    renderProducts();
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
