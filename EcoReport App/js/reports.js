/**
 * EcoReport - Reports Functionality
 * Handles report submission, viewing, and management
 */

document.addEventListener('DOMContentLoaded', () => {
    // Add reports functionality to the EcoReport object
    Object.assign(EcoReport, {
        // Initialize reports functionality
        initReports: function() {
            console.log('Initializing reports functionality...');
            
            // Set up report form
            this.setupReportForm();
            
            // Set up report filters
            this.setupReportFilters();
            
            // Set up report actions
            this.setupReportActions();
            
            // Set up offline support for reports
            this.setupOfflineReportSupport();
        },
        
        // Set up report form
        setupReportForm: function() {
            const reportForm = document.getElementById('reportForm');
            if (!reportForm) return;
            
            // Initialize location map
            this.initLocationMap();
            
            // Set up file upload preview
            this.setupFileUploadPreview();
            
            // Handle form submission
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleReportSubmission();
            });
            
            // Cancel button
            document.getElementById('cancelReportBtn')?.addEventListener('click', () => {
                if (confirm('Are you sure you want to cancel? Your report data will be lost.')) {
                    reportForm.reset();
                    this.navigateTo('home');
                }
            });
        },
        
        // Initialize location map
        initLocationMap: function() {
            const locationMap = document.getElementById('locationMap');
            if (!locationMap || typeof L === 'undefined') return;
            
            // Default to Nigeria center
            const defaultLat = 9.0820;
            const defaultLng = 8.6753;
            
            // Create map
            this.locationMapInstance = L.map(locationMap).setView([defaultLat, defaultLng], 6);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.locationMapInstance);
            
            // Add marker variable (will be set when user clicks on map)
            this.locationMarker = null;
            
            // Add click event to map
            this.locationMapInstance.on('click', (e) => {
                this.setReportLocation(e.latlng.lat, e.latlng.lng);
            });
            
            // Use current location button
            document.getElementById('useLocationBtn')?.addEventListener('click', () => {
                this.useCurrentLocation();
            });
        },
        
        // Set report location
        setReportLocation: function(lat, lng) {
            // Update hidden inputs
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lng;
            
            // Update or create marker
            if (this.locationMarker) {
                this.locationMarker.setLatLng([lat, lng]);
            } else {
                this.locationMarker = L.marker([lat, lng]).addTo(this.locationMapInstance);
            }
            
            // Center map on marker
            this.locationMapInstance.setView([lat, lng], 15);
            
            // Get location name (reverse geocoding)
            this.reverseGeocode(lat, lng)
                .then(locationName => {
                    document.getElementById('issueLocation').value = locationName;
                })
                .catch(error => {
                    console.error('Error geocoding location:', error);
                });
        },
        
        // Use current location
        useCurrentLocation: function() {
            if (navigator.geolocation) {
                this.showLoading();
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        
                        this.setReportLocation(lat, lng);
                        this.hideLoading();
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                        this.hideLoading();
                        
                        let errorMessage = 'Could not get your current location.';
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = 'Location access denied. Please enable location services in your browser settings.';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = 'Location information is unavailable. Please try again or select on the map.';
                                break;
                            case error.TIMEOUT:
                                errorMessage = 'Location request timed out. Please try again or select on the map.';
                                break;
                        }
                        
                        this.showToast('error', 'Location Error', errorMessage);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            } else {
                this.showToast('error', 'Location Not Supported', 'Geolocation is not supported by your browser. Please enter location manually.');
            }
        },
        
        // Set up file upload preview
        setupFileUploadPreview: function() {
            const fileInput = document.getElementById('issuePhotos');
            const photoPreview = document.getElementById('photoPreview');
            
            if (!fileInput || !photoPreview) return;
            
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
            
            // Add drag and drop functionality
            const fileUploadLabel = document.querySelector('.file-upload-label');
            if (fileUploadLabel) {
                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                    fileUploadLabel.addEventListener(eventName, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                });
                
                ['dragenter', 'dragover'].forEach(eventName => {
                    fileUploadLabel.addEventListener(eventName, () => {
                        fileUploadLabel.classList.add('drag-active');
                    });
                });
                
                ['dragleave', 'drop'].forEach(eventName => {
                    fileUploadLabel.addEventListener(eventName, () => {
                        fileUploadLabel.classList.remove('drag-active');
                    });
                });
                
                fileUploadLabel.addEventListener('drop', (e) => {
                    const dt = e.dataTransfer;
                    const files = dt.files;
                    
                    fileInput.files = files;
                    
                    // Trigger change event
                    const event = new Event('change');
                    fileInput.dispatchEvent(event);
                });
            }
        },
        
        // Handle report submission
        handleReportSubmission: function() {
            // Get form values
            const issueType = document.getElementById('issueType').value;
            const issueTitle = document.getElementById('issueTitle').value;
            const issueDescription = document.getElementById('issueDescription').value;
            const issueLocation = document.getElementById('issueLocation').value;
            const latitude = document.getElementById('latitude').value;
            const longitude = document.getElementById('longitude').value;
            const issueSeverity = document.getElementById('issueSeverity').value;
            const issuePhotos = document.getElementById('issuePhotos').files;
            
            // Validate form
            if (!issueType || !issueTitle || !issueDescription || !issueLocation) {
                this.showToast('error', 'Incomplete Form', 'Please fill in all required fields.');
                return;
            }
            
            if (!latitude || !longitude) {
                this.showToast('error', 'Location Required', 'Please select a location on the map or use your current location.');
                return;
            }
            
            // Check if user is logged in
            if (!this.user) {
                // Save form data to session storage
                sessionStorage.setItem('pendingReport', JSON.stringify({
                    type: issueType,
                    title: issueTitle,
                    description: issueDescription,
                    location: issueLocation,
                    latitude: latitude,
                    longitude: longitude,
                    severity: issueSeverity
                    // Can't save files to session storage
                }));
                
                // Show login prompt
                this.showToast('info', 'Login Required', 'Please log in to submit a report.');
                this.openModal('loginModal');
                
                // Add event listener to login form
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    const originalSubmitHandler = loginForm.onsubmit;
                    
                    loginForm.onsubmit = (e) => {
                        e.preventDefault();
                        
                        // Call original handler
                        if (originalSubmitHandler) {
                            originalSubmitHandler.call(loginForm, e);
                        }
                        
                        // Add callback to continue report submission after login
                        const checkLoginInterval = setInterval(() => {
                            if (this.user) {
                                clearInterval(checkLoginInterval);
                                
                                // Restore form data
                                const pendingReport = JSON.parse(sessionStorage.getItem('pendingReport'));
                                if (pendingReport) {
                                    sessionStorage.removeItem('pendingReport');
                                    
                                    // Continue submission
                                    this.submitReport(
                                        pendingReport.type,
                                        pendingReport.title,
                                        pendingReport.description,
                                        pendingReport.location,
                                        pendingReport.latitude,
                                        pendingReport.longitude,
                                        pendingReport.severity,
                                        issuePhotos
                                    );
                                }
                            }
                        }, 500);
                        
                        // Clear interval after 30 seconds (in case login fails)
                        setTimeout(() => {
                            clearInterval(checkLoginInterval);
                        }, 30000);
                    };
                }
                
                return;
            }
            
            // Submit report
            this.submitReport(
                issueType,
                issueTitle,
                issueDescription,
                issueLocation,
                latitude,
                longitude,
                issueSeverity,
                issuePhotos
            );
        },
        
        // Submit report
        submitReport: function(type, title, description, location, latitude, longitude, severity, photos) {
            this.showLoading();
            
            // Check if online
            if (!navigator.onLine) {
                // Store report for later submission
                this.storeOfflineReport(type, title, description, location, latitude, longitude, severity);
                
                // Hide loading and show message
                this.hideLoading();
                this.showToast('info', 'Offline Mode', 'Your report has been saved and will be submitted when you are back online.');
                
                // Reset form and navigate to home
                document.getElementById('reportForm').reset();
                document.getElementById('photoPreview').innerHTML = '';
                this.navigateTo('home');
                
                return;
            }
            
            // Simulate API call delay
            setTimeout(() => {
                // Process photos (in a real app, this would upload to a server)
                const photoUrls = [];
                
                if (photos && photos.length > 0) {
                    // In a real app, we would upload the photos and get URLs back
                    // For this demo, we'll just use placeholders
                    for (let i = 0; i < photos.length; i++) {
                        photoUrls.push(`images/reports/placeholder-${i + 1}.jpg`);
                    }
                }
                
                // Create new report object
                const newReport = {
                    id: 'r' + (this.reports.length + 1),
                    type: type,
                    title: title,
                    description: description,
                    location: location,
                    coordinates: {
                        lat: parseFloat(latitude),
                        lng: parseFloat(longitude)
                    },
                    severity: parseInt(severity),
                    status: 'reported',
                    date: new Date().toISOString().split('T')[0],
                    photos: photoUrls.length > 0 ? photoUrls : ['images/reports/default-report.jpg'],
                    upvotes: 0,
                    comments: 0,
                    reporter: this.user ? this.user.name : 'Anonymous'
                };
                
                // Add to reports array
                this.reports.push(newReport);
                
                // Update stats
                this.stats.reportCount++;
                this.updateStats();
                
                // Hide loading and show success message
                this.hideLoading();
                this.showToast('success', 'Report Submitted', 'Thank you for your report! It has been submitted successfully.');
                
                // Reset form
                document.getElementById('reportForm').reset();
                document.getElementById('photoPreview').innerHTML = '';
                
                // Navigate to map to see the report
                this.navigateTo('map');
                
                // Show the new report on the map
                setTimeout(() => {
                    if (this.mapInstance) {
                        this.mapInstance.setView([newReport.coordinates.lat, newReport.coordinates.lng], 15);
                        
                        // Find the marker for this report
                        const marker = this.reportMarkers.find(marker => {
                            const position = marker.getLatLng();
                            return position.lat === newReport.coordinates.lat && position.lng === newReport.coordinates.lng;
                        });
                        
                        if (marker) {
                            marker.openPopup();
                        }
                    }
                }, 500);
            }, 1500);
        },
        
        // Store report for offline submission
        storeOfflineReport: function(type, title, description, location, latitude, longitude, severity) {
            // In a real app, this would use IndexedDB to store the report
            // For this demo, we'll just use localStorage
            
            // Get existing offline reports
            let offlineReports = JSON.parse(localStorage.getItem('offlineReports') || '[]');
            
            // Add new report
            offlineReports.push({
                id: 'offline-' + Date.now(),
                type: type,
                title: title,
                description: description,
                location: location,
                coordinates: {
                    lat: parseFloat(latitude),
                    lng: parseFloat(longitude)
                },
                severity: parseInt(severity),
                date: new Date().toISOString().split('T')[0],
                reporter: this.user ? this.user.name : 'Anonymous'
            });
            
            // Save back to localStorage
            localStorage.setItem('offlineReports', JSON.stringify(offlineReports));
            
            // Register for background sync (if supported)
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                navigator.serviceWorker.ready
                    .then(registration => {
                        registration.sync.register('sync-reports')
                            .catch(err => {
                                console.error('Background sync registration failed:', err);
                            });
                    });
            }
        },
        
        // Set up offline report support
        setupOfflineReportSupport: function() {
            // Check for offline reports when coming back online
            window.addEventListener('online', () => {
                this.syncOfflineReports();
            });
            
            // Check for offline reports on page load
            if (navigator.onLine) {
                this.syncOfflineReports();
            }
        },
        
        // Sync offline reports
        syncOfflineReports: function() {
            // Get offline reports
            const offlineReports = JSON.parse(localStorage.getItem('offlineReports') || '[]');
            
            if (offlineReports.length === 0) return;
            
            // Show toast notification
            this.showToast('info', 'Syncing Reports', `Submitting ${offlineReports.length} offline report(s)...`);
            
            // Process each report
            offlineReports.forEach((report, index) => {
                setTimeout(() => {
                    // Create new report object
                    const newReport = {
                        id: 'r' + (this.reports.length + 1),
                        type: report.type,
                        title: report.title,
                        description: report.description,
                        location: report.location,
                        coordinates: report.coordinates,
                        severity: report.severity,
                        status: 'reported',
                        date: report.date,
                        photos: ['images/reports/default-report.jpg'],
                        upvotes: 0,
                        comments: 0,
                        reporter: report.reporter
                    };
                    
                    // Add to reports array
                    this.reports.push(newReport);
                    
                    // Update stats
                    this.stats.reportCount++;
                    
                    // If this is the last report, update UI and clear offline reports
                    if (index === offlineReports.length - 1) {
                        this.updateStats();
                        localStorage.removeItem('offlineReports');
                        this.showToast('success', 'Reports Synced', `Successfully submitted ${offlineReports.length} offline report(s).`);
                    }
                }, index * 500); // Stagger submissions to avoid overwhelming the server
            });
        },
        
        // Set up report filters
        setupReportFilters: function() {
            // This is handled in the map.js file
        },
        
        // Set up report actions
        setupReportActions: function() {
            // Support for report actions (upvote, comment, share, etc.)
            document.addEventListener('click', (e) => {
                // Support report button
                if (e.target.matches('#supportReportBtn') || e.target.closest('#supportReportBtn')) {
                    const reportId = e.target.closest('[data-report-id]')?.getAttribute('data-report-id');
                    if (reportId) {
                        this.supportReport(reportId);
                    }
                }
                
                // Share report button
                if (e.target.matches('#shareReportBtn') || e.target.closest('#shareReportBtn')) {
                    const reportId = e.target.closest('[data-report-id]')?.getAttribute('data-report-id');
                    if (reportId) {
                        this.shareReport(reportId);
                    }
                }
            });
        },
        
        // Support (upvote) a report
        supportReport: function(reportId) {
            // Find the report
            const report = this.reports.find(r => r.id === reportId);
            if (!report) return;
            
            // Check if user is logged in
            if (!this.user) {
                this.showToast('info', 'Login Required', 'Please log in to support this report.');
                this.openModal('loginModal');
                return;
            }
            
            // Increment upvote count
            report.upvotes++;
            
            // Update UI
            const supportButton = document.querySelector(`#supportReportBtn`);
            if (supportButton) {
                supportButton.innerHTML = `
                    <img src="images/thumbs-up.svg" alt="Support">
                    Supported (${report.upvotes})
                `;
                supportButton.disabled = true;
            }
            
            this.showToast('success', 'Report Supported', 'Thank you for supporting this report!');
        },
        
        // Share a report
        shareReport: function(reportId) {
            // Find the report
            const report = this.reports.find(r => r.id === reportId);
            if (!report) return;
            
            // Check if Web Share API is supported
            if (navigator.share) {
                navigator.share({
                    title: `EcoReport: ${report.title}`,
                    text: `Check out this environmental issue: ${report.title} in ${report.location}`,
                    url: window.location.origin + '/#map?report=' + reportId
                })
                .then(() => {
                    console.log('Report shared successfully');
                })
                .catch(error => {
                    console.error('Error sharing report:', error);
                    this.showManualShareOptions(report);
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                this.showManualShareOptions(report);
            }
        },
        
        // Show manual share options
        showManualShareOptions: function(report) {
            const shareUrl = window.location.origin + '/#map?report=' + report.id;
            
            // Create modal content
            const modalContent = `
                <div class="share-options">
                    <p>Share this environmental report with others:</p>
                    
                    <div class="social-share-buttons">
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" target="_blank" class="btn btn-social btn-facebook">
                            <img src="images/facebook-icon.svg" alt="Facebook">
                            Share on Facebook
                        </a>
                        
                        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this environmental issue: ${report.title} in ${report.location}`)}&url=${encodeURIComponent(shareUrl)}" target="_blank" class="btn btn-social btn-twitter">
                            <img src="images/twitter-icon.svg" alt="Twitter">
                            Share on Twitter
                        </a>
                        
                        <a href="https://wa.me/?text=${encodeURIComponent(`Check out this environmental issue: ${report.title} in ${report.location} ${shareUrl}`)}" target="_blank" class="btn btn-social btn-whatsapp">
                            <img src="images/whatsapp-icon.svg" alt="WhatsApp">
                            Share on WhatsApp
                        </a>
                    </div>
                    
                    <div class="copy-link">
                        <p>Or copy this link:</p>
                        <div class="copy-link-input">
                            <input type="text" id="shareUrlInput" value="${shareUrl}" readonly>
                            <button id="copyLinkBtn" class="btn btn-primary">Copy</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'shareModal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Share Report</h3>
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
            
            // Copy link button
            const copyLinkBtn = modal.querySelector('#copyLinkBtn');
            const shareUrlInput = modal.querySelector('#shareUrlInput');
            
            if (copyLinkBtn && shareUrlInput) {
                copyLinkBtn.addEventListener('click', () => {
                    shareUrlInput.select();
                    document.execCommand('copy');
                    
                    // Change button text temporarily
                    copyLinkBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyLinkBtn.textContent = 'Copy';
                    }, 2000);
                });
            }
            
            // Show modal
            modal.classList.add('active');
        },
        
        // Show report details
        showReportDetails: function(reportId) {
            // Find the report
            const report = this.reports.find(r => r.id === reportId);
            if (!report) return;
            
            // Create modal content
            const modalContent = this.createReportDetailContent(report);
            
            // Check if modal already exists
            let modal = document.getElementById('reportDetailModal');
            
            if (!modal) {
                // Create modal
                modal = document.createElement('div');
                modal.className = 'modal';
                modal.id = 'reportDetailModal';
                
                modal.innerHTML = `
                    <div class="modal-content modal-large">
                        <div class="modal-header">
                            <h3 id="reportDetailTitle">${report.title}</h3>
                            <button class="close-modal">&times;</button>
                        </div>
                        <div class="modal-body" id="reportDetailContent">
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
            } else {
                // Update existing modal
                document.getElementById('reportDetailTitle').textContent = report.title;
                document.getElementById('reportDetailContent').innerHTML = modalContent;
            }
            
            // Show modal
            modal.classList.add('active');
            
            // Initialize map in the modal after it's visible
            setTimeout(() => {
                const mapElement = document.getElementById('reportDetailMap');
                if (mapElement && typeof L !== 'undefined') {
                    const map = L.map(mapElement).setView([report.coordinates.lat, report.coordinates.lng], 15);
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(map);
                    
                    L.marker([report.coordinates.lat, report.coordinates.lng]).addTo(map)
                        .bindPopup(report.title)
                        .openPopup();
                }
            }, 300);
            
            // Add event listeners for buttons
            setTimeout(() => {
                // Support button
                const supportBtn = document.getElementById('supportReportBtn');
                if (supportBtn) {
                    supportBtn.addEventListener('click', () => {
                        this.supportReport(report.id);
                    });
                }
                
                // Share button
                const shareBtn = document.getElementById('shareReportBtn');
                if (shareBtn) {
                    shareBtn.addEventListener('click', () => {
                        this.shareReport(report.id);
                    });
                }
                
                // Comment form
                const commentForm = document.querySelector('.comment-form');
                if (commentForm) {
                    commentForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        
                        const commentText = commentForm.querySelector('textarea').value;
                        if (!commentText.trim()) return;
                        
                        // Check if user is logged in
                        if (!this.user) {
                            this.showToast('info', 'Login Required', 'Please log in to comment on this report.');
                            this.openModal('loginModal');
                            return;
                        }
                        
                        // Add comment (in a real app, this would send to a server)
                        report.comments++;
                        
                        // Update UI
                        const commentsHeading = document.querySelector('.report-detail-comments h4');
                        if (commentsHeading) {
                            commentsHeading.textContent = `Comments (${report.comments})`;
                        }
                        
                        // Add comment to UI
                        const commentsContainer = document.querySelector('.comments-list');
                        if (commentsContainer) {
                            const commentElement = document.createElement('div');
                            commentElement.className = 'comment';
                            
                            commentElement.innerHTML = `
                                <div class="comment-header">
                                    <div class="comment-author">
                                        <img src="${this.user.avatar}" alt="${this.user.name}">
                                        <span>${this.user.name}</span>
                                    </div>
                                    <div class="comment-date">Just now</div>
                                </div>
                                <div class="comment-content">
                                    <p>${commentText}</p>
                                </div>
                            `;
                            
                            commentsContainer.appendChild(commentElement);
                        }
                        
                        // Clear form
                        commentForm.querySelector('textarea').value = '';
                        
                        this.showToast('success', 'Comment Added', 'Your comment has been added successfully.');
                    });
                }
            }, 300);
        },
        
        // Create report detail content
        createReportDetailContent: function(report) {
            // Format date
            const reportDate = new Date(report.date);
            const formattedDate = reportDate.toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Status text
            let statusText = 'Reported';
            let statusClass = 'reported';
            if (report.status === 'inProgress') {
                statusText = 'In Progress';
                statusClass = 'inProgress';
            } else if (report.status === 'resolved') {
                statusText = 'Resolved';
                statusClass = 'resolved';
            }
            
            // Generate severity stars
            const severityStars = this.generateSeverityStars(report.severity);
            
            // Create image gallery
            const imageGallery = report.photos.map(photo => `
                <div class="report-detail-image">
                    <img src="${photo}" alt="${report.title}">
                </div>
            `).join('');
            
            // Create mock comments
            const mockComments = [];
            if (report.comments > 0) {
                // Generate some mock comments
                const commentAuthors = ['John D.', 'Sarah M.', 'Michael O.', 'Chioma E.'];
                const commentDates = ['2 days ago', '1 week ago', '3 weeks ago', 'Yesterday'];
                const commentTexts = [
                    'This is a serious issue that needs immediate attention. I\'ve seen this problem getting worse over the past month.',
                    'I live nearby and can confirm this is accurate. The local government needs to address this.',
                    'Thank you for reporting this. I\'ve also noticed this issue and it\'s affecting our community.',
                    'I\'ve reported this to the local authorities as well. Hopefully with more reports they\'ll take action.'
                ];
                
                for (let i = 0; i < Math.min(report.comments, 4); i++) {
                    mockComments.push(`
                        <div class="comment">
                            <div class="comment-header">
                                <div class="comment-author">
                                    <img src="images/default-avatar.png" alt="${commentAuthors[i]}">
                                    <span>${commentAuthors[i]}</span>
                                </div>
                                <div class="comment-date">${commentDates[i]}</div>
                            </div>
                            <div class="comment-content">
                                <p>${commentTexts[i]}</p>
                            </div>
                        </div>
                    `);
                }
            }
            
            return `
                <div class="report-detail">
                    <div class="report-detail-images">
                        ${imageGallery}
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
                                ${severityStars}
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
                            <button class="btn btn-primary" id="supportReportBtn" data-report-id="${report.id}">
                                <img src="images/thumbs-up.svg" alt="Support">
                                Support (${report.upvotes})
                            </button>
                            <button class="btn btn-outline" id="shareReportBtn" data-report-id="${report.id}">
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
                            <div class="comments-list">
                                ${mockComments.join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        
        // Generate severity stars
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
        
        // Reverse geocode coordinates to location name
        reverseGeocode: function(lat, lng) {
            return new Promise((resolve, reject) => {
                // In a real app, this would call a geocoding API like Nominatim or Google Maps
                
                // For this demo, we'll use a simple mock implementation
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
        }
    });
    
    // Initialize reports functionality
    EcoReport.initReports();
});