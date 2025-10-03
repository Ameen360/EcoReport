/**
 * EcoReport - Community Functionality
 * Handles community features including events, petitions, and volunteer management
 */

document.addEventListener('DOMContentLoaded', () => {
    // Add community functionality to the EcoReport object
    Object.assign(EcoReport, {
        // Initialize community content
        loadCommunityContent: function() {
            console.log('Loading community content...');
            
            // Set up tab navigation
            this.setupCommunityTabs();
            
            // Load events
            this.loadEvents();
            
            // Load petitions
            this.loadPetitions();
            
            // Set up volunteer form
            this.setupVolunteerForm();
            
            // Set up event creation button
            document.getElementById('createEventBtn')?.addEventListener('click', () => {
                this.showCreateEventForm();
            });
            
            // Set up petition creation button
            document.getElementById('createPetitionBtn')?.addEventListener('click', () => {
                this.showCreatePetitionForm();
            });
        },
        
        // Set up community tabs
        setupCommunityTabs: function() {
            const tabButtons = document.querySelectorAll('.community-tabs .tab-btn');
            const tabPanes = document.querySelectorAll('.tab-content .tab-pane');
            
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Remove active class from all buttons and panes
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabPanes.forEach(pane => pane.classList.remove('active'));
                    
                    // Add active class to clicked button
                    button.classList.add('active');
                    
                    // Show corresponding tab pane
                    const tabId = button.getAttribute('data-tab');
                    document.getElementById(tabId)?.classList.add('active');
                });
            });
        },
        
        // Load events
        loadEvents: function() {
            const eventsContainer = document.getElementById('eventsContainer');
            if (!eventsContainer) return;
            
            // Clear container
            eventsContainer.innerHTML = '';
            
            // Sort events by date (upcoming first)
            const sortedEvents = [...this.events].sort((a, b) => {
                return new Date(a.date) - new Date(b.date);
            });
            
            // Filter out past events
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const upcomingEvents = sortedEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= today;
            });
            
            // If no upcoming events, show message
            if (upcomingEvents.length === 0) {
                eventsContainer.innerHTML = `
                    <div class="empty-state">
                        <img src="images/empty-events.svg" alt="No Events">
                        <h4>No Upcoming Events</h4>
                        <p>There are no upcoming cleanup events scheduled at the moment.</p>
                        <button class="btn btn-primary" id="createFirstEventBtn">Create First Event</button>
                    </div>
                `;
                
                // Add event listener to create first event button
                document.getElementById('createFirstEventBtn')?.addEventListener('click', () => {
                    this.showCreateEventForm();
                });
                
                return;
            }
            
            // Create event cards
            upcomingEvents.forEach(event => {
                const eventCard = document.createElement('div');
                eventCard.className = 'event-card';
                
                // Format date
                const eventDate = new Date(event.date);
                const formattedDate = eventDate.toLocaleDateString('en-NG', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                eventCard.innerHTML = `
                    <div class="event-image">
                        <img src="${event.image || 'images/events/default-event.jpg'}" alt="${event.title}">
                    </div>
                    <div class="event-content">
                        <div class="event-date">
                            <img src="images/calendar-icon.svg" alt="Date">
                            <span>${formattedDate} at ${event.time}</span>
                        </div>
                        <h4 class="event-title">${event.title}</h4>
                        <div class="event-location">
                            <img src="images/location-icon.svg" alt="Location">
                            <span>${event.location}</span>
                        </div>
                        <p>${this.truncateText(event.description, 120)}</p>
                        <div class="event-participants">
                            <img src="images/users-icon.svg" alt="Participants">
                            <span>${event.participants} participants</span>
                        </div>
                        <div class="event-actions">
                            <button class="btn btn-primary join-event-btn" data-event-id="${event.id}">Join Event</button>
                            <button class="btn btn-outline view-event-btn" data-event-id="${event.id}">View Details</button>
                        </div>
                    </div>
                `;
                
                // Add event listeners
                eventCard.querySelector('.join-event-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.joinEvent(event.id);
                });
                
                eventCard.querySelector('.view-event-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showEventDetails(event.id);
                });
                
                eventsContainer.appendChild(eventCard);
            });
        },
        
        // Join an event
        joinEvent: function(eventId) {
            // Find the event
            const event = this.events.find(e => e.id === eventId);
            if (!event) return;
            
            // Check if user is logged in
            if (!this.user) {
                this.showToast('info', 'Login Required', 'Please log in to join this event.');
                this.openModal('loginModal');
                return;
            }
            
            this.showLoading();
            
            // Simulate API call delay
            setTimeout(() => {
                // Increment participant count
                event.participants++;
                
                // Update UI
                document.querySelectorAll(`.event-participants span`).forEach(span => {
                    if (span.closest('.event-card').querySelector(`.join-event-btn[data-event-id="${eventId}"]`)) {
                        span.textContent = `${event.participants} participants`;
                    }
                });
                
                // Show success message
                this.hideLoading();
                this.showToast('success', 'Joined Event', `You have successfully joined "${event.title}". We'll send you a reminder as the date approaches.`);
                
                // Change button text
                document.querySelectorAll(`.join-event-btn[data-event-id="${eventId}"]`).forEach(btn => {
                    btn.textContent = 'Joined';
                    btn.disabled = true;
                });
            }, 1000);
        },
        
        // Show event details
        showEventDetails: function(eventId) {
            // Find the event
            const event = this.events.find(e => e.id === eventId);
            if (!event) return;
            
            // Create modal content
            const modalContent = `
                <div class="event-detail-modal">
                    <div class="event-detail-image">
                        <img src="${event.image || 'images/events/default-event.jpg'}" alt="${event.title}">
                    </div>
                    <div class="event-detail-content">
                        <h3>${event.title}</h3>
                        <div class="event-detail-meta">
                            <div class="event-detail-item">
                                <img src="images/calendar-icon.svg" alt="Date">
                                <span><strong>Date & Time:</strong> ${new Date(event.date).toLocaleDateString('en-NG', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })} at ${event.time}</span>
                            </div>
                            <div class="event-detail-item">
                                <img src="images/location-icon.svg" alt="Location">
                                <span><strong>Location:</strong> ${event.location}</span>
                            </div>
                            <div class="event-detail-item">
                                <img src="images/users-icon.svg" alt="Participants">
                                <span><strong>Participants:</strong> ${event.participants} people are joining</span>
                            </div>
                            <div class="event-detail-item">
                                <img src="images/user-icon.svg" alt="Organizer">
                                <span><strong>Organized by:</strong> ${event.organizer}</span>
                            </div>
                        </div>
                        <div class="event-detail-description">
                            <h4>About This Event</h4>
                            <p>${event.description}</p>
                        </div>
                        <div class="event-detail-map" id="eventDetailMap" data-lat="6.5244" data-lng="3.3792">
                            <!-- Map will be initialized here -->
                        </div>
                        <div class="event-detail-what-to-bring">
                            <h4>What to Bring</h4>
                            <ul>
                                <li>Reusable water bottle</li>
                                <li>Comfortable clothes and closed-toe shoes</li>
                                <li>Sun protection (hat, sunscreen)</li>
                                <li>Work gloves (if you have them)</li>
                                <li>Positive attitude and energy!</li>
                            </ul>
                        </div>
                        <div class="event-detail-actions">
                            <button class="btn btn-primary join-event-btn" data-event-id="${event.id}">Join This Event</button>
                            <button class="btn btn-outline share-event-btn">Share Event</button>
                            <button class="btn btn-outline add-calendar-btn">Add to Calendar</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'eventDetailModal';
            
            modal.innerHTML = `
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h3>Event Details</h3>
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
            
            // Join event button
            modal.querySelector('.join-event-btn').addEventListener('click', () => {
                this.joinEvent(event.id);
            });
            
            // Share event button (mock implementation)
            modal.querySelector('.share-event-btn').addEventListener('click', () => {
                this.showToast('info', 'Share Event', 'Sharing functionality would be implemented in a real application.');
            });
            
            // Add to calendar button (mock implementation)
            modal.querySelector('.add-calendar-btn').addEventListener('click', () => {
                this.showToast('info', 'Add to Calendar', 'Calendar integration would be implemented in a real application.');
            });
            
            // Show modal
            modal.classList.add('active');
            
            // Initialize map in the modal after it's visible
            setTimeout(() => {
                const mapElement = document.getElementById('eventDetailMap');
                if (mapElement && typeof L !== 'undefined') {
                    // Use event location coordinates if available, otherwise use mock coordinates
                    const lat = event.coordinates?.lat || parseFloat(mapElement.getAttribute('data-lat'));
                    const lng = event.coordinates?.lng || parseFloat(mapElement.getAttribute('data-lng'));
                    
                    const map = L.map(mapElement).setView([lat, lng], 15);
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(map);
                    
                    L.marker([lat, lng]).addTo(map)
                        .bindPopup(event.title)
                        .openPopup();
                }
            }, 300);
        },
        
        // Show create event form (mock implementation)
        showCreateEventForm: function() {
            // Check if user is logged in
            if (!this.user) {
                this.showToast('info', 'Login Required', 'Please log in to create an event.');
                this.openModal('loginModal');
                return;
            }
            
            // Create modal content
            const modalContent = `
                <form id="createEventForm" class="create-event-form">
                    <div class="form-group">
                        <label for="eventTitle">Event Title</label>
                        <input type="text" id="eventTitle" placeholder="Enter a descriptive title" required>
                    </div>
                    <div class="form-group">
                        <label for="eventDescription">Description</label>
                        <textarea id="eventDescription" placeholder="Describe the event, its purpose, and what participants should expect" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="eventDate">Date</label>
                        <input type="date" id="eventDate" required>
                    </div>
                    <div class="form-group">
                        <label for="eventTime">Time</label>
                        <input type="time" id="eventTime" required>
                    </div>
                    <div class="form-group">
                        <label for="eventLocation">Location</label>
                        <input type="text" id="eventLocation" placeholder="Enter the event location" required>
                    </div>
                    <div class="form-group">
                        <label for="eventImage">Event Image</label>
                        <div class="file-upload">
                            <input type="file" id="eventImage" accept="image/*">
                            <label for="eventImage" class="file-upload-label">
                                <img src="images/upload-icon.svg" alt="Upload">
                                <span>Choose file or drag & drop</span>
                            </label>
                        </div>
                        <div id="eventImagePreview" class="image-preview"></div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" id="cancelCreateEventBtn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Event</button>
                    </div>
                </form>
            `;
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'createEventModal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Create Cleanup Event</h3>
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
            modal.querySelector('#cancelCreateEventBtn').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            // Handle form submission
            modal.querySelector('#createEventForm').addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Get form values
                const title = document.getElementById('eventTitle').value;
                const description = document.getElementById('eventDescription').value;
                const date = document.getElementById('eventDate').value;
                const time = document.getElementById('eventTime').value;
                const location = document.getElementById('eventLocation').value;
                
                // Validate form
                if (!title || !description || !date || !time || !location) {
                    this.showToast('error', 'Incomplete Form', 'Please fill in all required fields.');
                    return;
                }
                
                this.showLoading();
                
                // Simulate API call delay
                setTimeout(() => {
                    // Create new event
                    const newEvent = {
                        id: 'e' + (this.events.length + 1),
                        title: title,
                        description: description,
                        date: date,
                        time: time,
                        location: location,
                        image: 'images/events/default-event.jpg', // In a real app, this would be uploaded
                        organizer: this.user.name,
                        participants: 1 // Creator is the first participant
                    };
                    
                    // Add to events array
                    this.events.push(newEvent);
                    
                    // Update stats
                    this.stats.eventCount++;
                    this.updateStats();
                    
                    // Reload events
                    this.loadEvents();
                    
                    // Close modal
                    document.body.removeChild(modal);
                    
                    // Show success message
                    this.hideLoading();
                    this.showToast('success', 'Event Created', 'Your cleanup event has been created successfully.');
                }, 1500);
            });
            
            // Handle image upload preview
            const imageInput = document.getElementById('eventImage');
            const imagePreview = document.getElementById('eventImagePreview');
            
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
                            img.alt = 'Event Preview';
                            imagePreview.appendChild(img);
                        };
                        
                        reader.readAsDataURL(file);
                    }
                });
            }
            
            // Show modal
            modal.classList.add('active');
            
            // Set default date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('eventDate').value = tomorrow.toISOString().split('T')[0];
            
            // Set default time
            document.getElementById('eventTime').value = '09:00';
        },
        
        // Load petitions
        loadPetitions: function() {
            const petitionsContainer = document.getElementById('petitionsContainer');
            if (!petitionsContainer) return;
            
            // Clear container
            petitionsContainer.innerHTML = '';
            
            // If no petitions, show message
            if (this.petitions.length === 0) {
                petitionsContainer.innerHTML = `
                    <div class="empty-state">
                        <img src="images/empty-petitions.svg" alt="No Petitions">
                        <h4>No Active Petitions</h4>
                        <p>There are no active petitions at the moment.</p>
                        <button class="btn btn-primary" id="createFirstPetitionBtn">Start First Petition</button>
                    </div>
                `;
                
                // Add event listener to create first petition button
                document.getElementById('createFirstPetitionBtn')?.addEventListener('click', () => {
                    this.showCreatePetitionForm();
                });
                
                return;
            }
            
            // Create petition cards
            this.petitions.forEach(petition => {
                const petitionCard = document.createElement('div');
                petitionCard.className = 'petition-card';
                
                // Calculate progress percentage
                const progressPercentage = Math.min(Math.round((petition.signatures / petition.goal) * 100), 100);
                
                petitionCard.innerHTML = `
                    <div class="petition-image">
                        <img src="${petition.image || 'images/petitions/default-petition.jpg'}" alt="${petition.title}">
                    </div>
                    <div class="petition-content">
                        <h4 class="petition-title">${petition.title}</h4>
                        <div class="petition-target">
                            <strong>Target:</strong> ${petition.target}
                        </div>
                        <p>${this.truncateText(petition.description, 120)}</p>
                        <div class="petition-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                            </div>
                            <div class="progress-text">
                                <span>${petition.signatures.toLocaleString()} signatures</span>
                                <span>Goal: ${petition.goal.toLocaleString()}</span>
                            </div>
                        </div>
                        <div class="petition-actions">
                            <button class="btn btn-primary sign-petition-btn" data-petition-id="${petition.id}">Sign Petition</button>
                            <button class="btn btn-outline view-petition-btn" data-petition-id="${petition.id}">View Details</button>
                        </div>
                    </div>
                `;
                
                // Add event listeners
                petitionCard.querySelector('.sign-petition-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.signPetition(petition.id);
                });
                
                petitionCard.querySelector('.view-petition-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showPetitionDetails(petition.id);
                });
                
                petitionsContainer.appendChild(petitionCard);
            });
        },
        
        // Sign a petition
        signPetition: function(petitionId) {
            // Find the petition
            const petition = this.petitions.find(p => p.id === petitionId);
            if (!petition) return;
            
            // Check if user is logged in
            if (!this.user) {
                this.showToast('info', 'Login Required', 'Please log in to sign this petition.');
                this.openModal('loginModal');
                return;
            }
            
            this.showLoading();
            
            // Simulate API call delay
            setTimeout(() => {
                // Increment signature count
                petition.signatures++;
                
                // Calculate new progress percentage
                const progressPercentage = Math.min(Math.round((petition.signatures / petition.goal) * 100), 100);
                
                // Update UI
                document.querySelectorAll(`.petition-progress`).forEach(progress => {
                    if (progress.closest('.petition-card').querySelector(`.sign-petition-btn[data-petition-id="${petitionId}"]`)) {
                        progress.querySelector('.progress-fill').style.width = `${progressPercentage}%`;
                        progress.querySelector('.progress-text span:first-child').textContent = `${petition.signatures.toLocaleString()} signatures`;
                    }
                });
                
                // Show success message
                this.hideLoading();
                this.showToast('success', 'Petition Signed', `Thank you for signing "${petition.title}". Your voice matters!`);
                
                // Change button text
                document.querySelectorAll(`.sign-petition-btn[data-petition-id="${petitionId}"]`).forEach(btn => {
                    btn.textContent = 'Signed';
                    btn.disabled = true;
                });
            }, 1000);
        },
        
        // Show petition details
        showPetitionDetails: function(petitionId) {
            // Find the petition
            const petition = this.petitions.find(p => p.id === petitionId);
            if (!petition) return;
            
            // Calculate progress percentage
            const progressPercentage = Math.min(Math.round((petition.signatures / petition.goal) * 100), 100);
            
            // Create modal content
            const modalContent = `
                <div class="petition-detail-modal">
                    <div class="petition-detail-image">
                        <img src="${petition.image || 'images/petitions/default-petition.jpg'}" alt="${petition.title}">
                    </div>
                    <div class="petition-detail-content">
                        <h3>${petition.title}</h3>
                        <div class="petition-detail-target">
                            <strong>Target:</strong> ${petition.target}
                        </div>
                        <div class="petition-detail-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                            </div>
                            <div class="progress-text">
                                <span>${petition.signatures.toLocaleString()} signatures</span>
                                <span>Goal: ${petition.goal.toLocaleString()}</span>
                            </div>
                        </div>
                        <div class="petition-detail-description">
                            <h4>About This Petition</h4>
                            <p>${petition.description}</p>
                        </div>
                        <div class="petition-detail-why">
                            <h4>Why This Is Important</h4>
                            <p>Environmental issues like this affect our communities directly. By signing this petition, you're helping to create awareness and pressure decision-makers to take action. Every signature brings us closer to a cleaner, healthier environment for all Nigerians.</p>
                        </div>
                        <div class="petition-detail-actions">
                            <button class="btn btn-primary sign-petition-btn" data-petition-id="${petition.id}">Sign This Petition</button>
                            <button class="btn btn-outline share-petition-btn">Share Petition</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'petitionDetailModal';
            
            modal.innerHTML = `
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h3>Petition Details</h3>
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
            
            // Sign petition button
            modal.querySelector('.sign-petition-btn').addEventListener('click', () => {
                this.signPetition(petition.id);
                
                // Update button in modal
                modal.querySelector('.sign-petition-btn').textContent = 'Signed';
                modal.querySelector('.sign-petition-btn').disabled = true;
            });
            
            // Share petition button (mock implementation)
            modal.querySelector('.share-petition-btn').addEventListener('click', () => {
                this.showToast('info', 'Share Petition', 'Sharing functionality would be implemented in a real application.');
            });
            
            // Show modal
            modal.classList.add('active');
        },
        
        // Show create petition form (mock implementation)
        showCreatePetitionForm: function() {
            // Check if user is logged in
            if (!this.user) {
                this.showToast('info', 'Login Required', 'Please log in to create a petition.');
                this.openModal('loginModal');
                return;
            }
            
            // Create modal content
            const modalContent = `
                <form id="createPetitionForm" class="create-petition-form">
                    <div class="form-group">
                        <label for="petitionTitle">Petition Title</label>
                        <input type="text" id="petitionTitle" placeholder="Enter a clear, specific title" required>
                    </div>
                    <div class="form-group">
                        <label for="petitionTarget">Target</label>
                        <input type="text" id="petitionTarget" placeholder="Who is this petition addressed to?" required>
                    </div>
                    <div class="form-group">
                        <label for="petitionDescription">Description</label>
                        <textarea id="petitionDescription" placeholder="Explain the issue and what change you want to see" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="petitionGoal">Signature Goal</label>
                        <input type="number" id="petitionGoal" min="100" step="100" value="1000" required>
                    </div>
                    <div class="form-group">
                        <label for="petitionImage">Petition Image</label>
                        <div class="file-upload">
                            <input type="file" id="petitionImage" accept="image/*">
                            <label for="petitionImage" class="file-upload-label">
                                <img src="images/upload-icon.svg" alt="Upload">
                                <span>Choose file or drag & drop</span>
                            </label>
                        </div>
                        <div id="petitionImagePreview" class="image-preview"></div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" id="cancelCreatePetitionBtn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Petition</button>
                    </div>
                </form>
            `;
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'createPetitionModal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Start a Petition</h3>
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
            modal.querySelector('#cancelCreatePetitionBtn').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            // Handle form submission
            modal.querySelector('#createPetitionForm').addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Get form values
                const title = document.getElementById('petitionTitle').value;
                const target = document.getElementById('petitionTarget').value;
                const description = document.getElementById('petitionDescription').value;
                const goal = parseInt(document.getElementById('petitionGoal').value);
                
                // Validate form
                if (!title || !target || !description || isNaN(goal) || goal < 100) {
                    this.showToast('error', 'Incomplete Form', 'Please fill in all required fields with valid values.');
                    return;
                }
                
                this.showLoading();
                
                // Simulate API call delay
                setTimeout(() => {
                    // Create new petition
                    const newPetition = {
                        id: 'p' + (this.petitions.length + 1),
                        title: title,
                        target: target,
                        description: description,
                        goal: goal,
                        signatures: 1, // Creator is the first signer
                        image: 'images/petitions/default-petition.jpg' // In a real app, this would be uploaded
                    };
                    
                    // Add to petitions array
                    this.petitions.push(newPetition);
                    
                    // Reload petitions
                    this.loadPetitions();
                    
                    // Close modal
                    document.body.removeChild(modal);
                    
                    // Show success message
                    this.hideLoading();
                    this.showToast('success', 'Petition Created', 'Your petition has been created successfully.');
                }, 1500);
            });
            
            // Handle image upload preview
            const imageInput = document.getElementById('petitionImage');
            const imagePreview = document.getElementById('petitionImagePreview');
            
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
                            img.alt = 'Petition Preview';
                            imagePreview.appendChild(img);
                        };
                        
                        reader.readAsDataURL(file);
                    }
                });
            }
            
            // Show modal
            modal.classList.add('active');
        },
        
        // Set up volunteer form
        setupVolunteerForm: function() {
            const volunteerForm = document.getElementById('volunteerForm');
            if (!volunteerForm) return;
            
            volunteerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Get form values
                const name = document.getElementById('volunteerName').value;
                const email = document.getElementById('volunteerEmail').value;
                const phone = document.getElementById('volunteerPhone').value;
                const location = document.getElementById('volunteerLocation').value;
                
                // Validate form
                if (!name || !email || !phone || !location) {
                    this.showToast('error', 'Incomplete Form', 'Please fill in all required fields.');
                    return;
                }
                
                this.showLoading();
                
                // Simulate API call delay
                setTimeout(() => {
                    // In a real app, this would send the data to a server
                    
                    // Show success message
                    this.hideLoading();
                    this.showToast('success', 'Volunteer Registration', 'Thank you for registering as a volunteer! We will contact you soon with opportunities to help.');
                    
                    // Reset form
                    volunteerForm.reset();
                    
                    // Update community count
                    this.stats.communityCount++;
                    this.updateStats();
                }, 1500);
            });
        }
    });
});