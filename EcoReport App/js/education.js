/**
 * EcoReport - Education Functionality
 * Handles educational content including alerts, resources, and eco-friendly tips
 */

document.addEventListener('DOMContentLoaded', () => {
    // Add education functionality to the EcoReport object
    Object.assign(EcoReport, {
        // Initialize education content
        loadEducationContent: function() {
            console.log('Loading education content...');
            
            // Load environmental alerts
            this.loadEnvironmentalAlerts();
            
            // Load educational resources
            this.loadEducationalResources();
            
            // Load eco-friendly tips
            this.loadEcoTips();
            
            // Set up resource category filters
            this.setupResourceFilters();
        },
        
        // Load environmental alerts
        loadEnvironmentalAlerts: function() {
            const alertsContainer = document.getElementById('alertsContainer');
            if (!alertsContainer) return;
            
            // Clear container
            alertsContainer.innerHTML = '';
            
            // If no alerts, show message
            if (this.alerts.length === 0) {
                alertsContainer.innerHTML = `
                    <div class="empty-state">
                        <img src="images/empty-alerts.svg" alt="No Alerts">
                        <h4>No Current Alerts</h4>
                        <p>There are no active environmental alerts at the moment.</p>
                    </div>
                `;
                return;
            }
            
            // Sort alerts by date (newest first)
            const sortedAlerts = [...this.alerts].sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });
            
            // Create alert cards
            sortedAlerts.forEach(alert => {
                const alertCard = document.createElement('div');
                alertCard.className = `alert-card ${alert.type}`;
                
                // Format date
                const alertDate = new Date(alert.date);
                const formattedDate = alertDate.toLocaleDateString('en-NG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                // Get icon based on alert type
                let iconSrc = '';
                switch (alert.type) {
                    case 'warning':
                        iconSrc = 'images/alert-warning.svg';
                        break;
                    case 'danger':
                        iconSrc = 'images/alert-danger.svg';
                        break;
                    case 'info':
                        iconSrc = 'images/alert-info.svg';
                        break;
                }
                
                alertCard.innerHTML = `
                    <div class="alert-header">
                        <img src="${iconSrc}" alt="${alert.type}" class="alert-icon">
                        <h4 class="alert-title">${alert.title}</h4>
                    </div>
                    <div class="alert-date">${formattedDate}</div>
                    <p>${alert.description}</p>
                    <div class="alert-region">
                        <strong>Region:</strong> ${alert.region}
                    </div>
                `;
                
                alertsContainer.appendChild(alertCard);
            });
        },
        
        // Load educational resources
        loadEducationalResources: function() {
            const resourcesContainer = document.getElementById('resourcesContainer');
            if (!resourcesContainer) return;
            
            // Clear container
            resourcesContainer.innerHTML = '';
            
            // If no resources, show message
            if (this.resources.length === 0) {
                resourcesContainer.innerHTML = `
                    <div class="empty-state">
                        <img src="images/empty-resources.svg" alt="No Resources">
                        <h4>No Resources Available</h4>
                        <p>Educational resources are being developed and will be available soon.</p>
                    </div>
                `;
                return;
            }
            
            // Get active category filter
            const activeCategory = document.querySelector('.category-btn.active')?.getAttribute('data-category') || 'all';
            
            // Filter resources by category
            let filteredResources = [...this.resources];
            if (activeCategory !== 'all') {
                filteredResources = filteredResources.filter(resource => resource.category === activeCategory);
            }
            
            // If no resources match filter, show message
            if (filteredResources.length === 0) {
                resourcesContainer.innerHTML = `
                    <div class="empty-state">
                        <img src="images/empty-filter.svg" alt="No Matching Resources">
                        <h4>No Matching Resources</h4>
                        <p>No resources found for the selected category. Try selecting a different category.</p>
                    </div>
                `;
                return;
            }
            
            // Create resource cards
            filteredResources.forEach(resource => {
                const resourceCard = document.createElement('div');
                resourceCard.className = 'resource-card';
                
                resourceCard.innerHTML = `
                    <div class="resource-image">
                        <img src="${resource.image || 'images/resources/default-resource.jpg'}" alt="${resource.title}">
                    </div>
                    <div class="resource-content">
                        <span class="resource-category">${this.capitalizeFirstLetter(resource.category)}</span>
                        <h4 class="resource-title">${resource.title}</h4>
                        <div class="resource-source">Source: ${resource.source}</div>
                        <p>${this.truncateText(resource.description, 120)}</p>
                        <div class="resource-actions">
                            <a href="${resource.link}" class="btn btn-primary" target="_blank">Read More</a>
                            <button class="btn btn-outline save-resource-btn" data-resource-id="${resource.id}">Save</button>
                        </div>
                    </div>
                `;
                
                // Add event listener for save button
                resourceCard.querySelector('.save-resource-btn').addEventListener('click', (e) => {
                    e.preventDefault();
                    this.saveResource(resource.id);
                });
                
                resourcesContainer.appendChild(resourceCard);
            });
        },
        
        // Set up resource category filters
        setupResourceFilters: function() {
            const categoryButtons = document.querySelectorAll('.resource-categories .category-btn');
            
            categoryButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Remove active class from all buttons
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Add active class to clicked button
                    button.classList.add('active');
                    
                    // Reload resources with new filter
                    this.loadEducationalResources();
                });
            });
        },
        
        // Save a resource (mock implementation)
        saveResource: function(resourceId) {
            // Check if user is logged in
            if (!this.user) {
                this.showToast('info', 'Login Required', 'Please log in to save resources.');
                this.openModal('loginModal');
                return;
            }
            
            // Find the resource
            const resource = this.resources.find(r => r.id === resourceId);
            if (!resource) return;
            
            // Show success message
            this.showToast('success', 'Resource Saved', `"${resource.title}" has been saved to your profile.`);
            
            // Change button text
            document.querySelectorAll(`.save-resource-btn[data-resource-id="${resourceId}"]`).forEach(btn => {
                btn.textContent = 'Saved';
                btn.disabled = true;
            });
        },
        
        // Load eco-friendly tips
        loadEcoTips: function() {
            const tipsCarousel = document.getElementById('tipsCarousel');
            const carouselIndicators = document.getElementById('carouselIndicators');
            if (!tipsCarousel || !carouselIndicators) return;
            
            // Clear containers
            tipsCarousel.innerHTML = '';
            carouselIndicators.innerHTML = '';
            
            // If no tips, show message
            if (this.tips.length === 0) {
                tipsCarousel.innerHTML = `
                    <div class="empty-state">
                        <img src="images/empty-tips.svg" alt="No Tips">
                        <h4>No Tips Available</h4>
                        <p>Eco-friendly tips are being developed and will be available soon.</p>
                    </div>
                `;
                return;
            }
            
            // Create tip slides
            this.tips.forEach((tip, index) => {
                const tipSlide = document.createElement('div');
                tipSlide.className = `tip-slide ${index === 0 ? 'active' : ''}`;
                
                tipSlide.innerHTML = `
                    <img src="${tip.icon || 'images/tips/default-tip.svg'}" alt="${tip.title}" class="tip-icon">
                    <h4 class="tip-title">${tip.title}</h4>
                    <p>${tip.content}</p>
                `;
                
                tipsCarousel.appendChild(tipSlide);
                
                // Create indicator
                const indicator = document.createElement('div');
                indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
                indicator.setAttribute('data-index', index);
                
                // Add click event to indicator
                indicator.addEventListener('click', () => {
                    this.showTipSlide(index);
                });
                
                carouselIndicators.appendChild(indicator);
            });
            
            // Set up carousel navigation
            const prevButton = document.getElementById('prevTipBtn');
            const nextButton = document.getElementById('nextTipBtn');
            
            if (prevButton && nextButton) {
                // Current slide index
                this.currentTipIndex = 0;
                
                // Previous button
                prevButton.addEventListener('click', () => {
                    this.currentTipIndex--;
                    if (this.currentTipIndex < 0) {
                        this.currentTipIndex = this.tips.length - 1;
                    }
                    this.showTipSlide(this.currentTipIndex);
                });
                
                // Next button
                nextButton.addEventListener('click', () => {
                    this.currentTipIndex++;
                    if (this.currentTipIndex >= this.tips.length) {
                        this.currentTipIndex = 0;
                    }
                    this.showTipSlide(this.currentTipIndex);
                });
                
                // Auto-advance carousel
                this.startTipCarousel();
            }
        },
        
        // Show a specific tip slide
        showTipSlide: function(index) {
            // Update current index
            this.currentTipIndex = index;
            
            // Hide all slides and remove active class from indicators
            document.querySelectorAll('.tip-slide').forEach(slide => {
                slide.classList.remove('active');
            });
            
            document.querySelectorAll('.indicator').forEach(indicator => {
                indicator.classList.remove('active');
            });
            
            // Show selected slide and activate indicator
            document.querySelector(`.tip-slide:nth-child(${index + 1})`).classList.add('active');
            document.querySelector(`.indicator[data-index="${index}"]`).classList.add('active');
            
            // Reset auto-advance timer
            this.resetTipCarouselTimer();
        },
        
        // Start auto-advancing tip carousel
        startTipCarousel: function() {
            this.tipCarouselTimer = setInterval(() => {
                this.currentTipIndex++;
                if (this.currentTipIndex >= this.tips.length) {
                    this.currentTipIndex = 0;
                }
                this.showTipSlide(this.currentTipIndex);
            }, 5000); // Change slide every 5 seconds
        },
        
        // Reset tip carousel timer
        resetTipCarouselTimer: function() {
            if (this.tipCarouselTimer) {
                clearInterval(this.tipCarouselTimer);
                this.startTipCarousel();
            }
        },
        
        // Add a weather API integration (mock implementation)
        fetchWeatherData: function() {
            // In a real app, this would call a weather API
            console.log('Fetching weather data...');
            
            // Simulate API call delay
            setTimeout(() => {
                // Mock weather data
                const weatherData = {
                    location: 'Lagos, Nigeria',
                    temperature: 28,
                    condition: 'Partly Cloudy',
                    humidity: 75,
                    windSpeed: 12,
                    forecast: [
                        { day: 'Today', high: 30, low: 24, condition: 'Partly Cloudy' },
                        { day: 'Tomorrow', high: 31, low: 25, condition: 'Scattered Thunderstorms' },
                        { day: 'Wednesday', high: 29, low: 24, condition: 'Rain' }
                    ]
                };
                
                // Check for weather alerts
                if (weatherData.forecast[1].condition === 'Scattered Thunderstorms') {
                    // Create a new alert
                    const newAlert = {
                        id: 'a' + (this.alerts.length + 1),
                        title: 'Thunderstorm Warning: Lagos Area',
                        description: 'Scattered thunderstorms expected tomorrow. Potential for localized flooding in low-lying areas.',
                        type: 'warning',
                        date: new Date().toISOString().split('T')[0],
                        region: 'Lagos'
                    };
                    
                    // Add to alerts if not already present
                    if (!this.alerts.some(alert => alert.title === newAlert.title)) {
                        this.alerts.unshift(newAlert);
                        this.loadEnvironmentalAlerts();
                        
                        // Show notification
                        this.showToast('warning', 'Weather Alert', 'New thunderstorm warning issued for Lagos area.');
                    }
                }
            }, 2000);
        },
        
        // Add educational content search functionality
        searchEducationalContent: function(query) {
            if (!query) return;
            
            query = query.toLowerCase();
            
            // Search resources
            const matchingResources = this.resources.filter(resource => {
                return resource.title.toLowerCase().includes(query) || 
                       resource.description.toLowerCase().includes(query) ||
                       resource.category.toLowerCase().includes(query);
            });
            
            // Search tips
            const matchingTips = this.tips.filter(tip => {
                return tip.title.toLowerCase().includes(query) || 
                       tip.content.toLowerCase().includes(query);
            });
            
            // Display search results
            const resourcesContainer = document.getElementById('resourcesContainer');
            if (resourcesContainer) {
                // Clear container
                resourcesContainer.innerHTML = '';
                
                // Show search results heading
                const searchHeading = document.createElement('h3');
                searchHeading.textContent = `Search Results for "${query}"`;
                resourcesContainer.appendChild(searchHeading);
                
                // If no results, show message
                if (matchingResources.length === 0 && matchingTips.length === 0) {
                    const noResults = document.createElement('div');
                    noResults.className = 'empty-state';
                    noResults.innerHTML = `
                        <img src="images/empty-search.svg" alt="No Results">
                        <h4>No Results Found</h4>
                        <p>No educational content matches your search query. Try different keywords.</p>
                    `;
                    resourcesContainer.appendChild(noResults);
                    return;
                }
                
                // Show matching resources
                if (matchingResources.length > 0) {
                    const resourcesHeading = document.createElement('h4');
                    resourcesHeading.textContent = 'Resources';
                    resourcesHeading.className = 'search-section-heading';
                    resourcesContainer.appendChild(resourcesHeading);
                    
                    matchingResources.forEach(resource => {
                        const resourceCard = document.createElement('div');
                        resourceCard.className = 'resource-card';
                        
                        resourceCard.innerHTML = `
                            <div class="resource-image">
                                <img src="${resource.image || 'images/resources/default-resource.jpg'}" alt="${resource.title}">
                            </div>
                            <div class="resource-content">
                                <span class="resource-category">${this.capitalizeFirstLetter(resource.category)}</span>
                                <h4 class="resource-title">${resource.title}</h4>
                                <div class="resource-source">Source: ${resource.source}</div>
                                <p>${this.truncateText(resource.description, 120)}</p>
                                <div class="resource-actions">
                                    <a href="${resource.link}" class="btn btn-primary" target="_blank">Read More</a>
                                    <button class="btn btn-outline save-resource-btn" data-resource-id="${resource.id}">Save</button>
                                </div>
                            </div>
                        `;
                        
                        resourcesContainer.appendChild(resourceCard);
                    });
                }
                
                // Show matching tips
                if (matchingTips.length > 0) {
                    const tipsHeading = document.createElement('h4');
                    tipsHeading.textContent = 'Eco-Friendly Tips';
                    tipsHeading.className = 'search-section-heading';
                    resourcesContainer.appendChild(tipsHeading);
                    
                    const tipsContainer = document.createElement('div');
                    tipsContainer.className = 'search-tips-container';
                    
                    matchingTips.forEach(tip => {
                        const tipCard = document.createElement('div');
                        tipCard.className = 'tip-card';
                        
                        tipCard.innerHTML = `
                            <img src="${tip.icon || 'images/tips/default-tip.svg'}" alt="${tip.title}" class="tip-icon">
                            <h4 class="tip-title">${tip.title}</h4>
                            <p>${tip.content}</p>
                        `;
                        
                        tipsContainer.appendChild(tipCard);
                    });
                    
                    resourcesContainer.appendChild(tipsContainer);
                }
            }
        },
        
        // Add educational content submission form
        showContentSubmissionForm: function() {
            // Check if user is logged in
            if (!this.user) {
                this.showToast('info', 'Login Required', 'Please log in to submit educational content.');
                this.openModal('loginModal');
                return;
            }
            
            // Create modal content
            const modalContent = `
                <form id="contentSubmissionForm" class="content-submission-form">
                    <div class="form-group">
                        <label for="contentType">Content Type</label>
                        <select id="contentType" required>
                            <option value="" disabled selected>Select content type</option>
                            <option value="resource">Educational Resource</option>
                            <option value="tip">Eco-Friendly Tip</option>
                        </select>
                    </div>
                    
                    <div id="resourceFields" class="conditional-fields hidden">
                        <div class="form-group">
                            <label for="resourceTitle">Title</label>
                            <input type="text" id="resourceTitle" placeholder="Enter a descriptive title">
                        </div>
                        <div class="form-group">
                            <label for="resourceCategory">Category</label>
                            <select id="resourceCategory">
                                <option value="waste">Waste Management</option>
                                <option value="water">Water Conservation</option>
                                <option value="climate">Climate Change</option>
                                <option value="biodiversity">Biodiversity</option>
                                <option value="pollution">Pollution</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="resourceDescription">Description</label>
                            <textarea id="resourceDescription" placeholder="Provide detailed information about this resource" rows="4"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="resourceSource">Source</label>
                            <input type="text" id="resourceSource" placeholder="Name of organization or author">
                        </div>
                        <div class="form-group">
                            <label for="resourceLink">Link</label>
                            <input type="url" id="resourceLink" placeholder="URL to the resource">
                        </div>
                        <div class="form-group">
                            <label for="resourceImage">Image</label>
                            <div class="file-upload">
                                <input type="file" id="resourceImage" accept="image/*">
                                <label for="resourceImage" class="file-upload-label">
                                    <img src="images/upload-icon.svg" alt="Upload">
                                    <span>Choose file or drag & drop</span>
                                </label>
                            </div>
                            <div id="resourceImagePreview" class="image-preview"></div>
                        </div>
                    </div>
                    
                    <div id="tipFields" class="conditional-fields hidden">
                        <div class="form-group">
                            <label for="tipTitle">Title</label>
                            <input type="text" id="tipTitle" placeholder="Enter a short, catchy title">
                        </div>
                        <div class="form-group">
                            <label for="tipContent">Content</label>
                            <textarea id="tipContent" placeholder="Provide a practical, actionable eco-friendly tip" rows="4"></textarea>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" id="cancelSubmissionBtn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Submit Content</button>
                    </div>
                </form>
            `;
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'contentSubmissionModal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Submit Educational Content</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${modalContent}
                    </div>
                </div>
            `;
            
            // Add modal to body
            document.body.appendChild(modal);
            
            // Add event listeners
            modal.querySelector('.close-modal').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
            
            // Cancel button
            modal.querySelector('#cancelSubmissionBtn').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            // Content type selection
            const contentTypeSelect = document.getElementById('contentType');
            const resourceFields = document.getElementById('resourceFields');
            const tipFields = document.getElementById('tipFields');
            
            contentTypeSelect.addEventListener('change', () => {
                const selectedType = contentTypeSelect.value;
                
                if (selectedType === 'resource') {
                    resourceFields.classList.remove('hidden');
                    tipFields.classList.add('hidden');
                } else if (selectedType === 'tip') {
                    tipFields.classList.remove('hidden');
                    resourceFields.classList.add('hidden');
                }
            });
            
            // Handle form submission
            modal.querySelector('#contentSubmissionForm').addEventListener('submit', (e) => {
                e.preventDefault();
                
                const contentType = contentTypeSelect.value;
                
                if (contentType === 'resource') {
                    // Get resource form values
                    const title = document.getElementById('resourceTitle').value;
                    const category = document.getElementById('resourceCategory').value;
                    const description = document.getElementById('resourceDescription').value;
                    const source = document.getElementById('resourceSource').value;
                    const link = document.getElementById('resourceLink').value;
                    
                    // Validate form
                    if (!title || !category || !description || !source || !link) {
                        this.showToast('error', 'Incomplete Form', 'Please fill in all required fields.');
                        return;
                    }
                    
                    this.showLoading();
                    
                    // Simulate API call delay
                    setTimeout(() => {
                        // Create new resource
                        const newResource = {
                            id: 'res' + (this.resources.length + 1),
                            title: title,
                            description: description,
                            category: category,
                            source: source,
                            link: link,
                            image: 'images/resources/default-resource.jpg' // In a real app, this would be uploaded
                        };
                        
                        // Add to resources array
                        this.resources.push(newResource);
                        
                        // Reload resources
                        this.loadEducationalResources();
                        
                        // Close modal
                        document.body.removeChild(modal);
                        
                        // Show success message
                        this.hideLoading();
                        this.showToast('success', 'Content Submitted', 'Your educational resource has been submitted successfully. It will be reviewed by our team.');
                    }, 1500);
                } else if (contentType === 'tip') {
                    // Get tip form values
                    const title = document.getElementById('tipTitle').value;
                    const content = document.getElementById('tipContent').value;
                    
                    // Validate form
                    if (!title || !content) {
                        this.showToast('error', 'Incomplete Form', 'Please fill in all required fields.');
                        return;
                    }
                    
                    this.showLoading();
                    
                    // Simulate API call delay
                    setTimeout(() => {
                        // Create new tip
                        const newTip = {
                            id: 't' + (this.tips.length + 1),
                            title: title,
                            content: content,
                            icon: 'images/tips/default-tip.svg' // In a real app, this might be selected or uploaded
                        };
                        
                        // Add to tips array
                        this.tips.push(newTip);
                        
                        // Reload tips
                        this.loadEcoTips();
                        
                        // Close modal
                        document.body.removeChild(modal);
                        
                        // Show success message
                        this.hideLoading();
                        this.showToast('success', 'Content Submitted', 'Your eco-friendly tip has been submitted successfully. It will be reviewed by our team.');
                    }, 1500);
                } else {
                    this.showToast('error', 'Invalid Selection', 'Please select a content type.');
                }
            });
            
            // Handle image upload preview
            const imageInput = document.getElementById('resourceImage');
            const imagePreview = document.getElementById('resourceImagePreview');
            
            if (imageInput && imagePreview) {
                imageInput.addEventListener('change', () => {
                    imagePreview.innerHTML = '';
                    
                    if (imageInput.files.length > 0) {
                        const file = imageInput.files[0];
                        
                        // Only process images
                        if (!file.type.startsWith('image/')) return;
                        
                        const reader = new FileReader();
                        
                        reader.onload = (e) => {
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            img.alt = 'Resource Preview';
                            imagePreview.appendChild(img);
                        };
                        
                        reader.readAsDataURL(file);
                    }
                });
            }
            
            // Show modal
            modal.classList.add('active');
        }
    });
});