// User Portal JavaScript
// Comprehensive user functionality for learning and progress tracking

// Global variables
let currentSection = 'dashboard';
let libraryContent = [];
let bookmarkedContent = [];
let userProgress = {};
let userAchievements = [];
let charts = {};

// Initialize user portal
document.addEventListener('DOMContentLoaded', function() {
    initializeUserPortal();
    setupUserEventListeners();
    initializeUserCharts();
    loadUserData();
});

// Initialize user portal
function initializeUserPortal() {
    // Check user authentication
    checkUserAuth();
    
    // Initialize UI components
    initializeUserSidebar();
    initializeLibraryContent();
    initializeBookmarkedContent();
    initializeUserProgress();
    
    console.log('User portal initialized');
}

// Check user authentication
function checkUserAuth() {
    // In a real implementation, this would check with Supabase
    const userData = localStorage.getItem('judo_user');
    if (!userData) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(userData);
    if (user.user_metadata.role === 'admin') {
        // Redirect admins to admin dashboard
        window.location.href = 'admin.html';
        return;
    }
    
    // Update user info in UI
    updateUserInfo(user);
}

// Update user info in UI
function updateUserInfo(user) {
    const userNameElements = [
        document.getElementById('userName'),
        document.getElementById('sidebarUserName')
    ];
    
    userNameElements.forEach(el => {
        if (el) el.textContent = user.user_metadata.full_name || 'Estudiante';
    });
    
    const userLevelElement = document.getElementById('sidebarUserLevel');
    if (userLevelElement) {
        userLevelElement.textContent = 'Cinturón Blanco'; // This would come from user data
    }
}

// Setup user event listeners
function setupUserEventListeners() {
    // Sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('href').substring(1);
            showUserSection(section);
        });
    });
    
    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleUserSidebar);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeUserSidebar);
    }
    
    // User menu
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userMenu');
    
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', () => {
            userMenu.classList.toggle('hidden');
        });
    }
    
    // Search and filters
    const librarySearch = document.getElementById('librarySearch');
    const libraryTypeFilter = document.getElementById('libraryTypeFilter');
    const libraryCategoryFilter = document.getElementById('libraryCategoryFilter');
    
    if (librarySearch) {
        librarySearch.addEventListener('input', debounce(filterLibraryContent, 300));
    }
    
    if (libraryTypeFilter) {
        libraryTypeFilter.addEventListener('change', filterLibraryContent);
    }
    
    if (libraryCategoryFilter) {
        libraryCategoryFilter.addEventListener('change', filterLibraryContent);
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (userMenu && !userMenu.contains(e.target) && !userMenuBtn.contains(e.target)) {
            userMenu.classList.add('hidden');
        }
    });
}

// Initialize user sidebar
function initializeUserSidebar() {
    // Set active sidebar link
    const activeLink = document.querySelector('.sidebar-link[href="#dashboard"]');
    if (activeLink) {
        activeLink.classList.add('bg-dojo-gold', 'text-white');
    }
}

