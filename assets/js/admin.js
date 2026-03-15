// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.isAuthenticated = false;
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
    }

    // Authentication
    async checkAuth() {
        try {
            const response = await fetch('/api/admin/analytics');
            if (response.ok) {
                this.isAuthenticated = true;
                this.showDashboard();
            } else {
                this.showLogin();
            }
        } catch (error) {
            this.showLogin();
        }
    }

    async login(username, password) {
        try {
            const response = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.isAuthenticated = true;
                this.showDashboard();
                this.showToast('Login successful', 'success');
            } else {
                this.showToast(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            this.showToast('Login error: ' + error.message, 'error');
        }
    }

    async logout() {
        try {
            await fetch('/api/admin/logout', { method: 'POST' });
            this.isAuthenticated = false;
            this.showLogin();
            this.showToast('Logged out successfully', 'success');
        } catch (error) {
            this.showToast('Logout error', 'error');
        }
    }

    // UI Methods
    showLogin() {
        document.getElementById('login-container').style.display = 'flex';
        document.getElementById('admin-container').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('admin-container').style.display = 'block';
        this.loadDashboard();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                this.login(username, password);
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            });
        });
    }

    navigateTo(page) {
        this.currentPage = page;
        
        // Update active nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Show/hide sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(`${page}-section`).style.display = 'block';

        // Load page data
        switch(page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'orders':
                this.loadOrders();
                break;
        }
    }

    // Dashboard
    async loadDashboard() {
        try {
            const response = await fetch('/api/admin/analytics');
            const data = await response.json();
            
            if (response.ok) {
                this.updateDashboardStats(data.summary);
                this.renderOrdersChart(data.dailySales);
                this.renderStatusChart(data.ordersByStatus);
                this.renderTopProducts(data.topProducts);
            }
        } catch (error) {
            this.showToast('Failed to load dashboard', 'error');
        }
    }

    updateDashboardStats(stats) {
        document.getElementById('total-orders').textContent = stats.totalOrders || 0;
        document.getElementById('total-revenue').textContent = '€' + (stats.totalRevenue || 0).toFixed(2);
        document.getElementById('total-products').textContent = stats.totalProducts || 0;
        document.getElementById('avg-order').textContent = '€' + (stats.averageOrderValue || 0).toFixed(2);
    }

    renderOrdersChart(dailySales) {
        const ctx = document.getElementById('sales-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dailySales.map(d => new Date(d.date).toLocaleDateString()),
                datasets: [{
                    label: 'Sales',
                    data: dailySales.map(d => d.sales),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => '€' + value
                        }
                    }
                }
            }
        });
    }

    renderStatusChart(statusData) {
        const ctx = document.getElementById('status-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(statusData),
                datasets: [{
                    data: Object.values(statusData),
                    backgroundColor: [
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#6b7280'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderTopProducts(products) {
        const container = document.getElementById('top-products');
        if (!container) return;

        container.innerHTML = products.map((product, index) => `
            <div class="top-product-item">
                <span class="rank">${index + 1}</span>
                <img src="${product.image_url || '/placeholder.jpg'}" alt="${product.name}">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p>${product.totalSold} sold</p>
                </div>
                <span class="revenue">€${product.revenue.toFixed(2)}</span>
            </div>
        `).join('');
    }

    // Products
    async loadProducts() {
        try {
            const response = await fetch('/api/admin/products');
            const products = await response.json();
            
            if (response.ok) {
                this.renderProducts(products);
            } else {
                this.showToast('Failed to load products', 'error');
            }
        } catch (error) {
            this.showToast('Error loading products', 'error');
        }
    }

    renderProducts(products) {
        const tbody = document.querySelector('#products-table tbody');
        if (!tbody) return;

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>
                    <img src="${product.image_url || '/placeholder.jpg'}" alt="${product.name}" class="product-thumb">
                    ${product.name}
                </td>
                <td>€${product.base_price}</td>
                <td>${product.category}</td>
                <td>
                    <span class="status-badge ${product.in_stock ? 'status-active' : 'status-inactive'}">
                        ${product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="adminPanel.editProduct('${product.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async saveProduct(formData) {
        try {
            const isEdit = formData.id;
            const url = '/api/admin/products';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                this.showToast(`Product ${isEdit ? 'updated' : 'created'} successfully`, 'success');
                this.loadProducts();
                this.closeProductModal();
            } else {
                this.showToast(data.error || 'Failed to save product', 'error');
            }
        } catch (error) {
            this.showToast('Error saving product', 'error');
        }
    }

    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`/api/admin/products?id=${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showToast('Product deleted successfully', 'success');
                this.loadProducts();
            } else {
                this.showToast('Failed to delete product', 'error');
            }
        } catch (error) {
            this.showToast('Error deleting product', 'error');
        }
    }

    // Orders
    async loadOrders() {
        try {
            const response = await fetch('/api/admin/orders');
            const orders = await response.json();
            
            if (response.ok) {
                this.renderOrders(orders);
            } else {
                this.showToast('Failed to load orders', 'error');
            }
        } catch (error) {
            this.showToast('Error loading orders', 'error');
        }
    }

    renderOrders(orders) {
        const tbody = document.querySelector('#orders-table tbody');
        if (!tbody) return;

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customer_name}</td>
                <td>${order.customer_email}</td>
                <td>€${order.total_amount}</td>
                <td>
                    <span class="status-badge status-${order.status}">
                        ${order.status}
                    </span>
                </td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="adminPanel.viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="adminPanel.updateOrderStatus('${order.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Utility
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    closeProductModal() {
        document.getElementById('product-modal').style.display = 'none';
    }

    editProduct(id) {
        // Implementation for edit product modal
        console.log('Edit product:', id);
    }

    viewOrder(id) {
        // Implementation for view order modal
        console.log('View order:', id);
    }

    updateOrderStatus(id) {
        // Implementation for update order status
        console.log('Update order status:', id);
    }
}

// Initialize admin panel
const adminPanel = new AdminPanel();
