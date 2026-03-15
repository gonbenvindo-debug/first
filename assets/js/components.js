// ===================================
// PRINTCRAFT COMPONENTS JAVASCRIPT
// ===================================

// Generate Navbar
function generateNavbar() {
    // Detect if we're in a subdirectory
    const isInSubdirectory = window.location.pathname.includes('/pages/');
    const basePath = isInSubdirectory ? '../' : '';
    
    return `
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-logo">
                    <a href="${basePath}index.html">
                        <i class="fas fa-print"></i>
                        <span>PrintCraft</span>
                    </a>
                </div>
                
                <ul class="nav-menu">
                        <li class="mobile-search-item">
                            <div class="mobile-search">
                                <div class="search-container">
                                    <input type="text" id="mobile-search-input" placeholder="Pesquisar produtos..." onkeyup="handleNavSearch(event)">
                                    <button class="search-btn" onclick="toggleNavSearch()">
                                        <i class="fas fa-search"></i>
                                    </button>
                                </div>
                                <div class="search-dropdown" id="search-dropdown">
                                    <div class="search-results" id="search-results">
                                        <!-- Search results will appear here -->
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li><a href="${basePath}index.html#home">Início</a></li>
                        <li><a href="${basePath}index.html#products">Produtos</a></li>
                        <li><a href="${basePath}index.html#services">Serviços</a></li>
                        <li><a href="${basePath}index.html#about">Sobre</a></li>
                        <li><a href="${basePath}index.html#contact">Contacto</a></li>
                    </ul>
                    
                    <div class="nav-actions">
                        <div class="nav-search desktop-only">
                            <div class="search-container">
                                <input type="text" id="nav-search-input" placeholder="Pesquisar produtos..." onkeyup="handleNavSearch(event)">
                                <button class="search-btn" onclick="toggleNavSearch()">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                        <button class="cart-btn" onclick="toggleCart()">
                            <i class="fas fa-shopping-cart"></i>
                            <span id="cart-count">0</span>
                        </button>
                        <button class="mobile-menu-toggle" onclick="toggleMobileMenu()">
                            <i class="fas fa-bars"></i>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    `;
}

// Generate Footer
function generateFooter() {
    // Detect if we're in a subdirectory
    const isInSubdirectory = window.location.pathname.includes('/pages/');
    const basePath = isInSubdirectory ? '../' : '';
    
    return `
        <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <div class="footer-logo">
                            <i class="fas fa-print"></i>
                            <span>PrintCraft</span>
                        </div>
                        <p>Soluções de impressão e publicidade de alta qualidade para a sua empresa.</p>
                        <div class="social-links">
                            <a href="#"><i class="fab fa-facebook"></i></a>
                            <a href="#"><i class="fab fa-instagram"></i></a>
                            <a href="#"><i class="fab fa-linkedin"></i></a>
                        </div>
                    </div>
                    
                    <div class="footer-section">
                        <h4>Links Úteis</h4>
                        <ul>
                            <li><a href="${basePath}index.html">Início</a></li>
                            <li><a href="${basePath}index.html#products">Produtos</a></li>
                            <li><a href="${basePath}index.html#services">Serviços</a></li>
                            <li><a href="${basePath}index.html#about">Sobre Nós</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h4>Produtos</h4>
                        <ul>
                            <li><a href="${basePath}pages/catalogo.html?category=flybanners">Flybanners</a></li>
                            <li><a href="${basePath}pages/catalogo.html?category=rollups">Roll-ups</a></li>
                            <li><a href="${basePath}pages/catalogo.html?category=xbanners">X-Banners</a></li>
                            <li><a href="${basePath}pages/catalogo.html?category=lonas">Lonas</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <div class="contact-mini">
                            <h4><i class="fas fa-headset"></i> Suporte</h4>
                            <p><i class="fas fa-phone"></i> +351 912 345 678</p>
                            <p><i class="fas fa-envelope"></i> info@printcraft.pt</p>
                        </div>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <div class="footer-bottom-content">
                        <div class="footer-copyright">
                            <p>&copy; 2024 PrintCraft. Todos os direitos reservados.</p>
                            <p>Feito com <i class="fas fa-heart"></i> em Portugal</p>
                        </div>
                        <div class="footer-legal">
                            <a href="pages/privacy.html">Privacidade</a>
                            <a href="pages/terms.html">Termos</a>
                            <a href="pages/cookies.html">Cookies</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    `;
}

// Generate Cart Sidebar
function generateCartSidebar() {
    return `
        <div class="cart-sidebar" id="cart-sidebar">
            <div class="cart-header">
                <h3>Carrinho de Compras</h3>
                <button class="cart-close" onclick="toggleCart()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="cart-items" id="cart-items">
                <p style="text-align: center; padding: 2rem; color: #64748b;">O seu carrinho está vazio</p>
            </div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Total:</span>
                    <span id="cart-total">€0.00</span>
                </div>
                <button class="btn-primary" onclick="checkout()">Finalizar Pedido</button>
            </div>
        </div>
    `;
}

