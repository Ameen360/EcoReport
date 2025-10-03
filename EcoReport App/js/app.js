/**
 * EcoReport - Main Application JavaScript
 * A community-driven environmental reporting app for Nigeria
 */

// Global app state
const EcoReport = {
    currentPage: 'home',
    user: null,
    reports: [],
    events: [],
    petitions: [],
    resources: [],
    alerts: [],
    tips: [],
    stats: {
        reportCount: 0,
        resolvedCount: 0,
        communityCount: 0,
        eventCount: 0
    },
    mapInstance: null,
    reportMarkers: [],
    filters: {
        issueTypes: ['waste', 'pollution', 'deforestation', 'flooding', 'erosion', 'oilSpill', 'other'],
        status: ['reported', 'inProgress', 'resolved'],
        dateRange: {
            start: null,
            end: null
        },
        severity: {
            min: 1,
            max: 5
        }
    },
    init: function() {
        console.log('Initializing EcoReport application...');
        this.initNavigation();
        this.initModals();
        this.initToasts();
        this.initOfflineDetection();
        this.loadMockData();
        this.updateStats();
        this.displayRecentReports();
        this.registerServiceWorker();
        console.log('EcoReport application initialized successfully');
    },
    
    // Navigation and page handling
    initNavigation: function() {
        // Handle navigation links
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateTo(page);
            });
        });

        // Handle direct action buttons
        const reportBtn = document.getElementById('reportIssueBtn');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => {
                this.navigateTo('report');
            });
        }

        const mapBtn = document.getElementById('viewMapBtn');
        if (mapBtn) {
            mapBtn.addEventListener('click', () => {
                this.navigateTo('map');
            });
        }

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.navigateTo(e.state.page, false);
            }
        });

        // Set initial page based on URL hash if present
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            this.navigateTo(hash, false);
        }
    },
    
    navigateTo: function(page, addToHistory = true) {
        // Don't navigate if it's the current page
        if (page === this.currentPage) return;
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        
        // Show the selected page
        const pageElement = document.getElementById(page);
        if (pageElement) {
            pageElement.classList.add('active');
            this.currentPage = page;
            
            // Update active nav link
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-page') === page) {
                    link.classList.add('active');
                }
            });
            
            // Initialize page-specific content
            this.initPageContent(page);
            
            // Update URL and history
            if (addToHistory) {
                window.history.pushState({ page: page }, '', `#${page}`);
            }
            
            // Scroll to top
            window.scrollTo(0, 0);
        }
    },
    
    initPageContent: function(page) {
        switch (page) {
            case 'home':
                this.updateStats();
                this.displayRecentReports();
                break;
            case 'community':
                this.displayCommunityEvents();
                this.loadCommunityContent();
                break;
            case 'report':
                this.initReportForm();
                break;
            case 'map':
                this.initMap();
                break;
            case 'dashboard':
                this.initDashboard();
                break;
            case 'education':
                this.loadEducationContent();
                break;
        }
    },
    
    // Modal handling
    initModals: function() {
        // Close modal when clicking the close button or outside the modal
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.openModal('loginModal');
            });
        }

        // Signup button
        const signupBtn = document.getElementById('signupBtn');
        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                this.openModal('signupModal');
            });
        }

        // Switch between login and signup
        const switchToSignup = document.getElementById('switchToSignup');
        if (switchToSignup) {
            switchToSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal('loginModal');
                this.openModal('signupModal');
            });
        }

        const switchToLogin = document.getElementById('switchToLogin');
        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal('signupModal');
                this.openModal('loginModal');
            });
        }

        // Handle form submissions
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }
    },
    
    openModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    closeModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    closeAllModals: function() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    },
    
    // Toast notifications
    initToasts: function() {
        this.toastContainer = document.getElementById('toastContainer');
    },
    
    showToast: function(type, title, message, duration = 5000) {
        if (!this.toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconSrc = '';
        switch (type) {
            case 'success':
                iconSrc = 'images/check-circle.svg';
                break;
            case 'error':
                iconSrc = 'images/x-circle.svg';
                break;
            case 'warning':
                iconSrc = 'images/alert-triangle.svg';
                break;
            case 'info':
                iconSrc = 'images/info.svg';
                break;
        }
        
        toast.innerHTML = `
            <img src="${iconSrc}" alt="${type}" class="toast-icon">
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;
        
        // Add to container
        this.toastContainer.appendChild(toast);
        
        // Add close event
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        // Auto remove after duration
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    },
    
    removeToast: function(toast) {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode === this.toastContainer) {
                this.toastContainer.removeChild(toast);
            }
        }, 300);
    },
    
    // Offline detection
    initOfflineDetection: function() {
        const offlineNotification = document.getElementById('offlineNotification');
        if (!offlineNotification) return;

        const updateOnlineStatus = () => {
            if (navigator.onLine) {
                offlineNotification.classList.remove('active');
            } else {
                offlineNotification.classList.add('active');
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        updateOnlineStatus();
    },
    
    // Loading indicator
    showLoading: function() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.classList.add('active');
    },
    
    hideLoading: function() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.classList.remove('active');
    },
    
    // Service worker registration
    registerServiceWorker: function() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(error => {
                        console.log('ServiceWorker registration failed: ', error);
                    });
            });
        }
    },
    
    // Load mock data for demonstration
    loadMockData: function() {
        // Mock reports data
        this.reports = [
            {
                id: 'r1',
                type: 'waste',
                title: 'Illegal Waste Dump in Lekki',
                description: 'Large pile of household waste dumped near the road, causing environmental hazard and foul smell.',
                location: 'Lekki Phase 1, Lagos',
                coordinates: { lat: 6.4698, lng: 3.5852 },
                severity: 4,
                status: 'reported',
                date: '2025-08-25',
                photos: ['images/reports/waste_dump.png'],
                upvotes: 24,
                comments: 8,
                reporter: 'Oluwaseun A.'
            },
            {
                id: 'r2',
                type: 'pollution',
                title: 'Factory Emitting Black Smoke',
                description: 'Industrial factory continuously releasing black smoke affecting air quality in the surrounding residential area.',
                location: 'Ikeja, Lagos',
                coordinates: { lat: 6.6018, lng: 3.3515 },
                severity: 5,
                status: 'inProgress',
                date: '2025-08-20',
                photos: ['images/reports/black_smoke.png'],
                upvotes: 56,
                comments: 12,
                reporter: 'Chioma E.'
            },
            {
                id: 'r3',
                type: 'deforestation',
                title: 'Illegal Logging Activity',
                description: 'Observed unauthorized cutting of trees in protected forest area. Several heavy machines on site.',
                location: 'Omo Forest Reserve, Ogun State',
                coordinates: { lat: 6.8541, lng: 4.3874 },
                severity: 5,
                status: 'reported',
                date: '2025-08-28',
                photos: ['images/reports/Illegal_logging.png'],
                upvotes: 38,
                comments: 15,
                reporter: 'Adebayo O.'
            },
            {
                id: 'r4',
                type: 'flooding',
                title: 'Residential Area Flooded After Rain',
                description: 'Heavy rainfall has caused severe flooding in residential area. Poor drainage system unable to handle water volume.',
                location: 'Surulere, Lagos',
                coordinates: { lat: 6.5059, lng: 3.3509 },
                severity: 4,
                status: 'inProgress',
                date: '2025-08-15',
                photos: ['images/reports/flooded.png'],
                upvotes: 42,
                comments: 23,
                reporter: 'Funke A.'
            },
            {
                id: 'r5',
                type: 'oilSpill',
                title: 'Oil Spill in Waterway',
                description: 'Oil spill observed in local creek affecting water quality and aquatic life. Source appears to be from nearby pipeline.',
                location: 'Warri, Delta State',
                coordinates: { lat: 5.5156, lng: 5.7478 },
                severity: 5,
                status: 'reported',
                date: '2025-08-22',
                photos: ['images/reports/oil_spill.png'],
                upvotes: 67,
                comments: 31,
                reporter: 'Emmanuel O.'
            },
            {
                id: 'r6',
                type: 'erosion',
                title: 'Severe Soil Erosion Near Highway',
                description: 'Significant soil erosion observed along highway embankment threatening road stability and nearby farmland.',
                location: 'Enugu-Onitsha Expressway, Anambra',
                coordinates: { lat: 6.1430, lng: 6.7695 },
                severity: 3,
                status: 'resolved',
                date: '2025-08-10',
                photos: ['images/reports/soil_erosion.png'],
                upvotes: 29,
                comments: 7,
                reporter: 'Chinedu I.'
            }
        ];
        
        // Mock events data
        this.events = [
            {
                id: 'e1',
                title: 'Lekki Beach Cleanup',
                description: 'Join us for a community cleanup of Lekki Beach to remove plastic waste and debris.',
                location: 'Lekki Beach, Lagos',
                date: '2025-09-15',
                time: '09:00 AM',
                image: 'images/events/beach-cleanup.jpg',
                organizer: 'Lagos Green Initiative',
                participants: 45
            },
            {
                id: 'e2',
                title: 'Tree Planting Day',
                description: 'Help combat deforestation by planting trees in Abuja urban areas.',
                location: 'Millennium Park, Abuja',
                date: '2025-09-22',
                time: '10:00 AM',
                image: 'images/events/tree-planting.jpg',
                organizer: 'Green Nigeria Project',
                participants: 78
            },
            {
                id: 'e3',
                title: 'River Niger Cleanup Campaign',
                description: 'Multi-day effort to remove plastic and waste from River Niger shores.',
                location: 'Onitsha Waterfront, Anambra',
                date: '2025-10-05',
                time: '08:30 AM',
                image: 'images/events/river-cleanup.jpg',
                organizer: 'Clean Waters Nigeria',
                participants: 120
            }
        ];
        
        // Mock petitions data
        this.petitions = [
            {
                id: 'p1',
                title: 'Ban Single-Use Plastics in Lagos',
                description: 'Petition to Lagos State Government to implement a comprehensive ban on single-use plastics to reduce pollution.',
                target: 'Lagos State Environmental Protection Agency',
                image: 'images/petitions/plastic-ban.jpg',
                signatures: 3567,
                goal: 5000
            },
            {
                id: 'p2',
                title: 'Stop Oil Company Pollution in Niger Delta',
                description: 'Demand proper environmental regulations and cleanup of oil spills affecting Niger Delta communities.',
                target: 'Federal Ministry of Environment',
                image: 'images/petitions/oil-pollution.jpg',
                signatures: 8934,
                goal: 10000
            },
            {
                id: 'p3',
                title: 'Protect Omo Forest from Illegal Logging',
                description: 'Petition to increase protection and enforcement against illegal logging in Omo Forest Reserve.',
                target: 'Ogun State Forestry Department',
                image: 'images/petitions/forest-protection.jpg',
                signatures: 2145,
                goal: 3000
            }
        ];
        
        // Mock educational resources
        this.resources = [
            {
                id: 'res1',
                title: 'Waste Management Best Practices',
                description: 'Learn how to properly sort, reduce, and manage household waste to minimize environmental impact.',
                category: 'waste',
                image: 'images/resources/waste-management.jpg',
                source: 'Nigerian Conservation Foundation',
                link: '#'
            },
            {
                id: 'res2',
                title: 'Understanding Water Conservation',
                description: 'Practical tips for conserving water in daily life and during drought conditions.',
                category: 'water',
                image: 'images/resources/water-conservation.jpg',
                source: 'WaterAid Nigeria',
                link: '#'
            },
            {
                id: 'res3',
                title: 'Climate Change Effects in Nigeria',
                description: 'Comprehensive guide on how climate change is affecting different regions of Nigeria.',
                category: 'climate',
                image: 'images/resources/climate-change.jpg',
                source: 'Nigerian Meteorological Agency',
                link: '#'
            },
            {
                id: 'res4',
                title: 'Biodiversity of Nigerian Ecosystems',
                description: 'Explore the rich biodiversity of Nigeria\'s various ecosystems and the importance of preservation.',
                category: 'biodiversity',
                image: 'images/resources/biodiversity.jpg',
                source: 'Nigerian Conservation Foundation',
                link: '#'
            },
            {
                id: 'res5',
                title: 'Air Pollution: Causes and Solutions',
                description: 'Understanding air pollution sources in urban Nigeria and steps to reduce exposure and emissions.',
                category: 'pollution',
                image: 'images/resources/air-pollution.jpg',
                source: 'Clean Air Nigeria Initiative',
                link: '#'
            }
        ];
        
        // Mock environmental alerts
        this.alerts = [
            {
                id: 'a1',
                title: 'Flood Warning: Lagos Coastal Areas',
                description: 'Heavy rainfall expected in the next 48 hours. Residents in low-lying areas should prepare for possible flooding.',
                type: 'warning',
                date: '2025-09-01',
                region: 'Lagos'
            },
            {
                id: 'a2',
                title: 'Air Quality Alert: Abuja',
                description: 'Poor air quality due to dust and pollution. Sensitive groups should limit outdoor activities.',
                type: 'info',
                date: '2025-08-30',
                region: 'Abuja'
            },
            {
                id: 'a3',
                title: 'Extreme Heat Warning: Northern Nigeria',
                description: 'Temperatures expected to reach 40°C in the coming days. Stay hydrated and avoid prolonged sun exposure.',
                type: 'danger',
                date: '2025-08-29',
                region: 'Northern Nigeria'
            }
        ];
        
        // Mock eco tips
        this.tips = [
            {
                id: 't1',
                title: 'Reduce Plastic Waste',
                content: 'Use reusable bags when shopping and avoid single-use plastic items like straws and bottles.',
                icon: 'images/tips/plastic-reduction.svg'
            },
            {
                id: 't2',
                title: 'Save Water Daily',
                content: 'Fix leaky taps, take shorter showers, and collect rainwater for gardening to conserve water.',
                icon: 'images/tips/water-saving.svg'
            },
            {
                id: 't3',
                title: 'Compost Food Waste',
                content: 'Start a small compost bin for food scraps to reduce waste and create nutrient-rich soil for plants.',
                icon: 'images/tips/composting.svg'
            },
            {
                id: 't4',
                title: 'Use Energy Efficiently',
                content: 'Turn off lights when not in use, unplug electronics, and use energy-efficient appliances.',
                icon: 'images/tips/energy-saving.svg'
            },
            {
                id: 't5',
                title: 'Plant Native Trees',
                content: 'Plant indigenous trees and plants that require less water and support local wildlife.',
                icon: 'images/tips/tree-planting.svg'
            }
        ];
        
        // Update stats based on mock data
        this.stats = {
            reportCount: this.reports.length,
            resolvedCount: this.reports.filter(report => report.status === 'resolved').length,
            communityCount: 1245, // Mock community member count
            eventCount: this.events.length
        };
    },
    
    // Update statistics display
    updateStats: function() {
        const reportCount = document.getElementById('reportCount');
        if (reportCount) reportCount.textContent = this.stats.reportCount;
        const resolvedCount = document.getElementById('resolvedCount');
        if (resolvedCount) resolvedCount.textContent = this.stats.resolvedCount;
        const communityCount = document.getElementById('communityCount');
        if (communityCount) communityCount.textContent = this.stats.communityCount;
        const eventCount = document.getElementById('eventCount');
        if (eventCount) eventCount.textContent = this.stats.eventCount;
    },
    
    // Display recent reports on homepage
    displayRecentReports: function() {
        const container = document.getElementById('recentReportsContainer');
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Sort reports by date (newest first)
        const sortedReports = [...this.reports].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Take the 3 most recent reports
        const recentReports = sortedReports.slice(0, 3);
        
        // Create report cards
        const allReports = sortedReports;
        allReports.forEach(report => {
            const reportCard = document.createElement('div');
            reportCard.className = 'report-card';
            reportCard.setAttribute('data-report-id', report.id);
            
            // Format date
            const reportDate = new Date(report.date);
            const formattedDate = reportDate.toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Status text
            let statusText = 'Reported';
            if (report.status === 'inProgress') statusText = 'In Progress';
            if (report.status === 'resolved') statusText = 'Resolved';
            
            reportCard.innerHTML = `
                <div class="report-image">
                    <img src="${report.photos[0] || 'images/placeholder-report.jpg'}" alt="${report.title}">
                </div>
                <div class="report-content">
                    <span class="report-type ${report.type}">${this.capitalizeFirstLetter(report.type)}</span>
                    <h4 class="report-title">${report.title}</h4>
                    <div class="report-location">
                        <img src="images/location-icon.svg" alt="Location">
                        <span>${report.location}</span>
                    </div>
                    <p>${this.truncateText(report.description, 100)}</p>
                    <div class="report-meta">
                        <div class="report-date">
                            <img src="images/calendar-icon.svg" alt="Date">
                            <span>${formattedDate}</span>
                        </div>
                        <div class="report-status">
                            <span class="status-indicator status-${report.status}"></span>
                            <span>${statusText}</span>
                        </div>
                    </div>
                </div>
            `;
            
            // Add click event to show report details
            reportCard.addEventListener('click', () => {
                this.showReportDetails(report.id);
            });
            
            container.appendChild(reportCard);
        });
    },
    
    // Show report details in modal
    showReportDetails: function(reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (!report) return;
        
        const modal = document.getElementById('reportDetailModal');
        const content = document.getElementById('reportDetailContent');
        
        // Format date
        const reportDate = new Date(report.date);
        const formattedDate = reportDate.toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Status text
        let statusText = 'Reported';
        let statusClass = 'reported';
        if (report.status === 'inProgress') {
            statusText = 'In Progress';
            statusClass = 'inProgress';
        }
        if (report.status === 'resolved') {
            statusText = 'Resolved';
            statusClass = 'resolved';
        }
        
        // Update modal title
        document.getElementById('reportDetailTitle').textContent = report.title;
        
        // Create content
        content.innerHTML = `
            <div class="report-detail-images">
                ${report.photos.map(photo => `
                    <div class="report-detail-image">
                        <img src="${photo}" alt="${report.title}">
                    </div>
                `).join('')}
            </div>
            <div class="report-detail-info">
                <div class="report-detail-header">
                    <span class="report-type ${report.type}">${this.capitalizeFirstLetter(report.type)}</span>
                    <div class="report-status">
                        <span class="status-indicator status-${statusClass}"></span>
                        <span>${statusText}</span>
                    </div>
                </div>
                <div class="report-detail-location">
                    <img src="images/location-icon.svg" alt="Location">
                    <span>${report.location}</span>
                </div>
                <div class="report-detail-date">
                    <img src="images/calendar-icon.svg" alt="Date">
                    <span>Reported on ${formattedDate}</span>
                </div>
                <div class="report-detail-reporter">
                    <img src="images/user-icon.svg" alt="Reporter">
                    <span>Reported by ${report.reporter}</span>
                </div>
                <div class="report-detail-severity">
                    <strong>Severity:</strong>
                    <div class="severity-display">
                        ${this.generateSeverityStars(report.severity)}
                    </div>
                </div>
                <div class="report-detail-description">
                    <h4>Description</h4>
                    <p>${report.description}</p>
                </div>
                <div class="report-detail-map" id="reportDetailMap" data-lat="${report.coordinates.lat}" data-lng="${report.coordinates.lng}">
                    <!-- Map will be initialized here -->
                </div>
                <div class="report-detail-actions">
                    <button class="btn btn-primary" id="supportReportBtn">
                        <img src="images/thumbs-up.svg" alt="Support">
                        Support (${report.upvotes})
                    </button>
                    <button class="btn btn-outline" id="shareReportBtn">
                        <img src="images/share.svg" alt="Share">
                        Share
                    </button>
                </div>
                <div class="report-detail-comments">
                    <h4>Comments (${report.comments})</h4>
                    <div class="comment-form">
                        <textarea placeholder="Add your comment..." rows="3"></textarea>
                        <button class="btn btn-primary">Post Comment</button>
                    </div>
                    <!-- Comments would be loaded here -->
                </div>
            </div>
        `;
        
        // Open modal
        this.openModal('reportDetailModal');
        
        // Initialize map in the modal after it's visible
        setTimeout(() => {
            const mapElement = document.getElementById('reportDetailMap');
            if (mapElement && typeof L !== 'undefined') {
                const map = L.map(mapElement).setView([report.coordinates.lat, report.coordinates.lng], 13);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
                
                L.marker([report.coordinates.lat, report.coordinates.lng]).addTo(map)
                    .bindPopup(report.title)
                    .openPopup();
            }
        }, 300);
    },
    
    // Initialize report form
    initReportForm: function() {
        const reportForm = document.getElementById('reportForm');
        if (!reportForm) return;
        
        // Initialize location map if Leaflet is available
        const locationMap = document.getElementById('locationMap');
        if (locationMap && typeof L !== 'undefined') {
            // Default to Nigeria center
            const defaultLat = 9.0820;
            const defaultLng = 8.6753;
            
            const map = L.map(locationMap).setView([defaultLat, defaultLng], 6);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            let marker;
            
            // Add marker on click
            map.on('click', (e) => {
                if (marker) {
                    map.removeLayer(marker);
                }
                
                marker = L.marker(e.latlng).addTo(map);
                
                // Update hidden inputs
                document.getElementById('latitude').value = e.latlng.lat;
                document.getElementById('longitude').value = e.latlng.lng;
                
                // Reverse geocode to get location name
                this.reverseGeocode(e.latlng.lat, e.latlng.lng)
                    .then(locationName => {
                        document.getElementById('issueLocation').value = locationName;
                    })
                    .catch(error => {
                        console.error('Error geocoding location:', error);
                    });
            });
            
            // Use current location button
            document.getElementById('useLocationBtn').addEventListener('click', () => {
                if (navigator.geolocation) {
                    this.showLoading();
                    
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const lat = position.coords.latitude;
                            const lng = position.coords.longitude;
                            
                            // Update map
                            map.setView([lat, lng], 15);
                            
                            if (marker) {
                                map.removeLayer(marker);
                            }
                            
                            marker = L.marker([lat, lng]).addTo(map);
                            
                            // Update hidden inputs
                            document.getElementById('latitude').value = lat;
                            document.getElementById('longitude').value = lng;
                            
                            // Reverse geocode to get location name
                            this.reverseGeocode(lat, lng)
                                .then(locationName => {
                                    document.getElementById('issueLocation').value = locationName;
                                    this.hideLoading();
                                })
                                .catch(error => {
                                    console.error('Error geocoding location:', error);
                                    this.hideLoading();
                                });
                        },
                        (error) => {
                            console.error('Error getting location:', error);
                            this.hideLoading();
                            this.showToast('error', 'Location Error', 'Could not get your current location. Please try again or select on the map.');
                        }
                    );
                } else {
                    this.showToast('error', 'Location Not Supported', 'Geolocation is not supported by your browser. Please enter location manually.');
                }
            });
        }
        
        // Handle file uploads
        const fileInput = document.getElementById('issuePhotos');
        const photoPreview = document.getElementById('photoPreview');
        
        if (fileInput && photoPreview) {
            fileInput.addEventListener('change', () => {
                photoPreview.innerHTML = '';
                
                if (fileInput.files.length > 0) {
                    for (let i = 0; i < fileInput.files.length; i++) {
                        const file = fileInput.files[i];
                        
                        // Only process images
                        if (!file.type.startsWith('image/')) continue;
                        
                        const reader = new FileReader();
                        
                        reader.onload = (e) => {
                            const previewItem = document.createElement('div');
                            previewItem.className = 'photo-preview-item';
                            
                            previewItem.innerHTML = `
                                <img src="${e.target.result}" alt="Preview">
                                <div class="remove-photo" data-index="${i}">&times;</div>
                            `;
                            
                            photoPreview.appendChild(previewItem);
                            
                            // Add remove functionality
                            previewItem.querySelector('.remove-photo').addEventListener('click', () => {
                                previewItem.remove();
                                // Note: Can't actually remove from FileList, would need to use FormData in real implementation
                            });
                        };
                        
                        reader.readAsDataURL(file);
                    }
                }
            });
        }
        
        // Form submission
        reportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const issueType = document.getElementById('issueType').value;
            const issueTitle = document.getElementById('issueTitle').value;
            const issueDescription = document.getElementById('issueDescription').value;
            const issueLocation = document.getElementById('issueLocation').value;
            const latitude = document.getElementById('latitude').value;
            const longitude = document.getElementById('longitude').value;
            const issueSeverity = document.getElementById('issueSeverity').value;
            
            // Validate form
            if (!issueType || !issueTitle || !issueDescription || !issueLocation || !latitude || !longitude) {
                this.showToast('error', 'Incomplete Form', 'Please fill in all required fields and select a location on the map.');
                return;
            }
            
            // In a real app, we would upload the data to a server here
            // For this demo, we'll just show a success message and reset the form
            
            this.showLoading();
            
            // Simulate API call delay
            setTimeout(() => {
                // Add to reports array (in a real app, this would come from the server)
                const newReport = {
                    id: 'r' + (this.reports.length + 1),
                    type: issueType,
                    title: issueTitle,
                    description: issueDescription,
                    location: issueLocation,
                    coordinates: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
                    severity: parseInt(issueSeverity),
                    status: 'reported',
                    date: new Date().toISOString().split('T')[0],
                    photos: [], // In a real app, these would be uploaded and URLs returned
                    upvotes: 0,
                    comments: 0,
                    reporter: this.user ? this.user.name : 'Anonymous'
                };
                
                this.reports.push(newReport);
                
                // Update stats
                this.stats.reportCount++;
                this.updateStats();
                
                // Show success message
                this.hideLoading();
                this.showToast('success', 'Report Submitted', 'Thank you for your report! It has been submitted successfully.');
                
                // Reset form
                reportForm.reset();
                photoPreview.innerHTML = '';
                
                // Navigate to map to see the report
                this.navigateTo('map');
            }, 1500);
        });
        
        // Cancel button
        const cancelBtn = document.getElementById('cancelReportBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                reportForm.reset();
                document.getElementById('photoPreview').innerHTML = '';
                this.navigateTo('home');
            });
        }
    },
    
    // Reverse geocode coordinates to location name (mock implementation)
    reverseGeocode: function(lat, lng) {
        return new Promise((resolve, reject) => {
            // In a real app, this would call a geocoding API
            // For this demo, we'll return a mock location based on coordinates
            
            // Mock locations for Nigeria
            const mockLocations = [
                { lat: 6.4698, lng: 3.5852, name: 'Lekki Phase 1, Lagos' },
                { lat: 6.6018, lng: 3.3515, name: 'Ikeja, Lagos' },
                { lat: 6.5059, lng: 3.3509, name: 'Surulere, Lagos' },
                { lat: 9.0765, lng: 7.3986, name: 'Abuja, FCT' },
                { lat: 6.3350, lng: 5.6037, name: 'Benin City, Edo State' },
                { lat: 7.3775, lng: 3.9470, name: 'Ibadan, Oyo State' },
                { lat: 5.5156, lng: 5.7478, name: 'Warri, Delta State' },
                { lat: 4.8156, lng: 7.0498, name: 'Port Harcourt, Rivers State' }
            ];
            
            // Find closest mock location
            let closestLocation = null;
            let minDistance = Infinity;
            
            mockLocations.forEach(location => {
                const distance = Math.sqrt(
                    Math.pow(location.lat - lat, 2) + 
                    Math.pow(location.lng - lng, 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestLocation = location;
                }
            });
            
            // If within reasonable distance, use the mock location
            if (minDistance < 0.5) {
                resolve(closestLocation.name);
            } else {
                // Otherwise generate a generic name based on coordinates
                resolve(`Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            }
        });
    },
    
    // Helper functions
    capitalizeFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    truncateText: function(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    
    generateSeverityStars: function(severity) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= severity) {
                stars += '<span class="star filled">★</span>';
            } else {
                stars += '<span class="star">☆</span>';
            }
        }
        return stars;
    },
    
    // Authentication functions (mock implementation)
    handleLogin: function() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.showToast('error', 'Login Failed', 'Please enter both email and password.');
            return;
        }
        
        this.showLoading();
        
        // Simulate API call delay
        setTimeout(() => {
            // In a real app, this would validate credentials with a server
            // For this demo, we'll just accept any input
            
            this.user = {
                name: email.split('@')[0],
                email: email,
                avatar: 'images/default-avatar.png'
            };
            
            // Update UI
            this.updateUserUI();
            
            // Close modal and show success message
            this.closeAllModals();
            this.hideLoading();
            this.showToast('success', 'Login Successful', `Welcome back, ${this.user.name}!`);
        }, 1000);
    },
    
    handleSignup: function() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const termsAgree = document.getElementById('termsAgree').checked;
        
        if (!name || !email || !password || !confirmPassword) {
            this.showToast('error', 'Signup Failed', 'Please fill in all required fields.');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showToast('error', 'Signup Failed', 'Passwords do not match.');
            return;
        }
        
        if (!termsAgree) {
            this.showToast('error', 'Signup Failed', 'You must agree to the Terms of Service and Privacy Policy.');
            return;
        }
        
        this.showLoading();
        
        // Simulate API call delay
        setTimeout(() => {
            // In a real app, this would create a new user on the server
            // For this demo, we'll just accept any input
            
            this.user = {
                name: name,
                email: email,
                avatar: 'images/default-avatar.png'
            };
            
            // Update UI
            this.updateUserUI();
            
            // Close modal and show success message
            this.closeAllModals();
            this.hideLoading();
            this.showToast('success', 'Signup Successful', `Welcome to EcoReport, ${this.user.name}!`);
        }, 1000);
    },
    
    updateUserUI: function() {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const userProfile = document.querySelector('.user-profile');
        const userAvatar = document.getElementById('userAvatar');
        const logoutBtn = document.getElementById('logoutBtn');

        if (this.user) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (signupBtn) signupBtn.classList.add('hidden');
            if (userProfile) userProfile.classList.remove('hidden');
            if (userAvatar) userAvatar.src = this.user.avatar;
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleLogout();
                });
            }
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (signupBtn) signupBtn.classList.remove('hidden');
            if (userProfile) userProfile.classList.add('hidden');
        }
    },
    
    handleLogout: function() {
        this.user = null;
        this.updateUserUI();
        this.showToast('info', 'Logged Out', 'You have been successfully logged out.');
    },
    
    // Show 3 most recent events on the community page
    displayCommunityEvents: function() {
        const container = document.getElementById('communityEventsContainer');
        if (!container) return;

        container.innerHTML = '';

        // Sort events by date (newest first)
        const sortedEvents = [...this.events].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentEvents = sortedEvents.slice(0, 3);

        recentEvents.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';

            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            eventCard.innerHTML = `
                <div class="event-image">
                    <img src="${event.image}" alt="${event.title}">
                </div>
                <div class="event-content">
                    <h4 class="event-title">${event.title}</h4>
                    <div class="event-date">
                        <img src="images/calendar-icon.svg" alt="Date">
                        <span>${formattedDate} • ${event.time}</span>
                    </div>
                    <div class="event-location">
                        <img src="images/location-icon.svg" alt="Location">
                        <span>${event.location}</span>
                    </div>
                    <p>${this.truncateText(event.description, 100)}</p>
                    <div class="event-meta">
                        <span class="event-organizer"><img src="images/user-icon.svg" alt="Organizer"> ${event.organizer}</span>
                        <span class="event-participants"><img src="images/group-icon.svg" alt="Participants"> ${event.participants} participants</span>
                    </div>
                </div>
            `;
            container.appendChild(eventCard);
        });
    },
};

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    EcoReport.init();
});