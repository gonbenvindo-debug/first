// ===================================
// ADMIN PANEL JAVASCRIPT
// ===================================

// Import Supabase client
import { supabase, supabaseAdmin, db } from '../lib/supabase.js';

// Global Variables
let currentSection = 'dashboard';
let products = [];
let orders = [];
let customers = [];
let currentUser = null;

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

async function initializeAdmin() {
    // Check if user is logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
        // Load real data from Supabase
        await loadRealData();
    } else {
        // Load mock data for login screen
        loadMockData();
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Update stats
    updateStats();
}

// Login System
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple authentication (in real app, this would be server-side)
    if (username === 'admin' && password === 'admin123') {
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminUser', username);
        showToast('Login realizado com sucesso!', 'success');
        showDashboard();
    } else {
        showToast('Credenciais inválidas!', 'error');
    }
});

function showDashboard() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'flex';
    loadDashboardData();
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminUser');
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
    showToast('Logout realizado com sucesso!', 'info');
}

// Toggle Password Visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

// Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
}

// Mobile Sidebar Toggle
document.addEventListener('click', function(e) {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.mobile-sidebar-toggle');
    
    if (window.innerWidth <= 1024) {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
            sidebar.classList.remove('mobile-open');
        }
    }
});

// Navigation
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${section}-section`).classList.add('active');
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.querySelector(`[href="#${section}"]`).classList.add('active');
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'products': 'Gestão de Produtos',
        'orders': 'Gestão de Encomendas',
        'customers': 'Gestão de Clientes',
        'analytics': 'Análise',
        'settings': 'Configurações'
    };
    
    document.getElementById('page-title').textContent = titles[section];
    currentSection = section;
    
    // Load section-specific data
    loadSectionData(section);
}

function loadSectionData(section) {
    switch(section) {
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

// Load real data from Supabase
async function loadRealData() {
    try {
        // Load products
        const { data: productsData, error: productsError } = await supabaseAdmin
            .from('products')
            .select(`
                *,
                categories(name, icon)
            `)
            .order('created_at', { ascending: false });
        
        if (productsError) {
            console.error('Error loading products:', productsError);
            showToast('Erro ao carregar produtos', 'error');
        } else {
            products = productsData || [];
        }

        // Load orders
        const { data: ordersData, error: ordersError } = await supabaseAdmin
            .from('orders')
            .select(`
                *,
                order_items(*)
            `)
            .order('created_at', { ascending: false });
        
        if (ordersError) {
            console.error('Error loading orders:', ordersError);
            showToast('Erro ao carregar encomendas', 'error');
        } else {
            orders = ordersData || [];
        }

        // Load customers
        const { data: customersData, error: customersError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (customersError) {
            console.error('Error loading customers:', customersError);
            showToast('Erro ao carregar clientes', 'error');
        } else {
            customers = customersData || [];
        }

        // Update UI with real data
        updateStats();
        
        // If we're on a specific section, reload it
        if (currentSection === 'products') {
            loadProducts();
        } else if (currentSection === 'orders') {
            loadOrders();
        } else if (currentSection === 'customers') {
            loadCustomers();
        }

    } catch (error) {
        console.error('Error loading real data:', error);
        showToast('Erro ao carregar dados do Supabase', 'error');
    }
}

// Load Mock Data (fallback)
function loadMockData() {
    // Mock Products
    products = [
        {
            id: 1,
            name: 'Flyers Standard A6',
            category: 'flyers',
            price: 29.99,
            stock: 500,
            status: 'active',
            image: 'https://picsum.photos/seed/flyer1/100/100',
            description: 'Flyers de alta qualidade em papel 300g'
        },
        {
            id: 2,
            name: 'Cartões de Visita Premium',
            category: 'business-cards',
            price: 49.99,
            stock: 1000,
            status: 'active',
            image: 'https://picsum.photos/seed/card1/100/100',
            description: 'Cartões em papel especial com acabamento mate'
        },
        {
            id: 3,
            name: 'Banner Publicitário',
            category: 'banners',
            price: 89.99,
            stock: 50,
            status: 'active',
            image: 'https://picsum.photos/seed/banner1/100/100',
            description: 'Banners em vinil resistente para exterior'
        },
        {
            id: 4,
            name: 'Autocolantes Redondos',
            category: 'stickers',
            price: 19.99,
            stock: 0,
            status: 'out-of-stock',
            image: 'https://picsum.photos/seed/sticker1/100/100',
            description: 'Autocolantes adesivos de alta qualidade'
        }
    ];
    
    // Mock Orders
    orders = [
        {
            id: 1234,
            customer: 'João Silva',
            email: 'joao@email.com',
            date: '2024-03-13',
            total: 129.99,
            status: 'pending',
            items: 3
        },
        {
            id: 1235,
            customer: 'Maria Santos',
            email: 'maria@email.com',
            date: '2024-03-13',
            total: 89.99,
            status: 'processing',
            items: 2
        },
        {
            id: 1236,
            customer: 'Pedro Costa',
            email: 'pedro@email.com',
            date: '2024-03-12',
            total: 199.99,
            status: 'shipped',
            items: 5
        }
    ];
    
    // Mock Customers
    customers = [
        {
            id: 1,
            name: 'João Silva',
            email: 'joao@email.com',
            phone: '+351 912 345 678',
            orders: 5,
            totalSpent: 599.99,
            joinDate: '2024-01-15'
        },
        {
            id: 2,
            name: 'Maria Santos',
            email: 'maria@email.com',
            phone: '+351 923 456 789',
            orders: 3,
            totalSpent: 299.99,
            joinDate: '2024-02-01'
        }
    ];
}

// Dashboard Data
function loadDashboardData() {
    updateStats();
    loadCharts();
    loadRecentActivity();
}

function updateStats() {
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('total-customers').textContent = customers.length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('total-revenue').textContent = `€${totalRevenue.toFixed(2)}`;
    
    // Update badges
    document.getElementById('products-count').textContent = products.length;
    document.getElementById('orders-count').textContent = orders.length;
}

function loadCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('sales-chart').getContext('2d');
    new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [{
                label: 'Vendas',
                data: [1200, 1900, 1500, 2500, 2200, 3000],
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '€' + value;
                        }
                    }
                }
            }
        }
    });
    
    // Products Chart
    const productsCtx = document.getElementById('products-chart').getContext('2d');
    new Chart(productsCtx, {
        type: 'doughnut',
        data: {
            labels: ['Flyers', 'Cartões', 'Banners', 'Autocolantes'],
            datasets: [{
                data: [30, 25, 20, 25],
                backgroundColor: [
                    '#4f46e5',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function loadRecentActivity() {
    // This would load from a real API
    // For now, the activity is hardcoded in the HTML
}

// Products Management
function loadProducts() {
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = createProductRow(product);
        tbody.appendChild(row);
    });
}

function createProductRow(product) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <img src="${product.image}" alt="${product.name}" class="product-image">
        </td>
        <td>
            <strong>${product.name}</strong><br>
            <small>${product.description}</small>
        </td>
        <td>${getCategoryName(product.category)}</td>
        <td>€${product.price.toFixed(2)}</td>
        <td>${product.stock}</td>
        <td>
            <span class="status-badge ${product.status}">${getStatusName(product.status)}</span>
        </td>
        <td>
            <div class="action-buttons">
                <button class="action-btn edit" onclick="editProduct(${product.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteProduct(${product.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    return row;
}

function getCategoryName(category) {
    const names = {
        'flyers': 'Flyers',
        'business-cards': 'Cartões de Visita',
        'banners': 'Banners',
        'stickers': 'Autocolantes'
    };
    return names[category] || category;
}

function getStatusName(status) {
    const names = {
        'active': 'Ativo',
        'inactive': 'Inativo',
        'out-of-stock': 'Sem Stock'
    };
    return names[status] || status;
}

// Product Modal
function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');
    
    if (productId) {
        const product = products.find(p => p.id === productId);
        title.textContent = 'Editar Produto';
        form.dataset.productId = productId;
        
        // Fill form with product data
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-active').checked = product.status === 'active';
        
        // Show image preview
        if (product.image) {
            document.getElementById('image-preview').innerHTML = `
                <img src="${product.image}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
            `;
        }
    } else {
        title.textContent = 'Novo Produto';
        form.reset();
        delete form.dataset.productId;
        document.getElementById('image-preview').innerHTML = `
            <i class="fas fa-image"></i>
            <span>Carregar imagem</span>
        `;
    }
    
    modal.classList.add('show');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('show');
}

function editProduct(id) {
    openProductModal(id);
}

function deleteProduct(id) {
    if (confirm('Tem certeza que deseja eliminar este produto?')) {
        products = products.filter(p => p.id !== id);
        loadProducts();
        updateStats();
    }
}

// Product Form Submit
document.getElementById('product-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const productId = this.dataset.productId;
    
    const productData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value) || 0,
        description: document.getElementById('product-description').value,
        status: document.getElementById('product-active').checked ? 'active' : 'inactive',
        image_url: 'https://picsum.photos/seed/product' + Date.now() + '/100/100'
    };
    
    try {
        let result;
        
        if (productId) {
            // Update existing product
            const { data, error } = await supabaseAdmin
                .from('products')
                .update(productData)
                .eq('id', productId)
                .select()
                .single();
            
            if (error) throw error;
            result = data;
            showToast('Produto atualizado com sucesso!', 'success');
        } else {
            // Add new product
            const { data, error } = await supabaseAdmin
                .from('products')
                .insert(productData)
                .select()
                .single();
            
            if (error) throw error;
            result = data;
            showToast('Produto adicionado com sucesso!', 'success');
        }
        
        // Reload data from Supabase
        await loadRealData();
        loadProducts();
        updateStats();
        closeProductModal();
        
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Erro ao salvar produto: ' + error.message, 'error');
    }
});

// Orders Management
function loadOrders() {
    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = '';
    
    orders.forEach(order => {
        const row = createOrderRow(order);
        tbody.appendChild(row);
    });
}

function createOrderRow(order) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><strong>#${order.id}</strong></td>
        <td>
            <strong>${order.customer}</strong><br>
            <small>${order.email}</small>
        </td>
        <td>${formatDate(order.date)}</td>
        <td>€${order.total.toFixed(2)}</td>
        <td>
            <span class="status-badge ${order.status}">${getOrderStatusName(order.status)}</span>
        </td>
        <td>
            <div class="action-buttons">
                <button class="action-btn edit" onclick="viewOrder(${order.id})" title="Ver">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit" onclick="updateOrderStatus(${order.id})" title="Atualizar">
                    <i class="fas fa-sync"></i>
                </button>
            </div>
        </td>
    `;
    return row;
}

