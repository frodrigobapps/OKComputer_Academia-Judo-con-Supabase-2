// Judo Academy - Main JavaScript File
// Core functionality for the website

// Global variables
let supabase;
let currentUser = null;
let isAuthenticated = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeAnimations();
    setupScrollReveal();
    initializeParticles();
});

// Initialize application
function initializeApp() {
    // Initialize Supabase client
    initializeSupabase();
    
    // Check authentication status
    checkAuthStatus();
    
    // Initialize UI components
    initializeNavigation();
    initializeCarousels();
    initializeCounters();
    
    console.log('Judo Academy app initialized');
}

// Supabase initialization
function initializeSupabase() {
    // Note: In production, these should be environment variables
    const supabaseUrl = 'https://your-project.supabase.co';
    const supabaseKey = 'your-anon-key';
    
    // For demo purposes, we'll create a mock Supabase client
    supabase = {
        auth: {
            signIn: mockSignIn,
            signUp: mockSignUp,
            signOut: mockSignOut,
            getUser: mockGetUser,
            onAuthStateChange: mockOnAuthStateChange
        },
        from: mockFrom
    };
}

// Mock Supabase functions for demo
async function mockSignIn({ email, password }) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data
    const user = {
        id: '123456789',
        email: email,
        user_metadata: {
            full_name: email.split('@')[0],
            role: email.includes('admin') ? 'admin' : 'student'
        }
    };
    
    // Store user in localStorage for demo
    localStorage.setItem('judo_user', JSON.stringify(user));
    
    return { data: { user }, error: null };
}

async function mockSignUp({ email, password, ...metadata }) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = {
        id: Date.now().toString(),
        email: email,
        user_metadata: {
            full_name: metadata.full_name || email.split('@')[0],
            role: 'student'
        }
    };
    
    localStorage.setItem('judo_user', JSON.stringify(user));
    
    return { data: { user }, error: null };
}

async function mockSignOut() {
    localStorage.removeItem('judo_user');
    return { error: null };
}

function mockGetUser() {
    const userData = localStorage.getItem('judo_user');
    return userData ? JSON.parse(userData) : null;
}

function mockOnAuthStateChange(callback) {
    // Simulate auth state changes
    const user = mockGetUser();
    callback('SIGNED_IN', user);
}

function mockFrom(table) {
    // Mock database operations
    return {
        select: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
            order: () => Promise.resolve({ data: [], error: null })
        }),
        insert: () => Promise.resolve({ data: [], error: null }),
        update: () => Promise.resolve({ data: [], error: null }),
        delete: () => Promise.resolve({ data: [], error: null })
    };
}

// Check authentication status
function checkAuthStatus() {
    const user = supabase.auth.getUser();
    if (user) {
        currentUser = user;
        isAuthenticated = true;
        updateUIForAuthenticatedUser();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Login modal
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', openLoginModal);
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Smooth scrolling for navigation links
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
    
    // Navigation scroll effect
    window.addEventListener('scroll', handleNavigationScroll);
}

// Initialize animations
function initializeAnimations() {
    // Initialize text splitting for animations
    if (typeof Splitting !== 'undefined') {
        Splitting();
    }
    
    // Animate hero text
    animateHeroText();
    
    // Initialize card hover effects
    initializeCardHovers();
}

// Animate hero text
function animateHeroText() {
    const heroTitle = document.querySelector('[data-splitting]');
    if (heroTitle && typeof anime !== 'undefined') {
        anime({
            targets: heroTitle.querySelectorAll('.char'),
            translateY: [100, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 1400,
            delay: (el, i) => 30 * i
        });
    }
}

// Initialize card hover effects
function initializeCardHovers() {
    const cards = document.querySelectorAll('.card-hover');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: this,
                    scale: 1.02,
                    rotateX: 5,
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: this,
                    scale: 1,
                    rotateX: 0,
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        });
    });
}

