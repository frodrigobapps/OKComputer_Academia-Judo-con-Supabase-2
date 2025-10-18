// Admin Dashboard JavaScript
// Comprehensive admin functionality for content and user management

// Global variables
let currentSection = 'dashboard';
let contentData = [];
let usersData = [];
let currentEditingContent = null;
let charts = {};

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminDashboard();
    setupAdminEventListeners();
    initializeCharts();
    loadDashboardData();
});

// Initialize admin dashboard
function initializeAdminDashboard() {
    // Check admin authentication
    checkAdminAuth();
    
    // Initialize UI components
    initializeSidebar();
    initializeContentGrid();
    initializeUsersTable();
    
    console.log('Admin dashboard initialized');
}

// Check admin authentication
function checkAdminAuth() {
    // In a real implementation, this would check with Supabase
    const userData = localStorage.getItem('judo_user');
    if (!userData) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(userData);
    if (user.user_metadata.role !== 'admin') {
        // Redirect if not admin
        window.location.href = 'user-portal.html';
        return;
    }
}

// Setup admin event listeners
function setupAdminEventListeners() {
    // Sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('href').substring(1);
            showSection(section);
        });
    });
    
    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
    
    // User menu
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userMenu');
    
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', () => {
            userMenu.classList.toggle('hidden');
        });
    }
    
    // Content management
    const addContentBtn = document.getElementById('addContentBtn');
    if (addContentBtn) {
        addContentBtn.addEventListener('click', () => openContentModal());
    }
    
    // Content form
    const contentForm = document.getElementById('contentForm');
    if (contentForm) {
        contentForm.addEventListener('submit', handleContentSubmit);
    }
    
    // File upload
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (fileUploadArea && fileInput) {
        fileUploadArea.addEventListener('click', () => fileInput.click());
        fileUploadArea.addEventListener('dragover', handleDragOver);
        fileUploadArea.addEventListener('drop', handleFileDrop);
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // User management
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => openUserModal());
    }
    
    // Search and filters
    const contentSearch = document.getElementById('contentSearch');
    const contentTypeFilter = document.getElementById('contentTypeFilter');
    const beltLevelFilter = document.getElementById('beltLevelFilter');
    
    if (contentSearch) {
        contentSearch.addEventListener('input', debounce(filterContent, 300));
    }
    
    if (contentTypeFilter) {
        contentTypeFilter.addEventListener('change', filterContent);
    }
    
    if (beltLevelFilter) {
        beltLevelFilter.addEventListener('change', filterContent);
    }
}

// Initialize sidebar
function initializeSidebar() {
    // Set active sidebar link
    const activeLink = document.querySelector('.sidebar-link[href="#dashboard"]');
    if (activeLink) {
        activeLink.classList.add('bg-dojo-gold', 'text-white');
    }
}

// Show section
function showSection(sectionName) {
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
        case 'content':
            loadContentData();
            break;
        case 'users':
            loadUsersData();
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
    }
}

// Sidebar toggle functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('-translate-x-full');
    sidebarOverlay.classList.toggle('hidden');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.add('-translate-x-full');
    sidebarOverlay.classList.add('hidden');
}