function getOrderStatusName(status) {
    const names = {
        'pending': 'Pendente',
        'processing': 'Em Processamento',
        'shipped': 'Enviado',
        'delivered': 'Entregue',
        'cancelled': 'Cancelado'
    };
    return names[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT');
}

function viewOrder(id) {
    // This would open a detailed order view
    showToast(`Ver encomenda #${id}`, 'info');
}

function updateOrderStatus(id) {
    // This would open a status update modal
    showToast(`Atualizar status da encomenda #${id}`, 'info');
}

function exportOrders() {
    // This would export orders to CSV/Excel
    showToast('A exportar encomendas...', 'info');
}

// Customers Management
function loadCustomers() {
    // This would load customers into a table
    showToast('Carregando clientes...', 'info');
}

// Analytics
function loadAnalytics() {
    // This would load detailed analytics
    showToast('Carregando análises...', 'info');
}

// Settings
function loadSettings() {
    // This would load settings page
    showToast('Carregando configurações...', 'info');
}

// Search and Filters
document.getElementById('product-search').addEventListener('input', function() {
    filterProducts();
});

document.getElementById('category-filter').addEventListener('change', function() {
    filterProducts();
});

document.getElementById('status-filter').addEventListener('change', function() {
    filterProducts();
});

function filterProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                             product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        const matchesStatus = !statusFilter || product.status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = '';
    
    filteredProducts.forEach(product => {
        const row = createProductRow(product);
        tbody.appendChild(row);
    });
}

