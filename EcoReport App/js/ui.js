/**
 * EcoReport - UI Functionality
 * Handles user interface interactions, responsive design, and form validation
 */

document.addEventListener('DOMContentLoaded', () => {
    // Add UI functionality to the EcoReport object
    Object.assign(EcoReport, {
        // Initialize UI components
        initUI: function() {
            console.log('Initializing UI components...');
            
            // Set up mobile navigation
            this.setupMobileNav();
            
            // Set up form validation
            this.setupFormValidation();
            
            // Set up scroll effects
            this.setupScrollEffects();
            
            // Set up dark mode toggle
            this.setupDarkModeToggle();
            
            // Set up search functionality
            this.setupSearch();
            
            // Set up notification preferences
            this.setupNotificationPreferences();
            
            // Set up accessibility features
            this.setupAccessibilityFeatures();
        },
        
        // Set up mobile navigation
        setupMobileNav: function() {
            const menuToggle = document.querySelector('.menu-toggle');
            const navLinks = document.querySelector('.nav-links');
            
            if (menuToggle && navLinks) {
                menuToggle.addEventListener('click', () => {
                    // Toggle active class on nav links
                    navLinks.classList.toggle('active');
                    
                    // Toggle menu icon (hamburger to X)
                    const spans = menuToggle.querySelectorAll('span');
                    spans.forEach(span => span.classList.toggle('active'));
                    
                    // Toggle aria-expanded attribute
                    const expanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
                    menuToggle.setAttribute('aria-expanded', !expanded);
                });
                
                // Close mobile menu when clicking outside
                document.addEventListener('click', (e) => {
                    if (navLinks.classList.contains('active') && 
                        !navLinks.contains(e.target) && 
                        !menuToggle.contains(e.target)) {
                        navLinks.classList.remove('active');
                        menuToggle.querySelectorAll('span').forEach(span => span.classList.remove('active'));
                        menuToggle.setAttribute('aria-expanded', 'false');
                    }
                });
                
                // Close mobile menu when window is resized to desktop size
                window.addEventListener('resize', () => {
                    if (window.innerWidth > 767 && navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                        menuToggle.querySelectorAll('span').forEach(span => span.classList.remove('active'));
                        menuToggle.setAttribute('aria-expanded', 'false');
                    }
                });
                
                // Close mobile menu when a link is clicked
                navLinks.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', () => {
                        if (window.innerWidth <= 767) {
                            navLinks.classList.remove('active');
                            menuToggle.querySelectorAll('span').forEach(span => span.classList.remove('active'));
                            menuToggle.setAttribute('aria-expanded', 'false');
                        }
                    });
                });
            }
        },
        
        // Set up form validation
        setupFormValidation: function() {
            // Get all forms
            const forms = document.querySelectorAll('form');
            
            forms.forEach(form => {
                // Add novalidate attribute to disable browser's default validation
                form.setAttribute('novalidate', '');
                
                // Add custom validation
                form.addEventListener('submit', (e) => {
                    // Check if form has already been validated by our custom validation
                    if (!form.classList.contains('validated')) {
                        e.preventDefault();
                        
                        // Validate form
                        const isValid = this.validateForm(form);
                        
                        // If valid, add validated class and submit
                        if (isValid) {
                            form.classList.add('validated');
                            
                            // If this is not a real form submission (e.g., login, signup), 
                            // we'll handle it in the respective handler function
                            if (form.id === 'loginForm' || form.id === 'signupForm' || 
                                form.id === 'reportForm' || form.id === 'volunteerForm' ||
                                form.id === 'newsletterForm') {
                                // These forms have their own handlers
                            } else {
                                // For other forms, submit normally
                                form.submit();
                            }
                        }
                    }
                });
                
                // Live validation on input
                form.querySelectorAll('input, select, textarea').forEach(field => {
                    field.addEventListener('blur', () => {
                        this.validateField(field);
                    });
                    
                    // Special handling for password fields
                    if (field.type === 'password' && field.id === 'signupPassword') {
                        field.addEventListener('input', () => {
                            this.updatePasswordStrength(field);
                        });
                    }
                    
                    // Special handling for confirm password
                    if (field.id === 'signupConfirmPassword') {
                        field.addEventListener('input', () => {
                            const password = document.getElementById('signupPassword');
                            if (password) {
                                this.validatePasswordMatch(password, field);
                            }
                        });
                    }
                });
            });
            
            // Handle newsletter form specifically
            const newsletterForm = document.getElementById('newsletterForm');
            if (newsletterForm) {
                newsletterForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    const emailInput = document.getElementById('newsletterEmail');
                    if (emailInput && this.validateEmail(emailInput.value)) {
                        // Show success message
                        this.showToast('success', 'Subscription Successful', 'Thank you for subscribing to our newsletter!');
                        
                        // Reset form
                        newsletterForm.reset();
                    } else {
                        // Show error message
                        this.showToast('error', 'Invalid Email', 'Please enter a valid email address.');
                    }
                });
            }
        },
        
        // Validate a form
        validateForm: function(form) {
            let isValid = true;
            
            // Validate all required fields
            form.querySelectorAll('[required]').forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });
            
            // Validate email fields
            form.querySelectorAll('input[type="email"]').forEach(field => {
                if (field.value && !this.validateEmail(field.value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    isValid = false;
                }
            });
            
            // Validate password fields
            const password = form.querySelector('input[id="signupPassword"]');
            const confirmPassword = form.querySelector('input[id="signupConfirmPassword"]');
            
            if (password && confirmPassword) {
                if (password.value !== confirmPassword.value) {
                    this.showFieldError(confirmPassword, 'Passwords do not match');
                    isValid = false;
                }
            }
            
            // Validate checkbox for terms agreement
            const termsCheckbox = form.querySelector('input[id="termsAgree"]');
            if (termsCheckbox && !termsCheckbox.checked) {
                this.showFieldError(termsCheckbox, 'You must agree to the terms');
                isValid = false;
            }
            
            return isValid;
        },
        
        // Validate a single field
        validateField: function(field) {
            // Clear previous error
            this.clearFieldError(field);
            
            // Check if field is required and empty
            if (field.hasAttribute('required') && !field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                return false;
            }
            
            // Validate email format
            if (field.type === 'email' && field.value) {
                if (!this.validateEmail(field.value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    return false;
                }
            }
            
            // Validate URL format
            if (field.type === 'url' && field.value) {
                if (!this.validateUrl(field.value)) {
                    this.showFieldError(field, 'Please enter a valid URL');
                    return false;
                }
            }
            
            // Validate minimum length
            if (field.hasAttribute('minlength') && field.value) {
                const minLength = parseInt(field.getAttribute('minlength'));
                if (field.value.length < minLength) {
                    this.showFieldError(field, `Must be at least ${minLength} characters`);
                    return false;
                }
            }
            
            // Validate maximum length
            if (field.hasAttribute('maxlength') && field.value) {
                const maxLength = parseInt(field.getAttribute('maxlength'));
                if (field.value.length > maxLength) {
                    this.showFieldError(field, `Must be no more than ${maxLength} characters`);
                    return false;
                }
            }
            
            // Validate number range
            if (field.type === 'number') {
                if (field.hasAttribute('min') && field.value) {
                    const min = parseFloat(field.getAttribute('min'));
                    if (parseFloat(field.value) < min) {
                        this.showFieldError(field, `Must be at least ${min}`);
                        return false;
                    }
                }
                
                if (field.hasAttribute('max') && field.value) {
                    const max = parseFloat(field.getAttribute('max'));
                    if (parseFloat(field.value) > max) {
                        this.showFieldError(field, `Must be no more than ${max}`);
                        return false;
                    }
                }
            }
            
            return true;
        },
        
        // Show error message for a field
        showFieldError: function(field, message) {
            // Remove any existing error message
            this.clearFieldError(field);
            
            // Add error class to field
            field.classList.add('error');
            
            // Create error message element
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = message;
            
            // Add error message after the field
            if (field.type === 'checkbox' || field.type === 'radio') {
                // For checkboxes and radios, add after the label
                const label = field.closest('label') || field.parentNode;
                label.parentNode.insertBefore(errorElement, label.nextSibling);
            } else {
                // For other fields, add after the field
                field.parentNode.insertBefore(errorElement, field.nextSibling);
            }
        },
        
        // Clear error message for a field
        clearFieldError: function(field) {
            // Remove error class
            field.classList.remove('error');
            
            // Remove error message
            const parent = field.type === 'checkbox' || field.type === 'radio' 
                ? (field.closest('label') || field.parentNode).parentNode 
                : field.parentNode;
            
            const errorElement = parent.querySelector('.error-message');
            if (errorElement) {
                parent.removeChild(errorElement);
            }
        },
        
        // Validate email format
        validateEmail: function(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email.toLowerCase());
        },
        
        // Validate URL format
        validateUrl: function(url) {
            try {
                new URL(url);
                return true;
            } catch (e) {
                return false;
            }
        },
        
        // Update password strength indicator
        updatePasswordStrength: function(passwordField) {
            const password = passwordField.value;
            const strengthMeter = document.querySelector('.strength-meter');
            const strengthText = document.querySelector('.strength-text');
            
            if (!strengthMeter || !strengthText) return;
            
            // Calculate password strength
            let strength = 0;
            
            // Length check
            if (password.length >= 8) strength += 1;
            if (password.length >= 12) strength += 1;
            
            // Complexity checks
            if (/[a-z]/.test(password)) strength += 1; // Lowercase
            if (/[A-Z]/.test(password)) strength += 1; // Uppercase
            if (/[0-9]/.test(password)) strength += 1; // Numbers
            if (/[^a-zA-Z0-9]/.test(password)) strength += 1; // Special characters
            
            // Update strength meter
            let width = (strength / 6) * 100;
            let color = '';
            let text = '';
            
            if (strength === 0) {
                color = '#e0e0e0';
                text = 'Enter password';
            } else if (strength <= 2) {
                color = '#f44336';
                text = 'Weak';
            } else if (strength <= 4) {
                color = '#ff9800';
                text = 'Moderate';
            } else {
                color = '#4caf50';
                text = 'Strong';
            }
            
            strengthMeter.style.width = width + '%';
            strengthMeter.style.backgroundColor = color;
            strengthText.textContent = text;
        },
        
        // Validate password match
        validatePasswordMatch: function(passwordField, confirmField) {
            if (passwordField.value !== confirmField.value) {
                this.showFieldError(confirmField, 'Passwords do not match');
                return false;
            } else {
                this.clearFieldError(confirmField);
                return true;
            }
        },
        
        // Set up scroll effects
        setupScrollEffects: function() {
            // Smooth scroll for anchor links
            document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        // Scroll to element
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // Update URL hash without scrolling
                        history.pushState(null, null, targetId);
                    }
                });
            });
            
            // Back to top button
            const backToTopBtn = document.createElement('button');
            backToTopBtn.className = 'back-to-top';
            backToTopBtn.innerHTML = '<img src="images/arrow-up.svg" alt="Back to Top">';
            backToTopBtn.setAttribute('aria-label', 'Back to top');
            document.body.appendChild(backToTopBtn);
            
            // Show/hide back to top button based on scroll position
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    backToTopBtn.classList.add('active');
                } else {
                    backToTopBtn.classList.remove('active');
                }
            });
            
            // Scroll to top when button is clicked
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
            
            // Add scroll animations for elements
            this.setupScrollAnimations();
        },
        
        // Set up scroll animations
        setupScrollAnimations: function() {
            // Add animation classes to elements when they come into view
            const animateElements = document.querySelectorAll('.animate-on-scroll');
            
            // Create intersection observer
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1
            });
            
            // Observe elements
            animateElements.forEach(element => {
                observer.observe(element);
            });
        },
        
        // Set up dark mode toggle
        setupDarkModeToggle: function() {
            // Create dark mode toggle button
            const darkModeToggle = document.createElement('button');
            darkModeToggle.className = 'dark-mode-toggle';
            darkModeToggle.innerHTML = '<img src="images/moon.svg" alt="Toggle Dark Mode">';
            darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
            document.body.appendChild(darkModeToggle);
            
            // Check for saved preference
            const darkModePreference = localStorage.getItem('darkMode');
            
            // Apply dark mode if preferred
            if (darkModePreference === 'enabled') {
                document.body.classList.add('dark-mode');
                darkModeToggle.innerHTML = '<img src="images/sun.svg" alt="Toggle Light Mode">';
            }
            
            // Toggle dark mode when button is clicked
            darkModeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                
                if (document.body.classList.contains('dark-mode')) {
                    localStorage.setItem('darkMode', 'enabled');
                    darkModeToggle.innerHTML = '<img src="images/sun.svg" alt="Toggle Light Mode">';
                } else {
                    localStorage.setItem('darkMode', 'disabled');
                    darkModeToggle.innerHTML = '<img src="images/moon.svg" alt="Toggle Dark Mode">';
                }
                
                // Update map styles if map is initialized
                if (this.mapInstance) {
                    // In a real app, this would update the map styles for dark mode
                }
            });
            
            // Also check system preference
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Apply dark mode if system prefers it and no saved preference
            if (prefersDarkMode.matches && darkModePreference === null) {
                document.body.classList.add('dark-mode');
                darkModeToggle.innerHTML = '<img src="images/sun.svg" alt="Toggle Light Mode">';
                localStorage.setItem('darkMode', 'enabled');
            }
            
            // Listen for changes in system preference
            prefersDarkMode.addEventListener('change', (e) => {
                // Only apply if user hasn't set a preference
                if (localStorage.getItem('darkMode') === null) {
                    if (e.matches) {
                        document.body.classList.add('dark-mode');
                        darkModeToggle.innerHTML = '<img src="images/sun.svg" alt="Toggle Light Mode">';
                    } else {
                        document.body.classList.remove('dark-mode');
                        darkModeToggle.innerHTML = '<img src="images/moon.svg" alt="Toggle Dark Mode">';
                    }
                }
            });
        },
        
        // Set up search functionality
        setupSearch: function() {
            // Create search button
            const searchButton = document.createElement('button');
            searchButton.className = 'search-button';
            searchButton.innerHTML = '<img src="images/search.svg" alt="Search">';
            searchButton.setAttribute('aria-label', 'Open search');
            
            // Add search button to header
            const headerContainer = document.querySelector('.main-header .container');
            if (headerContainer) {
                headerContainer.insertBefore(searchButton, headerContainer.querySelector('.auth-buttons'));
            }
            
            // Create search modal
            const searchModal = document.createElement('div');
            searchModal.className = 'modal search-modal';
            searchModal.id = 'searchModal';
            
            searchModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Search EcoReport</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="searchForm" class="search-form">
                            <div class="search-input-container">
                                <input type="text" id="searchInput" placeholder="Search for reports, events, resources..." autofocus>
                                <button type="submit" class="search-submit">
                                    <img src="images/search.svg" alt="Search">
                                </button>
                            </div>
                            <div class="search-filters">
                                <label><input type="checkbox" value="reports" checked> Reports</label>
                                <label><input type="checkbox" value="events" checked> Events</label>
                                <label><input type="checkbox" value="petitions" checked> Petitions</label>
                                <label><input type="checkbox" value="resources" checked> Resources</label>
                            </div>
                        </form>
                        <div id="searchResults" class="search-results"></div>
                    </div>
                </div>
            `;
            
            // Add search modal to body
            document.body.appendChild(searchModal);
            
            // Open search modal when search button is clicked
            searchButton.addEventListener('click', () => {
                searchModal.classList.add('active');
                document.getElementById('searchInput').focus();
            });
            
            // Close search modal
            searchModal.querySelector('.close-modal').addEventListener('click', () => {
                searchModal.classList.remove('active');
            });
            
            // Close when clicking outside
            searchModal.addEventListener('click', (e) => {
                if (e.target === searchModal) {
                    searchModal.classList.remove('active');
                }
            });
            
            // Handle search form submission
            const searchForm = document.getElementById('searchForm');
            if (searchForm) {
                searchForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    const searchInput = document.getElementById('searchInput');
                    const searchQuery = searchInput.value.trim();
                    
                    if (searchQuery) {
                        this.performSearch(searchQuery);
                    }
                });
            }
            
            // Add keyboard shortcut (Ctrl+K or Cmd+K) to open search
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    searchModal.classList.add('active');
                    document.getElementById('searchInput').focus();
                }
                
                // Close search modal with Escape key
                if (e.key === 'Escape' && searchModal.classList.contains('active')) {
                    searchModal.classList.remove('active');
                }
            });
        },
        
        // Perform search
        performSearch: function(query) {
            const searchResults = document.getElementById('searchResults');
            if (!searchResults) return;
            
            // Show loading indicator
            searchResults.innerHTML = '<div class="search-loading">Searching...</div>';
            
            // Get selected filters
            const filters = {
                reports: document.querySelector('input[value="reports"]').checked,
                events: document.querySelector('input[value="events"]').checked,
                petitions: document.querySelector('input[value="petitions"]').checked,
                resources: document.querySelector('input[value="resources"]').checked
            };
            
            // Simulate search delay
            setTimeout(() => {
                // Clear results
                searchResults.innerHTML = '';
                
                // Track total results
                let totalResults = 0;
                
                // Search reports
                if (filters.reports) {
                    const matchingReports = this.reports.filter(report => {
                        return report.title.toLowerCase().includes(query.toLowerCase()) || 
                               report.description.toLowerCase().includes(query.toLowerCase()) ||
                               report.location.toLowerCase().includes(query.toLowerCase()) ||
                               report.type.toLowerCase().includes(query.toLowerCase());
                    });
                    
                    if (matchingReports.length > 0) {
                        totalResults += matchingReports.length;
                        
                        // Create reports section
                        const reportsSection = document.createElement('div');
                        reportsSection.className = 'search-section';
                        reportsSection.innerHTML = `<h4>Reports (${matchingReports.length})</h4>`;
                        
                        // Create results list
                        const resultsList = document.createElement('ul');
                        resultsList.className = 'search-results-list';
                        
                        // Add each result
                        matchingReports.forEach(report => {
                            const listItem = document.createElement('li');
                            listItem.className = 'search-result-item';
                            
                            listItem.innerHTML = `
                                <div class="result-type ${report.type}">${this.capitalizeFirstLetter(report.type)}</div>
                                <h5>${report.title}</h5>
                                <p>${this.truncateText(report.description, 100)}</p>
                                <div class="result-location">${report.location}</div>
                            `;
                            
                            // Add click event
                            listItem.addEventListener('click', () => {
                                // Close search modal
                                document.getElementById('searchModal').classList.remove('active');
                                
                                // Navigate to map page and show report details
                                this.navigateTo('map');
                                setTimeout(() => {
                                    this.showReportDetails(report.id);
                                }, 500);
                            });
                            
                            resultsList.appendChild(listItem);
                        });
                        
                        reportsSection.appendChild(resultsList);
                        searchResults.appendChild(reportsSection);
                    }
                }
                
                // Search events
                if (filters.events) {
                    const matchingEvents = this.events.filter(event => {
                        return event.title.toLowerCase().includes(query.toLowerCase()) || 
                               event.description.toLowerCase().includes(query.toLowerCase()) ||
                               event.location.toLowerCase().includes(query.toLowerCase());
                    });
                    
                    if (matchingEvents.length > 0) {
                        totalResults += matchingEvents.length;
                        
                        // Create events section
                        const eventsSection = document.createElement('div');
                        eventsSection.className = 'search-section';
                        eventsSection.innerHTML = `<h4>Events (${matchingEvents.length})</h4>`;
                        
                        // Create results list
                        const resultsList = document.createElement('ul');
                        resultsList.className = 'search-results-list';
                        
                        // Add each result
                        matchingEvents.forEach(event => {
                            const listItem = document.createElement('li');
                            listItem.className = 'search-result-item';
                            
                            // Format date
                            const eventDate = new Date(event.date);
                            const formattedDate = eventDate.toLocaleDateString('en-NG', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            });
                            
                            listItem.innerHTML = `
                                <div class="result-type event">Event</div>
                                <h5>${event.title}</h5>
                                <p>${this.truncateText(event.description, 100)}</p>
                                <div class="result-meta">
                                    <span>${formattedDate} at ${event.time}</span>
                                    <span>${event.location}</span>
                                </div>
                            `;
                            
                            // Add click event
                            listItem.addEventListener('click', () => {
                                // Close search modal
                                document.getElementById('searchModal').classList.remove('active');
                                
                                // Navigate to community page and show event details
                                this.navigateTo('community');
                                setTimeout(() => {
                                    // Activate events tab
                                    document.querySelector('.tab-btn[data-tab="events"]').click();
                                    
                                    // Show event details
                                    setTimeout(() => {
                                        this.showEventDetails(event.id);
                                    }, 300);
                                }, 500);
                            });
                            
                            resultsList.appendChild(listItem);
                        });
                        
                        eventsSection.appendChild(resultsList);
                        searchResults.appendChild(eventsSection);
                    }
                }
                
                // Search petitions
                if (filters.petitions) {
                    const matchingPetitions = this.petitions.filter(petition => {
                        return petition.title.toLowerCase().includes(query.toLowerCase()) || 
                               petition.description.toLowerCase().includes(query.toLowerCase()) ||
                               petition.target.toLowerCase().includes(query.toLowerCase());
                    });
                    
                    if (matchingPetitions.length > 0) {
                        totalResults += matchingPetitions.length;
                        
                        // Create petitions section
                        const petitionsSection = document.createElement('div');
                        petitionsSection.className = 'search-section';
                        petitionsSection.innerHTML = `<h4>Petitions (${matchingPetitions.length})</h4>`;
                        
                        // Create results list
                        const resultsList = document.createElement('ul');
                        resultsList.className = 'search-results-list';
                        
                        // Add each result
                        matchingPetitions.forEach(petition => {
                            const listItem = document.createElement('li');
                            listItem.className = 'search-result-item';
                            
                            listItem.innerHTML = `
                                <div class="result-type petition">Petition</div>
                                <h5>${petition.title}</h5>
                                <p>${this.truncateText(petition.description, 100)}</p>
                                <div class="result-meta">
                                    <span>Target: ${petition.target}</span>
                                    <span>${petition.signatures.toLocaleString()} signatures</span>
                                </div>
                            `;
                            
                            // Add click event
                            listItem.addEventListener('click', () => {
                                // Close search modal
                                document.getElementById('searchModal').classList.remove('active');
                                
                                // Navigate to community page and show petition details
                                this.navigateTo('community');
                                setTimeout(() => {
                                    // Activate petitions tab
                                    document.querySelector('.tab-btn[data-tab="petitions"]').click();
                                    
                                    // Show petition details
                                    setTimeout(() => {
                                        this.showPetitionDetails(petition.id);
                                    }, 300);
                                }, 500);
                            });
                            
                            resultsList.appendChild(listItem);
                        });
                        
                        petitionsSection.appendChild(resultsList);
                        searchResults.appendChild(petitionsSection);
                    }
                }
                
                // Search resources
                if (filters.resources) {
                    const matchingResources = this.resources.filter(resource => {
                        return resource.title.toLowerCase().includes(query.toLowerCase()) || 
                               resource.description.toLowerCase().includes(query.toLowerCase()) ||
                               resource.category.toLowerCase().includes(query.toLowerCase()) ||
                               resource.source.toLowerCase().includes(query.toLowerCase());
                    });
                    
                    if (matchingResources.length > 0) {
                        totalResults += matchingResources.length;
                        
                        // Create resources section
                        const resourcesSection = document.createElement('div');
                        resourcesSection.className = 'search-section';
                        resourcesSection.innerHTML = `<h4>Resources (${matchingResources.length})</h4>`;
                        
                        // Create results list
                        const resultsList = document.createElement('ul');
                        resultsList.className = 'search-results-list';
                        
                        // Add each result
                        matchingResources.forEach(resource => {
                            const listItem = document.createElement('li');
                            listItem.className = 'search-result-item';
                            
                            listItem.innerHTML = `
                                <div class="result-type resource">${this.capitalizeFirstLetter(resource.category)}</div>
                                <h5>${resource.title}</h5>
                                <p>${this.truncateText(resource.description, 100)}</p>
                                <div class="result-meta">
                                    <span>Source: ${resource.source}</span>
                                </div>
                            `;
                            
                            // Add click event
                            listItem.addEventListener('click', () => {
                                // Close search modal
                                document.getElementById('searchModal').classList.remove('active');
                                
                                // Navigate to education page
                                this.navigateTo('education');
                                setTimeout(() => {
                                    // Scroll to resources section
                                    document.querySelector('.education-resources').scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start'
                                    });
                                    
                                    // Activate category filter
                                    document.querySelector(`.category-btn[data-category="${resource.category}"]`)?.click();
                                }, 500);
                            });
                            
                            resultsList.appendChild(listItem);
                        });
                        
                        resourcesSection.appendChild(resultsList);
                        searchResults.appendChild(resourcesSection);
                    }
                }
                
                // If no results found
                if (totalResults === 0) {
                    searchResults.innerHTML = `
                        <div class="no-results">
                            <img src="images/no-results.svg" alt="No Results">
                            <h4>No Results Found</h4>
                            <p>No matches found for "${query}". Try different keywords or filters.</p>
                        </div>
                    `;
                } else {
                    // Add search summary
                    const searchSummary = document.createElement('div');
                    searchSummary.className = 'search-summary';
                    searchSummary.textContent = `Found ${totalResults} results for "${query}"`;
                    searchResults.insertBefore(searchSummary, searchResults.firstChild);
                }
            }, 500);
        },
        
        // Set up notification preferences
        setupNotificationPreferences: function() {
            // This would be implemented in a real application
            // For this demo, we'll just create a mock function
        },
        
        // Set up accessibility features
        setupAccessibilityFeatures: function() {
            // Add skip to content link
            const skipLink = document.createElement('a');
            skipLink.href = '#main';
            skipLink.className = 'skip-link';
            skipLink.textContent = 'Skip to content';
            document.body.insertBefore(skipLink, document.body.firstChild);
            
            // Add main landmark if not present
            if (!document.querySelector('main')) {
                const mainContent = document.createElement('main');
                mainContent.id = 'main';
                
                // Move page content into main element
                const pageContent = document.querySelector('.page.active');
                if (pageContent) {
                    pageContent.parentNode.insertBefore(mainContent, pageContent);
                    mainContent.appendChild(pageContent);
                }
            }
            
            // Add ARIA labels to elements without text
            document.querySelectorAll('button:not([aria-label])').forEach(button => {
                if (!button.textContent.trim() && button.querySelector('img')) {
                    const img = button.querySelector('img');
                    if (img.alt) {
                        button.setAttribute('aria-label', img.alt);
                    }
                }
            });
            
            // Add focus styles
            const style = document.createElement('style');
            style.textContent = `
                :focus {
                    outline: 2px solid var(--primary-color);
                    outline-offset: 2px;
                }
                
                .skip-link {
                    position: absolute;
                    top: -40px;
                    left: 0;
                    background: var(--primary-color);
                    color: white;
                    padding: 8px;
                    z-index: 100;
                    transition: top 0.3s;
                }
                
                .skip-link:focus {
                    top: 0;
                }
            `;
            document.head.appendChild(style);
        }
    });
    
    // Initialize UI components
    EcoReport.initUI();
});