// Initialize charts
function initializeCharts() {
    if (typeof echarts === 'undefined') return;
    
    // Visits chart
    const visitsChartElement = document.getElementById('visitsChart');
    if (visitsChartElement) {
        charts.visits = echarts.init(visitsChartElement);
        
        const visitsOption = {
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: [820, 932, 901, 934, 1290, 1330],
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: '#B8860B'
                },
                areaStyle: {
                    color: 'rgba(184, 134, 11, 0.1)'
                }
            }],
            color: ['#B8860B']
        };
        
        charts.visits.setOption(visitsOption);
    }
    
    // Content types chart
    const contentChartElement = document.getElementById('contentChart');
    if (contentChartElement) {
        charts.content = echarts.init(contentChartElement);
        
        const contentOption = {
            tooltip: {
                trigger: 'item'
            },
            series: [{
                type: 'pie',
                radius: '70%',
                data: [
                    { value: 35, name: 'Técnicas' },
                    { value: 25, name: 'Teoría' },
                    { value: 20, name: 'Videos' },
                    { value: 15, name: 'Documentos' },
                    { value: 5, name: 'Imágenes' }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }],
            color: ['#B8860B', '#9CAF88', '#2C2C2C', '#F5F3F0', '#D4AF37']
        };
        
        charts.content.setOption(contentOption);
    }
    
    // Progress chart
    const progressChartElement = document.getElementById('progressChart');
    if (progressChartElement) {
        charts.progress = echarts.init(progressChartElement);
        
        const progressOption = {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['Completado', 'En Progreso', 'No Iniciado']
            },
            xAxis: {
                type: 'category',
                data: ['Blanco', 'Amarillo', 'Naranja', 'Verde', 'Azul', 'Marrón', 'Negro']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: 'Completado',
                    type: 'bar',
                    stack: 'total',
                    data: [45, 38, 25, 20, 15, 12, 8],
                    itemStyle: { color: '#9CAF88' }
                },
                {
                    name: 'En Progreso',
                    type: 'bar',
                    stack: 'total',
                    data: [15, 22, 18, 15, 12, 8, 5],
                    itemStyle: { color: '#B8860B' }
                },
                {
                    name: 'No Iniciado',
                    type: 'bar',
                    stack: 'total',
                    data: [8, 12, 15, 10, 8, 5, 2],
                    itemStyle: { color: '#2C2C2C' }
                }
            ]
        };
        
        charts.progress.setOption(progressOption);
    }
    
    // Usage chart
    const usageChartElement = document.getElementById('usageChart');
    if (usageChartElement) {
        charts.usage = echarts.init(usageChartElement);
        
        const usageOption = {
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                data: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: [120, 200, 150, 80, 70, 110, 130],
                type: 'bar',
                itemStyle: {
                    color: '#B8860B'
                }
            }]
        };
        
        charts.usage.setOption(usageOption);
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

// Load dashboard data
function loadDashboardData() {
    // Simulate loading dashboard statistics
    setTimeout(() => {
        updateDashboardStats();
    }, 500);
}

// Update dashboard statistics
function updateDashboardStats() {
    // Mock data - in real implementation, this would come from Supabase
    const stats = {
        totalUsers: 127,
        totalContent: 89,
        dailyVisits: 234,
        storageUsed: '2.4GB'
    };
    
    // Update DOM elements
    const totalUsersEl = document.getElementById('totalUsers');
    const totalContentEl = document.getElementById('totalContent');
    const dailyVisitsEl = document.getElementById('dailyVisits');
    const storageUsedEl = document.getElementById('storageUsed');
    
    if (totalUsersEl) totalUsersEl.textContent = stats.totalUsers;
    if (totalContentEl) totalContentEl.textContent = stats.totalContent;
    if (dailyVisitsEl) dailyVisitsEl.textContent = stats.dailyVisits;
    if (storageUsedEl) storageUsedEl.textContent = stats.storageUsed;
}

