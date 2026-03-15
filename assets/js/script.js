// ===================================
// PRINTCRAFT FRONTEND JAVASCRIPT
// ===================================

// Supabase Configuration
const SUPABASE_URL = 'https://sgoafvyygsmucmzssraa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnb2Fmdnl5Z3NtdWNtenNzcmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTAxODQsImV4cCI6MjA4ODk4NjE4NH0.JvxNdhCO-ucRtr2ew0M-TQHdsoMW4BzzUaRtXsl9HDM';

// State
let cart = [];
let products = [];
let currentCategory = 'all';

// Init
document.addEventListener('DOMContentLoaded', function() {
    initCategoryButtons();
    loadProducts();
    loadCart();
    setupEventListeners();
    updateCartCount();
});

// Setup category buttons - simple approach
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
        });
    });
}

// Load Products
async function loadProducts() {
    const grid = document.getElementById('products-grid');
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
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    if (!products.length) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#64748b">Nenhum produto encontrado</p>';
        return;
    }
    
    // Limit to 6 products on homepage
    const limitedProducts = products.slice(0, 6);
    
    grid.innerHTML = limitedProducts.map(p => `
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
    
    // Add "Ver Tudo" button if there are more products
    if (products.length > 6) {
        const viewAllBtn = document.createElement('div');
        viewAllBtn.style.cssText = 'grid-column: 1/-1; text-align: center; margin-top: 2rem;';
        viewAllBtn.innerHTML = `
            <button type="button" class="btn-primary" onclick="goToCatalog()">
                <i class="fas fa-th"></i> Ver Todos os Produtos (${products.length})
            </button>
        `;
        grid.appendChild(viewAllBtn);
    }
}

// Category Label
function getCategoryLabel(cat) {
    const labels = { 'flybanners': 'Flybanners', 'rollups': 'Roll-ups', 'xbanners': 'X-Banners', 'lonas': 'Lonas' };
    return labels[cat] || cat;
}

// Go to Product
function goToProduct(slug) {
    window.location.href = `pages/produto.html?slug=${slug}`;
}

// Go to Catalog
function goToCatalog() {
    window.location.href = `pages/catalogo.html?category=${currentCategory}`;
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
        // Se for a seção contact, procurar pelo textarea message
        if (sectionId === 'contact') {
            const messageTextarea = document.getElementById('message');
            if (messageTextarea) {
                const isMobile = window.innerWidth <= 768;
                const offset = isMobile ? -100 : -120; // Offset para mobile/desktop
                
                const textareaTop = messageTextarea.offsetTop + offset;
                window.scrollTo({
                    top: textareaTop,
                    behavior: 'smooth'
                });
                
                // Focar no textarea após o scroll
                setTimeout(() => {
                    messageTextarea.focus();
                }, 800);
                
                return;
            }
        }
        
        // Para outras seções, comportamento normal
        const isMobile = window.innerWidth <= 768;
        const offset = isMobile ? -40 : -80;
        
        const sectionTop = section.offsetTop + offset;
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
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