// Generate Toast Notification
function generateToast() {
    return `
        <div class="toast" id="toast"></div>
    `;
}

// Initialize Components
function initializeComponents() {
    // Insert navbar
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        navbarPlaceholder.innerHTML = generateNavbar();
    }
    
    // Insert footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = generateFooter();
    }
    
    // Insert cart sidebar
    const cartPlaceholder = document.getElementById('cart-placeholder');
    if (cartPlaceholder) {
        cartPlaceholder.innerHTML = generateCartSidebar();
    }
    
    // Insert toast
    const toastPlaceholder = document.getElementById('toast-placeholder');
    if (toastPlaceholder) {
        toastPlaceholder.innerHTML = generateToast();
    }
    
    // Initialize cart if cart functions exist
    if (typeof loadCart === 'function') {
        loadCart();
    }
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
}

// Search functionality
let searchTimeout;
let allProducts = [];

// Load products for search
async function loadProductsForSearch() {
    if (allProducts.length > 0) return allProducts;
    
    try {
        const response = await fetch('https://sgoafvyygsmucmzssraa.supabase.co/rest/v1/products?select=*&order=created_at.desc', {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnb2Fmdnl5Z3NtdWNtenNzcmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MDQ1MTksImV4cCI6MjA0OTQ4MDUxOX0.w9JtqRqXwB3IS1YCFQqwP8lJQJFg7WJ_LXaVtP8O7o',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnb2Fmdnl5Z3NtdWNtenNzcmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MDQ1MTksImV4cCI6MjA0OTQ4MDUxOX0.w9JtqRqXwB3IS1YCFQqwP8lJQJFg7WJ_LXaVtP8O7o'
            }
        });
        
        if (response.ok) {
            allProducts = await response.json();
        }
    } catch (error) {
        console.error('Error loading products for search:', error);
    }
    
    return allProducts;
}

// Handle nav search
function handleNavSearch(event) {
    const query = event.target.value.trim();
    const searchDropdown = document.getElementById('search-dropdown');
    const searchResults = document.getElementById('search-results');
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    if (query.length === 0) {
        searchDropdown.classList.remove('show');
        return;
    }
    
    // Debounce search
    searchTimeout = setTimeout(async () => {
        const products = await loadProductsForSearch();
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description?.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
        
        if (filteredProducts.length > 0) {
            searchResults.innerHTML = filteredProducts.slice(0, 5).map(product => `
                <div class="search-result-item" onclick="goToProductFromSearch('${product.slug}')">
                    <div class="search-result-image">
                        <img src="${product.image_url || 'https://via.placeholder.com/50x50?text=Produto'}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/50x50?text=Produto'">
                    </div>
                    <div class="search-result-info">
                        <div class="search-result-name">${highlightMatch(product.name, query)}</div>
                        <div class="search-result-category">${getCategoryLabel(product.category)}</div>
                        <div class="search-result-price">€${parseFloat(product.price).toFixed(2)}</div>
                    </div>
                </div>
            `).join('');
            
            if (filteredProducts.length > 5) {
                searchResults.innerHTML += `
                    <div class="search-result-item see-all" onclick="goToCatalogWithSearch('${query}')">
                        <div class="search-result-info">
                            <div class="search-result-name">Ver todos os ${filteredProducts.length} resultados</div>
                        </div>
                    </div>
                `;
            }
        } else {
            searchResults.innerHTML = `
                <div class="search-result-item no-results">
                    <div class="search-result-info">
                        <div class="search-result-name">Nenhum produto encontrado para "${query}"</div>
                    </div>
                </div>
            `;
        }
        
        searchDropdown.classList.add('show');
    }, 300);
}

// Highlight matching text
function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Toggle nav search
function toggleNavSearch() {
    const searchInput = document.getElementById('nav-search-input');
    searchInput.focus();
}

// Go to product from search
function goToProductFromSearch(slug) {
    const isInSubdirectory = window.location.pathname.includes('/pages/');
    const productUrl = isInSubdirectory ? `produto.html?slug=${slug}` : `pages/produto.html?slug=${slug}`;
    window.location.href = productUrl;
}

// Go to catalog with search
function goToCatalogWithSearch(query) {
    const isInSubdirectory = window.location.pathname.includes('/pages/');
    const catalogUrl = isInSubdirectory ? `catalogo.html?search=${encodeURIComponent(query)}` : `pages/catalogo.html?search=${encodeURIComponent(query)}`;
    window.location.href = catalogUrl;
}

// Close search when clicking outside
document.addEventListener('click', function(event) {
    const searchContainer = document.querySelector('.nav-search');
    const searchDropdown = document.getElementById('search-dropdown');
    
    if (searchContainer && !searchContainer.contains(event.target)) {
        searchDropdown.classList.remove('show');
    }
});

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeComponents();
    loadProductsForSearch(); // Preload products for search
});

// Export functions for global use
window.generateNavbar = generateNavbar;
window.generateFooter = generateFooter;
window.generateCartSidebar = generateCartSidebar;
window.generateToast = generateToast;
window.initializeComponents = initializeComponents;
