/**
 * EcoReport - Authentication Functionality
 * Handles user authentication, registration, and profile management
 */

document.addEventListener('DOMContentLoaded', () => {
    // Add authentication functionality to the EcoReport object
    Object.assign(EcoReport, {
        // Initialize authentication
        initAuth: function() {
            console.log('Initializing authentication...');
            
            // Check for existing session
            this.checkAuthSession();
            
            // Set up login form
            this.setupLoginForm();
            
            // Set up signup form
            this.setupSignupForm();
            
            // Set up logout functionality
            this.setupLogout();
            
            // Set up password reset
            this.setupPasswordReset();
            
            // Set up profile management
            this.setupProfileManagement();
        },
        
        // Check for existing authentication session
        checkAuthSession: function() {
            // In a real app, this would check for a valid token in localStorage or cookies
            // and validate it with the server
            
            const savedUser = localStorage.getItem('ecoReportUser');
            if (savedUser) {
                try {
                    this.user = JSON.parse(savedUser);
                    this.updateUserUI();
                    console.log('User session restored:', this.user.name);
                } catch (error) {
                    console.error('Error parsing saved user data:', error);
                    localStorage.removeItem('ecoReportUser');
                }
            }
        },
        
        // Set up login form
        setupLoginForm: function() {
            const loginForm = document.getElementById('loginForm');
            if (!loginForm) return;
            
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                
                // Validate inputs
                if (!email || !password) {
                    this.showToast('error', 'Login Failed', 'Please enter both email and password.');
                    return;
                }
                
                this.showLoading();
                
                // Simulate API call delay
                setTimeout(() => {
                    // In a real app, this would send credentials to a server for validation
                    // For this demo, we'll accept any valid-looking email and password
                    
                    if (this.validateEmail(email) && password.length >= 6) {
                        // Create user object
                        this.user = {
                            name: email.split('@')[0],
                            email: email,
                            avatar: 'images/default-avatar.png'
                        };
                        
                        // Save to localStorage (in a real app, we'd store a token instead)
                        localStorage.setItem('ecoReportUser', JSON.stringify(this.user));
                        
                        // Update UI
                        this.updateUserUI();
                        
                        // Close modal and show success message
                        this.closeAllModals();
                        this.hideLoading();
                        this.showToast('success', 'Login Successful', `Welcome back, ${this.user.name}!`);
                    } else {
                        // Show error message
                        this.hideLoading();
                        this.showToast('error', 'Login Failed', 'Invalid email or password. Please try again.');
                    }
                }, 1000);
            });
            
            // Forgot password link
            const forgotPasswordLink = loginForm.querySelector('.forgot-password');
            if (forgotPasswordLink) {
                forgotPasswordLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showPasswordResetForm();
                });
            }
            
            // Social login buttons (mock implementation)
            const socialButtons = loginForm.querySelectorAll('.btn-social');
            socialButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const provider = button.classList.contains('btn-google') ? 'Google' : 'Facebook';
                    
                    this.showLoading();
                    
                    // Simulate API call delay
                    setTimeout(() => {
                        // In a real app, this would redirect to the OAuth provider
                        
                        // For this demo, we'll create a mock user
                        this.user = {
                            name: provider === 'Google' ? 'Google User' : 'Facebook User',
                            email: `user@${provider.toLowerCase()}.example`,
                            avatar: 'images/default-avatar.png'
                        };
                        
                        // Save to localStorage
                        localStorage.setItem('ecoReportUser', JSON.stringify(this.user));
                        
                        // Update UI
                        this.updateUserUI();
                        
                        // Close modal and show success message
                        this.closeAllModals();
                        this.hideLoading();
                        this.showToast('success', 'Login Successful', `Welcome, ${this.user.name}!`);
                    }, 1500);
                });
            });
        },
        
        // Set up signup form
        setupSignupForm: function() {
            const signupForm = document.getElementById('signupForm');
            if (!signupForm) return;
            
            // Password strength meter
            const passwordInput = document.getElementById('signupPassword');
            const confirmPasswordInput = document.getElementById('signupConfirmPassword');
            const strengthMeter = signupForm.querySelector('.strength-meter');
            const strengthText = signupForm.querySelector('.strength-text');
            
            if (passwordInput && strengthMeter && strengthText) {
                passwordInput.addEventListener('input', () => {
                    this.updatePasswordStrength(passwordInput.value, strengthMeter, strengthText);
                });
            }
            
            // Password matching validation
            if (passwordInput && confirmPasswordInput) {
                confirmPasswordInput.addEventListener('input', () => {
                    if (passwordInput.value !== confirmPasswordInput.value) {
                        confirmPasswordInput.setCustomValidity("Passwords don't match");
                    } else {
                        confirmPasswordInput.setCustomValidity('');
                    }
                });
            }
            
            // Form submission
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const name = document.getElementById('signupName').value;
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPassword').value;
                const confirmPassword = document.getElementById('signupConfirmPassword').value;
                const termsAgreed = document.getElementById('termsAgree').checked;
                
                // Validate inputs
                if (!name || !email || !password || !confirmPassword) {
                    this.showToast('error', 'Signup Failed', 'Please fill in all required fields.');
                    return;
                }
                
                if (!this.validateEmail(email)) {
                    this.showToast('error', 'Signup Failed', 'Please enter a valid email address.');
                    return;
                }
                
                if (password !== confirmPassword) {
                    this.showToast('error', 'Signup Failed', 'Passwords do not match.');
                    return;
                }
                
                if (password.length < 8) {
                    this.showToast('error', 'Signup Failed', 'Password must be at least 8 characters long.');
                    return;
                }
                
                if (!termsAgreed) {
                    this.showToast('error', 'Signup Failed', 'You must agree to the Terms of Service and Privacy Policy.');
                    return;
                }
                
                this.showLoading();
                
                // Simulate API call delay
                setTimeout(() => {
                    // In a real app, this would send registration data to a server
                    
                    // Create user object
                    this.user = {
                        name: name,
                        email: email,
                        avatar: 'images/default-avatar.png'
                    };
                    
                    // Save to localStorage (in a real app, we'd store a token instead)
                    localStorage.setItem('ecoReportUser', JSON.stringify(this.user));
                    
                    // Update UI
                    this.updateUserUI();
                    
                    // Close modal and show success message
                    this.closeAllModals();
                    this.hideLoading();
                    this.showToast('success', 'Signup Successful', `Welcome to EcoReport, ${this.user.name}!`);
                }, 1500);
            });
            
            // Social signup buttons (mock implementation)
            const socialButtons = signupForm.querySelectorAll('.btn-social');
            socialButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const provider = button.classList.contains('btn-google') ? 'Google' : 'Facebook';
                    
                    this.showLoading();
                    
                    // Simulate API call delay
                    setTimeout(() => {
                        // In a real app, this would redirect to the OAuth provider
                        
                        // For this demo, we'll create a mock user
                        this.user = {
                            name: provider === 'Google' ? 'Google User' : 'Facebook User',
                            email: `user@${provider.toLowerCase()}.example`,
                            avatar: 'images/default-avatar.png'
                        };
                        
                        // Save to localStorage
                        localStorage.setItem('ecoReportUser', JSON.stringify(this.user));
                        
                        // Update UI
                        this.updateUserUI();
                        
                        // Close modal and show success message
                        this.closeAllModals();
                        this.hideLoading();
                        this.showToast('success', 'Signup Successful', `Welcome to EcoReport, ${this.user.name}!`);
                    }, 1500);
                });
            });
        },
        
        // Update password strength indicator
        updatePasswordStrength: function(password, strengthMeter, strengthText) {
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
        
        // Set up logout functionality
        setupLogout: function() {
            const logoutBtn = document.getElementById('logoutBtn');
            if (!logoutBtn) return;
            
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        },
        
        // Logout user
        logout: function() {
            // Clear user data
            this.user = null;
            
            // Remove from localStorage
            localStorage.removeItem('ecoReportUser');
            
            // Update UI
            this.updateUserUI();
            
            // Show message
            this.showToast('info', 'Logged Out', 'You have been successfully logged out.');
        },
        
        // Update user UI elements
        updateUserUI: function() {
            if (this.user) {
                // Hide login/signup buttons
                document.getElementById('loginBtn')?.classList.add('hidden');
                document.getElementById('signupBtn')?.classList.add('hidden');
                
                // Show user profile
                const userProfile = document.querySelector('.user-profile');
                if (userProfile) {
                    userProfile.classList.remove('hidden');
                    
                    // Update avatar
                    const userAvatar = document.getElementById('userAvatar');
                    if (userAvatar) {
                        userAvatar.src = this.user.avatar;
                        userAvatar.alt = this.user.name;
                    }
                }
            } else {
                // Show login/signup buttons
                document.getElementById('loginBtn')?.classList.remove('hidden');
                document.getElementById('signupBtn')?.classList.remove('hidden');
                
                // Hide user profile
                document.querySelector('.user-profile')?.classList.add('hidden');
            }
        },
        
        // Show password reset form
        showPasswordResetForm: function() {
            // Create modal content
            const modalContent = `
                <form id="passwordResetForm" class="password-reset-form">
                    <p>Enter your email address and we'll send you a link to reset your password.</p>
                    <div class="form-group">
                        <label for="resetEmail">Email Address</label>
                        <input type="email" id="resetEmail" placeholder="Enter your email address" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" id="cancelResetBtn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Send Reset Link</button>
                    </div>
                </form>
            `;
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'passwordResetModal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Reset Password</h3>
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
            modal.querySelector('#cancelResetBtn').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            // Form submission
            modal.querySelector('#passwordResetForm').addEventListener('submit', (e) => {
                e.preventDefault();
                
                const email = document.getElementById('resetEmail').value;
                
                if (!email || !this.validateEmail(email)) {
                    this.showToast('error', 'Invalid Email', 'Please enter a valid email address.');
                    return;
                }
                
                this.showLoading();
                
                // Simulate API call delay
                setTimeout(() => {
                    // In a real app, this would send a password reset email
                    
                    // Close modal
                    document.body.removeChild(modal);
                    
                    // Show success message
                    this.hideLoading();
                    this.showToast('success', 'Reset Link Sent', `A password reset link has been sent to ${email}. Please check your inbox.`);
                }, 1500);
            });
            
            // Show modal
            modal.classList.add('active');
            
            // Focus email input
            setTimeout(() => {
                document.getElementById('resetEmail').focus();
            }, 100);
        },
        
        // Set up profile management
        setupProfileManagement: function() {
            // This would be implemented in a real application
            // For this demo, we'll just create a mock function that shows a profile modal
            
            // Add click event to profile menu items
            document.querySelectorAll('.dropdown-menu a[data-page="profile"]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showProfileModal();
                });
            });
            
            // Add click event to "My Reports" menu item
            document.querySelectorAll('.dropdown-menu a[data-page="my-reports"]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showMyReportsModal();
                });
            });
        },
        
        // Show profile modal
        showProfileModal: function() {
            // Check if user is logged in
            if (!this.user) {
                this.showToast('info', 'Login Required', 'Please log in to view your profile.');
                this.openModal('loginModal');
                return;
            }
            
            // Create modal content
            const modalContent = `
                <form id="profileForm" class="profile-form">
                    <div class="profile-avatar">
                        <img src="${this.user.avatar}" alt="${this.user.name}" id="profileAvatar">
                        <button type="button" class="change-avatar-btn">Change Avatar</button>
                        <input type="file" id="avatarUpload" accept="image/*" class="hidden">
                    </div>
                    <div class="form-group">
                        <label for="profileName">Full Name</label>
                        <input type="text" id="profileName" value="${this.user.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="profileEmail">Email Address</label>
                        <input type="email" id="profileEmail" value="${this.user.email}" required>
                    </div>
                    <div class="form-group">
                        <label for="profilePhone">Phone Number (optional)</label>
                        <input type="tel" id="profilePhone" placeholder="Enter your phone number">
                    </div>
                    <div class="form-group">
                        <label for="profileLocation">Location (optional)</label>
                        <input type="text" id="profileLocation" placeholder="Enter your location">
                    </div>
                    <div class="form-group">
                        <label for="profileBio">Bio (optional)</label>
                        <textarea id="profileBio" rows="3" placeholder="Tell us about yourself"></textarea>
                    </div>
                    <div class="form-group">
                        <h4>Notification Preferences</h4>
                        <div class="checkbox-group">
                            <label><input type="checkbox" id="notifyReports" checked> New reports in my area</label>
                            <label><input type="checkbox" id="notifyEvents" checked> Upcoming events</label>
                            <label><input type="checkbox" id="notifyUpdates" checked> Updates to my reports</label>
                            <label><input type="checkbox" id="notifyNews" checked> Environmental news and alerts</label>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" id="cancelProfileBtn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            `;
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'profileModal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Profile</h3>
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
            modal.querySelector('#cancelProfileBtn').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            // Avatar upload
            const changeAvatarBtn = modal.querySelector('.change-avatar-btn');
            const avatarUpload = modal.querySelector('#avatarUpload');
            const profileAvatar = modal.querySelector('#profileAvatar');
            
            if (changeAvatarBtn && avatarUpload && profileAvatar) {
                changeAvatarBtn.addEventListener('click', () => {
                    avatarUpload.click();
                });
                
                avatarUpload.addEventListener('change', () => {
                    if (avatarUpload.files.length > 0) {
                        const file = avatarUpload.files[0];
                        
                        // Only process images
                        if (!file.type.startsWith('image/')) return;
                        
                        const reader = new FileReader();
                        
                        reader.onload = (e) => {
                            profileAvatar.src = e.target.result;
                        };
                        
                        reader.readAsDataURL(file);
                    }
                });
            }
            
            // Form submission
            modal.querySelector('#profileForm').addEventListener('submit', (e) => {
                e.preventDefault();
                
                const name = document.getElementById('profileName').value;
                const email = document.getElementById('profileEmail').value;
                
                if (!name || !email || !this.validateEmail(email)) {
                    this.showToast('error', 'Invalid Input', 'Please enter a valid name and email address.');
                    return;
                }
                
                this.showLoading();
                
                // Simulate API call delay
                setTimeout(() => {
                    // Update user object
                    this.user.name = name;
                    this.user.email = email;
                    this.user.avatar = profileAvatar.src;
                    
                    // Save to localStorage
                    localStorage.setItem('ecoReportUser', JSON.stringify(this.user));
                    
                    // Update UI
                    this.updateUserUI();
                    
                    // Close modal
                    document.body.removeChild(modal);
                    
                    // Show success message
                    this.hideLoading();
                    this.showToast('success', 'Profile Updated', 'Your profile has been updated successfully.');
                }, 1500);
            });
            
            // Show modal
            modal.classList.add('active');
        },
        
        // Show my reports modal
        showMyReportsModal: function() {
            // Check if user is logged in
            if (!this.user) {
                this.showToast('info', 'Login Required', 'Please log in to view your reports.');
                this.openModal('loginModal');
                return;
            }
            
            // Filter reports by current user
            const userReports = this.reports.filter(report => report.reporter === this.user.name);
            
            // Create modal content
            let modalContent = '';
            
            if (userReports.length === 0) {
                modalContent = `
                    <div class="empty-state">
                        <img src="images/empty-reports.svg" alt="No Reports">
                        <h4>No Reports Yet</h4>
                        <p>You haven't submitted any environmental reports yet.</p>
                        <button class="btn btn-primary" id="createReportBtn">Create First Report</button>
                    </div>
                `;
            } else {
                modalContent = `
                    <div class="my-reports">
                        <div class="reports-header">
                            <h4>Your Reports (${userReports.length})</h4>
                            <button class="btn btn-primary" id="createReportBtn">Create New Report</button>
                        </div>
                        <div class="report-list">
                            ${userReports.map(report => {
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
                                } else if (report.status === 'resolved') {
                                    statusText = 'Resolved';
                                    statusClass = 'resolved';
                                }
                                
                                return `
                                    <div class="report-item" data-report-id="${report.id}">
                                        <div class="report-item-image">
                                            <img src="${report.photos[0] || 'images/placeholder-report.jpg'}" alt="${report.title}">
                                        </div>
                                        <div class="report-item-content">
                                            <div class="report-item-header">
                                                <span class="report-type ${report.type}">${this.capitalizeFirstLetter(report.type)}</span>
                                                <span class="report-status ${statusClass}">${statusText}</span>
                                            </div>
                                            <h5>${report.title}</h5>
                                            <div class="report-item-meta">
                                                <span class="report-date">${formattedDate}</span>
                                                <span class="report-location">${report.location}</span>
                                            </div>
                                            <div class="report-item-actions">
                                                <button class="btn btn-small btn-outline view-report-btn" data-report-id="${report.id}">View Details</button>
                                                <button class="btn btn-small btn-outline edit-report-btn" data-report-id="${report.id}">Edit</button>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'myReportsModal';
            
            modal.innerHTML = `
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h3>My Reports</h3>
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
            
            // Create report button
            const createReportBtn = modal.querySelector('#createReportBtn');
            if (createReportBtn) {
                createReportBtn.addEventListener('click', () => {
                    document.body.removeChild(modal);
                    this.navigateTo('report');
                });
            }
            
            // View report buttons
            const viewReportBtns = modal.querySelectorAll('.view-report-btn');
            viewReportBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const reportId = btn.getAttribute('data-report-id');
                    document.body.removeChild(modal);
                    this.showReportDetails(reportId);
                });
            });
            
            // Edit report buttons (mock implementation)
            const editReportBtns = modal.querySelectorAll('.edit-report-btn');
            editReportBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const reportId = btn.getAttribute('data-report-id');
                    this.showToast('info', 'Edit Report', 'Report editing would be implemented in a real application.');
                });
            });
            
            // Show modal
            modal.classList.add('active');
        },
        
        // Validate email format
        validateEmail: function(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email.toLowerCase());
        }
    });
    
    // Initialize authentication
    EcoReport.initAuth();
});