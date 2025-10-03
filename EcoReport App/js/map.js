/**
 * EcoReport - Map Functionality
 * Handles the interactive map for viewing environmental reports
 */

// Extend the EcoReport object with map functionality
document.addEventListener('DOMContentLoaded', () => {
    // Make sure the main EcoReport object exists
    if (typeof EcoReport === 'undefined') {
        console.error('EcoReport main object not found. Map functionality cannot be initialized.');
        return;
    }
    
    // Add map functionality to EcoReport
    Object.assign(EcoReport, {
        // Initialize the map
        initMap: function() {
            console.log('Initializing map...');
            
            const mapElement = document.getElementById('issuesMap');
            if (!mapElement) {
                console.error('Map element not found');
                return;
            }
            
            // Check if Leaflet is available
            if (typeof L === 'undefined') {
                console.error('Leaflet library not loaded');
                this.showToast('error', 'Map Error', 'Could not load the map. Please check your internet connection and try again.');
                return;
            }
            
            // Initialize the map if not already initialized
            if (!this.mapInstance) {
                // Center on Nigeria
                const nigeriaCenter = [9.0820, 8.6753];
                this.mapInstance = L.map(mapElement).setView(nigeriaCenter, 6);
                
                // Add tile layer (OpenStreetMap)
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(this.mapInstance);
                
                // Add scale control
                L.control.scale().addTo(this.mapInstance);
            } else {
                // If map already exists, just make sure it's properly sized
                this.mapInstance.invalidateSize();
            }
            
            // Clear existing markers
            this.clearMapMarkers();
            
            // Add markers for reports
            this.addReportMarkers();
            
            // Set up map filters
            this.setupMapFilters();
        },
        
        // Clear all markers from the map
        clearMapMarkers: function() {
            if (this.reportMarkers.length > 0) {
                this.reportMarkers.forEach(marker => {
                    if (this.mapInstance) {
                        this.mapInstance.removeLayer(marker);
                    }
                });
            }
            this.reportMarkers = [];
        },
        
        // Add markers for all reports that match current filters
        addReportMarkers: function() {
            if (!this.mapInstance) return;
            
            // Get filtered reports
            const filteredReports = this.getFilteredReports();
            
            // Add a marker for each report
            filteredReports.forEach(report => {
                // Skip if no valid coordinates
                if (!report.coordinates || !report.coordinates.lat || !report.coordinates.lng) {
                    return;
                }
                
                // Create custom icon based on report type
                const icon = this.getReportIcon(report.type);
                
                // Create marker
                const marker = L.marker([report.coordinates.lat, report.coordinates.lng], { icon: icon })
                    .addTo(this.mapInstance);
                
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
                
                // Create popup content
                const popupContent = `
                    <div class="map-popup">
                        <h4>${report.title}</h4>
                        <div class="popup-type ${report.type}">${this.capitalizeFirstLetter(report.type)}</div>
                        <div class="popup-location">
                            <img src="images/location-icon.svg" alt="Location">
                            <span>${report.location}</span>
                        </div>
                        <p>${this.truncateText(report.description, 150)}</p>
                        <div class="popup-meta">
                            <div class="popup-date">
                                <img src="images/calendar-icon.svg" alt="Date">
                                <span>${formattedDate}</span>
                            </div>
                            <div class="popup-status">
                                <span class="status-indicator status-${report.status}"></span>
                                <span>${statusText}</span>
                            </div>
                        </div>
                        <button class="btn btn-primary btn-small view-report-btn" data-report-id="${report.id}">View Details</button>
                    </div>
                `;
                
                // Add popup to marker
                marker.bindPopup(popupContent);
                
                // Add click event to the "View Details" button in popup
                marker.on('popupopen', () => {
                    const viewButton = document.querySelector(`.view-report-btn[data-report-id="${report.id}"]`);
                    if (viewButton) {
                        viewButton.addEventListener('click', () => {
                            this.showReportDetails(report.id);
                        });
                    }
                });
                
                // Store marker reference
                this.reportMarkers.push(marker);
            });
            
            // If we have reports with coordinates, fit the map to show all markers
            if (this.reportMarkers.length > 0) {
                const group = L.featureGroup(this.reportMarkers);
                this.mapInstance.fitBounds(group.getBounds(), {
                    padding: [50, 50]
                });
            }
        },
        
        // Get custom icon for report type
        getReportIcon: function(type) {
            // Define colors for different report types
            const colors = {
                waste: '#FF5722',      // Deep Orange
                pollution: '#9C27B0',  // Purple
                deforestation: '#795548', // Brown
                flooding: '#2196F3',   // Blue
                erosion: '#FF9800',    // Orange
                oilSpill: '#000000',   // Black
                other: '#607D8B'       // Blue Grey
            };
            
            // Get color for this type (default to "other" if not found)
            const color = colors[type] || colors.other;
            
            // Create custom icon
            return L.divIcon({
                className: 'custom-map-marker',
                html: `<div style="background-color: ${color}"></div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30]
            });
        },
        
        // Set up map filters
        setupMapFilters: function() {
            // Get filter elements
            const issueTypeCheckboxes = document.querySelectorAll('.map-filters input[type="checkbox"][value]');
            const startDateInput = document.getElementById('startDate');
            const endDateInput = document.getElementById('endDate');
            const minSeverityInput = document.getElementById('minSeverity');
            const maxSeverityInput = document.getElementById('maxSeverity');
            const minSeverityValue = document.getElementById('minSeverityValue');
            const maxSeverityValue = document.getElementById('maxSeverityValue');
            const applyFiltersBtn = document.getElementById('applyFiltersBtn');
            const resetFiltersBtn = document.getElementById('resetFiltersBtn');
            
            // Set initial values for date inputs
            if (startDateInput && endDateInput) {
                // Set end date to today
                const today = new Date();
                const endDateStr = today.toISOString().split('T')[0];
                endDateInput.value = endDateStr;
                
                // Set start date to 30 days ago
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
                const startDateStr = startDate.toISOString().split('T')[0];
                startDateInput.value = startDateStr;
            }
            
            // Update severity range display
            if (minSeverityInput && minSeverityValue) {
                minSeverityInput.addEventListener('input', () => {
                    minSeverityValue.textContent = minSeverityInput.value;
                    
                    // Ensure max is not less than min
                    if (parseInt(maxSeverityInput.value) < parseInt(minSeverityInput.value)) {
                        maxSeverityInput.value = minSeverityInput.value;
                        maxSeverityValue.textContent = maxSeverityInput.value;
                    }
                });
            }
            
            if (maxSeverityInput && maxSeverityValue) {
                maxSeverityInput.addEventListener('input', () => {
                    maxSeverityValue.textContent = maxSeverityInput.value;
                    
                    // Ensure min is not greater than max
                    if (parseInt(minSeverityInput.value) > parseInt(maxSeverityInput.value)) {
                        minSeverityInput.value = maxSeverityInput.value;
                        minSeverityValue.textContent = minSeverityInput.value;
                    }
                });
            }
            
            // Apply filters button
            if (applyFiltersBtn) {
                applyFiltersBtn.addEventListener('click', () => {
                    // Update filters object
                    this.filters.issueTypes = [];
                    issueTypeCheckboxes.forEach(checkbox => {
                        if (checkbox.checked) {
                            this.filters.issueTypes.push(checkbox.value);
                        }
                    });
                    
                    this.filters.status = [];
                    document.querySelectorAll('.map-filters input[value="reported"], .map-filters input[value="inProgress"], .map-filters input[value="resolved"]').forEach(checkbox => {
                        if (checkbox.checked) {
                            this.filters.status.push(checkbox.value);
                        }
                    });
                    
                    this.filters.dateRange = {
                        start: startDateInput.value || null,
                        end: endDateInput.value || null
                    };
                    
                    this.filters.severity = {
                        min: parseInt(minSeverityInput.value) || 1,
                        max: parseInt(maxSeverityInput.value) || 5
                    };
                    
                    // Refresh map markers
                    this.clearMapMarkers();
                    this.addReportMarkers();
                    
                    this.showToast('success', 'Filters Applied', 'Map has been updated with your filter settings.');
                });
            }
            
            // Reset filters button
            if (resetFiltersBtn) {
                resetFiltersBtn.addEventListener('click', () => {
                    // Reset checkboxes
                    issueTypeCheckboxes.forEach(checkbox => {
                        checkbox.checked = true;
                    });
                    
                    document.querySelectorAll('.map-filters input[value="reported"], .map-filters input[value="inProgress"], .map-filters input[value="resolved"]').forEach(checkbox => {
                        checkbox.checked = true;
                    });
                    
                    // Reset date inputs
                    if (startDateInput && endDateInput) {
                        const today = new Date();
                        const endDateStr = today.toISOString().split('T')[0];
                        endDateInput.value = endDateStr;
                        
                        const startDate = new Date();
                        startDate.setDate(startDate.getDate() - 30);
                        const startDateStr = startDate.toISOString().split('T')[0];
                        startDateInput.value = startDateStr;
                    }
                    
                    // Reset severity inputs
                    if (minSeverityInput && maxSeverityInput) {
                        minSeverityInput.value = 1;
                        maxSeverityInput.value = 5;
                        minSeverityValue.textContent = '1';
                        maxSeverityValue.textContent = '5';
                    }
                    
                    // Reset filters object
                    this.filters = {
                        issueTypes: ['waste', 'pollution', 'deforestation', 'flooding', 'erosion', 'oilSpill', 'other'],
                        status: ['reported', 'inProgress', 'resolved'],
                        dateRange: {
                            start: startDateInput.value || null,
                            end: endDateInput.value || null
                        },
                        severity: {
                            min: 1,
                            max: 5
                        }
                    };
                    
                    // Refresh map markers
                    this.clearMapMarkers();
                    this.addReportMarkers();
                    
                    this.showToast('info', 'Filters Reset', 'Map filters have been reset to default values.');
                });
            }
        },
        
        // Get reports filtered by current filter settings
        getFilteredReports: function() {
            return this.reports.filter(report => {
                // Filter by issue type
                if (!this.filters.issueTypes.includes(report.type)) {
                    return false;
                }
                
                // Filter by status
                if (!this.filters.status.includes(report.status)) {
                    return false;
                }
                
                // Filter by date range
                if (this.filters.dateRange.start) {
                    const reportDate = new Date(report.date);
                    const startDate = new Date(this.filters.dateRange.start);
                    if (reportDate < startDate) {
                        return false;
                    }
                }
                
                if (this.filters.dateRange.end) {
                    const reportDate = new Date(report.date);
                    const endDate = new Date(this.filters.dateRange.end);
                    // Set end date to end of day
                    endDate.setHours(23, 59, 59, 999);
                    if (reportDate > endDate) {
                        return false;
                    }
                }
                
                // Filter by severity
                if (report.severity < this.filters.severity.min || report.severity > this.filters.severity.max) {
                    return false;
                }
                
                // If passed all filters, include this report
                return true;
            });
        }
    });
});