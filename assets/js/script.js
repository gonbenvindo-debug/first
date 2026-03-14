// ===================================
// PRINTCRAFT FRONTEND JAVASCRIPT
// ===================================

// Supabase Configuration
const SUPABASE_URL = 'https://sgoafvyygsmucmzssraa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnb2Fmdnl5Z3NtdWNtenNzcmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NzI1ODQsImV4cCI6MjA1NzQ0ODU4NH0.KmPxFeg-SZJXG0ZfQrS-ciKJFtt-GQpPVU8FPHkdAnM';

// State Management
let cart = [];
let products = [];
let currentCategory = 'all';

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadProductsFromSupabase();
    loadCart();
    setupEventListeners();
    updateCartCount();
});

// Load Products from Supabase
async function loadProductsFromSupabase() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';
    
    try {
        let url = `${SUPABASE_URL}/rest/v1/products?in_stock=eq.true&order=created_at.desc`;
        if (currentCategory !== 'all') {
            url += `&category=eq.${currentCategory}`;
        }
        
        const response = await fetch(url, {
            headers: { 'apikey': SUPABASE_KEY }
        });
        
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Erro ao carregar produtos</p>';
    }
}

// Render Products
function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b;">Nenhum produto encontrado</p>';
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" onclick="goToProduct('${product.slug}')">
            <div class="product-image">
                <img src="${product.image_url}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x300?text=Produto'">
            </div>
            <div class="product-info">
                <span class="product-category-tag">${getCategoryLabel(product.category)}</span>
                <h3>${product.name}</h3>
                <p>${product.description || ''}</p>
                <div class="product-price">Desde €${product.price.toFixed(2)}</div>
                <button class="add-to-cart" onclick="event.stopPropagation(); goToProduct('${product.slug}')">
                    <i class="fas fa-palette"></i> Personalizar
                </button>
            </div>
        </div>
    `).join('');
}

// Get Category Label
function getCategoryLabel(category) {
    const labels = {
        'flybanners': 'Flybanners',
        'rollups': 'Roll-ups',
        'xbanners': 'X-Banners',
        'lonas': 'Lonas'
    };
    return labels[category] || category;
}

// Go to Product Page
function goToProduct(slug) {
    window.location.href = `pages/produto.html?slug=${slug}`;
}

// Filter Products
function filterProducts(category) {
    currentCategory = category;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadProductsFromSupabase();
}

// Cart Functions
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
    document.getElementById('cart-count').textContent = count;
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; padding: 2rem; color: #64748b;">O seu carrinho está vazio</p>';
        cartTotal.textContent = '€0.00';
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
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `€${total.toFixed(2)}`;
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.toggle('active');
}

function checkout() {
    if (cart.length === 0) {
        showToast('O seu carrinho está vazio', 'error');
        return;
    }
    
    // Here you would integrate with Supabase to save the order
    const orderData = {
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        created_at: new Date().toISOString()
    };
    
    // For now, just show a message
    showToast('Pedido finalizado! Entraremos em contacto em breve.');
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartCount();
    renderCart();
    toggleCart();
}

// Navigation Functions
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Form Handling
function setupEventListeners() {
    // Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                product_type: document.getElementById('product-type').value,
                message: document.getElementById('message').value,
                created_at: new Date().toISOString()
            };
            
            try {
                // Save to Supabase (when configured)
                // const { data, error } = await supabaseClient
                //     .from('contacts')
                //     .insert([formData]);
                
                // For now, just show success message
                showToast('Mensagem enviada com sucesso! Entraremos em contacto em breve.');
                contactForm.reset();
            } catch (error) {
                showToast('Erro ao enviar mensagem. Tente novamente.', 'error');
                console.error('Error:', error);
            }
        });
    }
    
    // Newsletter Form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = e.target.querySelector('input[type="email"]').value;
            
            try {
                // Save to Supabase (when configured)
                // const { data, error } = await supabaseClient
                //     .from('newsletter')
                //     .insert([{ email, created_at: new Date().toISOString() }]);
                
                showToast('Subscrição realizada com sucesso!');
                e.target.reset();
            } catch (error) {
                showToast('Erro ao subscrever. Tente novamente.', 'error');
                console.error('Error:', error);
            }
        });
    }
    
    // Close cart when clicking outside
    document.addEventListener('click', function(e) {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartBtn = document.querySelector('.cart-btn');
        
        if (!cartSidebar.contains(e.target) && !cartBtn.contains(e.target)) {
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
                navMenu.classList.remove('active');
            }
        });
    });
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    
    if (type === 'error') {
        toast.classList.add('error');
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Supabase Integration Functions
async function saveContactToSupabase(contactData) {
    try {
        const { data, error } = await supabaseClient
            .from('contacts')
            .insert([contactData]);
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving contact:', error);
        throw error;
    }
}

async function saveNewsletterToSupabase(email) {
    try {
        const { data, error } = await supabaseClient
            .from('newsletter')
            .insert([{ 
                email, 
                created_at: new Date().toISOString() 
            }]);
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving newsletter subscription:', error);
        throw error;
    }
}

async function saveOrderToSupabase(orderData) {
    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .insert([orderData]);
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving order:', error);
        throw error;
    }
}

// Initialize Supabase connection check
async function checkSupabaseConnection() {
    // Supabase desativado - sempre retorna false para usar dados locais
    return false;
    
    // Código original comentado para referência futura
    /*
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('count')
            .limit(1);
        
        if (error) {
            console.log('Supabase connection error:', error);
            return false;
        }
        
        console.log('Supabase connected successfully');
        return true;
    } catch (error) {
        console.log('Supabase not available:', error);
        return false;
    }
    */
}

// Load products from Supabase if available
async function loadProductsFromSupabase() {
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
        try {
            const { data, error } = await supabaseClient
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Use Supabase products instead of local data
                return data;
            }
        } catch (error) {
            console.error('Error loading products from Supabase:', error);
        }
    }
    
    // Fallback to local products
    return products;
}

// Update the loadProducts function to use Supabase data
async function initializeProducts() {
    const productsData = await loadProductsFromSupabase();
    // Update the global products array
    if (productsData !== products) {
        products.length = 0;
        products.push(...productsData);
    }
    loadProducts();
}

// Call initializeProducts instead of loadProducts on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeProducts();
    loadCart();
    setupEventListeners();
    updateCartCount();
});