// Initialize content grid
function initializeContentGrid() {
    // Mock content data
    contentData = [
        {
            id: 1,
            title: 'Técnica de Proyección O-soto-gari',
            type: 'technique',
            category: 'Técnicas',
            beltLevel: 'white',
            description: 'Técnica fundamental de proyección hacia atrás',
            thumbnail: 'https://kimi-web-img.moonshot.cn/img/www.bennionkearny.com/bb30b1ce10ffd7bf01da7faf5982c94e0f25f37d.jpg',
            viewCount: 245,
            downloadCount: 32,
            createdAt: '2024-01-15'
        },
        {
            id: 2,
            title: 'Filosofía del Judo',
            type: 'theory',
            category: 'Teoría',
            beltLevel: 'yellow',
            description: 'Principios fundamentales del judo',
            thumbnail: 'https://kimi-web-img.moonshot.cn/img/www.beijingjudo.com/463b9b49fa39e05c698f965e2355301e12038aeb.jpg',
            viewCount: 189,
            downloadCount: 45,
            createdAt: '2024-01-10'
        },
        {
            id: 3,
            title: 'Nage-no-Kata',
            type: 'video',
            category: 'Kata',
            beltLevel: 'green',
            description: 'Forma de proyecciones tradicionales',
            thumbnail: 'https://kimi-web-img.moonshot.cn/img/kljudo.com/2885d4cbbdd4e598eef8940de6c8024326123b70.JPG',
            viewCount: 156,
            downloadCount: 28,
            createdAt: '2024-01-08'
        },
        {
            id: 4,
            title: 'Reglas de Competición',
            type: 'document',
            category: 'Competición',
            beltLevel: 'blue',
            description: 'Reglas oficiales de competición IJF',
            thumbnail: 'https://kimi-web-img.moonshot.cn/img/judoweekly.com/3b59e8738a8291f667260588e2c1338327292bbe.jpg',
            viewCount: 98,
            downloadCount: 67,
            createdAt: '2024-01-05'
        },
        {
            id: 5,
            title: 'Calentamiento y Estiramiento',
            type: 'video',
            category: 'Fitness',
            beltLevel: 'all_levels',
            description: 'Rutina completa de preparación física',
            thumbnail: 'https://kimi-web-img.moonshot.cn/img/swiftkickma.com/45292df7ed4e1aa68e1860a2f7563e85a680de45.jpg',
            viewCount: 312,
            downloadCount: 89,
            createdAt: '2024-01-03'
        },
        {
            id: 6,
            title: 'Prevención de Lesiones',
            type: 'document',
            category: 'Seguridad',
            beltLevel: 'all_levels',
            description: 'Guía de seguridad y prevención de lesiones',
            thumbnail: 'https://kimi-web-img.moonshot.cn/img/fullpotentialma.com/40d025eb917c1a482c36128f1a5ea7a0586429f6.jpg',
            viewCount: 178,
            downloadCount: 54,
            createdAt: '2024-01-01'
        }
    ];
}

// Load content data
function loadContentData() {
    renderContentGrid();
}

// Render content grid
function renderContentGrid() {
    const contentGrid = document.getElementById('contentGrid');
    if (!contentGrid) return;
    
    contentGrid.innerHTML = '';
    
    contentData.forEach(item => {
        const contentCard = createContentCard(item);
        contentGrid.appendChild(contentCard);
    });
}