// Show user section
function showUserSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('bg-dojo-gold', 'text-white');
        link.classList.add('hover:bg-dojo-gold', 'hover:text-white');
    });
    
    const activeLink = document.querySelector(`.sidebar-link[href="#${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('bg-dojo-gold', 'text-white');
        activeLink.classList.remove('hover:bg-dojo-gold', 'hover:text-white');
    }
    
    currentSection = sectionName;
    
    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'library':
            loadLibraryData();
            break;
        case 'progress':
            loadProgressData();
            break;
        case 'bookmarks':
            loadBookmarksData();
            break;
        case 'achievements':
            loadAchievementsData();
            break;
    }
}

// Sidebar toggle functions
function toggleUserSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('-translate-x-full');
    sidebarOverlay.classList.toggle('hidden');
}

function closeUserSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.add('-translate-x-full');
    sidebarOverlay.classList.add('hidden');
}

// Initialize user charts
function initializeUserCharts() {
    if (typeof echarts === 'undefined') return;
    
    // Progress chart
    const progressChartElement = document.getElementById('progressChart');
    if (progressChartElement) {
        charts.progress = echarts.init(progressChartElement);
        
        const progressOption = {
            tooltip: {
                trigger: 'item'
            },
            series: [{
                type: 'pie',
                radius: '70%',
                data: [
                    { value: 35, name: 'Técnicas Completadas' },
                    { value: 25, name: 'En Progreso' },
                    { value: 40, name: 'Pendientes' }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }],
            color: ['#9CAF88', '#B8860B', '#E5E7EB']
        };
        
        charts.progress.setOption(progressOption);
    }
    
    // Resize charts on window resize
    window.addEventListener('resize', () => {
        Object.values(charts).forEach(chart => {
            if (chart && chart.resize) {
                chart.resize();
            }
        });
    });
}

// Initialize library content
function initializeLibraryContent() {
    // Mock library content - in real app, this would come from Supabase
    libraryContent = [
        {
            id: 1,
            title: 'Técnica de Proyección O-soto-gari',
            type: 'technique',
            category: 'techniques',
            beltLevel: 'white',
            description: 'Técnica fundamental de proyección hacia atrás. Aprende los principios básicos del Kuzushi, Tsukuri y Kake.',
            thumbnail: 'https://kimi-web-img.moonshot.cn/img/www.bennionkearny.com/bb30b1ce10ffd7bf01da7faf5982c94e0f25f37d.jpg',
            duration: '15 min',
            difficulty: 'beginner',
            isBookmarked: false,
            progress: 0,
            viewCount: 245,
            rating: 4.8
        },
        {
            id: 2,
            title: 'Filosofía del Judo - Principios Fundamentales',
            type: 'theory',
            category: 'theory',
            beltLevel: 'white',
            description: 'Descubre los principios filosóficos que fundamentan el judo: Seiryoku Zenyo y Jita Kyoei.',
            thumbnail: 'https://kimi-web-img.moonshot.cn/img/www.beijingjudo.com/463b9b49fa39e05c698f965e2355301e12038aeb.jpg',
            duration: '25 min',
            difficulty: 'beginner',
            isBookmarked: true,
            progress: 25,
            viewCount: 189,
            rating: 4.9
        },
        {
            id: 3,
            title: 'Ukemi - Técnicas de Caída Segura',
            type: 'video',
            category: 'techniques',
            beltLevel: 'white',
            description: 'Aprende a caer sin lesionarte. Técnicas esenciales para practicar judo de forma segura.',
            thumbnail: 'https://kimi-web-img.moonshot.cn/img/kljudo.com/2885d4cbbdd4e598eef8940de6c8024326123b70.JPG',
            duration: '20 min',
            difficulty: 'beginner',
            isBookmarked: false,
            progress: 100,
            viewCount: 312,
            rating: 4.7
        },
        {
            id: 4,
            title: 'Tai-otoshi - Proyección de Cuerpo',
            type: 'technique',
            category: 'techniques',
            beltLevel: 'yellow',
            description: 'Técnica clásica de proyección usando el cuerpo como palanca. Requiere precisión y timing.',
            thumbnail: 'https://kimi-web-img.moonshot.cn/img/judoweekly.com/3b59e8738a8291f667260588e2c1338327292bbe.jpg',
            duration: '18 min',
            difficulty: 'intermediate',
            isBookmarked: true,
            progress: 0,
            viewCount: 156,
            rating: 4.6
        },
        {
            id: 5,
            title: 'Calentamiento y Preparación Física',
            type: 'video',
            category: 'fitness',
            beltLevel: 'all_levels',
            description: 'Rutina completa de calentamiento para prevenir lesiones y mejorar el rendimiento.',
            thumbnail: 'https://kimi-web-img.moonshot.cn/img/swiftkickma.com/40d025eb917c1a482c36128f1a5ea7a0586429f6.jpg',
            duration: '12 min',
            difficulty: 'all_levels',
            isBookmarked: false,
            progress: 80,
            viewCount: 278,
            rating: 4.5
        },
        {
            id: 6,
            title: 'Reglas de Competición IJF',
            type: 'document',
            category: 'competition',
            beltLevel: 'green',
            description: 'Guía completa de las reglas de competición de la Federación Internacional de Judo.',
            thumbnail: 'https://kimi-web-img.moonshot.cn/img/fullpotentialma.com/40d025eb917c1a482c36128f1a5ea7a0586429f6.jpg',
            duration: '45 min',
            difficulty: 'advanced',
            isBookmarked: false,
            progress: 0,
            viewCount: 98,
            rating: 4.4
        },
        {
            id: 7,
            title: 'Nage-no-Kata - Forma de Proyecciones',
            type: 'video',
            category: 'kata',
            beltLevel: 'blue',
            description: 'Las cinco técnicas de proyección del Nage-no-Kata con explicaciones detalladas.',
            thumbnail: 'https://kimi-web-img.moonshot.cn/img/www.judosa.com.au/108237bf05fb7a1b9c078a01f0a2c54ffcbdad1b.jpg',
            duration: '35 min',
            difficulty: 'advanced',
            isBookmarked: true,
            progress: 0,
            viewCount: 134,
            rating: 4.8
        },
        {
            id: 8,
            title: 'Kuzushi - El Arte del Desequilibrio',
            type: 'theory',
            category: 'theory',
            beltLevel: 'yellow',
            description: 'Domina el principio fundamental del Kuzushi para ejecutar técnicas efectivas.',
            thumbnail: 'https://kimi-web-img.moonshot.cn/img/www.judosa.com.au/88974d771e364559ac56f2ea20981f436c48036b.jpg',
            duration: '22 min',
            difficulty: 'intermediate',
            isBookmarked: false,
            progress: 15,
            viewCount: 167,
            rating: 4.9
        }
    ];
}

// Initialize bookmarked content
function initializeBookmarkedContent() {
    bookmarkedContent = libraryContent.filter(item => item.isBookmarked);
}

// Initialize user progress
function initializeUserProgress() {
    userProgress = {
        beltLevel: 'white',
        overallProgress: 35,
        techniquesLearned: 12,
        totalTechniques: 25,
        practiceTimeThisMonth: 28,
        completedContent: libraryContent.filter(item => item.progress === 100).length,
        totalContent: libraryContent.length
    };
}

// Load user data
function loadUserData() {
    loadDashboardData();
}

// Load dashboard data
function loadDashboardData() {
    // Update progress ring
    updateProgressRing();
    
    // Initialize scroll reveal animations
    setupScrollReveal();
}

// Update progress ring
function updateProgressRing() {
    const progressRing = document.querySelector('.progress-ring');
    if (progressRing) {
        const progress = userProgress.overallProgress;
        const circumference = 2 * Math.PI * 15.9155;
        const offset = circumference - (progress / 100) * circumference;
        
        progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
        progressRing.style.strokeDashoffset = offset;
    }
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
            }
        });
    }, observerOptions);
    
    // Observe all scroll reveal elements
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

// Load library data
function loadLibraryData() {
    renderLibraryGrid();
}

// Render library grid
function renderLibraryGrid() {
    const libraryGrid = document.getElementById('libraryGrid');
    if (!libraryGrid) return;
    
    libraryGrid.innerHTML = '';
    
    libraryContent.forEach(item => {
        const contentCard = createLibraryCard(item);
        libraryGrid.appendChild(contentCard);
    });
}

// Create library card
function createLibraryCard(item) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-lg overflow-hidden card-hover scroll-reveal';
    
    const typeColors = {
        technique: 'bg-dojo-sage',
        theory: 'bg-dojo-gold',
        document: 'bg-dojo-charcoal',
        video: 'bg-red-500',
        image: 'bg-blue-500'
    };
    
    const typeIcons = {
        technique: 'M13 10V3L4 14h7v7l9-11h-7z',
        theory: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        video: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14V10z',
        image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
    };
    
    const difficultyColors = {
        beginner: 'bg-green-100 text-green-800',
        intermediate: 'bg-yellow-100 text-yellow-800',
        advanced: 'bg-red-100 text-red-800',
        all_levels: 'bg-blue-100 text-blue-800'
    };
    
    const progressWidth = item.progress || 0;
    
    card.innerHTML = `
        <div class="relative">
            <img src="${item.thumbnail}" alt="${item.title}" class="w-full h-48 object-cover">
            <div class="absolute top-4 left-4 ${typeColors[item.type]} text-white px-2 py-1 rounded-full text-xs font-medium">
                ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </div>
            <div class="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                ${item.beltLevel.charAt(0).toUpperCase() + item.beltLevel.slice(1)}
            </div>
            <button onclick="toggleBookmark(${item.id})" 
                    class="absolute bottom-4 right-4 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all ${item.isBookmarked ? 'bookmark-active' : ''}">
                <svg class="w-5 h-5" fill="${item.isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                </svg>
            </button>
        </div>
        <div class="p-6">
            <h3 class="font-display text-lg font-bold mb-2 line-clamp-2">${item.title}</h3>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">${item.description}</p>
            
            <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    ${item.duration}
                </span>
                <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    ${item.viewCount}
                </span>
                <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    ${item.rating}
                </span>
            </div>
            
            <div class="mb-4">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-xs text-gray-500">Progreso</span>
                    <span class="text-xs text-gray-500">${progressWidth}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-dojo-sage h-2 rounded-full transition-all duration-300" style="width: ${progressWidth}%"></div>
                </div>
            </div>
            
            <div class="flex items-center justify-between mb-4">
                <span class="px-2 py-1 ${difficultyColors[item.difficulty]} rounded-full text-xs font-medium">
                    ${item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1).replace('_', ' ')}
                </span>
                <span class="text-xs text-gray-500">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
            </div>
            
            <div class="flex space-x-2">
                <button onclick="openContent(${item.id})" 
                        class="flex-1 bg-dojo-sage text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all">
                    ${progressWidth === 0 ? 'Comenzar' : progressWidth === 100 ? 'Revisar' : 'Continuar'}
                </button>
                <button onclick="shareContent(${item.id})" 
                        class="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Load progress data
