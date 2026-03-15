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
                        <li><a href="${basePath}index.html#home">Início</a></li>
                        <li><a href="${basePath}index.html#products">Produtos</a></li>
                        <li><a href="${basePath}index.html#services">Serviços</a></li>
                        <li><a href="${basePath}index.html#about">Sobre</a></li>
                        <li><a href="${basePath}index.html#contact">Contacto</a></li>
                    </ul>
                    
                    <div class="nav-actions">
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

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeComponents();
});

// Export functions for global use
window.generateNavbar = generateNavbar;
window.generateFooter = generateFooter;
window.generateCartSidebar = generateCartSidebar;
window.generateToast = generateToast;
window.initializeComponents = initializeComponents;