// Create content card
function createContentCard(item) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-lg overflow-hidden card-hover';
    
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
    
    card.innerHTML = `
        <div class="relative">
            <img src="${item.thumbnail}" alt="${item.title}" class="w-full h-48 object-cover">
            <div class="absolute top-4 left-4 ${typeColors[item.type]} text-white px-2 py-1 rounded-full text-xs font-medium">
                ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </div>
            <div class="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                ${item.beltLevel.charAt(0).toUpperCase() + item.beltLevel.slice(1)}
            </div>
        </div>
        <div class="p-6">
            <h3 class="font-display text-lg font-bold mb-2 line-clamp-2">${item.title}</h3>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">${item.description}</p>
            
            <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    ${item.viewCount}
                </span>
                <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                    </svg>
                    ${item.downloadCount}
                </span>
            </div>
            
            <div class="flex space-x-2">
                <button onclick="editContent(${item.id})" 
                        class="flex-1 bg-dojo-gold text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all">
                    Editar
                </button>
                <button onclick="deleteContent(${item.id})" 
                        class="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Initialize users table
function initializeUsersTable() {
    // Mock users data
    usersData = [
        {
            id: 1,
            name: 'Carlos García',
            email: 'carlos@example.com',
            role: 'student',
            beltLevel: 'white',
            status: 'active',
            joinDate: '2024-01-15',
            lastActive: '2024-01-20'
        },
        {
            id: 2,
            name: 'Ana Martínez',
            email: 'ana@example.com',
            role: 'student',
            beltLevel: 'yellow',
            status: 'active',
            joinDate: '2024-01-10',
            lastActive: '2024-01-19'
        },
        {
            id: 3,
            name: 'Sensei Tanaka',
            email: 'tanaka@example.com',
            role: 'instructor',
            beltLevel: 'black',
            status: 'active',
            joinDate: '2023-06-01',
            lastActive: '2024-01-20'
        },
        {
            id: 4,
            name: 'María Rodríguez',
            email: 'maria@example.com',
            role: 'student',
            beltLevel: 'green',
            status: 'inactive',
            joinDate: '2023-11-20',
            lastActive: '2023-12-15'
        },
        {
            id: 5,
            name: 'David Kim',
            email: 'david@example.com',
            role: 'instructor',
            beltLevel: 'brown',
            status: 'active',
            joinDate: '2023-08-15',
            lastActive: '2024-01-18'
        }
    ];
}

// Load users data
function loadUsersData() {
    renderUsersTable();
}

// Render users table
function renderUsersTable() {
    const usersTableBody = document.getElementById('usersTableBody');
    if (!usersTableBody) return;
    
    usersTableBody.innerHTML = '';
    
    usersData.forEach(user => {
        const row = createUserRow(user);
        usersTableBody.appendChild(row);
    });
}

// Create user row
function createUserRow(user) {
    const row = document.createElement('tr');
    row.className = 'table-row-hover';
    
    const roleColors = {
        admin: 'bg-red-100 text-red-800',
        instructor: 'bg-blue-100 text-blue-800',
        student: 'bg-green-100 text-green-800'
    };
    
    const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        suspended: 'bg-red-100 text-red-800'
    };
    
    row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
                <div class="h-10 w-10 flex-shrink-0">
                    <img class="h-10 w-10 rounded-full object-cover" 
                         src="https://kimi-web-img.moonshot.cn/img/www.academyfivepoints.com/68ed908a2421ac8dc54e1868dee5935437f69db6.jpg" 
                         alt="${user.name}">
                </div>
                <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">${user.name}</div>
                    <div class="text-sm text-gray-500">${user.email}</div>
                </div>
            </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role]}">
                ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${user.beltLevel.charAt(0).toUpperCase() + user.beltLevel.slice(1)}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[user.status]}">
                ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button onclick="editUser(${user.id})" class="text-dojo-gold hover:text-dojo-gold-dark mr-3">
                Editar
            </button>
            <button onclick="deleteUser(${user.id})" class="text-red-600 hover:text-red-900">
                Eliminar
            </button>
        </td>
    `;
    
    return row;
}

// Load analytics data
function loadAnalyticsData() {
    // Analytics data is already loaded in initializeCharts
    // This function can be used to update charts with real data
}

