class MultiUserTodoApp {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.todos = {};
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindAuthEvents();
        this.bindTodoEvents();
        this.checkLoginStatus();
    }

    // Authentication Methods
    bindAuthEvents() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchAuthTab(e.target.dataset.tab);
            });
        });

        // Enter key support
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (document.getElementById('loginForm').classList.contains('active')) {
                    this.login();
                } else if (document.getElementById('registerForm').classList.contains('active')) {
                    this.register();
                }
            }
        });
    }

    switchAuthTab(tab) {
        // Update tab appearance
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Show/hide forms
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${tab}Form`).classList.add('active');

        // Clear messages
        this.clearMessages();
    }

    loadUsers() {
        const savedUsers = JSON.parse(localStorage.getItem('todoUsers') || '{}');
        
        // Add default demo user if not exists
        if (!savedUsers['admin@test.com']) {
            savedUsers['admin@test.com'] = {
                name: 'Demo User',
                email: 'admin@test.com',
                password: 'password123',
                id: 'demo-user'
            };
        }
        
        return savedUsers;
    }

    saveUsers() {
        localStorage.setItem('todoUsers', JSON.stringify(this.users));
    }

    register() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            this.showError('All fields are required');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        if (this.users[email]) {
            this.showError('Email already exists');
            return;
        }

        // Create new user
        const userId = 'user-' + Date.now();
        this.users[email] = {
            name,
            email,
            password,
            id: userId
        };

        this.saveUsers();
        this.showSuccess('Registration successful! Please login.');
        
        // Switch to login tab
        setTimeout(() => {
            this.switchAuthTab('login');
            document.getElementById('loginEmail').value = email;
        }, 1500);
    }

    login() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showError('Email and password are required');
            return;
        }

        const user = this.users[email];
        if (!user || user.password !== password) {
            this.showError('Invalid email or password');
            return;
        }

        // Login successful
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.showApp();
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showAuth();
    }

    checkLoginStatus() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showApp();
        } else {
            this.showAuth();
        }
    }

    showAuth() {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('userHeader').style.display = 'none';
        document.getElementById('todoApp').style.display = 'none';
        this.clearAuthForms();
    }

    showApp() {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('userHeader').style.display = 'flex';
        document.getElementById('todoApp').style.display = 'block';
        
        // Update user info
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userEmail').textContent = this.currentUser.email;
        document.getElementById('userAvatar').textContent = this.currentUser.name.charAt(0).toUpperCase();
        
        // Load user's todos
        this.loadUserTodos();
        this.render();
    }

    clearAuthForms() {
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('registerName').value = '';
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        this.clearMessages();
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        document.getElementById('successMessage').style.display = 'none';
    }

    showSuccess(message) {
        const successDiv = document.getElementById('successMessage');
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        document.getElementById('errorMessage').style.display = 'none';
    }

    clearMessages() {
        document.getElementById('errorMessage').style.display = 'none';
        document.getElementById('successMessage').style.display = 'none';
    }

    // Todo Methods
    bindTodoEvents() {
        // Will be bound after login when elements are available
    }

    bindTodoEventsAfterLogin() {
        const addBtn = document.getElementById('addBtn');
        const taskInput = document.getElementById('taskInput');
        const dateInput = document.getElementById('dateInput');
        const filterSelect = document.getElementById('filterSelect');
        const deleteAllBtn = document.getElementById('deleteAllBtn');

        if (addBtn) addBtn.addEventListener('click', () => this.addTodo());
        if (taskInput) {
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addTodo();
            });
        }
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => this.filterTodos(e.target.value));
        }
        if (deleteAllBtn) {
            deleteAllBtn.addEventListener('click', () => this.deleteAllTodos());
        }
    }

    loadUserTodos() {
        if (!this.currentUser) return;
        
        const allTodos = JSON.parse(localStorage.getItem('allUserTodos') || '{}');
        this.todos = allTodos[this.currentUser.id] || [];
        
        // Bind events after elements are available
        setTimeout(() => this.bindTodoEventsAfterLogin(), 100);
    }

    saveUserTodos() {
        if (!this.currentUser) return;
        
        const allTodos = JSON.parse(localStorage.getItem('allUserTodos') || '{}');
        allTodos[this.currentUser.id] = this.todos;
        localStorage.setItem('allUserTodos', JSON.stringify(allTodos));
    }

    validateTodoInput() {
        const taskInput = document.getElementById('taskInput');
        const dateInput = document.getElementById('dateInput');
        let isValid = true;

        // Remove previous error states
        taskInput?.classList.remove('input-error');
        dateInput?.classList.remove('input-error');

        // Validate task input
        if (!taskInput?.value.trim()) {
            taskInput?.classList.add('input-error');
            isValid = false;
        }

        // Validate date input
        if (!dateInput?.value) {
            dateInput?.classList.add('input-error');
            isValid = false;
        }

        return isValid;
    }

    addTodo() {
        if (!this.validateTodoInput()) {
            return;
        }

        const taskInput = document.getElementById('taskInput');
        const dateInput = document.getElementById('dateInput');

        const todo = {
            id: Date.now(),
            task: taskInput.value.trim(),
            dueDate: dateInput.value,
            completed: false,
            createdAt: new Date(),
            userId: this.currentUser.id
        };

        this.todos.push(todo);
        taskInput.value = '';
        dateInput.value = '';
        
        // Remove error states after successful addition
        taskInput.classList.remove('input-error');
        dateInput.classList.remove('input-error');
        
        this.saveUserTodos();
        this.render();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveUserTodos();
        this.render();
    }

    toggleComplete(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveUserTodos();
            this.render();
        }
    }

    editTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            const newTask = prompt('Edit task:', todo.task);
            if (newTask !== null && newTask.trim()) {
                todo.task = newTask.trim();
                this.saveUserTodos();
                this.render();
            }
        }
    }

    filterTodos(filter) {
        this.currentFilter = filter;
        this.render();
    }

    deleteAllTodos() {
        if (this.todos.length === 0) return;
        
        const confirmDelete = confirm('Are you sure you want to delete all todos?');
        if (confirmDelete) {
            this.todos = [];
            this.saveUserTodos();
            this.render();
        }
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            case 'pending':
                return this.todos.filter(todo => !todo.completed);
            default:
                return this.todos;
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    render() {
        const tbody = document.getElementById('todoTableBody');
        if (!tbody) return;

        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            tbody.innerHTML = `
                <tr class="no-tasks">
                    <td colspan="4">No task found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredTodos.map(todo => {
            const daysUntilDue = this.getDaysUntilDue(todo.dueDate);
            const urgencyClass = this.getUrgencyClass(daysUntilDue);
            const urgencyIcon = this.getUrgencyIcon(daysUntilDue);
            
            return `
                <tr class="task-item ${todo.completed ? 'completed' : ''} ${urgencyClass}">
                    <td>
                        <div class="task-text">
                            ${urgencyIcon} ${todo.task}
                            ${this.getUrgencyBadge(daysUntilDue)}
                        </div>
                    </td>
                    <td>${this.formatDate(todo.dueDate)}</td>
                    <td>
                        <span class="status-badge ${todo.completed ? 'status-completed' : 'status-pending'}">
                            ${todo.completed ? 'Completed' : 'Pending'}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit-btn" onclick="app.editTodo(${todo.id})">
                                Edit
                            </button>
                            <button class="action-btn complete-btn" onclick="app.toggleComplete(${todo.id})">
                                ${todo.completed ? 'Undo' : 'Complete'}
                            </button>
                            <button class="action-btn delete-btn" onclick="app.deleteTodo(${todo.id})">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Notification and Alert System
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotificationAlert('🔔 Notifications enabled! You\'ll get deadline reminders.');
                }
            });
        }
    }

    startNotificationService() {
        // Check every hour for due tasks
        this.notificationInterval = setInterval(() => {
            this.checkDeadlines();
        }, 60 * 60 * 1000); // 1 hour

        // Check immediately
        this.checkDeadlines();
    }

    stopNotificationService() {
        if (this.notificationInterval) {
            clearInterval(this.notificationInterval);
            this.notificationInterval = null;
        }
    }

    checkDeadlines() {
        if (!this.currentUser || !this.todos.length) return;

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        this.todos.forEach(todo => {
            if (todo.completed) return;

            const dueDate = new Date(todo.dueDate);
            const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

            // Alert for tasks due tomorrow
            if (daysUntilDue === 1) {
                this.showDeadlineNotification(todo, 'tomorrow');
            }
            // Alert for tasks due today
            else if (daysUntilDue === 0) {
                this.showDeadlineNotification(todo, 'today');
            }
            // Alert for overdue tasks
            else if (daysUntilDue < 0) {
                this.showDeadlineNotification(todo, 'overdue');
            }
        });
    }

    showDeadlineNotification(todo, urgency) {
        const messages = {
            tomorrow: `⚠️ Task "${todo.task}" is due tomorrow!`,
            today: `🚨 Task "${todo.task}" is due TODAY!`,
            overdue: `❌ Task "${todo.task}" is OVERDUE!`
        };

        const message = messages[urgency];

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Todo Deadline Alert', {
                body: message,
                icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjAwOTkiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48cG9seWxpbmUgcG9pbnRzPSIxMiw2IDEyLDEyIDE2LDE0Ii8+PC9zdmc+',
                badge: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjAwOTkiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48cG9seWxpbmUgcG9pbnRzPSIxMiw2IDEyLDEyIDE2LDE0Ii8+PC9zdmc+',
                tag: `todo-${todo.id}`,
                requireInteraction: urgency === 'overdue'
            });
        }

        // In-app alert
        this.showNotificationAlert(message);

        // Sound alert for critical deadlines
        if (urgency === 'today' || urgency === 'overdue') {
            this.playAlertSound();
        }
    }

    showNotificationAlert(message) {
        // Create notification popup
        const notification = document.createElement('div');
        notification.className = 'notification-popup';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Animation
        setTimeout(() => notification.classList.add('show'), 100);
    }

    playAlertSound() {
        // Create audio context for alert sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Audio not available');
        }
    }

    getDaysUntilDue(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    }

    getUrgencyClass(daysUntilDue) {
        if (daysUntilDue < 0) return 'task-overdue';
        if (daysUntilDue === 0) return 'task-due-today';
        if (daysUntilDue === 1) return 'task-due-tomorrow';
        if (daysUntilDue <= 3) return 'task-due-soon';
        return '';
    }

    getUrgencyIcon(daysUntilDue) {
        if (daysUntilDue < 0) return '❌';
        if (daysUntilDue === 0) return '🚨';
        if (daysUntilDue === 1) return '⚠️';
        if (daysUntilDue <= 3) return '⏰';
        return '📋';
    }

    getUrgencyBadge(daysUntilDue) {
        if (daysUntilDue < 0) {
            const overdueDays = Math.abs(daysUntilDue);
            return `<span class="urgency-badge overdue">${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue</span>`;
        }
        if (daysUntilDue === 0) return `<span class="urgency-badge due-today">Due Today</span>`;
        if (daysUntilDue === 1) return `<span class="urgency-badge due-tomorrow">Due Tomorrow</span>`;
        if (daysUntilDue <= 3) return `<span class="urgency-badge due-soon">${daysUntilDue} days left</span>`;
        return '';
    }
}

// Global functions for inline event handlers
function login() {
    app.login();
}

function register() {
    app.register();
}

function logout() {
    app.logout();
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MultiUserTodoApp();
});