// Scroll Animations for Wind Effect and Immersive Experience

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initWindEffects();
    initParallaxEffects();
    initScrollReveal();
});

// Scroll-based animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Add wind effect to specific elements
                if (entry.target.classList.contains('wind-element')) {
                    startWindEffect(entry.target);
                }
                
                // Add floating effect to service cards
                if (entry.target.classList.contains('service-card')) {
                    entry.target.style.animation = 'floatInWind 4s ease-in-out infinite';
                }
                
                // Add banner wave effect
                if (entry.target.classList.contains('banner-element')) {
                    startBannerWave(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.product-card, .service-card, .about-content, .contact-form').forEach(el => {
        el.classList.add('scroll-reveal');
        observer.observe(el);
    });

    // Observe wind elements
    document.querySelectorAll('.category-btn, .add-to-cart, .stat').forEach(el => {
        el.classList.add('wind-element');
        observer.observe(el);
    });

    // Observe banner elements
    document.querySelectorAll('.products h2, .services h2, .about h2, .contact h2').forEach(el => {
        el.classList.add('banner-element');
        observer.observe(el);
    });
}

// Wind effect for elements
function initWindEffects() {
    // Add wind particles to hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        createWindParticles(hero);
    }

    // Add wind effect to navigation
    const nav = document.querySelector('.navbar');
    if (nav) {
        nav.classList.add('wind-nav');
    }

    // Add banner wind effect to sections
    document.querySelectorAll('.products, .services, .about, .contact').forEach(section => {
        createBannerWind(section);
    });
}

// Create floating wind particles
function createWindParticles(container) {
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'wind-particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: windParticle ${Math.random() * 10 + 5}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
            pointer-events: none;
        `;
        container.appendChild(particle);
    }
}

// Create banner wind effect
function createBannerWind(section) {
    const banner = document.createElement('div');
    banner.className = 'banner-wind';
    banner.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.05), transparent);
        animation: bannerWind 8s ease-in-out infinite;
        pointer-events: none;
        z-index: 1;
    `;
    section.style.position = 'relative';
    section.style.overflow = 'hidden';
    section.appendChild(banner);
}

// Start wind effect on element
function startWindEffect(element) {
    element.style.animation = 'windEffect 3s ease-in-out infinite';
    
    // Add random delay for natural effect
    element.style.animationDelay = `${Math.random() * 2}s`;
}

// Start banner wave effect
function startBannerWave(element) {
    element.style.position = 'relative';
    element.style.animation = 'bannerWave 6s ease-in-out infinite';
}

// Parallax effects
function initParallaxEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        // Parallax for hero content
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
        
        // Parallax for hero image
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
            heroImage.style.transform = `translateY(${scrolled * 0.5}px) scale(${1 + scrolled * 0.0005})`;
        }
        
        // Parallax for sections
        document.querySelectorAll('.products, .services, .about, .contact').forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const speed = 0.1 + (index * 0.02);
                section.style.transform = `translateY(${scrolled * speed}px)`;
            }
        });
    });
}

// Scroll reveal animations
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    revealElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px)';
        element.style.transition = `all 0.8s ease ${index * 0.1}s`;
    });
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes windParticle {
        0% {
            transform: translateX(0) translateY(0) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateX(300px) translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes windEffect {
        0%, 100% {
            transform: translateX(0) rotate(0deg);
        }
        25% {
            transform: translateX(2px) rotate(0.5deg);
        }
        50% {
            transform: translateX(-1px) rotate(-0.5deg);
        }
        75% {
            transform: translateX(1px) rotate(0.3deg);
        }
    }
    
    @keyframes bannerWind {
        0% {
            left: -100%;
        }
        50% {
            left: 100%;
        }
        100% {
            left: 100%;
        }
    }
    
    @keyframes bannerWave {
        0%, 100% {
            transform: translateX(0) scaleX(1);
        }
        25% {
            transform: translateX(-5px) scaleX(1.02);
        }
        50% {
            transform: translateX(3px) scaleX(0.98);
        }
        75% {
            transform: translateX(-2px) scaleX(1.01);
        }
    }
    
    @keyframes floatInWind {
        0%, 100% {
            transform: translateY(0) rotate(0deg);
        }
        33% {
            transform: translateY(-5px) rotate(1deg);
        }
        66% {
            transform: translateY(3px) rotate(-1deg);
        }
    }
    
    .animate-in {
        animation: fadeInUp 0.8s ease forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .wind-nav {
        animation: navWind 4s ease-in-out infinite;
    }
    
    @keyframes navWind {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-1px);
        }
    }
    
    /* Scroll indicator */
    .scroll-indicator {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
        transform-origin: left;
        transform: scaleX(0);
        z-index: 10000;
        transition: transform 0.3s ease;
    }
`;

document.head.appendChild(style);

// Add scroll progress indicator
const scrollIndicator = document.createElement('div');
scrollIndicator.className = 'scroll-indicator';
document.body.appendChild(scrollIndicator);

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrolled / maxScroll;
    scrollIndicator.style.transform = `scaleX(${scrollPercent})`;
});

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
