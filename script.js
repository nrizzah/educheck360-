// Daily Quotes
const DAILY_QUOTES = [
    { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { quote: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { quote: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
    { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { quote: "Your limitation—it's only your imagination.", author: "Unknown" },
    { quote: "Push yourself, because no one else is going to do it for you.", author: "Unknown" }
];

// Global state
let currentRole = 'student';

// Role selection
function selectRole(role) {
    currentRole = role;
    
    // Update button states
    document.getElementById('studentRoleBtn').classList.toggle('active', role === 'student');
    document.getElementById('adminRoleBtn').classList.toggle('active', role === 'admin');
    
    // Update button text
    document.getElementById('loginRoleText').textContent = role === 'admin' ? 'Admin' : 'Student';
    document.getElementById('signupRoleText').textContent = role === 'admin' ? 'Admin' : 'Student';
}

// Notification Manager
class NotificationManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.requestPermission();
        this.bindEvents();
    }

    bindEvents() {
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showSettingsModal();
            });
        }
    }

    loadSettings() {
        try {
            const currentUser = window.authManager?.getCurrentUser();
            if (!currentUser) return this.getDefaultSettings();
            
            const stored = localStorage.getItem(`notifications_${currentUser.id}`);
            return stored ? JSON.parse(stored) : this.getDefaultSettings();
        } catch (error) {
            console.error('Failed to load notification settings:', error);
            return this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            enableNotifications: false,
            enableReminders: true,
            enableDailyQuotes: true,
            reminderSound: 'default'
        };
    }

    saveSettings() {
        try {
            const currentUser = window.authManager?.getCurrentUser();
            if (!currentUser) return;
            
            localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save notification settings:', error);
        }
    }

    async requestPermission() {
        if ('Notification' in window && this.settings.enableNotifications) {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                this.settings.enableNotifications = false;
                this.saveSettings();
            }
        }
    }

    showNotification(title, body, type = 'info', duration = 5000) {
        // In-app notification
        this.showInAppNotification(title, body, type, duration);

        // Browser notification
        if (this.settings.enableNotifications && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/favicon.ico',
                tag: 'educheck360'
            });
        }
    }

    showInAppNotification(title, body, type = 'info', duration = 5000) {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">${title}</div>
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-body">${body}</div>
        `;

        container.appendChild(notification);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // Auto remove after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
    }

    removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.animation = 'slideOutNotification 0.3s ease forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }

    showSettingsModal() {
        // Load current settings into modal
        document.getElementById('enableNotifications').checked = this.settings.enableNotifications;
        document.getElementById('enableReminders').checked = this.settings.enableReminders;
        document.getElementById('enableDailyQuotes').checked = this.settings.enableDailyQuotes;
        document.getElementById('reminderSound').value = this.settings.reminderSound;
        
        document.getElementById('notificationModal').classList.add('active');
    }

    async saveSettingsFromModal() {
        this.settings.enableNotifications = document.getElementById('enableNotifications').checked;
        this.settings.enableReminders = document.getElementById('enableReminders').checked;
        this.settings.enableDailyQuotes = document.getElementById('enableDailyQuotes').checked;
        this.settings.reminderSound = document.getElementById('reminderSound').value;

        // Request permission if notifications are enabled
        if (this.settings.enableNotifications) {
            await this.requestPermission();
        }

        this.saveSettings();
        this.closeSettingsModal();
        this.showNotification('Settings Saved', 'Your notification preferences have been updated.', 'success');

        // Update daily quote visibility
        this.updateQuoteVisibility();
    }

    closeSettingsModal() {
        document.getElementById('notificationModal').classList.remove('active');
    }

    updateQuoteVisibility() {
        const quoteSection = document.querySelector('.quote-section');
        if (quoteSection) {
            quoteSection.style.display = this.settings.enableDailyQuotes ? 'block' : 'none';
        }
    }
}

// Daily Quote Manager
class QuoteManager {
    constructor() {
        this.init();
    }

    init() {
        this.displayDailyQuote();
    }

    displayDailyQuote() {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const quoteIndex = dayOfYear % DAILY_QUOTES.length;
        const todaysQuote = DAILY_QUOTES[quoteIndex];

        const quoteElement = document.getElementById('dailyQuote');
        const authorElement = document.getElementById('quoteAuthor');
        
        if (quoteElement && authorElement) {
            quoteElement.textContent = `"${todaysQuote.quote}"`;
            authorElement.textContent = `— ${todaysQuote.author}`;
        }
    }
}

// Admin Manager
class AdminManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadAdminData();
    }

    bindEvents() {
        // Create user form
        const createUserForm = document.getElementById('createUserForm');
        if (createUserForm) {
            createUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateUser();
            });
        }

        // Admin action buttons
        const manageUsersBtn = document.getElementById('manageUsersBtn');
        if (manageUsersBtn) {
            manageUsersBtn.addEventListener('click', () => {
                this.switchAdminTab('users');
            });
        }

        const systemReportsBtn = document.getElementById('systemReportsBtn');
        if (systemReportsBtn) {
            systemReportsBtn.addEventListener('click', () => {
                this.switchAdminTab('reports');
            });
        }

        const analyticsBtn = document.getElementById('analyticsBtn');
        if (analyticsBtn) {
            analyticsBtn.addEventListener('click', () => {
                this.switchAdminTab('analytics');
            });
        }
    }

    loadAdminData() {
        this.updateAdminStats();
        this.loadUsersTable();
        this.loadAnalytics();
        this.loadReports();
    }

    updateAdminStats() {
        const users = this.getAllUsers();
        const allChecklists = this.getAllChecklists();
        const allTasks = allChecklists.flatMap(c => c.tasks);
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const stats = {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.isActive !== false).length,
            totalChecklists: allChecklists.length,
            totalTasks: allTasks.length,
            systemCompletionRate: allTasks.length > 0 ? Math.round((allTasks.filter(t => t.completed).length / allTasks.length) * 100) : 0,
            newUsersThisWeek: users.filter(u => new Date(u.createdAt) >= oneWeekAgo).length
        };

        // Update admin stats display
        this.updateElement('totalUsers', stats.totalUsers);
        this.updateElement('activeUsers', stats.activeUsers);
        this.updateElement('totalChecklistsAdmin', stats.totalChecklists);
        this.updateElement('totalTasksAdmin', stats.totalTasks);
        this.updateElement('systemCompletionRate', `${stats.systemCompletionRate}%`);
        this.updateElement('newUsersThisWeek', stats.newUsersThisWeek);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    getAllUsers() {
        try {
            const users = localStorage.getItem('users');
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('Failed to load users:', error);
            return [];
        }
    }

    getAllChecklists() {
        const users = this.getAllUsers();
        let allChecklists = [];
        
        users.forEach(user => {
            try {
                const userChecklists = localStorage.getItem(`checklists_${user.id}`);
                if (userChecklists) {
                    const checklists = JSON.parse(userChecklists);
                    allChecklists = allChecklists.concat(checklists.map(c => ({ ...c, userId: user.id, userName: user.name })));
                }
            } catch (error) {
                console.error(`Failed to load checklists for user ${user.id}:`, error);
            }
        });
        
        return allChecklists;
    }

    loadUsersTable() {
        const users = this.getAllUsers();
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => {
            const userChecklists = this.getUserChecklists(user.id);
            const userTasks = userChecklists.flatMap(c => c.tasks);
            const completedTasks = userTasks.filter(t => t.completed).length;
            const completionRate = userTasks.length > 0 ? Math.round((completedTasks / userTasks.length) * 100) : 0;

            return `
                <tr>
                    <td>
                        <div class="user-info">
                            <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                            <div>
                                <div class="user-name">${this.escapeHtml(user.name)}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="role-badge role-${user.role || 'student'}">
                            ${user.role === 'admin' ? '👨‍💼' : '👨‍🎓'} ${this.capitalize(user.role || 'student')}
                        </span>
                    </td>
                    <td>${this.escapeHtml(user.email)}</td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                    <td>${userChecklists.length}</td>
                    <td>${completedTasks} (${completionRate}%)</td>
                    <td>
                        <span class="status-badge status-${user.isActive !== false ? 'active' : 'inactive'}">
                            ${user.isActive !== false ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                    </td>
                    <td>
                        <div class="user-actions">
                            <button class="btn-user-action" onclick="window.adminManager.toggleUserStatus('${user.id}')" title="Toggle Status">
                                ${user.isActive !== false ? '🚫' : '✅'}
                            </button>
                            <button class="btn-user-action" onclick="window.adminManager.viewUserDetails('${user.id}')" title="View Details">
                                👁️
                            </button>
                            <button class="btn-user-action" onclick="window.adminManager.deleteUser('${user.id}')" title="Delete User">
                                🗑️
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getUserChecklists(userId) {
        try {
            const stored = localStorage.getItem(`checklists_${userId}`);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error(`Failed to load checklists for user ${userId}:`, error);
            return [];
        }
    }

    handleCreateUser() {
        const name = document.getElementById('newUserName').value.trim();
        const email = document.getElementById('newUserEmail').value.trim();
        const role = document.getElementById('newUserRole').value;
        const password = document.getElementById('newUserPassword').value;

        if (!name || !email || !password) {
            window.notificationManager.showNotification('Error', 'Please fill in all fields.', 'error');
            return;
        }

        const users = this.getAllUsers();
        if (users.find(u => u.email === email)) {
            window.notificationManager.showNotification('Error', 'A user with this email already exists.', 'error');
            return;
        }

        const newUser = {
            id: this.generateId(),
            name,
            email,
            password,
            role: role || 'student',
            createdAt: new Date().toISOString(),
            isActive: true
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        this.closeCreateUserModal();
        this.loadAdminData();
        
        window.notificationManager.showNotification(
            'User Created',
            `${name} has been added as a ${role}.`,
            'success'
        );
    }

    toggleUserStatus(userId) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].isActive = users[userIndex].isActive !== false ? false : true;
            localStorage.setItem('users', JSON.stringify(users));
            
            this.loadUsersTable();
            this.updateAdminStats();
            
            const status = users[userIndex].isActive ? 'activated' : 'deactivated';
            window.notificationManager.showNotification(
                'User Status Updated',
                `User has been ${status}.`,
                'info'
            );
        }
    }

    viewUserDetails(userId) {
        const users = this.getAllUsers();
        const user = users.find(u => u.id === userId);
        
        if (user) {
            const userChecklists = this.getUserChecklists(userId);
            const userTasks = userChecklists.flatMap(c => c.tasks);
            
            const details = `
                Name: ${user.name}
                Email: ${user.email}
                Role: ${user.role || 'student'}
                Joined: ${new Date(user.createdAt).toLocaleDateString()}
                Last Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                Status: ${user.isActive !== false ? 'Active' : 'Inactive'}
                
                Statistics:
                - Checklists: ${userChecklists.length}
                - Total Tasks: ${userTasks.length}
                - Completed Tasks: ${userTasks.filter(t => t.completed).length}
                - Completion Rate: ${userTasks.length > 0 ? Math.round((userTasks.filter(t => t.completed).length / userTasks.length) * 100) : 0}%
            `;
            
            alert(details);
        }
    }

    deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        const users = this.getAllUsers();
        const user = users.find(u => u.id === userId);
        
        if (user) {
            // Remove user from users list
            const updatedUsers = users.filter(u => u.id !== userId);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            
            // Remove user's checklists
            localStorage.removeItem(`checklists_${userId}`);
            localStorage.removeItem(`notifications_${userId}`);
            
            this.loadAdminData();
            
            window.notificationManager.showNotification(
                'User Deleted',
                `${user.name} has been removed from the system.`,
                'info'
            );
        }
    }

    loadAnalytics() {
        const performanceMetrics = document.getElementById('performanceMetrics');
        if (!performanceMetrics) return;

        const users = this.getAllUsers();
        const allChecklists = this.getAllChecklists();
        const allTasks = allChecklists.flatMap(c => c.tasks);

        const metrics = [
            { label: 'Average Tasks per User', value: users.length > 0 ? Math.round(allTasks.length / users.length) : 0 },
            { label: 'Average Checklists per User', value: users.length > 0 ? Math.round(allChecklists.length / users.length) : 0 },
            { label: 'Most Popular Subject', value: this.getMostPopularSubject(allChecklists) },
            { label: 'System Uptime', value: '99.9%' },
            { label: 'Data Storage Used', value: this.calculateStorageUsed() }
        ];

        performanceMetrics.innerHTML = metrics.map(metric => `
            <div class="metric-item">
                <span class="metric-label">${metric.label}</span>
                <span class="metric-value">${metric.value}</span>
            </div>
        `).join('');
    }

    getMostPopularSubject(checklists) {
        const subjects = {};
        checklists.forEach(checklist => {
            subjects[checklist.subject] = (subjects[checklist.subject] || 0) + 1;
        });
        
        const sortedSubjects = Object.entries(subjects).sort((a, b) => b[1] - a[1]);
        return sortedSubjects.length > 0 ? sortedSubjects[0][0] : 'None';
    }

    calculateStorageUsed() {
        const totalStorage = JSON.stringify(localStorage).length;
        const sizeInKB = Math.round(totalStorage / 1024);
        return sizeInKB > 1024 ? `${Math.round(sizeInKB / 1024)} MB` : `${sizeInKB} KB`;
    }

    loadReports() {
        // Reports are handled by button clicks
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    closeCreateUserModal() {
        document.getElementById('createUserModal').classList.remove('active');
        document.getElementById('createUserForm').reset();
    }
}

