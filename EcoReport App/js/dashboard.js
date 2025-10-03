/**
 * EcoReport - Dashboard Functionality
 * Handles data visualization and analytics for environmental reports
 */

document.addEventListener('DOMContentLoaded', () => {
    // Add dashboard functionality to the EcoReport object
    Object.assign(EcoReport, {
        // Initialize the dashboard
        initDashboard: function() {
            console.log('Initializing dashboard...');
            
            // Check if Chart.js is available
            if (typeof Chart === 'undefined') {
                console.error('Chart.js library not loaded');
                this.showToast('error', 'Dashboard Error', 'Could not load visualization library. Please check your internet connection and try again.');
                return;
            }
            
            // Set up dashboard filters
            this.setupDashboardFilters();
            
            // Create charts
            this.createIssueTypeChart();
            this.createIssueStatusChart();
            this.createIssueTimeChart();
            this.createAreaChart();
            
            // Generate insights
            this.generateDashboardInsights();
            
            // Set up export buttons
            this.setupExportButtons();
        },
        
        // Set up dashboard filters
        setupDashboardFilters: function() {
            const regionSelect = document.getElementById('dashboardRegion');
            const timeframeSelect = document.getElementById('dashboardTimeframe');
            const updateButton = document.getElementById('updateDashboardBtn');
            
            if (updateButton) {
                updateButton.addEventListener('click', () => {
                    // Update all charts and insights
                    this.createIssueTypeChart();
                    this.createIssueStatusChart();
                    this.createIssueTimeChart();
                    this.createAreaChart();
                    this.generateDashboardInsights();
                    
                    this.showToast('success', 'Dashboard Updated', 'Dashboard data has been refreshed with your filter settings.');
                });
            }
        },
        
        // Get filtered reports based on dashboard filters
        getDashboardFilteredReports: function() {
            const regionSelect = document.getElementById('dashboardRegion');
            const timeframeSelect = document.getElementById('dashboardTimeframe');
            
            let region = 'all';
            let timeframe = 'month';
            
            if (regionSelect) region = regionSelect.value;
            if (timeframeSelect) timeframe = timeframeSelect.value;
            
            // Filter by region
            let filteredReports = [...this.reports];
            if (region !== 'all') {
                filteredReports = filteredReports.filter(report => {
                    // This is a simplified example - in a real app, you would have more precise region data
                    if (region === 'north' && report.coordinates.lat > 9.0) return true;
                    if (region === 'south' && report.coordinates.lat < 9.0) return true;
                    if (region === 'lagos' && report.location.includes('Lagos')) return true;
                    if (region === 'abuja' && report.location.includes('Abuja')) return true;
                    if (region === 'portHarcourt' && report.location.includes('Port Harcourt')) return true;
                    if (region === 'kano' && report.location.includes('Kano')) return true;
                    return false;
                });
            }
            
            // Filter by timeframe
            const now = new Date();
            let cutoffDate = new Date();
            
            switch (timeframe) {
                case 'week':
                    cutoffDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    cutoffDate.setMonth(now.getMonth() - 1);
                    break;
                case 'quarter':
                    cutoffDate.setMonth(now.getMonth() - 3);
                    break;
                case 'year':
                    cutoffDate.setFullYear(now.getFullYear() - 1);
                    break;
                case 'all':
                    cutoffDate = new Date(0); // Beginning of time
                    break;
            }
            
            if (timeframe !== 'all') {
                filteredReports = filteredReports.filter(report => {
                    const reportDate = new Date(report.date);
                    return reportDate >= cutoffDate;
                });
            }
            
            return filteredReports;
        },
        
        // Create chart showing issues by type
        createIssueTypeChart: function() {
            const chartCanvas = document.getElementById('issueTypeChart');
            if (!chartCanvas) return;
            
            // Get filtered reports
            const filteredReports = this.getDashboardFilteredReports();
            
            // Count issues by type
            const issueTypes = ['waste', 'pollution', 'deforestation', 'flooding', 'erosion', 'oilSpill', 'other'];
            const typeCounts = {};
            
            issueTypes.forEach(type => {
                typeCounts[type] = filteredReports.filter(report => report.type === type).length;
            });
            
            // Define colors for each type
            const typeColors = {
                waste: '#FF5722',      // Deep Orange
                pollution: '#9C27B0',  // Purple
                deforestation: '#795548', // Brown
                flooding: '#2196F3',   // Blue
                erosion: '#FF9800',    // Orange
                oilSpill: '#000000',   // Black
                other: '#607D8B'       // Blue Grey
            };
            
            // Prepare data for chart
            const data = {
                labels: issueTypes.map(type => this.capitalizeFirstLetter(type)),
                datasets: [{
                    data: issueTypes.map(type => typeCounts[type]),
                    backgroundColor: issueTypes.map(type => typeColors[type]),
                    borderWidth: 0
                }]
            };
            
            // Chart configuration
            const config = {
                type: 'pie',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                font: {
                                    family: "'Nunito', sans-serif"
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            };
            
            // Destroy previous chart if it exists
            if (this.issueTypeChart) {
                this.issueTypeChart.destroy();
            }
            
            // Create new chart
            this.issueTypeChart = new Chart(chartCanvas, config);
        },
        
        // Create chart showing issues by status
        createIssueStatusChart: function() {
            const chartCanvas = document.getElementById('issueStatusChart');
            if (!chartCanvas) return;
            
            // Get filtered reports
            const filteredReports = this.getDashboardFilteredReports();
            
            // Count issues by status
            const reportedCount = filteredReports.filter(report => report.status === 'reported').length;
            const inProgressCount = filteredReports.filter(report => report.status === 'inProgress').length;
            const resolvedCount = filteredReports.filter(report => report.status === 'resolved').length;
            
            // Prepare data for chart
            const data = {
                labels: ['Reported', 'In Progress', 'Resolved'],
                datasets: [{
                    data: [reportedCount, inProgressCount, resolvedCount],
                    backgroundColor: ['#FF9800', '#2196F3', '#4CAF50'],
                    borderWidth: 0
                }]
            };
            
            // Chart configuration
            const config = {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                font: {
                                    family: "'Nunito', sans-serif"
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            };
            
            // Destroy previous chart if it exists
            if (this.issueStatusChart) {
                this.issueStatusChart.destroy();
            }
            
            // Create new chart
            this.issueStatusChart = new Chart(chartCanvas, config);
        },
        
        // Create chart showing issues over time
        createIssueTimeChart: function() {
            const chartCanvas = document.getElementById('issueTimeChart');
            if (!chartCanvas) return;
            
            // Get filtered reports
            const filteredReports = this.getDashboardFilteredReports();
            
            // Group reports by date
            const reportsByDate = {};
            filteredReports.forEach(report => {
                const date = report.date;
                if (!reportsByDate[date]) {
                    reportsByDate[date] = 0;
                }
                reportsByDate[date]++;
            });
            
            // Sort dates
            const sortedDates = Object.keys(reportsByDate).sort();
            
            // Prepare data for chart
            const data = {
                labels: sortedDates.map(date => {
                    const d = new Date(date);
                    return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
                }),
                datasets: [{
                    label: 'Number of Reports',
                    data: sortedDates.map(date => reportsByDate[date]),
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    borderColor: '#4CAF50',
                    borderWidth: 2,
                    tension: 0.3,
                    pointBackgroundColor: '#4CAF50'
                }]
            };
            
            // Chart configuration
            const config = {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            };
            
            // Destroy previous chart if it exists
            if (this.issueTimeChart) {
                this.issueTimeChart.destroy();
            }
            
            // Create new chart
            this.issueTimeChart = new Chart(chartCanvas, config);
        },
        
        // Create chart showing top affected areas
        createAreaChart: function() {
            const chartCanvas = document.getElementById('areaChart');
            if (!chartCanvas) return;
            
            // Get filtered reports
            const filteredReports = this.getDashboardFilteredReports();
            
            // Group reports by location
            const reportsByLocation = {};
            filteredReports.forEach(report => {
                // Extract city/area from location
                const locationParts = report.location.split(',');
                const area = locationParts[0].trim();
                
                if (!reportsByLocation[area]) {
                    reportsByLocation[area] = 0;
                }
                reportsByLocation[area]++;
            });
            
            // Sort locations by number of reports (descending)
            const sortedLocations = Object.keys(reportsByLocation).sort((a, b) => {
                return reportsByLocation[b] - reportsByLocation[a];
            });
            
            // Take top 10 locations
            const topLocations = sortedLocations.slice(0, 10);
            
            // Prepare data for chart
            const data = {
                labels: topLocations,
                datasets: [{
                    label: 'Number of Reports',
                    data: topLocations.map(location => reportsByLocation[location]),
                    backgroundColor: '#FFC107',
                    borderColor: '#FFA000',
                    borderWidth: 1
                }]
            };
            
            // Chart configuration
            const config = {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            };
            
            // Destroy previous chart if it exists
            if (this.areaChart) {
                this.areaChart.destroy();
            }
            
            // Create new chart
            this.areaChart = new Chart(chartCanvas, config);
        },
        
        // Generate insights based on dashboard data
        generateDashboardInsights: function() {
            const insightsContainer = document.getElementById('dashboardInsights');
            if (!insightsContainer) return;
            
            // Get filtered reports
            const filteredReports = this.getDashboardFilteredReports();
            
            // Clear previous insights
            insightsContainer.innerHTML = '';
            
            // If no reports, show message
            if (filteredReports.length === 0) {
                insightsContainer.innerHTML = '<p>No data available for the selected filters.</p>';
                return;
            }
            
            // Generate insights
            const insights = [];
            
            // 1. Most common issue type
            const typeCounts = {};
            filteredReports.forEach(report => {
                if (!typeCounts[report.type]) {
                    typeCounts[report.type] = 0;
                }
                typeCounts[report.type]++;
            });
            
            const mostCommonType = Object.keys(typeCounts).reduce((a, b) => {
                return typeCounts[a] > typeCounts[b] ? a : b;
            });
            
            insights.push({
                title: 'Most Reported Issue',
                content: `${this.capitalizeFirstLetter(mostCommonType)} is the most reported environmental issue, accounting for ${Math.round((typeCounts[mostCommonType] / filteredReports.length) * 100)}% of all reports.`
            });
            
            // 2. Resolution rate
            const resolvedCount = filteredReports.filter(report => report.status === 'resolved').length;
            const resolutionRate = Math.round((resolvedCount / filteredReports.length) * 100);
            
            insights.push({
                title: 'Resolution Rate',
                content: `${resolutionRate}% of reported issues have been resolved. ${100 - resolutionRate}% are still pending or in progress.`
            });
            
            // 3. Severity analysis
            const averageSeverity = filteredReports.reduce((sum, report) => sum + report.severity, 0) / filteredReports.length;
            const highSeverityCount = filteredReports.filter(report => report.severity >= 4).length;
            const highSeverityPercentage = Math.round((highSeverityCount / filteredReports.length) * 100);
            
            insights.push({
                title: 'Severity Analysis',
                content: `Average severity rating is ${averageSeverity.toFixed(1)} out of 5. ${highSeverityPercentage}% of issues are rated as high severity (4-5).`
            });
            
            // 4. Reporting trends
            const dates = filteredReports.map(report => new Date(report.date));
            const latestDate = new Date(Math.max.apply(null, dates));
            const earliestDate = new Date(Math.min.apply(null, dates));
            
            const daysDifference = Math.round((latestDate - earliestDate) / (1000 * 60 * 60 * 24));
            const reportsPerDay = daysDifference > 0 ? (filteredReports.length / daysDifference).toFixed(1) : filteredReports.length;
            
            insights.push({
                title: 'Reporting Trends',
                content: `An average of ${reportsPerDay} environmental issues are reported daily. Community engagement is key to addressing these challenges.`
            });
            
            // 5. Geographic hotspots
            const locationCounts = {};
            filteredReports.forEach(report => {
                // Extract city/area from location
                const locationParts = report.location.split(',');
                const area = locationParts[0].trim();
                
                if (!locationCounts[area]) {
                    locationCounts[area] = 0;
                }
                locationCounts[area]++;
            });
            
            const topLocation = Object.keys(locationCounts).reduce((a, b) => {
                return locationCounts[a] > locationCounts[b] ? a : b;
            });
            
            insights.push({
                title: 'Geographic Hotspots',
                content: `${topLocation} has the highest concentration of environmental issues with ${locationCounts[topLocation]} reports. Targeted interventions may be needed in this area.`
            });
            
            // Add insights to container
            insights.forEach(insight => {
                const insightCard = document.createElement('div');
                insightCard.className = 'insight-card';
                insightCard.innerHTML = `
                    <h4>${insight.title}</h4>
                    <p>${insight.content}</p>
                `;
                insightsContainer.appendChild(insightCard);
            });
        },
        
        // Set up export buttons
        setupExportButtons: function() {
            // Export as CSV
            const exportCsvBtn = document.getElementById('exportCsvBtn');
            if (exportCsvBtn) {
                exportCsvBtn.addEventListener('click', () => {
                    this.exportReportsAsCSV();
                });
            }
            
            // Export as PDF
            const exportPdfBtn = document.getElementById('exportPdfBtn');
            if (exportPdfBtn) {
                exportPdfBtn.addEventListener('click', () => {
                    this.exportDashboardAsPDF();
                });
            }
            
            // Export charts as images
            const exportImageBtn = document.getElementById('exportImageBtn');
            if (exportImageBtn) {
                exportImageBtn.addEventListener('click', () => {
                    this.exportChartsAsImages();
                });
            }
        },
        
        // Export reports as CSV
        exportReportsAsCSV: function() {
            // Get filtered reports
            const filteredReports = this.getDashboardFilteredReports();
            
            // If no reports, show message
            if (filteredReports.length === 0) {
                this.showToast('error', 'Export Failed', 'No data available to export.');
                return;
            }
            
            // Create CSV content
            let csvContent = 'data:text/csv;charset=utf-8,';
            
            // Add headers
            csvContent += 'ID,Type,Title,Description,Location,Latitude,Longitude,Severity,Status,Date,Upvotes,Comments,Reporter\n';
            
            // Add data rows
            filteredReports.forEach(report => {
                csvContent += `${report.id},${report.type},"${report.title.replace(/"/g, '""')}","${report.description.replace(/"/g, '""')}","${report.location.replace(/"/g, '""')}",${report.coordinates.lat},${report.coordinates.lng},${report.severity},${report.status},${report.date},${report.upvotes},${report.comments},"${report.reporter.replace(/"/g, '""')}"\n`;
            });
            
            // Create download link
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'ecoreport_data.csv');
            document.body.appendChild(link);
            
            // Trigger download
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            
            this.showToast('success', 'Export Successful', 'Report data has been exported as CSV.');
        },
        
        // Export dashboard as PDF (mock implementation)
        exportDashboardAsPDF: function() {
            // In a real app, this would use a library like jsPDF to generate a PDF
            this.showToast('info', 'Export PDF', 'This feature would generate a PDF of the dashboard in a real application.');
        },
        
        // Export charts as images (mock implementation)
        exportChartsAsImages: function() {
            // In a real app, this would use Chart.js toBase64Image() method to export charts
            this.showToast('info', 'Export Charts', 'This feature would export the charts as images in a real application.');
        }
    });
});