// Content management functions
function openContentModal(content = null) {
    const modal = document.getElementById('contentModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('contentForm');
    
    if (!modal || !modalTitle || !form) return;
    
    currentEditingContent = content;
    
    if (content) {
        modalTitle.textContent = 'Editar Contenido';
        // Populate form with existing data
        document.getElementById('contentTitle').value = content.title;
        document.getElementById('contentType').value = content.type;
        document.getElementById('contentDescription').value = content.description;
        document.getElementById('contentCategory').value = content.category.toLowerCase();
        document.getElementById('beltLevel').value = content.beltLevel;
    } else {
        modalTitle.textContent = 'Agregar Contenido';
        form.reset();
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeContentModal() {
    const modal = document.getElementById('contentModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        currentEditingContent = null;
    }
}

function handleContentSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contentData = Object.fromEntries(formData);
    
    if (currentEditingContent) {
        // Update existing content
        updateContent(currentEditingContent.id, contentData);
    } else {
        // Create new content
        createContent(contentData);
    }
    
    closeContentModal();
}

function createContent(data) {
    const newContent = {
        id: Date.now(),
        ...data,
        viewCount: 0,
        downloadCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        thumbnail: 'https://kimi-web-img.moonshot.cn/img/www.judosa.com.au/108237bf05fb7a1b9c078a01f0a2c54ffcbdad1b.jpg'
    };
    
    contentData.unshift(newContent);
    renderContentGrid();
    showNotification('Contenido creado exitosamente', 'success');
}

function updateContent(id, data) {
    const index = contentData.findIndex(item => item.id === id);
    if (index !== -1) {
        contentData[index] = { ...contentData[index], ...data };
        renderContentGrid();
        showNotification('Contenido actualizado exitosamente', 'success');
    }
}

function editContent(id) {
    const content = contentData.find(item => item.id === id);
    if (content) {
        openContentModal(content);
    }
}

function deleteContent(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este contenido?')) {
        contentData = contentData.filter(item => item.id !== id);
        renderContentGrid();
        showNotification('Contenido eliminado exitosamente', 'success');
    }
}

// File upload functions
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
}

function handleFileUpload(file) {
    // Show file preview
    const filePreview = document.getElementById('filePreview');
    if (filePreview) {
        filePreview.innerHTML = `
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center space-x-3">
                    <svg class="w-8 h-8 text-dojo-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <div>
                        <p class="font-medium">${file.name}</p>
                        <p class="text-sm text-gray-500">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button onclick="removeFile()" class="ml-auto text-red-500 hover:text-red-700">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        filePreview.classList.remove('hidden');
    }
}

function removeFile() {
    const filePreview = document.getElementById('filePreview');
    const fileInput = document.getElementById('fileInput');
    
    if (filePreview) {
        filePreview.classList.add('hidden');
        filePreview.innerHTML = '';
    }
    
    if (fileInput) {
        fileInput.value = '';
    }
}

// Filter content
function filterContent() {
    const searchTerm = document.getElementById('contentSearch')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('contentTypeFilter')?.value || '';
    const beltFilter = document.getElementById('beltLevelFilter')?.value || '';
    
    const filteredContent = contentData.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm) || 
                            item.description.toLowerCase().includes(searchTerm);
        const matchesType = !typeFilter || item.type === typeFilter;
        const matchesBelt = !beltFilter || item.beltLevel === beltFilter;
        
        return matchesSearch && matchesType && matchesBelt;
    });
    
    renderFilteredContent(filteredContent);
}

function renderFilteredContent(filteredContent) {
    const contentGrid = document.getElementById('contentGrid');
    if (!contentGrid) return;
    
    contentGrid.innerHTML = '';
    
    if (filteredContent.length === 0) {
        contentGrid.innerHTML = `
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
        const contentCard = createContentCard(item);
        contentGrid.appendChild(contentCard);
    });
}

// User management functions
function openUserModal(user = null) {
    // This would open a user creation/editing modal
    // For now, we'll show a notification
    if (user) {
        showNotification('Función de edición de usuario próximamente', 'info');
    } else {
        showNotification('Función de creación de usuario próximamente', 'info');
    }
}

function editUser(id) {
    const user = usersData.find(u => u.id === id);
    if (user) {
        openUserModal(user);
    }
}

function deleteUser(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        usersData = usersData.filter(user => user.id !== id);
        renderUsersTable();
        showNotification('Usuario eliminado exitosamente', 'success');
    }
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
window.adminDashboard = {
    showSection,
    openContentModal,
    closeContentModal,
    editContent,
    deleteContent,
    editUser,
    deleteUser,
    logout,
    showNotification
};

console.log('Admin dashboard JavaScript loaded successfully');