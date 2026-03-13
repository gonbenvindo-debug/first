// Supabase Configuration
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// State Management
let cart = [];
let currentCategory = 'all';

// Products Data
const products = [
    {
        id: 1,
        name: 'Flyers A6',
        category: 'flyers',
        price: 29.99,
        description: 'Flyers em papel de alta qualidade, formato A6',
        icon: 'fa-file-alt',
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop'
    },
    {
        id: 2,
        name: 'Cartões de Visita',
        category: 'business-cards',
        price: 19.99,
        description: 'Cartões de visita profissionais em papel premium',
        icon: 'fa-id-card',
        image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop'
    },
    {
        id: 3,
        name: 'Banner 2x1m',
        category: 'banners',
        price: 89.99,
        description: 'Banners externos em vinil resistente',
        icon: 'fa-flag',
        image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'
    },
    {
        id: 4,
        name: 'Autocolantes Redondos',
        category: 'stickers',
        price: 14.99,
        description: 'Autocolantes adesivos de alta qualidade',
        icon: 'fa-circle',
        image: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=400&h=300&fit=crop'
    },
    {
        id: 5,
        name: 'Flyers A5',
        category: 'flyers',
        price: 39.99,
        description: 'Flyers em papel de alta qualidade, formato A5',
        icon: 'fa-file',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57c70?w=400&h=300&fit=crop'
    },
    {
        id: 6,
        name: 'Cartões de Visita Premium',
        category: 'business-cards',
        price: 34.99,
        description: 'Cartões de visita em papel especial com acabamento premium',
        icon: 'fa-id-badge',
        image: 'https://images.unsplash.com/photo-1606325611047-e6b6d6e1e1a2?w=400&h=300&fit=crop'
    },
    {
        id: 7,
        name: 'Banner 3x2m',
        category: 'banners',
        price: 149.99,
        description: 'Banners grandes para eventos e promoções',
        icon: 'fa-scroll',
        image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop'
    },
    {
        id: 8,
        name: 'Autocolantes Quadrados',
        category: 'stickers',
        price: 16.99,
        description: 'Autocolantes quadrados personalizados',
        icon: 'fa-square',
        image: 'https://images.unsplash.com/photo-1620321023374-1a2b56b5ec3e?w=400&h=300&fit=crop'
    }
];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCart();
    setupEventListeners();
    updateCartCount();
});

// Load Products
function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    const filteredProducts = currentCategory === 'all' 
        ? products 
        : products.filter(p => p.category === currentCategory);
    
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'">` : ''}
                <i class="fas ${product.icon}"></i>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">€${product.price.toFixed(2)}</div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    Adicionar ao Carrinho
                </button>
            </div>
        </div>
    `).join('');
}

// Filter Products
function filterProducts(category) {
    currentCategory = category;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadProducts();
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
                // const { data, error } = await supabase
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
                // const { data, error } = await supabase
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
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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
    try {
        const { data, error } = await supabase
            .from('products')
            .select('count')
            .limit(1);
        
        if (error) {
            console.warn('Supabase not configured yet. Using local data.');
            return false;
        }
        
        return true;
    } catch (error) {
        console.warn('Supabase connection failed. Using local data.');
        return false;
    }
}

// Load products from Supabase if available
async function loadProductsFromSupabase() {
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
        try {
            const { data, error } = await supabase
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
