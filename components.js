// ===================================
// COMPONENTS LOADER - Dynamic Component System
// ===================================

// Component Loader Class
class ComponentLoader {
    constructor() {
        this.components = new Map();
        this.cache = new Map();
        this.init();
    }

    async init() {
        await this.loadComponents();
        this.setupEventListeners();
        this.initializeComponents();
    }

    // Load all components
    async loadComponents() {
        const componentConfigs = [
            {
                id: 'navbar',
                url: 'components/navbar.html',
                container: 'navbar-container',
                required: true
            },
            {
                id: 'footer',
                url: 'components/footer.html',
                container: 'footer-container',
                required: true
            }
        ];

        for (const config of componentConfigs) {
            try {
                await this.loadComponent(config);
            } catch (error) {
                console.error(`Failed to load component ${config.id}:`, error);
                if (config.required) {
                    this.showComponentError(config.id);
                }
            }
        }
    }

    // Load individual component
    async loadComponent(config) {
        // Check cache first
        if (this.cache.has(config.url)) {
            this.renderComponent(config, this.cache.get(config.url));
            return;
        }

        try {
            const response = await fetch(config.url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            this.cache.set(config.url, html);
            this.renderComponent(config, html);
            this.components.set(config.id, { ...config, loaded: true });
            
        } catch (error) {
            throw new Error(`Failed to fetch component ${config.id}: ${error.message}`);
        }
    }

    // Render component to DOM
    renderComponent(config, html) {
        const container = document.getElementById(config.container);
        if (container) {
            container.innerHTML = html;
            this.initializeComponentScripts(config.id, container);
        }
    }

    // Initialize component-specific scripts
    initializeComponentScripts(componentId, container) {
        switch (componentId) {
            case 'navbar':
                this.initializeNavbar(container);
                break;
            case 'footer':
                this.initializeFooter(container);
                break;
        }
    }

    // Initialize navbar functionality
    initializeNavbar(container) {
        const mobileMenuBtn = container.querySelector('#mobile-menu-btn');
        const navMenu = container.querySelector('#nav-menu');
        const cartBtn = container.querySelector('#cart-btn');
        const navbar = container.querySelector('#navbar');

        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-bars');
                    icon.classList.toggle('fa-times');
                }
            });
        }

        // Close mobile menu when clicking on links
        const navLinks = container.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu) {
                    navMenu.classList.remove('active');
                }
                const icon = mobileMenuBtn?.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            });
        });

        // Navbar scroll effect
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        }

        // Smooth scroll for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        const offset = 80; // Navbar height
                        const targetPosition = targetElement.offsetTop - offset;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    // Initialize footer functionality
    initializeFooter(container) {
        // Newsletter form
        const newsletterForm = container.querySelector('#newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                
                try {
                    await this.subscribeNewsletter(email);
                    this.showToast('🎉 Subscrição realizada com sucesso! Verifique seu email.', 'success');
                    newsletterForm.reset();
                } catch (error) {
                    this.showToast('❌ Erro ao subscrever. Tente novamente.', 'error');
                }
            });
        }

        // Back to top button
        const backToTopBtn = container.querySelector('#back-to-top');
        if (backToTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    backToTopBtn.classList.add('visible');
                } else {
                    backToTopBtn.classList.remove('visible');
                }
            });

            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        // Footer links smooth scroll
        const footerLinks = container.querySelectorAll('.footer-links a, .footer-section a[href^="#"]');
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        const offset = 80;
                        const targetPosition = targetElement.offsetTop - offset;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });

        // Language selector
        const languageSelect = container.querySelector('#language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                const selectedLang = e.target.value;
                this.changeLanguage(selectedLang);
            });
        }

        // Initialize live chat
        this.initializeLiveChat(container);
    }

    // Initialize live chat functionality
    initializeLiveChat(container) {
        const chatToggle = container.querySelector('#chat-toggle');
        const chatWindow = container.querySelector('#chat-window');
        const chatClose = container.querySelector('#chat-close');
        const chatInput = container.querySelector('#chat-input-field');
        const chatSend = container.querySelector('#chat-send');
        const chatMessages = container.querySelector('#chat-messages');

        if (!chatToggle || !chatWindow) return;

        // Toggle chat window
        chatToggle.addEventListener('click', () => {
            chatWindow.classList.toggle('active');
            const badge = chatToggle.querySelector('.chat-badge');
            if (badge) {
                badge.style.display = 'none';
            }
        });

        // Close chat window
        if (chatClose) {
            chatClose.addEventListener('click', () => {
                chatWindow.classList.remove('active');
            });
        }

        // Send message
        const sendMessage = () => {
            const message = chatInput?.value.trim();
            if (!message || !chatMessages) return;

            // Add user message
            const userMessage = document.createElement('div');
            userMessage.className = 'chat-message user';
            userMessage.innerHTML = `
                <i class="fas fa-user"></i>
                <div class="message-content">
                    <p>${this.escapeHtml(message)}</p>
                </div>
            `;
            chatMessages.appendChild(userMessage);

            // Clear input
            if (chatInput) {
                chatInput.value = '';
            }

            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Simulate bot response
            setTimeout(() => {
                const botMessage = document.createElement('div');
                botMessage.className = 'chat-message bot';
                botMessage.innerHTML = `
                    <i class="fas fa-robot"></i>
                    <div class="message-content">
                        <p>Obrigado pela sua mensagem! Nossa equipe irá responder em breve. Horário de atendimento: Seg-Sex 9h-18h.</p>
                    </div>
                `;
                chatMessages.appendChild(botMessage);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        };

        // Send on button click
        if (chatSend) {
            chatSend.addEventListener('click', sendMessage);
        }

        // Send on Enter key
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        }

        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target) && chatWindow.classList.contains('active')) {
                chatWindow.classList.remove('active');
            }
        });
    }

    // Change language
    changeLanguage(lang) {
        // Simulate language change
        this.showToast(`🌐 Idioma alterado para ${this.getLanguageName(lang)}`, 'info');
        
        // In a real application, this would reload content in the selected language
        console.log(`Language changed to: ${lang}`);
    }

    // Get language name
    getLanguageName(lang) {
        const languages = {
            'pt': 'Português',
            'en': 'English',
            'es': 'Español',
            'fr': 'Français'
        };
        return languages[lang] || lang;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Newsletter subscription
    async subscribeNewsletter(email) {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && email.includes('@')) {
                    resolve();
                } else {
                    reject(new Error('Invalid email'));
                }
            }, 1000);
        });
    }

    // Show toast notification
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Show component error
    showComponentError(componentId) {
        const container = document.getElementById(`${componentId}-container`);
        if (container) {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center; background: #fee; border: 1px solid #fcc; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #c00; margin: 0 0 10px 0;">Erro ao Carregar Componente</h3>
                    <p style="color: #666; margin: 0;">Não foi possível carregar o componente ${componentId}. Por favor, recarregue a página.</p>
                </div>
            `;
        }
    }

    // Setup global event listeners
    setupEventListeners() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.refreshComponents();
            }
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            this.showToast('Conexão restaurada', 'success');
            this.refreshComponents();
        });

        window.addEventListener('offline', () => {
            this.showToast('Sem conexão à internet', 'error');
        });
    }

    // Initialize all components
    initializeComponents() {
        // Add any global initialization logic here
        console.log('All components initialized successfully');
    }

    // Refresh components
    async refreshComponents() {
        for (const [id, config] of this.components) {
            if (config.loaded) {
                try {
                    await this.loadComponent(config);
                } catch (error) {
                    console.error(`Failed to refresh component ${id}:`, error);
                }
            }
        }
    }

    // Get component by ID
    getComponent(id) {
        return this.components.get(id);
    }

    // Reload specific component
    async reloadComponent(id) {
        const config = this.components.get(id);
        if (config) {
            this.cache.delete(config.url);
            await this.loadComponent(config);
        }
    }
}

// Theme Manager
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    setupThemeToggle() {
        // Add theme toggle button if needed
        const themeToggle = document.createElement('button');
        themeToggle.id = 'theme-toggle';
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.setAttribute('aria-label', 'Alternar tema');
        
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
            const icon = themeToggle.querySelector('i');
            icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        });

        // Add to page (you can customize where to place it)
        document.body.appendChild(themeToggle);
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            this.recordPageLoadMetrics();
        });

        // Monitor component load times
        this.observeComponentPerformance();
    }

    recordPageLoadMetrics() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            this.metrics.pageLoad = {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                totalTime: navigation.loadEventEnd - navigation.fetchStart
            };
            console.log('Page Load Metrics:', this.metrics.pageLoad);
        }
    }

    observeComponentPerformance() {
        // Observe when components become visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const componentName = entry.target.dataset.component;
                    if (componentName) {
                        this.recordComponentLoad(componentName);
                    }
                }
            });
        });

        document.querySelectorAll('[data-component]').forEach(el => {
            observer.observe(el);
        });
    }

    recordComponentLoad(componentName) {
        if (!this.metrics.components) {
            this.metrics.components = {};
        }
        this.metrics.components[componentName] = {
            loadTime: performance.now(),
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize component loader
    window.componentLoader = new ComponentLoader();
    
    // Initialize theme manager
    window.themeManager = new ThemeManager();
    
    // Initialize performance monitor
    window.performanceMonitor = new PerformanceMonitor();
    
    // Global error handling
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        if (window.componentLoader) {
            window.componentLoader.showToast('Ocorreu um erro inesperado', 'error');
        }
    });

    // Global unhandled promise rejection
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        if (window.componentLoader) {
            window.componentLoader.showToast('Ocorreu um erro inesperado', 'error');
        }
    });
});

// Export for external use
window.ComponentLoader = ComponentLoader;
window.ThemeManager = ThemeManager;
window.PerformanceMonitor = PerformanceMonitor;