// Global Search
document.getElementById('global-search').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    
    if (searchTerm.length > 2) {
        // Perform global search across all entities
        showToast(`Pesquisando por "${searchTerm}"...`, 'info');
    }
});

// Notifications
function toggleNotifications() {
    const dropdown = document.getElementById('notifications-dropdown');
    dropdown.classList.toggle('show');
}

// Close notifications when clicking outside
document.addEventListener('click', function(e) {
    const notificationsBtn = document.querySelector('.notification-btn');
    const dropdown = document.getElementById('notifications-dropdown');
    
    if (!notificationsBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// Theme Toggle
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('adminTheme', newTheme);
    
    // Update icon
    const themeBtn = document.querySelector('.theme-toggle i');
    themeBtn.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Load saved theme
const savedTheme = localStorage.getItem('adminTheme');
if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
    const themeBtn = document.querySelector('.theme-toggle i');
    themeBtn.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Image Upload Preview
document.getElementById('product-image').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('image-preview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
            `;
        };
        reader.readAsDataURL(file);
    }
});

// File Upload Click Handler
document.getElementById('image-preview').addEventListener('click', function() {
    document.getElementById('product-image').click();
});

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// Setup Event Listeners
function setupEventListeners() {
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
        }
    });
    
    // Close modal on background click
    document.getElementById('product-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeProductModal();
        }
    });
    
    // Form validations
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Basic validation
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            }
        });
    });
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

function formatNumber(number) {
    return new Intl.NumberFormat('pt-PT').format(number);
}

// Auto-refresh data
setInterval(() => {
    if (currentSection === 'dashboard') {
        updateStats();
    }
}, 30000); // Update every 30 seconds

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search').focus();
    }
    
    // Ctrl/Cmd + N for new product
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && currentSection === 'products') {
        e.preventDefault();
        openProductModal();
    }
});

// Export functions for global access
window.showSection = showSection;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.viewOrder = viewOrder;
window.updateOrderStatus = updateOrderStatus;
window.exportOrders = exportOrders;
window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.toggleNotifications = toggleNotifications;
window.togglePassword = togglePassword;
window.logout = logout;