function loadProgressData() {
    // Progress data is already loaded in initializeUserProgress
    // This function can be used to update charts with real data
}

// Load bookmarks data
function loadBookmarksData() {
    renderBookmarksGrid();
}

// Render bookmarks grid
function renderBookmarksGrid() {
    const bookmarksGrid = document.getElementById('bookmarksGrid');
    if (!bookmarksGrid) return;
    
    bookmarksGrid.innerHTML = '';
    
    if (bookmarkedContent.length === 0) {
        bookmarksGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No tienes marcadores</h3>
                <p class="mt-1 text-sm text-gray-500">Guarda contenido interesante para revisar más tarde.</p>
            </div>
        `;
        return;
    }
    
    bookmarkedContent.forEach(item => {
        const contentCard = createLibraryCard(item);
        bookmarksGrid.appendChild(contentCard);
    });
}

// Load achievements data
function loadAchievementsData() {
    // Achievements are already loaded in the HTML
    // This function can be used to load dynamic achievement data
}

// Content interaction functions
function toggleBookmark(contentId) {
    const content = libraryContent.find(item => item.id === contentId);
    if (content) {
        content.isBookmarked = !content.isBookmarked;
        
        if (content.isBookmarked) {
            bookmarkedContent.push(content);
            showNotification('Contenido agregado a marcadores', 'success');
        } else {
            bookmarkedContent = bookmarkedContent.filter(item => item.id !== contentId);
            showNotification('Contenido eliminado de marcadores', 'info');
        }
        
        // Re-render the current view
        if (currentSection === 'library') {
            renderLibraryGrid();
        } else if (currentSection === 'bookmarks') {
            renderBookmarksGrid();
        }
    }
}

function openContent(contentId) {
    const content = libraryContent.find(item => item.id === contentId);
    if (content) {
        // In a real app, this would open the content viewer
        showNotification(`Abriendo: ${content.title}`, 'info');
        
        // Simulate progress update
        if (content.progress < 100) {
            content.progress = Math.min(100, content.progress + 25);
            
            // Update progress ring if on dashboard
            if (currentSection === 'dashboard') {
                updateProgressRing();
            }
            
            // Re-render current view
            if (currentSection === 'library') {
                renderLibraryGrid();
            }
        }
    }
}

function shareContent(contentId) {
    const content = libraryContent.find(item => item.id === contentId);
    if (content) {
        // In a real app, this would open sharing options
        showNotification('Enlace copiado al portapapeles', 'success');
    }
}

// Filter library content
function filterLibraryContent() {
    const searchTerm = document.getElementById('librarySearch')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('libraryTypeFilter')?.value || '';
    const categoryFilter = document.getElementById('libraryCategoryFilter')?.value || '';
    
    const filteredContent = libraryContent.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm) || 
                            item.description.toLowerCase().includes(searchTerm);
        const matchesType = !typeFilter || item.type === typeFilter;
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        
        return matchesSearch && matchesType && matchesCategory;
    });
    
    renderFilteredLibrary(filteredContent);
}

function renderFilteredLibrary(filteredContent) {
    const libraryGrid = document.getElementById('libraryGrid');
    if (!libraryGrid) return;
    
    libraryGrid.innerHTML = '';
    
    if (filteredContent.length === 0) {
        libraryGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No se encontraron contenidos</h3>
                <p class="mt-1 text-sm text-gray-500">Intenta ajustar tus filtros de búsqueda.</p>
            </div>
        `;
        return;
    }
    
    filteredContent.forEach(item => {
        const contentCard = createLibraryCard(item);
        libraryGrid.appendChild(contentCard);
    });
}

// Logout function
function logout() {
    // Clear user data
    localStorage.removeItem('judo_user');
    
    // Show notification
    showNotification('Sesión cerrada exitosamente', 'success');
    
    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Notification system
function showNotification(message, type = 'info') {
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
    
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
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

// Export functions for global access
window.userPortal = {
    showUserSection,
    toggleBookmark,
    openContent,
    shareContent,
    filterLibraryContent,
    logout,
    showNotification
};

console.log('User portal JavaScript loaded successfully');