// Data Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Create demo accounts if they don't exist
        this.createDemoAccounts();
        
        // Check if user is already logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
        } else {
            this.showAuthModal();
        }
        this.bindAuthEvents();
    }

    createDemoAccounts() {
        const users = this.getStoredUsers();
        
        // Create admin account if it doesn't exist
        if (!users.find(u => u.email === 'admin@educheck360.com')) {
            users.push({
                id: 'admin-demo-account',
                name: 'Admin User',
                email: 'admin@educheck360.com',
                password: 'admin123',
                role: 'admin',
                createdAt: new Date().toISOString(),
                isActive: true
            });
        }
        
        // Create student account if it doesn't exist
        if (!users.find(u => u.email === 'student@educheck360.com')) {
            users.push({
                id: 'student-demo-account',
                name: 'Student User',
                email: 'student@educheck360.com',
                password: 'student123',
                role: 'student',
                createdAt: new Date().toISOString(),
                isActive: true
            });
        }
        
        localStorage.setItem('users', JSON.stringify(users));
    }

    bindAuthEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Signup form
        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showError('Please fill in all fields.');
            return;
        }

        // Get stored users
        const users = this.getStoredUsers();
        const user = users.find(u => u.email === email && u.role === currentRole);

        if (!user) {
            this.showError(`No ${currentRole} account found with this email address.`);
            return;
        }

        if (user.password !== password) {
            this.showError('Incorrect password.');
            return;
        }

        if (user.isActive === false) {
            this.showError('Your account has been deactivated. Please contact an administrator.');
            return;
        }

        // Login successful
        this.currentUser = { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role || 'student',
            isActive: user.isActive 
        };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // Update last login
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex].lastLogin = new Date().toISOString();
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        this.showSuccess('Login successful!');
        
        setTimeout(() => {
            this.showMainApp();
        }, 1000);
    }

    handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!name || !email || !password || !confirmPassword) {
            this.showError('Please fill in all fields.');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match.');
            return;
        }

        // Check if email already exists
        const users = this.getStoredUsers();
        if (users.find(u => u.email === email)) {
            this.showError('An account with this email already exists.');
            return;
        }

        // Create new user
        const newUser = {
            id: this.generateId(),
            name,
            email,
            password,
            role: currentRole,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isActive: true
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Auto login
        this.currentUser = { 
            id: newUser.id, 
            name: newUser.name, 
            email: newUser.email, 
            role: newUser.role,
            isActive: newUser.isActive 
        };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        this.showSuccess('Account created successfully!');
        
        setTimeout(() => {
            this.showMainApp();
        }, 1000);
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            
            // Reset managers
            if (window.checklistManager) {
                window.checklistManager.checklists = [];
                window.checklistManager.renderChecklists();
                window.checklistManager.updateStats();
            }
            
            this.showAuthModal();
        }
    }

    getStoredUsers() {
        try {
            const users = localStorage.getItem('users');
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('Failed to load users:', error);
            return [];
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showAuthModal() {
        document.getElementById('authModal').classList.add('active');
        document.querySelector('.header').style.display = 'none';
        document.getElementById('studentDashboard').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'none';
    }

    showMainApp() {
        document.getElementById('authModal').classList.remove('active');
        document.querySelector('.header').style.display = 'block';
        
        // Update welcome message and header
        document.getElementById('userWelcome').textContent = `Welcome, ${this.currentUser.name}! (${this.currentUser.role})`;
        document.getElementById('headerSubtitle').textContent = this.currentUser.role === 'admin' ? 'Admin Panel' : 'Student Task Manager';
        
        // Show appropriate dashboard
        if (this.currentUser.role === 'admin') {
            document.getElementById('studentDashboard').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            document.getElementById('studentActions').style.display = 'none';
            document.getElementById('adminActions').style.display = 'flex';
            
            // Initialize admin manager
            if (!window.adminManager) {
                window.adminManager = new AdminManager();
            } else {
                window.adminManager.loadAdminData();
            }
        } else {
            document.getElementById('studentDashboard').style.display = 'block';
            document.getElementById('adminDashboard').style.display = 'none';
            document.getElementById('studentActions').style.display = 'flex';
            document.getElementById('adminActions').style.display = 'none';
            
            // Initialize student managers
            if (!window.checklistManager) {
                window.checklistManager = new ChecklistManager();
            } else {
                window.checklistManager.loadUserData();
            }
            
            if (!window.quoteManager) {
                window.quoteManager = new QuoteManager();
            }
        }
        
        // Initialize notification manager
        if (!window.notificationManager) {
            window.notificationManager = new NotificationManager();
        }
        
        // Update quote visibility based on settings
        setTimeout(() => {
            if (window.notificationManager) {
                window.notificationManager.updateQuoteVisibility();
            }
        }, 100);
    }

    showError(message) {
        this.removeMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const activeForm = document.querySelector('.auth-form:not([style*="display: none"])');
        activeForm.insertBefore(errorDiv, activeForm.firstChild);
    }

    showSuccess(message) {
        this.removeMessages();
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        const activeForm = document.querySelector('.auth-form:not([style*="display: none"])');
        activeForm.insertBefore(successDiv, activeForm.firstChild);
    }

    removeMessages() {
        const messages = document.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => msg.remove());
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// ChecklistManager (simplified for space)
class ChecklistManager {
    constructor() {
        this.checklists = [];
        this.currentEditingId = null;
        this.currentTaskChecklistId = null;
        this.loadUserData();
        this.init();
    }

    loadUserData() {
        this.checklists = this.loadFromStorage();
        this.renderChecklists();
        this.updateStats();
    }

    init() {
        this.renderChecklists();
        this.updateStats();
        this.bindEvents();
        
        // Add sample data only if user has no checklists
        if (this.checklists.length === 0) {
            this.addSampleData();
        }
    }

    bindEvents() {
        // Create checklist button
        const createBtn = document.getElementById('createChecklistBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                this.showCreateModal();
            });
        }

        // Form submissions
        const checklistForm = document.getElementById('checklistForm');
        if (checklistForm) {
            checklistForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleChecklistSubmit();
            });
        }

        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTaskSubmit();
            });
        }

        // Filters
        const searchInput = document.getElementById('searchInput');
        const subjectFilter = document.getElementById('subjectFilter');
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');

        if (searchInput) searchInput.addEventListener('input', () => this.filterChecklists());
        if (subjectFilter) subjectFilter.addEventListener('change', () => this.filterChecklists());
        if (statusFilter) statusFilter.addEventListener('change', () => this.filterChecklists());
        if (priorityFilter) priorityFilter.addEventListener('change', () => this.filterChecklists());
    }

    loadFromStorage() {
        try {
            const currentUser = window.authManager?.getCurrentUser();
            if (!currentUser) return [];
            
            const stored = localStorage.getItem(`checklists_${currentUser.id}`);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load checklists:', error);
            return [];
        }
    }

    saveToStorage() {
        try {
            const currentUser = window.authManager?.getCurrentUser();
            if (!currentUser) return;
            
            localStorage.setItem(`checklists_${currentUser.id}`, JSON.stringify(this.checklists));
        } catch (error) {
            console.error('Failed to save checklists:', error);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    createChecklist(title, description, subject, priority, dueDate, reminderTime, tasks) {
        const checklist = {
            id: this.generateId(),
            title,
            description,
            subject,
            priority: priority || 'medium',
            dueDate,
            reminderTime,
            reminderSent: false,
            tasks: tasks.map(taskText => ({
                id: this.generateId(),
                text: taskText,
                completed: false,
                priority: 'medium',
                dueDate: null,
                reminderSent: false,
                createdAt: new Date().toISOString()
            })),
            createdAt: new Date().toISOString()
        };

        this.checklists.unshift(checklist);
        this.saveToStorage();
        this.renderChecklists();
        this.updateStats();
        
        if (window.notificationManager) {
            window.notificationManager.showNotification(
                'Checklist Created',
                `"${title}" has been created successfully!`,
                'success'
            );
        }
        
        return checklist;
    }

    updateChecklist(id, updates) {
        const checklistIndex = this.checklists.findIndex(c => c.id === id);
        if (checklistIndex !== -1) {
            if (updates.dueDate || updates.reminderTime) {
                updates.reminderSent = false;
            }
            
            this.checklists[checklistIndex] = { ...this.checklists[checklistIndex], ...updates };
            this.saveToStorage();
            this.renderChecklists();
            this.updateStats();
            
            if (window.notificationManager) {
                window.notificationManager.showNotification(
                    'Checklist Updated',
                    `"${this.checklists[checklistIndex].title}" has been updated!`,
                    'success'
                );
            }
        }
    }

    deleteChecklist(id) {
        const checklist = this.checklists.find(c => c.id === id);
        if (checklist && confirm('Are you sure you want to delete this checklist?')) {
            this.checklists = this.checklists.filter(c => c.id !== id);
            this.saveToStorage();
            this.renderChecklists();
            this.updateStats();
            
            if (window.notificationManager) {
                window.notificationManager.showNotification(
                    'Checklist Deleted',
                    `"${checklist.title}" has been deleted.`,
                    'info'
                );
            }
        }
    }

    addTask(checklistId, taskText, priority, dueDate) {
        const checklist = this.checklists.find(c => c.id === checklistId);
        if (checklist) {
            const task = {
                id: this.generateId(),
                text: taskText,
                completed: false,
                priority: priority || 'medium',
                dueDate,
                reminderSent: false,
                createdAt: new Date().toISOString()
            };
            checklist.tasks.push(task);
            this.saveToStorage();
            this.renderChecklists();
            this.updateStats();
            
            if (window.notificationManager) {
                window.notificationManager.showNotification(
                    'Task Added',
                    `New task added to "${checklist.title}"`,
                    'success'
                );
            }
        }
    }

    toggleTask(checklistId, taskId) {
        const checklist = this.checklists.find(c => c.id === checklistId);
        if (checklist) {
            const task = checklist.tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                task.completedAt = task.completed ? new Date().toISOString() : null;
                this.saveToStorage();
                this.renderChecklists();
                this.updateStats();
                
                if (task.completed && window.notificationManager) {
                    window.notificationManager.showNotification(
                        'Task Completed! 🎉',
                        `"${task.text}" has been marked as complete!`,
                        'success'
                    );
                }
            }
        }
    }

    deleteTask(checklistId, taskId) {
        const checklist = this.checklists.find(c => c.id === checklistId);
        if (checklist) {
            const task = checklist.tasks.find(t => t.id === taskId);
            if (task && confirm('Are you sure you want to delete this task?')) {
                checklist.tasks = checklist.tasks.filter(t => t.id !== taskId);
                this.saveToStorage();
                this.renderChecklists();
                this.updateStats();
                
                if (window.notificationManager) {
                    window.notificationManager.showNotification(
                        'Task Deleted',
                        `Task has been removed from "${checklist.title}"`,
                        'info'
                    );
                }
            }
        }
    }

    showCreateModal() {
        this.currentEditingId = null;
        document.getElementById('modalTitle').textContent = 'Create New Checklist';
        document.getElementById('submitBtnText').textContent = 'Create Checklist';
        document.getElementById('checklistForm').reset();
        this.resetTaskInputs();
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59);
        document.getElementById('checklistDueDate').value = tomorrow.toISOString().slice(0, 16);
        
        document.getElementById('checklistModal').classList.add('active');
    }

    showEditModal(checklistId) {
        const checklist = this.checklists.find(c => c.id === checklistId);
        if (!checklist) return;

        this.currentEditingId = checklistId;
        document.getElementById('modalTitle').textContent = 'Edit Checklist';
        document.getElementById('submitBtnText').textContent = 'Update Checklist';
        
        document.getElementById('checklistTitle').value = checklist.title;
        document.getElementById('checklistDescription').value = checklist.description || '';
        document.getElementById('checklistSubject').value = checklist.subject;
        document.getElementById('checklistPriority').value = checklist.priority || 'medium';
        document.getElementById('checklistDueDate').value = checklist.dueDate ? new Date(checklist.dueDate).toISOString().slice(0, 16) : '';
        document.getElementById('reminderTime').value = checklist.reminderTime || '';
        
        this.resetTaskInputs();
        checklist.tasks.forEach(task => {
            this.addTaskInput(task.text);
        });
        
        document.getElementById('checklistModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('checklistModal').classList.remove('active');
        this.currentEditingId = null;
    }

    showTaskModal(checklistId) {
        this.currentTaskChecklistId = checklistId;
        document.getElementById('taskText').value = '';
        document.getElementById('taskPriority').value = 'medium';
        document.getElementById('taskDueDate').value = '';
        document.getElementById('taskModal').classList.add('active');
    }

    closeTaskModal() {
        document.getElementById('taskModal').classList.remove('active');
        this.currentTaskChecklistId = null;
    }

    handleChecklistSubmit() {
        const title = document.getElementById('checklistTitle').value.trim();
        const description = document.getElementById('checklistDescription').value.trim();
        const subject = document.getElementById('checklistSubject').value;
        const priority = document.getElementById('checklistPriority').value;
        const dueDate = document.getElementById('checklistDueDate').value;
        const reminderTime = document.getElementById('reminderTime').value;
        
        const taskInputs = document.querySelectorAll('.task-input');
        const tasks = Array.from(taskInputs)
            .map(input => input.value.trim())
            .filter(task => task.length > 0);

        if (!title || !subject) {
            alert('Please fill in all required fields.');
            return;
        }

        if (this.currentEditingId) {
            const updates = { title, description, subject, priority, dueDate, reminderTime };
            
            const checklist = this.checklists.find(c => c.id === this.currentEditingId);
            if (checklist) {
                updates.tasks = tasks.map(taskText => {
                    const existingTask = checklist.tasks.find(t => t.text === taskText);
                    if (existingTask) {
                        return existingTask;
                    }
                    return {
                        id: this.generateId(),
                        text: taskText,
                        completed: false,
                        priority: 'medium',
                        dueDate: null,
                        reminderSent: false,
                        createdAt: new Date().toISOString()
                    };
                });
            }
            
            this.updateChecklist(this.currentEditingId, updates);
        } else {
            this.createChecklist(title, description, subject, priority, dueDate, reminderTime, tasks);
        }

        this.closeModal();
    }

    handleTaskSubmit() {
        const taskText = document.getElementById('taskText').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;
        
        if (!taskText) {
            alert('Please enter a task description.');
            return;
        }

        if (this.currentTaskChecklistId) {
            this.addTask(this.currentTaskChecklistId, taskText, priority, dueDate);
            this.closeTaskModal();
        }
    }

    resetTaskInputs() {
        const tasksList = document.getElementById('tasksList');
        if (tasksList) {
            tasksList.innerHTML = `
                <div class="task-input-group">
                    <input type="text" placeholder="Enter a task..." class="task-input">
                    <button type="button" class="btn-remove-task" onclick="checklistManager.removeTaskInput(this)">&times;</button>
                </div>
            `;
        }
    }

    addTaskInput(value = '') {
        const tasksList = document.getElementById('tasksList');
        if (tasksList) {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'task-input-group';
            inputGroup.innerHTML = `
                <input type="text" placeholder="Enter a task..." class="task-input" value="${value}">
                <button type="button" class="btn-remove-task" onclick="checklistManager.removeTaskInput(this)">&times;</button>
            `;
            tasksList.appendChild(inputGroup);
        }
    }

    removeTaskInput(button) {
        const tasksList = document.getElementById('tasksList');
        if (tasksList && tasksList.children.length > 1) {
            button.parentElement.remove();
        }
    }

    getTaskStatus(task) {
        if (task.completed) return 'completed';
        if (task.dueDate && new Date(task.dueDate) < new Date()) return 'overdue';
        if (task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000)) return 'due-soon';
        return 'normal';
    }

    getChecklistStatus(checklist) {
        const now = new Date();
        if (checklist.dueDate) {
            const dueDate = new Date(checklist.dueDate);
            if (dueDate < now && checklist.tasks.some(t => !t.completed)) return 'overdue';
            if (dueDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000)) return 'due-soon';
        }
        return 'normal';
    }

    formatDueDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Due today';
        if (diffDays === 1) return 'Due tomorrow';
        if (diffDays <= 7) return `Due in ${diffDays} days`;
        
        return date.toLocaleDateString();
    }

    renderChecklists() {
        const grid = document.getElementById('checklistsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!grid || !emptyState) return;
        
        const filteredChecklists = this.getFilteredChecklists();
        
        if (filteredChecklists.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        grid.innerHTML = filteredChecklists.map(checklist => {
            const completedTasks = checklist.tasks.filter(t => t.completed).length;
            const totalTasks = checklist.tasks.length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const subjectEmoji = this.getSubjectEmoji(checklist.subject);
            const checklistStatus = this.getChecklistStatus(checklist);
            const priorityClass = `priority-${checklist.priority || 'medium'}`;

            return `
                <div class="checklist-card ${checklistStatus}">
                    <div class="checklist-header">
                        <div class="checklist-title">
                            <h3>${this.escapeHtml(checklist.title)}</h3>
                            <div class="checklist-actions">
                                <button class="btn btn-secondary btn-small" onclick="checklistManager.showEditModal('${checklist.id}')">
                                    ✏️
                                </button>
                                <button class="btn btn-danger btn-small" onclick="checklistManager.deleteChecklist('${checklist.id}')">
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div class="checklist-meta">
                            <div class="subject-badge">
                                ${subjectEmoji} ${checklist.subject}
                            </div>
                            <div class="priority-badge ${priorityClass}">
                                ${this.getPriorityEmoji(checklist.priority)} ${this.capitalize(checklist.priority || 'medium')}
                            </div>
                            ${checklist.dueDate ? `<div class="due-badge due-${checklistStatus}">⏰ ${this.formatDueDate(checklist.dueDate)}</div>` : ''}
                        </div>
                        ${checklist.description ? `<p class="checklist-description">${this.escapeHtml(checklist.description)}</p>` : ''}
                    </div>
                    <div class="checklist-body">
                        <div class="progress-section">
                            <div class="progress-info">
                                <span class="progress-text">${completedTasks} of ${totalTasks} tasks completed</span>
                                <span class="progress-percentage">${progress}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                        </div>
                        <div class="tasks-preview">
                            ${checklist.tasks.slice(0, 5).map(task => {
                                const taskStatus = this.getTaskStatus(task);
                                const taskPriorityClass = `priority-${task.priority || 'medium'}`;
                                
                                return `
                                    <div class="task-item ${taskStatus}">
                                        <div class="task-checkbox ${task.completed ? 'completed' : ''}" 
                                             onclick="checklistManager.toggleTask('${checklist.id}', '${task.id}')"></div>
                                        <div class="task-content">
                                            <span class="task-text ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.text)}</span>
                                            <div class="task-meta">
                                                <div class="priority-badge ${taskPriorityClass}">${this.getPriorityEmoji(task.priority)}</div>
                                                ${task.dueDate ? `<div class="due-badge due-${taskStatus}">⏰ ${this.formatDueDate(task.dueDate)}</div>` : ''}
                                            </div>
                                        </div>
                                        <div class="task-actions">
                                            <button class="btn-task" onclick="checklistManager.deleteTask('${checklist.id}', '${task.id}')" title="Delete task">
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                            ${checklist.tasks.length > 5 ? `<p class="task-item" style="color: #6b7280; font-style: italic;">... and ${checklist.tasks.length - 5} more tasks</p>` : ''}
                        </div>
                    </div>
                    <div class="checklist-footer">
                        <button class="add-task-btn" onclick="checklistManager.showTaskModal('${checklist.id}')">
                            + Add New Task
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getFilteredChecklists() {
        const searchInput = document.getElementById('searchInput');
        const subjectFilter = document.getElementById('subjectFilter');
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');

        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const subjectValue = subjectFilter ? subjectFilter.value : '';
        const statusValue = statusFilter ? statusFilter.value : '';
        const priorityValue = priorityFilter ? priorityFilter.value : '';

        return this.checklists.filter(checklist => {
            const matchesSearch = searchTerm === '' || 
                checklist.title.toLowerCase().includes(searchTerm) ||
                checklist.description?.toLowerCase().includes(searchTerm) ||
                checklist.tasks.some(task => task.text.toLowerCase().includes(searchTerm));

            const matchesSubject = subjectValue === '' || checklist.subject === subjectValue;
            const matchesPriority = priorityValue === '' || checklist.priority === priorityValue;

            let matchesStatus = true;
            if (statusValue === 'completed') {
                matchesStatus = checklist.tasks.length > 0 && checklist.tasks.every(task => task.completed);
            } else if (statusValue === 'incomplete') {
                matchesStatus = checklist.tasks.some(task => !task.completed);
            } else if (statusValue === 'overdue') {
                matchesStatus = this.getChecklistStatus(checklist) === 'overdue';
            } else if (statusValue === 'due-soon') {
                matchesStatus = this.getChecklistStatus(checklist) === 'due-soon';
            }

            return matchesSearch && matchesSubject && matchesStatus && matchesPriority;
        });
    }

    filterChecklists() {
        this.renderChecklists();
    }

    updateStats() {
        const totalChecklists = this.checklists.length;
        const allTasks = this.checklists.flatMap(c => c.tasks);
        const completedTasks = allTasks.filter(t => t.completed).length;
        const pendingTasks = allTasks.length - completedTasks;
        const completionRate = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;
        
        const now = new Date();
        const dueSoonTasks = allTasks.filter(task => {
            if (task.completed || !task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            const timeDiff = dueDate.getTime() - now.getTime();
            const hoursUntilDue = timeDiff / (1000 * 60 * 60);
            return hoursUntilDue <= 24 && hoursUntilDue > 0;
        }).length;

        this.updateElement('totalChecklists', totalChecklists);
        this.updateElement('completedTasks', completedTasks);
        this.updateElement('pendingTasks', pendingTasks);
        this.updateElement('completionRate', `${completionRate}%`);
        this.updateElement('dueSoonTasks', dueSoonTasks);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    getSubjectEmoji(subject) {
        const emojiMap = {
            'Mathematics': '📊',
            'Science': '🔬',
            'English': '📚',
            'History': '🏛️',
            'Art': '🎨',
            'Physical Education': '⚽',
            'Music': '🎵',
            'Computer Science': '💻',
            'General': '📋'
        };
        return emojiMap[subject] || '📋';
    }

    getPriorityEmoji(priority) {
        const emojiMap = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🟢'
        };
        return emojiMap[priority || 'medium'];
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addSampleData() {
        this.createChecklist(
            'Math Homework - Chapter 5',
            'Complete exercises from algebra chapter',
            'Mathematics',
            'high',
            new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            '1440',
            ['Solve equations 1-15', 'Review quadratic formulas', 'Practice word problems', 'Check answers']
        );
        
        this.createChecklist(
            'Science Project',
            'Solar system model presentation',
            'Science',
            'medium',
            new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            '2880',
            ['Research planet facts', 'Build 3D model', 'Prepare presentation slides', 'Practice speech']
        );
    }
}

// Global functions for onclick handlers
window.showCreateModal = () => window.checklistManager?.showCreateModal();
window.closeModal = () => window.checklistManager?.closeModal();
window.closeTaskModal = () => window.checklistManager?.closeTaskModal();
window.closeNotificationModal = () => window.notificationManager?.closeSettingsModal();
window.closeReportModal = () => document.getElementById('reportModal')?.classList.remove('active');
window.closeCreateUserModal = () => window.adminManager?.closeCreateUserModal();

window.saveNotificationSettings = () => window.notificationManager?.saveSettingsFromModal();
window.downloadReport = () => console.log('Download report functionality would be implemented here');

// Admin functions
window.switchAdminTab = (tabName) => {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
};

window.showCreateUserModal = () => document.getElementById('createUserModal')?.classList.add('active');
window.generateSystemReport = () => console.log('System report generation would be implemented here');
window.downloadUserActivityReport = () => console.log('User activity report download would be implemented here');
window.downloadPerformanceReport = () => console.log('Performance report download would be implemented here');
window.downloadAnalyticsReport = () => console.log('Analytics report download would be implemented here');
window.downloadUserManagementReport = () => console.log('User management report download would be implemented here');

// Auth form switching functions
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('authTitle').textContent = 'Welcome Back to EDUCHECK360';
    window.authManager?.removeMessages();
}

function showSignupForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('authTitle').textContent = 'Join EDUCHECK360';
    window.authManager?.removeMessages();
}

// Task input management functions
window.addTaskInput = (value = '') => window.checklistManager?.addTaskInput(value);
window.removeTaskInput = (button) => window.checklistManager?.removeTaskInput(button);

// Initialize the application
window.authManager = new AuthManager();

// Additional CSS animations
const style = document.createElement('style');
style.textContent = `
@keyframes slideOutNotification {
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
`;
document.head.appendChild(style);