// Setup scroll reveal animations
function setupScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Trigger specific animations based on element
                if (entry.target.classList.contains('scroll-reveal')) {
                    animateScrollReveal(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe all scroll reveal elements
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

// Animate scroll reveal elements
function animateScrollReveal(element) {
    if (typeof anime !== 'undefined') {
        anime({
            targets: element,
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutQuad'
        });
    }
}

// Initialize particles effect
function initializeParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer || typeof p5 === 'undefined') return;
    
    new p5((p) => {
        let particles = [];
        
        p.setup = function() {
            const canvas = p.createCanvas(particlesContainer.offsetWidth, particlesContainer.offsetHeight);
            canvas.parent(particlesContainer);
            
            // Create particles
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    vx: p.random(-0.5, 0.5),
                    vy: p.random(-0.5, 0.5),
                    size: p.random(2, 6),
                    opacity: p.random(0.1, 0.3)
                });
            }
        };
        
        p.draw = function() {
            p.clear();
            
            particles.forEach(particle => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around edges
                if (particle.x < 0) particle.x = p.width;
                if (particle.x > p.width) particle.x = 0;
                if (particle.y < 0) particle.y = p.height;
                if (particle.y > p.height) particle.y = 0;
                
                // Draw particle
                p.fill(255, 255, 255, particle.opacity * 255);
                p.noStroke();
                p.ellipse(particle.x, particle.y, particle.size);
            });
        };
        
        p.windowResized = function() {
            p.resizeCanvas(particlesContainer.offsetWidth, particlesContainer.offsetHeight);
        };
    });
}

// Navigation scroll effect
function handleNavigationScroll() {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-lg');
        } else {
            navbar.classList.remove('shadow-lg');
        }
    }
}

// Initialize navigation
function initializeNavigation() {
    // Add active state to navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('text-dojo-gold'));
            this.classList.add('text-dojo-gold');
        });
    });
}

// Initialize carousels
function initializeCarousels() {
    // Initialize Splide carousels if available
    if (typeof Splide !== 'undefined') {
        const carousels = document.querySelectorAll('.splide');
        carousels.forEach(carousel => {
            new Splide(carousel, {
                type: 'loop',
                autoplay: true,
                interval: 5000,
                pauseOnHover: true
            }).mount();
        });
    }
}

// Initialize counters
function initializeCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        let current = 0;
        const increment = target / 100;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        // Start counter when element is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
}

// Login modal functions
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Focus on email input
        setTimeout(() => {
            const emailInput = document.getElementById('loginEmail');
            if (emailInput) emailInput.focus();
        }, 100);
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Iniciando sesión...';
        submitBtn.disabled = true;
        
        // Attempt login
        const { data, error } = await supabase.auth.signIn({ email, password });
        
        if (error) {
            throw error;
        }
        
        // Success
        currentUser = data.user;
        isAuthenticated = true;
        
        updateUIForAuthenticatedUser();
        closeLoginModal();
        
        // Show success message
        showNotification('¡Bienvenido! Has iniciado sesión correctamente.', 'success');
        
        // Redirect based on user role
        setTimeout(() => {
            if (currentUser.user_metadata.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'user-portal.html';
            }
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Error al iniciar sesión. Verifica tus credenciales.', 'error');
    } finally {
        // Reset button state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn && currentUser) {
        loginBtn.textContent = currentUser.user_metadata.full_name || 'Mi Cuenta';
        loginBtn.onclick = () => {
            // Redirect to appropriate portal
            if (currentUser.user_metadata.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'user-portal.html';
            }
        };
    }
}

// Handle contact form submission
async function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Success
        showNotification('¡Mensaje enviado! Te contactaremos pronto.', 'success');
        e.target.reset();
        
    } catch (error) {
        console.error('Contact form error:', error);
        showNotification('Error al enviar el mensaje. Intenta de nuevo.', 'error');
    } finally {
        // Reset button state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export functions for global access
window.judoApp = {
    openLoginModal,
    closeLoginModal,
    showNotification,
    supabase
};

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, pause animations if needed
        console.log('Page hidden');
    } else {
        // Page is visible, resume animations
        console.log('Page visible');
    }
});

// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Recalculate layouts if needed
    console.log('Window resized');
}, 250));

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showNotification('Ha ocurrido un error. Por favor, recarga la página.', 'error');
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('Error de conexión. Intenta de nuevo.', 'error');
});

console.log('Judo Academy main.js loaded successfully');