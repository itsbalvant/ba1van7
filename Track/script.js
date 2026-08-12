// Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
    }

    // Simple hash function for passwords (not cryptographically secure, but better than plain text)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    getUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : {};
    }

    saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    register(username, password, name, email) {
        const users = this.getUsers();
        
        if (users[username]) {
            return { success: false, message: 'Username already taken!' };
        }

        // No password validation - accept any password
        users[username] = {
            username,
            email: email || '',
            passwordHash: this.hashPassword(password || ''),
            name: name || username,
            createdAt: new Date().toISOString()
        };

        this.saveUsers(users);
        return { success: true, message: 'Registration successful!' };
    }

    login(username, password) {
        if (!username || username.trim() === '') {
            return { success: false, message: 'Username is required!' };
        }

        const users = this.getUsers();
        const user = users[username];

        if (!user) {
            return { success: false, message: 'Username not found!' };
        }

        // Check if password matches
        // Normalize password (handle empty string)
        const normalizedPassword = password || '';
        const providedPasswordHash = this.hashPassword(normalizedPassword);
        const storedPasswordHash = user.passwordHash || this.hashPassword('');
        
        // Compare password hashes
        if (providedPasswordHash !== storedPasswordHash) {
            return { success: false, message: 'Incorrect password!' };
        }

        // Set current user session
        const session = {
            username: user.username,
            email: user.email || '',
            name: user.name || user.username,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(session));
        this.currentUser = session;

        return { success: true, message: 'Login successful!', user: session };
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
    }

    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Goal Tracker Application
class GoalTracker {
    constructor(authManager) {
        this.authManager = authManager;
        this.currentUser = authManager.getCurrentUser();
        this.goals = this.loadGoals();
        this.editingGoalId = null;
        this.init();
    }

    async init() {
        this.renderGoals();
        this.updateStats();
        this.setupEventListeners();
        this.setupBountyHistoryListeners();
        // Update INR displays with current exchange rates
        await this.updateAllBountyINRDisplays();
    }

    async updateAllBountyINRDisplays() {
        const bountyGoals = this.goals.filter(g => g.isBountyGoal);
        for (const goal of bountyGoals) {
            await this.updateBountyINRDisplay(goal.id);
        }
    }

    setupBountyHistoryListeners() {
        // Use event delegation for bounty history delete buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.bounty-history-delete')) {
                const button = e.target.closest('.bounty-history-delete');
                const onclick = button.getAttribute('onclick');
                if (onclick) {
                    // Extract goalId and entryIndex from onclick
                    const match = onclick.match(/tracker\.removeBountyEntry\('([^']+)',\s*(\d+)\)/);
                    if (match) {
                        const goalId = match[1];
                        const entryIndex = parseInt(match[2]);
                        this.removeBountyEntry(goalId, entryIndex);
                    }
                }
            }
        });
    }

    setupEventListeners() {
        // Prevent duplicate event listeners
        if (this.listenersAttached) return;
        this.listenersAttached = true;

        // Add goal button
        const addGoalBtn = document.getElementById('addGoalBtn');
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => {
                this.openModal();
            });
        }

        // Close modal
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeModal();
            });
        }

        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Modal backdrop click
        const goalModal = document.getElementById('goalModal');
        if (goalModal) {
            goalModal.addEventListener('click', (e) => {
                if (e.target.id === 'goalModal') {
                    this.closeModal();
                }
            });
        }

        // Form submission - prevent multiple submissions
        const goalForm = document.getElementById('goalForm');
        if (goalForm) {
            goalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.isSaving) return; // Prevent multiple submissions
                this.saveGoal();
            });
        }
    }

    openModal(goalId = null) {
        const modal = document.getElementById('goalModal');
        const form = document.getElementById('goalForm');
        const modalTitle = document.getElementById('modalTitle');

        this.editingGoalId = goalId;

        if (goalId) {
            const goal = this.goals.find(g => g.id === goalId);
            if (goal) {
                modalTitle.textContent = 'Edit Goal';
                document.getElementById('goalTitle').value = goal.title;
                document.getElementById('goalDescription').value = goal.description || '';
                document.getElementById('goalCategory').value = goal.category || 'personal';
                document.getElementById('goalPriority').value = goal.priority || 'medium';
                document.getElementById('goalDueDate').value = goal.dueDate || '';
                document.getElementById('goalProgress').value = goal.progress || 0;
                document.getElementById('goalTags').value = goal.tags ? goal.tags.join(', ') : '';
            }
        } else {
            modalTitle.textContent = 'Add New Goal';
            form.reset();
            document.getElementById('goalProgress').value = 0;
        }

        modal.classList.add('active');
        document.getElementById('goalTitle').focus();
    }

    closeModal() {
        const modal = document.getElementById('goalModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.editingGoalId = null;
        this.isSaving = false; // Reset saving state
        const form = document.getElementById('goalForm');
        if (form) {
            form.reset();
        }
    }

    saveGoal() {
        // Prevent multiple submissions
        if (this.isSaving) return;
        this.isSaving = true;

        try {
            const titleInput = document.getElementById('goalTitle');
            if (!titleInput) {
                console.error('Goal title input not found');
                this.isSaving = false;
                return;
            }

            const title = titleInput.value.trim();
            if (!title) {
                alert('Please enter a goal title');
                this.isSaving = false;
                return;
            }

            const goalData = {
                title,
                description: document.getElementById('goalDescription')?.value.trim() || '',
                category: document.getElementById('goalCategory')?.value || 'personal',
                priority: document.getElementById('goalPriority')?.value || 'medium',
                dueDate: document.getElementById('goalDueDate')?.value || '',
                progress: parseInt(document.getElementById('goalProgress')?.value) || 0,
                completed: false,
                createdAt: new Date().toISOString()
            };

            if (this.editingGoalId) {
                // Update existing goal
                const goal = this.goals.find(g => g.id === this.editingGoalId);
                if (goal) {
                    // Preserve bounty-specific fields if it's a bounty goal
                    if (goal.isBountyGoal) {
                        goal.title = goalData.title;
                        goal.description = goalData.description;
                        goal.category = goalData.category;
                        goal.priority = goalData.priority;
                        goal.dueDate = goalData.dueDate;
                        // Don't update progress for bounty goals - it's calculated from earned/target
                        // Don't update completed - it's auto-set when target is reached
                    } else {
                        Object.assign(goal, goalData);
                    }
                    goal.updatedAt = new Date().toISOString();
                }
            } else {
                // Add new goal
                goalData.id = Date.now().toString();
                this.goals.push(goalData);
            }

            this.saveGoals();
            this.renderGoals();
            this.updateStats();
            this.closeModal();
        } catch (error) {
            console.error('Error saving goal:', error);
            alert('An error occurred while saving the goal. Please try again.');
        } finally {
            this.isSaving = false;
        }
    }

    deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.goals = this.goals.filter(g => g.id !== goalId);
            this.saveGoals();
            this.renderGoals();
            this.updateStats();
        }
    }

    toggleComplete(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.completed = !goal.completed;
            if (goal.completed && goal.progress < 100) {
                goal.progress = 100;
            } else if (!goal.completed && goal.progress === 100) {
                goal.progress = 99;
            }
            goal.updatedAt = new Date().toISOString();
            this.saveGoals();
            this.renderGoals();
            this.updateStats();
        }
    }

    getFilteredGoals() {
        // Return all goals sorted by newest first
        return [...this.goals].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    renderGoals() {
        const container = document.getElementById('goalsContainer');
        const emptyState = document.getElementById('emptyState');
        const filteredGoals = this.getFilteredGoals();

        if (filteredGoals.length === 0) {
            emptyState.classList.remove('hidden');
            container.innerHTML = '';
            container.appendChild(emptyState);
            return;
        }

        emptyState.classList.add('hidden');
        container.innerHTML = '';

        filteredGoals.forEach(goal => {
            const card = this.createGoalCard(goal);
            container.appendChild(card);
        });
    }

    createGoalCard(goal) {
        const card = document.createElement('div');
        card.className = `goal-card ${goal.completed ? 'completed' : ''} ${goal.isBountyGoal ? 'bounty-goal' : ''}`;
        card.dataset.goalId = goal.id;

        const isOverdue = goal.dueDate && new Date(goal.dueDate) < new Date() && !goal.completed;
        const dueDateFormatted = goal.dueDate 
            ? new Date(goal.dueDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            })
            : null;

        // Bounty-specific content
        let bountySection = '';
        if (goal.isBountyGoal) {
            const earned = goal.earnedAmount || 0;
            const target = goal.targetAmount || 100000;
            // Recalculate progress to ensure accuracy
            const progressPercent = target > 0 ? (earned / target) * 100 : 0;
            goal.progress = Math.min(100, Math.max(0, Math.round(progressPercent * 10) / 10)); // Round to 1 decimal place for better accuracy
            const formattedEarned = this.formatCurrency(earned);
            const formattedTarget = this.formatCurrency(target);
            const remaining = target - earned;
            const formattedRemaining = this.formatCurrency(remaining > 0 ? remaining : 0);
            
            // Calculate INR totals using historical exchange rates
            const totalINREarned = this.calculateTotalINREarned(goal.bountyHistory);
            const formattedEarnedINR = this.formatCurrencyINR(totalINREarned);
            // For target and remaining, use approximate rate (will be updated with real rate)
            const approximateRate = 83.0;
            const formattedTargetINR = this.formatCurrencyINR(target * approximateRate);
            const formattedRemainingINR = this.formatCurrencyINR(remaining * approximateRate);
            
            bountySection = `
                <div class="bounty-tracking">
                    <div class="bounty-amounts">
                        <div class="bounty-amount-item">
                            <span class="bounty-label">Earned</span>
                            <div class="bounty-value-group">
                                <span class="bounty-value earned">${formattedEarned}</span>
                                <span class="bounty-value-inr earned-inr">${formattedEarnedINR}</span>
                            </div>
                        </div>
                        <div class="bounty-amount-item">
                            <span class="bounty-label">Target</span>
                            <div class="bounty-value-group">
                                <span class="bounty-value target">${formattedTarget}</span>
                                <span class="bounty-value-inr target-inr">${formattedTargetINR}</span>
                            </div>
                        </div>
                        <div class="bounty-amount-item">
                            <span class="bounty-label">Remaining</span>
                            <div class="bounty-value-group">
                                <span class="bounty-value remaining">${formattedRemaining}</span>
                                <span class="bounty-value-inr remaining-inr">${formattedRemainingINR}</span>
                            </div>
                        </div>
                    </div>
                    <div class="bounty-add-section">
                        <div class="bounty-input-group">
                            <span class="currency-symbol">$</span>
                            <input type="number" 
                                   id="bounty-input-${goal.id}" 
                                   class="bounty-input" 
                                   placeholder="0.00" 
                                   min="0" 
                                   step="0.01">
                        </div>
                        <button class="btn btn-primary btn-small" onclick="tracker.addBounty('${goal.id}')">
                            💰 Add Bounty
                        </button>
                    </div>
                    ${goal.bountyHistory && goal.bountyHistory.length > 0 ? `
                        <div class="bounty-history">
                            <div class="bounty-history-title">Recent Bounties:</div>
                            <div class="bounty-history-list">
                                ${goal.bountyHistory.slice(-5).reverse().map((entry, index) => {
                                    const actualIndex = goal.bountyHistory.length - 1 - index;
                                    const inrAmount = entry.amount * (entry.exchangeRate || 83.0);
                                    return `
                                    <div class="bounty-history-item">
                                        <div class="bounty-history-content">
                                            <div class="bounty-history-amounts">
                                                <span class="bounty-history-amount">+${this.formatCurrency(entry.amount)}</span>
                                                <span class="bounty-history-amount-inr">(${this.formatCurrencyINR(inrAmount)})</span>
                                            </div>
                                            <span class="bounty-history-date">${new Date(entry.date).toLocaleDateString()}</span>
                                        </div>
                                        <button class="bounty-history-delete" onclick="tracker.removeBountyEntry('${goal.id}', ${actualIndex})" title="Remove this bounty">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        card.innerHTML = `
            <div class="goal-header">
                <div>
                    <h3 class="goal-title">${this.escapeHtml(goal.title)}</h3>
                </div>
                <div class="goal-actions">
                    <button class="action-btn edit" onclick="tracker.editGoal('${goal.id}')" title="Edit">
                        ✏️
                    </button>
                    <button class="action-btn delete" onclick="tracker.deleteGoal('${goal.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
            ${goal.description ? `<p class="goal-description">${this.escapeHtml(goal.description)}</p>` : ''}
            <div class="goal-meta">
                <span class="goal-badge badge-category">${this.formatCategory(goal.category)}</span>
                <span class="goal-badge badge-priority ${goal.priority}">${this.formatPriority(goal.priority)}</span>
                ${goal.isBountyGoal ? '<span class="goal-badge badge-bounty">💰 Bounty Goal</span>' : ''}
            </div>
            ${goal.tags && goal.tags.length > 0 ? `
                <div class="goal-tags">
                    ${goal.tags.map(tag => `<span class="goal-tag">#${this.escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
            ${bountySection}
            <div class="goal-progress">
                <div class="progress-label">
                    <span>Progress</span>
                    <span>${Math.round(goal.progress)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(100, Math.max(0, goal.progress))}%"></div>
                </div>
            </div>
            <div class="goal-footer">
                <div class="checkbox-container">
                    <input type="checkbox" id="check-${goal.id}" ${goal.completed ? 'checked' : ''} 
                           onchange="tracker.toggleComplete('${goal.id}')">
                    <label for="check-${goal.id}">${goal.completed ? 'Completed' : 'Mark as complete'}</label>
                </div>
                ${dueDateFormatted ? `
                    <div class="goal-due-date ${isOverdue ? 'overdue' : ''}">
                        📅 ${dueDateFormatted} ${isOverdue ? '(Overdue)' : ''}
                    </div>
                ` : ''}
            </div>
        `;

        return card;
    }

    editGoal(goalId) {
        this.openModal(goalId);
    }

    updateStats() {
        // Stats section removed - function kept for compatibility but does nothing
        // Can be used for future features if needed
    }

    formatCategory(category) {
        const categories = {
            personal: 'Personal',
            career: 'Career',
            health: 'Health',
            education: 'Education',
            finance: 'Finance',
            hobby: 'Hobby'
        };
        return categories[category] || category;
    }

    formatPriority(priority) {
        const priorities = {
            low: 'Low Priority',
            medium: 'Medium Priority',
            high: 'High Priority'
        };
        return priorities[priority] || priority;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatCurrencyINR(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    async fetchUSDToINRRate() {
        try {
            // Using exchangerate-api.com free endpoint (no API key needed for basic usage)
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            return data.rates.INR || 83.0; // Fallback to approximate rate if API fails
        } catch (error) {
            console.warn('Failed to fetch exchange rate, using fallback:', error);
            // Fallback to approximate rate
            return 83.0;
        }
    }

    calculateTotalINREarned(bountyHistory) {
        if (!bountyHistory || bountyHistory.length === 0) return 0;
        return bountyHistory.reduce((total, entry) => {
            const usdAmount = entry.amount || 0;
            const rate = entry.exchangeRate || 83.0; // Fallback rate
            return total + (usdAmount * rate);
        }, 0);
    }

    async addBounty(goalId) {
        // Find the goal index to ensure we're modifying the actual array element
        const goalIndex = this.goals.findIndex(g => g.id === goalId);
        if (goalIndex === -1) {
            console.error('Goal not found:', goalId);
            alert('Goal not found!');
            return;
        }
        
        const goal = this.goals[goalIndex];
        if (!goal.isBountyGoal) {
            console.error('Not a bounty goal:', goalId);
            return;
        }

        const input = document.getElementById(`bounty-input-${goalId}`);
        if (!input) {
            console.error('Input not found:', `bounty-input-${goalId}`);
            alert('Input field not found!');
            return;
        }

        const inputValue = input.value.trim().replace(/[$,]/g, ''); // Remove $ and commas
        const amount = parseFloat(inputValue);

        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid bounty amount');
            input.focus();
            return;
        }

        // Initialize earnedAmount if it doesn't exist
        if (typeof goal.earnedAmount !== 'number') {
            goal.earnedAmount = 0;
        }

        // Store old values for verification
        const oldEarned = goal.earnedAmount || 0;
        
        // Update earned amount directly in the array
        goal.earnedAmount = oldEarned + amount;
        
        // Update progress based on earned vs target (calculate accurately)
        const target = goal.targetAmount || 100000;
        const progressPercent = target > 0 ? (goal.earnedAmount / target) * 100 : 0;
        goal.progress = Math.min(100, Math.max(0, Math.round(progressPercent * 10) / 10)); // Round to 1 decimal place for better accuracy

        // Fetch current exchange rate and add to bounty history
        if (!goal.bountyHistory) {
            goal.bountyHistory = [];
        }
        
        // Fetch real-time exchange rate
        const exchangeRate = await this.fetchUSDToINRRate();
        
        goal.bountyHistory.push({
            amount: amount,
            date: new Date().toISOString(),
            exchangeRate: exchangeRate // Store the rate at the time of adding
        });

        // Auto-complete if target reached
        if (goal.earnedAmount >= target && !goal.completed) {
            goal.completed = true;
            goal.progress = 100;
        }

        goal.updatedAt = new Date().toISOString();
        
        // Save to localStorage first
        this.saveGoals();
        
        // Clear input immediately for better UX
        input.value = '';
        
        // Update DOM immediately for instant feedback
        const card = document.querySelector(`[data-goal-id="${goalId}"]`);
        if (card) {
            // Update earned amount display
            const earnedElement = card.querySelector('.bounty-value.earned');
            const remainingElement = card.querySelector('.bounty-value.remaining');
            const earnedINRElement = card.querySelector('.bounty-value-inr.earned-inr');
            const remainingINRElement = card.querySelector('.bounty-value-inr.remaining-inr');
            const progressFill = card.querySelector('.progress-fill');
            const progressLabel = card.querySelector('.progress-label span:last-child');
            
            if (earnedElement) {
                earnedElement.textContent = this.formatCurrency(goal.earnedAmount);
            }
            if (remainingElement) {
                const remaining = target - goal.earnedAmount;
                remainingElement.textContent = this.formatCurrency(remaining > 0 ? remaining : 0);
            }
            // Update INR values
            if (earnedINRElement) {
                const totalINREarned = this.calculateTotalINREarned(goal.bountyHistory);
                earnedINRElement.textContent = this.formatCurrencyINR(totalINREarned);
            }
            if (remainingINRElement) {
                const remaining = target - goal.earnedAmount;
                const currentRate = await this.fetchUSDToINRRate();
                remainingINRElement.textContent = this.formatCurrencyINR(remaining * currentRate);
            }
            if (progressFill) {
                // Ensure progress is calculated correctly for display
                const displayProgress = Math.min(100, Math.max(0, goal.progress));
                progressFill.style.width = displayProgress + '%';
            }
            if (progressLabel) {
                // Display progress with proper rounding
                const displayProgress = Math.min(100, Math.max(0, goal.progress));
                progressLabel.textContent = Math.round(displayProgress) + '%';
            }
            
            // Add to history if history section exists
            const historyList = card.querySelector('.bounty-history-list');
            if (historyList) {
                const historyItem = document.createElement('div');
                historyItem.className = 'bounty-history-item';
                const historyIndex = goal.bountyHistory.length - 1;
                const latestEntry = goal.bountyHistory[historyIndex];
                const inrAmount = latestEntry.amount * (latestEntry.exchangeRate || 83.0);
                historyItem.innerHTML = `
                    <div class="bounty-history-content">
                        <div class="bounty-history-amounts">
                            <span class="bounty-history-amount">+${this.formatCurrency(latestEntry.amount)}</span>
                            <span class="bounty-history-amount-inr">(${this.formatCurrencyINR(inrAmount)})</span>
                        </div>
                        <span class="bounty-history-date">${new Date(latestEntry.date).toLocaleDateString()}</span>
                    </div>
                    <button class="bounty-history-delete" onclick="tracker.removeBountyEntry('${goal.id}', ${historyIndex})" title="Remove this bounty">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                historyList.insertBefore(historyItem, historyList.firstChild);
                // Keep only last 5 items
                while (historyList.children.length > 5) {
                    historyList.removeChild(historyList.lastChild);
                }
            } else if (goal.bountyHistory && goal.bountyHistory.length > 0) {
                // If history section doesn't exist, we need to re-render
                this.renderGoals();
            }
        }
        
        // Update stats
        this.updateStats();
        
        // Update INR display with current rate
        await this.updateBountyINRDisplay(goalId);
        
        // Full re-render to ensure everything is in sync (happens after immediate update)
        setTimeout(() => {
            this.renderGoals();
        }, 100);
        
        // Show visual feedback
        if (card) {
            card.classList.add('bounty-added');
            setTimeout(() => {
                card.classList.remove('bounty-added');
            }, 500);
        }
    }

    async removeBountyEntry(goalId, entryIndex) {
        const goalIndex = this.goals.findIndex(g => g.id === goalId);
        if (goalIndex === -1) {
            console.error('Goal not found:', goalId);
            return;
        }

        const goal = this.goals[goalIndex];
        if (!goal.isBountyGoal || !goal.bountyHistory) {
            console.error('Not a bounty goal or no history');
            return;
        }

        // Validate index
        if (entryIndex < 0 || entryIndex >= goal.bountyHistory.length) {
            console.error('Invalid entry index:', entryIndex);
            return;
        }

        // Get the entry to remove
        const entryToRemove = goal.bountyHistory[entryIndex];
        const amountToRemove = entryToRemove.amount || 0;

        if (!confirm(`Remove bounty of ${this.formatCurrency(amountToRemove)}?`)) {
            return;
        }

        // Remove from history
        goal.bountyHistory.splice(entryIndex, 1);

        // Subtract from earned amount
        goal.earnedAmount = Math.max(0, (goal.earnedAmount || 0) - amountToRemove);

        // Update progress (calculate accurately)
        const target = goal.targetAmount || 100000;
        const progressPercent = target > 0 ? (goal.earnedAmount / target) * 100 : 0;
        goal.progress = Math.min(100, Math.max(0, Math.round(progressPercent * 10) / 10)); // Round to 1 decimal place for better accuracy

        // If earned amount is now less than target, un-complete if it was completed
        if (goal.earnedAmount < target && goal.completed) {
            goal.completed = false;
        }

        goal.updatedAt = new Date().toISOString();

        // Save to localStorage first
        this.saveGoals();

        // Update DOM immediately for instant feedback
        const card = document.querySelector(`[data-goal-id="${goalId}"]`);
        if (card) {
            // Update earned amount display
            const earnedElement = card.querySelector('.bounty-value.earned');
            const remainingElement = card.querySelector('.bounty-value.remaining');
            const progressFill = card.querySelector('.progress-fill');
            const progressLabel = card.querySelector('.progress-label span:last-child');
            
            if (earnedElement) {
                earnedElement.textContent = this.formatCurrency(goal.earnedAmount);
            }
            if (remainingElement) {
                const remaining = target - goal.earnedAmount;
                remainingElement.textContent = this.formatCurrency(remaining > 0 ? remaining : 0);
            }
            if (progressFill) {
                const displayProgress = Math.min(100, Math.max(0, goal.progress));
                progressFill.style.width = displayProgress + '%';
            }
            if (progressLabel) {
                const displayProgress = Math.min(100, Math.max(0, goal.progress));
                progressLabel.textContent = Math.round(displayProgress) + '%';
            }

            // Re-render the history section immediately
            const historySection = card.querySelector('.bounty-history');
            const historyList = card.querySelector('.bounty-history-list');
            if (historyList && goal.bountyHistory && goal.bountyHistory.length > 0) {
                // Re-render the history list
                historyList.innerHTML = goal.bountyHistory.slice(-5).reverse().map((entry, index) => {
                    const actualIndex = goal.bountyHistory.length - 1 - index;
                    const inrAmount = entry.amount * (entry.exchangeRate || 83.0);
                    return `
                    <div class="bounty-history-item">
                        <div class="bounty-history-content">
                            <div class="bounty-history-amounts">
                                <span class="bounty-history-amount">+${this.formatCurrency(entry.amount)}</span>
                                <span class="bounty-history-amount-inr">(${this.formatCurrencyINR(inrAmount)})</span>
                            </div>
                            <span class="bounty-history-date">${new Date(entry.date).toLocaleDateString()}</span>
                        </div>
                        <button class="bounty-history-delete" onclick="tracker.removeBountyEntry('${goal.id}', ${actualIndex})" title="Remove this bounty">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                }).join('');
            } else if (historySection && (!goal.bountyHistory || goal.bountyHistory.length === 0)) {
                // Hide history section if no entries
                historySection.style.display = 'none';
            }
        }

        // Update stats
        this.updateStats();
        
        // Update INR display after removal
        await this.updateBountyINRDisplay(goalId);
        
        // Full re-render to ensure everything is in sync
        setTimeout(() => {
            this.renderGoals();
        }, 100);
    }

    async updateBountyINRDisplay(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal || !goal.isBountyGoal) return;

        const card = document.querySelector(`[data-goal-id="${goalId}"]`);
        if (!card) return;

        const earnedINRElement = card.querySelector('.bounty-value-inr.earned-inr');
        const remainingINRElement = card.querySelector('.bounty-value-inr.remaining-inr');
        const targetINRElement = card.querySelector('.bounty-value-inr.target-inr');

        // Calculate total INR earned from history
        const totalINREarned = this.calculateTotalINREarned(goal.bountyHistory);
        
        // Fetch current rate for target and remaining
        const currentRate = await this.fetchUSDToINRRate();
        const target = goal.targetAmount || 100000;
        const remaining = target - (goal.earnedAmount || 0);

        if (earnedINRElement) {
            earnedINRElement.textContent = this.formatCurrencyINR(totalINREarned);
        }
        if (remainingINRElement) {
            remainingINRElement.textContent = this.formatCurrencyINR(remaining * currentRate);
        }
        if (targetINRElement) {
            targetINRElement.textContent = this.formatCurrencyINR(target * currentRate);
        }
    }

    saveGoals() {
        if (!this.currentUser) {
            console.error('No current user for saving goals');
            return;
        }
        try {
            const key = `goals_${this.currentUser.username}`;
            localStorage.setItem(key, JSON.stringify(this.goals));
        } catch (error) {
            console.error('Error saving goals to localStorage:', error);
            alert('Failed to save goals. Please check your browser storage settings.');
            throw error;
        }
    }

    loadGoals() {
        if (!this.currentUser) return [];
        
        const key = `goals_${this.currentUser.username}`;
        const stored = localStorage.getItem(key);
        let goals = stored ? JSON.parse(stored) : [];
        
        // Ensure bounty goals have required properties and recalculate progress
        goals.forEach(goal => {
            if (goal.isBountyGoal) {
                if (typeof goal.earnedAmount !== 'number') {
                    goal.earnedAmount = 0;
                }
                if (typeof goal.targetAmount !== 'number') {
                    goal.targetAmount = 100000;
                }
                if (!goal.bountyHistory) {
                    goal.bountyHistory = [];
                }
                // Ensure all bounty history entries have exchangeRate (for old entries)
                goal.bountyHistory.forEach(entry => {
                    if (!entry.exchangeRate) {
                        entry.exchangeRate = 83.0; // Default rate for old entries
                    }
                });
                // Recalculate progress from actual earned/target ratio for accuracy
                const target = goal.targetAmount || 100000;
                const earned = goal.earnedAmount || 0;
                const progressPercent = target > 0 ? (earned / target) * 100 : 0;
                goal.progress = Math.min(100, Math.max(0, Math.round(progressPercent * 10) / 10)); // Round to 1 decimal place for better accuracy
                // Update completion status based on actual progress
                if (earned >= target && !goal.completed) {
                    goal.completed = true;
                    goal.progress = 100;
                } else if (earned < target && goal.completed) {
                    goal.completed = false;
                }
            }
        });
        
        // Initialize with Bug Bounty goal if it doesn't exist
        const hasBountyGoal = goals.some(g => g.isBountyGoal);
        if (!hasBountyGoal) {
            const bountyGoal = {
                id: 'bounty-goal-100k',
                title: 'Bug Bounty 100k $ Goal',
                description: 'Track your bug bounty earnings and reach $100,000!',
                category: 'career',
                priority: 'high',
                isBountyGoal: true,
                targetAmount: 100000,
                earnedAmount: 0,
                progress: 0,
                completed: false,
                createdAt: new Date().toISOString(),
                bountyHistory: []
            };
            goals.unshift(bountyGoal); // Add at the beginning
            // Save directly to localStorage
            localStorage.setItem(key, JSON.stringify(goals));
        }
        
        return goals;
    }

    updateUser(user) {
        this.currentUser = user;
        // Reload goals for the new user
        this.goals = this.loadGoals();
        this.renderGoals();
        this.updateStats();
    }
}

// Expense Tracker Application
class ExpenseTracker {
    constructor(authManager) {
        this.authManager = authManager;
        this.currentUser = authManager.getCurrentUser();
        this.expenses = this.loadExpenses();
        this.currentFilter = 'all';
        this.currentDateFilter = '';
        this.init();
    }

    init() {
        this.renderExpenses();
        this.updateExpenseStats();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Prevent duplicate event listeners
        if (this.listenersAttached) return;
        this.listenersAttached = true;

        // Add expense button
        const addExpenseBtn = document.getElementById('addExpenseBtn');
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => {
                this.openModal();
            });
        }

        // Close modal
        const closeExpenseModal = document.getElementById('closeExpenseModal');
        if (closeExpenseModal) {
            closeExpenseModal.addEventListener('click', () => {
                this.closeModal();
            });
        }

        const cancelExpenseBtn = document.getElementById('cancelExpenseBtn');
        if (cancelExpenseBtn) {
            cancelExpenseBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Modal backdrop click
        const expenseModal = document.getElementById('expenseModal');
        if (expenseModal) {
            expenseModal.addEventListener('click', (e) => {
                if (e.target.id === 'expenseModal') {
                    this.closeModal();
                }
            });
        }

        // Form submission - prevent multiple submissions
        const expenseForm = document.getElementById('expenseForm');
        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.isSaving) return; // Prevent multiple submissions
                this.saveExpense();
            });
        }

        // Filters
        const expenseDateFilter = document.getElementById('expenseDateFilter');
        if (expenseDateFilter) {
            expenseDateFilter.addEventListener('change', (e) => {
                this.currentDateFilter = e.target.value;
                this.renderExpenses();
            });
        }

        const expenseCategoryFilter = document.getElementById('expenseCategoryFilter');
        if (expenseCategoryFilter) {
            expenseCategoryFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderExpenses();
            });
        }

        // Set today's date as default - this updates automatically each day
        const dateInput = document.getElementById('expenseDate');
        if (dateInput) {
            dateInput.valueAsDate = new Date();
        }

        // Setup event delegation for edit/delete buttons (only once)
        this.setupExpenseCardButtons();
    }

    setupExpenseCardButtons() {
        // Use event delegation for dynamically created buttons
        // This only needs to be set up once since we use event delegation
        const expensesList = document.getElementById('expensesList');
        if (expensesList && !expensesList.hasAttribute('data-listener-attached')) {
            expensesList.addEventListener('click', (e) => {
                const button = e.target.closest('.action-btn');
                if (!button) return;

                const expenseId = button.dataset.expenseId;
                const action = button.dataset.action;

                if (action === 'edit' && expenseId) {
                    this.editExpense(expenseId);
                } else if (action === 'delete' && expenseId) {
                    this.deleteExpense(expenseId);
                }
            });
            expensesList.setAttribute('data-listener-attached', 'true');
        }
    }

    openModal(expenseId = null) {
        const modal = document.getElementById('expenseModal');
        const form = document.getElementById('expenseForm');
        const modalTitle = document.getElementById('expenseModalTitle');
        const dateInput = document.getElementById('expenseDate');

        this.editingExpenseId = expenseId;

        if (expenseId) {
            const expense = this.expenses.find(e => e.id === expenseId);
            if (expense) {
                modalTitle.textContent = 'Edit Expense';
                document.getElementById('expenseAmount').value = expense.amount;
                document.getElementById('expenseCategory').value = expense.category;
                dateInput.value = expense.date;
                document.getElementById('expenseNotes').value = expense.notes || '';
            }
        } else {
            modalTitle.textContent = 'Add Expense';
            form.reset();
            // Always set to today's date automatically
            const today = new Date();
            dateInput.valueAsDate = today;
        }

        modal.classList.add('active');
        document.getElementById('expenseAmount').focus();
    }

    closeModal() {
        const modal = document.getElementById('expenseModal');
        if (modal) {
            modal.classList.remove('active');
        }
        // Always clear editing state and saving flag
        this.editingExpenseId = null;
        this.isSaving = false;
        
        const form = document.getElementById('expenseForm');
        if (form) {
            form.reset();
            // Reset to today's date for next time
            const dateInput = document.getElementById('expenseDate');
            if (dateInput) {
                dateInput.valueAsDate = new Date();
            }
        }
    }

    saveExpense() {
        // Prevent multiple submissions
        if (this.isSaving) {
            console.log('Already saving expense, ignoring duplicate submission');
            return;
        }
        this.isSaving = true;

        try {
            // Ensure expenses array exists
            if (!Array.isArray(this.expenses)) {
                console.warn('Expenses array is invalid, resetting');
                this.expenses = [];
            }

            const amountInput = document.getElementById('expenseAmount');
            if (!amountInput) {
                console.error('Expense amount input not found');
                this.isSaving = false;
                return;
            }

            const amount = parseFloat(amountInput.value);
            if (!amount || amount <= 0 || isNaN(amount)) {
                alert('Please enter a valid amount');
                this.isSaving = false;
                return;
            }

            const expenseData = {
                amount: amount,
                category: document.getElementById('expenseCategory')?.value || 'other',
                date: document.getElementById('expenseDate')?.value || new Date().toISOString().split('T')[0],
                notes: document.getElementById('expenseNotes')?.value.trim() || '',
                createdAt: new Date().toISOString()
            };

            if (this.editingExpenseId) {
                // Update existing expense
                const expenseIndex = this.expenses.findIndex(e => e.id === this.editingExpenseId);
                if (expenseIndex !== -1) {
                    Object.assign(this.expenses[expenseIndex], expenseData);
                    this.expenses[expenseIndex].updatedAt = new Date().toISOString();
                } else {
                    console.error('Expense not found for editing:', this.editingExpenseId);
                }
            } else {
                // Add new expense - use timestamp + random to prevent ID collisions
                expenseData.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                this.expenses.push(expenseData);
            }

            // Save first - wrap in try-catch to handle localStorage errors gracefully
            try {
                this.saveExpenses();
            } catch (saveError) {
                console.error('Error saving to localStorage:', saveError);
                // Continue anyway to update UI
            }
            
            // Clear editing state before closing modal
            this.editingExpenseId = null;
            
            // Then update UI immediately
            this.renderExpenses();
            this.updateExpenseStats();
            
            // Close modal
            this.closeModal();
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('An error occurred while saving the expense. Please try again.');
        } finally {
            this.isSaving = false;
        }
    }

    deleteExpense(expenseId) {
        if (confirm('Are you sure you want to delete this expense?')) {
            // Find the expense to get its amount for stats calculation
            const expense = this.expenses.find(e => e.id === expenseId);
            
            // Remove from array
            const expenseIndex = this.expenses.findIndex(e => e.id === expenseId);
            if (expenseIndex !== -1) {
                this.expenses.splice(expenseIndex, 1);
            }
            
            // Save immediately
            this.saveExpenses();
            
            // Remove card from DOM immediately for instant feedback
            const expenseCard = document.querySelector(`[data-expense-id="${expenseId}"]`);
            if (expenseCard) {
                expenseCard.style.transition = 'opacity 0.2s, transform 0.2s';
                expenseCard.style.opacity = '0';
                expenseCard.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    expenseCard.remove();
                }, 200);
            }
            
            // Update stats immediately
            this.updateExpenseStats();
            
            // Re-render to ensure everything is in sync (especially if filters are active)
            setTimeout(() => {
                this.renderExpenses();
            }, 250);
        }
    }

    getFilteredExpenses() {
        let filtered = [...this.expenses];

        // Apply category filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(e => e.category === this.currentFilter);
        }

        // Apply date filter
        if (this.currentDateFilter) {
            filtered = filtered.filter(e => e.date === this.currentDateFilter);
        }

        // Sort by date (newest first)
        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    renderExpenses() {
        const container = document.getElementById('expensesList');
        const emptyState = document.getElementById('expensesEmptyState');
        
        if (!container) return;
        
        const filteredExpenses = this.getFilteredExpenses();

        if (filteredExpenses.length === 0) {
            emptyState.classList.remove('hidden');
            container.innerHTML = '';
            container.appendChild(emptyState);
            // Update stats even when empty
            this.updateExpenseStats();
            return;
        }

        emptyState.classList.add('hidden');
        container.innerHTML = '';

        filteredExpenses.forEach(expense => {
            const card = this.createExpenseCard(expense);
            container.appendChild(card);
        });
    }

    createExpenseCard(expense) {
        const card = document.createElement('div');
        card.className = 'expense-card';
        card.dataset.expenseId = expense.id;

        const date = new Date(expense.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });

        const categoryIcons = {
            food: '🍔',
            transport: '🚗',
            shopping: '🛍️',
            bills: '💳',
            entertainment: '🎬',
            health: '💊',
            education: '📚',
            other: '📦'
        };

        const categoryNames = {
            food: 'Food & Dining',
            transport: 'Transport',
            shopping: 'Shopping',
            bills: 'Bills & Utilities',
            entertainment: 'Entertainment',
            health: 'Health & Fitness',
            education: 'Education',
            other: 'Other'
        };

        card.innerHTML = `
            <div class="expense-card-header">
                <div class="expense-card-left">
                    <div class="expense-category-icon">${categoryIcons[expense.category] || '📦'}</div>
                    <div class="expense-card-info">
                        <h3 class="expense-amount">${this.formatCurrency(expense.amount)}</h3>
                        <p class="expense-category">${categoryNames[expense.category] || expense.category}</p>
                    </div>
                </div>
                <div class="expense-card-actions">
                    <button class="action-btn edit" data-expense-id="${expense.id}" data-action="edit" title="Edit">
                        ✏️
                    </button>
                    <button class="action-btn delete" data-expense-id="${expense.id}" data-action="delete" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="expense-card-body">
                <div class="expense-date">
                    <i class="fas fa-calendar"></i>
                    ${formattedDate}
                </div>
                ${expense.notes ? `<div class="expense-notes">${this.escapeHtml(expense.notes)}</div>` : ''}
            </div>
        `;

        return card;
    }

    editExpense(expenseId) {
        this.openModal(expenseId);
    }

    updateExpenseStats() {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // Today's total
        const todayTotal = this.expenses
            .filter(e => e.date === today)
            .reduce((sum, e) => sum + e.amount, 0);

        // This month's total
        const monthTotal = this.expenses
            .filter(e => {
                const expenseDate = new Date(e.date);
                return expenseDate.getMonth() === currentMonth && 
                       expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, e) => sum + e.amount, 0);

        // Daily average for current month
        const monthExpenses = this.expenses.filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate.getMonth() === currentMonth && 
                   expenseDate.getFullYear() === currentYear;
        });
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const currentDay = new Date().getDate();
        const dailyAverage = monthExpenses.length > 0 
            ? monthTotal / currentDay 
            : 0;

        document.getElementById('todayTotal').textContent = this.formatCurrency(todayTotal);
        document.getElementById('monthTotal').textContent = this.formatCurrency(monthTotal);
        document.getElementById('dailyAverage').textContent = this.formatCurrency(dailyAverage);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveExpenses() {
        if (!this.currentUser) {
            console.error('No current user for saving expenses');
            return;
        }
        try {
            const key = `expenses_${this.currentUser.username}`;
            // Ensure expenses is an array
            if (!Array.isArray(this.expenses)) {
                console.warn('Expenses is not an array, resetting to empty array');
                this.expenses = [];
            }
            localStorage.setItem(key, JSON.stringify(this.expenses));
        } catch (error) {
            console.error('Error saving expenses to localStorage:', error);
            // Check if it's a quota exceeded error
            if (error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded! Please clear some data or use a different browser.');
            } else {
                alert('Failed to save expenses. Please check your browser storage settings.');
            }
            throw error;
        }
    }

    loadExpenses() {
        if (!this.currentUser) return [];
        const key = `expenses_${this.currentUser.username}`;
        try {
            const stored = localStorage.getItem(key);
            if (!stored) return [];
            const parsed = JSON.parse(stored);
            // Ensure it's an array
            if (!Array.isArray(parsed)) {
                console.warn('Expenses data is not an array, resetting');
                return [];
            }
            return parsed;
        } catch (error) {
            console.error('Error loading expenses:', error);
            return [];
        }
    }
}

// Lend Tracker Application
class LendTracker {
    constructor(authManager) {
        this.authManager = authManager;
        this.currentUser = authManager.getCurrentUser();
        this.lends = this.loadLends();
        this.currentFilter = 'all';
        this.editingLendId = null;
        this.init();
    }

    init() {
        this.renderLends();
        this.updateLendStats();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Prevent duplicate event listeners
        if (this.listenersAttached) return;
        this.listenersAttached = true;

        // Add lend button
        const addLendBtn = document.getElementById('addLendBtn');
        if (addLendBtn) {
            addLendBtn.addEventListener('click', () => {
                this.openModal();
            });
        }

        // Close modal
        const closeLendModal = document.getElementById('closeLendModal');
        if (closeLendModal) {
            closeLendModal.addEventListener('click', () => {
                this.closeModal();
            });
        }

        const cancelLendBtn = document.getElementById('cancelLendBtn');
        if (cancelLendBtn) {
            cancelLendBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Modal backdrop click
        const lendModal = document.getElementById('lendModal');
        if (lendModal) {
            lendModal.addEventListener('click', (e) => {
                if (e.target.id === 'lendModal') {
                    this.closeModal();
                }
            });
        }

        // Form submission - prevent multiple submissions
        const lendForm = document.getElementById('lendForm');
        if (lendForm) {
            lendForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.isSaving) {
                    console.log('Already saving, ignoring duplicate submission');
                    return; // Prevent multiple submissions
                }
                this.saveLend();
            });
        }

        // Status filter
        const lendStatusFilter = document.getElementById('lendStatusFilter');
        if (lendStatusFilter) {
            lendStatusFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderLends();
            });
        }

        // Setup event delegation for edit/delete buttons
        this.setupLendCardButtons();
    }

    setupLendCardButtons() {
        const lendList = document.getElementById('lendList');
        if (lendList && !lendList.hasAttribute('data-listener-attached')) {
            lendList.addEventListener('click', (e) => {
                const button = e.target.closest('.action-btn');
                if (!button) return;

                const lendId = button.dataset.lendId;
                const action = button.dataset.action;

                if (action === 'edit' && lendId) {
                    this.editLend(lendId);
                } else if (action === 'delete' && lendId) {
                    this.deleteLend(lendId);
                } else if (action === 'toggle' && lendId) {
                    this.toggleReturned(lendId);
                }
            });
            lendList.setAttribute('data-listener-attached', 'true');
        }
    }

    openModal(lendId = null) {
        const modal = document.getElementById('lendModal');
        const form = document.getElementById('lendForm');
        const modalTitle = document.getElementById('lendModalTitle');
        const dateInput = document.getElementById('lendDate');
        const dueDateInput = document.getElementById('lendDueDate');

        this.editingLendId = lendId;

        if (lendId) {
            const lend = this.lends.find(l => l.id === lendId);
            if (lend) {
                modalTitle.textContent = 'Edit Lend';
                document.getElementById('lendPersonName').value = lend.personName;
                document.getElementById('lendAmount').value = lend.amount;
                dateInput.value = lend.lendDate;
                dueDateInput.value = lend.dueDate;
                document.getElementById('lendNotes').value = lend.notes || '';
                document.getElementById('lendReturned').checked = lend.returned || false;
            }
        } else {
            modalTitle.textContent = 'Add Lend';
            form.reset();
            // Set default dates
            const today = new Date();
            dateInput.valueAsDate = today;
            // Set due date to 30 days from now
            const dueDate = new Date(today);
            dueDate.setDate(dueDate.getDate() + 30);
            dueDateInput.valueAsDate = dueDate;
        }

        modal.classList.add('active');
        document.getElementById('lendPersonName').focus();
    }

    closeModal() {
        try {
            const modal = document.getElementById('lendModal');
            if (modal) {
                modal.classList.remove('active');
                // Force remove active class in case of any CSS issues
                setTimeout(() => {
                    modal.classList.remove('active');
                }, 50);
            }
            this.editingLendId = null;
            this.isSaving = false; // Reset saving state
            const form = document.getElementById('lendForm');
            if (form) {
                form.reset();
                // Reset dates to defaults
                const dateInput = document.getElementById('lendDate');
                const dueDateInput = document.getElementById('lendDueDate');
                if (dateInput && dueDateInput) {
                    const today = new Date();
                    dateInput.valueAsDate = today;
                    const dueDate = new Date(today);
                    dueDate.setDate(dueDate.getDate() + 30);
                    dueDateInput.valueAsDate = dueDate;
                }
            }
        } catch (error) {
            console.error('Error closing modal:', error);
        }
    }

    saveLend() {
        // Prevent multiple submissions
        if (this.isSaving) return;
        this.isSaving = true;

        try {
            const personNameInput = document.getElementById('lendPersonName');
            const amountInput = document.getElementById('lendAmount');
            const lendDateInput = document.getElementById('lendDate');
            const dueDateInput = document.getElementById('lendDueDate');

            if (!personNameInput || !amountInput || !lendDateInput || !dueDateInput) {
                console.error('Required lend form inputs not found');
                this.isSaving = false;
                return;
            }

            const personName = personNameInput.value.trim();
            const amount = parseFloat(amountInput.value);
            const lendDate = lendDateInput.value;
            const dueDate = dueDateInput.value;
            const notes = document.getElementById('lendNotes')?.value.trim() || '';
            const returned = document.getElementById('lendReturned')?.checked || false;

            if (!personName || !amount || isNaN(amount) || amount <= 0 || !lendDate || !dueDate) {
                alert('Please fill in all required fields with valid values');
                this.isSaving = false;
                return;
            }

            if (this.editingLendId) {
                // Update existing
                const index = this.lends.findIndex(l => l.id === this.editingLendId);
                if (index !== -1) {
                    this.lends[index] = {
                        ...this.lends[index],
                        personName,
                        amount,
                        lendDate,
                        dueDate,
                        notes,
                        returned,
                        updatedAt: new Date().toISOString()
                    };
                } else {
                    console.error('Lend not found for editing:', this.editingLendId);
                }
            } else {
                // Add new
                const newLend = {
                    id: Date.now().toString(),
                    personName,
                    amount,
                    lendDate,
                    dueDate,
                    notes,
                    returned: returned, // Use the checkbox value
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                this.lends.unshift(newLend);
            }

            // Save first
            try {
                this.saveLends();
            } catch (saveError) {
                console.error('Error saving to localStorage:', saveError);
                // Continue anyway to update UI
            }

            // Get the newly added/updated lend
            const updatedLend = this.editingLendId 
                ? this.lends.find(l => l.id === this.editingLendId)
                : this.lends[0]; // New lends are added at the beginning

            // Update UI immediately - add card to DOM instantly
            if (updatedLend) {
                const container = document.getElementById('lendList');
                const emptyState = document.getElementById('lendEmptyState');
                
                if (!container) {
                    console.error('Lend list container not found!');
                    // Still update stats and close modal
                    this.updateLendStats();
                    this.closeModal();
                    return;
                }
                
                // Hide empty state
                if (emptyState) {
                    emptyState.classList.add('hidden');
                }
                
                // If editing, remove old card first
                if (this.editingLendId) {
                    const oldCard = container.querySelector(`[data-lend-id="${this.editingLendId}"]`);
                    if (oldCard) {
                        oldCard.remove();
                    }
                } else {
                    // For new lends, check if it should be visible based on current filter
                    const shouldShow = this.shouldShowLend(updatedLend);
                    if (!shouldShow) {
                        // If filtered out, just update stats and close modal
                        // The full render will handle it correctly
                        this.updateLendStats();
                        this.closeModal();
                        // Still do full render to ensure sync
                        setTimeout(() => {
                            this.renderLends();
                        }, 100);
                        return;
                    }
                }
                
                // Create and add new card immediately with animation
                const newCard = this.createLendCard(updatedLend);
                if (newCard) {
                    // Add animation
                    newCard.style.opacity = '0';
                    newCard.style.transform = 'translateY(-10px)';
                    container.insertBefore(newCard, container.firstChild);
                    
                    // Animate in
                    requestAnimationFrame(() => {
                        newCard.style.transition = 'opacity 0.3s, transform 0.3s';
                        newCard.style.opacity = '1';
                        newCard.style.transform = 'translateY(0)';
                    });
                } else {
                    console.error('Failed to create lend card');
                }
            } else {
                console.error('Updated lend not found after save');
            }

            // Update stats immediately
            this.updateLendStats();
            
            // Full re-render to ensure everything is in sync (but don't wait for it)
            setTimeout(() => {
                this.renderLends();
            }, 100);
            
            // Close modal immediately
            this.closeModal();
        } catch (error) {
            console.error('Error saving lend:', error);
            alert('An error occurred while saving the lend entry. Please try again.');
            // Still close modal even on error
            this.closeModal();
        } finally {
            this.isSaving = false;
        }
    }

    editLend(lendId) {
        this.openModal(lendId);
    }

    deleteLend(lendId) {
        if (confirm('Are you sure you want to delete this lend entry?')) {
            const lendIndex = this.lends.findIndex(l => l.id === lendId);
            if (lendIndex !== -1) {
                this.lends.splice(lendIndex, 1);
            }
            
            this.saveLends();
            
            // Remove card from DOM immediately
            const lendCard = document.querySelector(`[data-lend-id="${lendId}"]`);
            if (lendCard) {
                lendCard.style.transition = 'opacity 0.2s, transform 0.2s';
                lendCard.style.opacity = '0';
                lendCard.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    lendCard.remove();
                }, 200);
            }
            
            this.updateLendStats();
            
            setTimeout(() => {
                this.renderLends();
            }, 250);
        }
    }

    toggleReturned(lendId) {
        const lend = this.lends.find(l => l.id === lendId);
        if (!lend) {
            console.error('Lend not found:', lendId);
            return;
        }

        // Toggle the returned status
        lend.returned = !lend.returned;
        lend.updatedAt = new Date().toISOString();

        // Save immediately
        this.saveLends();

        // Update the card DOM immediately for instant feedback
        const lendCard = document.querySelector(`[data-lend-id="${lendId}"]`);
        if (lendCard) {
            // Update card class
            if (lend.returned) {
                lendCard.classList.add('returned');
            } else {
                lendCard.classList.remove('returned');
            }

            // Update the toggle button
            const toggleBtn = lendCard.querySelector('.action-btn.toggle');
            if (toggleBtn) {
                toggleBtn.innerHTML = lend.returned ? '↩️' : '✓';
                toggleBtn.title = lend.returned ? 'Mark as pending' : 'Mark as returned';
            }

            // Update the due date section
            const dueDateItem = lendCard.querySelector('.lend-date-item');
            const daysBadge = dueDateItem?.querySelector('.lend-days-badge');
            if (dueDateItem && daysBadge) {
                if (lend.returned) {
                    daysBadge.textContent = 'Returned';
                    daysBadge.className = 'lend-days-badge returned';
                    dueDateItem.classList.remove('overdue');
                } else {
                    // Recalculate days
                    const dueDate = new Date(lend.dueDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    dueDate.setHours(0, 0, 0, 0);
                    const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                    const isOverdue = dueDate < today;
                    
                    if (isOverdue) {
                        daysBadge.textContent = `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''} overdue`;
                        daysBadge.className = 'lend-days-badge overdue';
                        dueDateItem.classList.add('overdue');
                    } else {
                        daysBadge.textContent = `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`;
                        daysBadge.className = 'lend-days-badge';
                        dueDateItem.classList.remove('overdue');
                    }
                }
            }
        }

        // Update stats immediately
        this.updateLendStats();

        // Full re-render to ensure everything is in sync
        setTimeout(() => {
            this.renderLends();
        }, 100);
    }

    shouldShowLend(lend) {
        const today = new Date().toISOString().split('T')[0];
        
        if (this.currentFilter === 'pending') {
            return !lend.returned;
        } else if (this.currentFilter === 'returned') {
            return lend.returned;
        } else if (this.currentFilter === 'overdue') {
            return !lend.returned && lend.dueDate < today;
        }
        
        return true; // 'all' filter
    }

    getFilteredLends() {
        let filtered = [...this.lends];
        const today = new Date().toISOString().split('T')[0];

        if (this.currentFilter === 'pending') {
            filtered = filtered.filter(l => !l.returned);
        } else if (this.currentFilter === 'returned') {
            filtered = filtered.filter(l => l.returned);
        } else if (this.currentFilter === 'overdue') {
            filtered = filtered.filter(l => !l.returned && l.dueDate < today);
        }

        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    renderLends() {
        const container = document.getElementById('lendList');
        const emptyState = document.getElementById('lendEmptyState');
        
        if (!container) {
            console.error('Lend list container not found in renderLends');
            return;
        }
        
        const filteredLends = this.getFilteredLends();

        if (filteredLends.length === 0) {
            if (emptyState) {
                emptyState.classList.remove('hidden');
            }
            container.innerHTML = '';
            if (emptyState) {
                container.appendChild(emptyState);
            }
            return;
        }

        if (emptyState) {
            emptyState.classList.add('hidden');
        }
        
        // Clear container
        container.innerHTML = '';

        // Render all filtered lends
        filteredLends.forEach(lend => {
            const card = this.createLendCard(lend);
            if (card) {
                container.appendChild(card);
            }
        });
    }

    createLendCard(lend) {
        const card = document.createElement('div');
        card.className = `lend-card ${lend.returned ? 'returned' : ''}`;
        card.dataset.lendId = lend.id;

        const lendDate = new Date(lend.lendDate);
        const dueDate = new Date(lend.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        const isOverdue = !lend.returned && dueDate < today;
        const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        const daysSinceLend = Math.ceil((today - lendDate) / (1000 * 60 * 60 * 24));

        const formattedLendDate = lendDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        const formattedDueDate = dueDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });

        card.innerHTML = `
            <div class="lend-card-header">
                <div class="lend-card-left">
                    <div class="lend-person-icon">👤</div>
                    <div class="lend-card-info">
                        <h3 class="lend-person-name">${this.escapeHtml(lend.personName)}</h3>
                        <p class="lend-amount">${this.formatCurrency(lend.amount)}</p>
                    </div>
                </div>
                <div class="lend-card-actions">
                    <button class="action-btn toggle" data-lend-id="${lend.id}" data-action="toggle" title="${lend.returned ? 'Mark as pending' : 'Mark as returned'}">
                        ${lend.returned ? '↩️' : '✓'}
                    </button>
                    <button class="action-btn edit" data-lend-id="${lend.id}" data-action="edit" title="Edit">
                        ✏️
                    </button>
                    <button class="action-btn delete" data-lend-id="${lend.id}" data-action="delete" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="lend-card-body">
                <div class="lend-dates">
                    <div class="lend-date-item">
                        <i class="fas fa-calendar-plus"></i>
                        <span>Lent: ${formattedLendDate}</span>
                        <span class="lend-days-badge">${daysSinceLend} day${daysSinceLend !== 1 ? 's' : ''} ago</span>
                    </div>
                    <div class="lend-date-item ${isOverdue ? 'overdue' : ''}">
                        <i class="fas fa-calendar-check"></i>
                        <span>Due: ${formattedDueDate}</span>
                        ${!lend.returned ? `
                            <span class="lend-days-badge ${isOverdue ? 'overdue' : ''}">
                                ${isOverdue ? `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''} overdue` : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`}
                            </span>
                        ` : '<span class="lend-days-badge returned">Returned</span>'}
                    </div>
                </div>
                ${lend.notes ? `<div class="lend-notes">${this.escapeHtml(lend.notes)}</div>` : ''}
            </div>
        `;

        return card;
    }

    updateLendStats() {
        const totalLent = this.lends.reduce((sum, l) => sum + l.amount, 0);
        const pendingAmount = this.lends.filter(l => !l.returned).reduce((sum, l) => sum + l.amount, 0);
        const returnedAmount = this.lends.filter(l => l.returned).reduce((sum, l) => sum + l.amount, 0);

        document.getElementById('totalLent').textContent = this.formatCurrency(totalLent);
        document.getElementById('pendingAmount').textContent = this.formatCurrency(pendingAmount);
        document.getElementById('returnedAmount').textContent = this.formatCurrency(returnedAmount);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveLends() {
        if (!this.currentUser) {
            console.error('No current user for saving lends');
            return;
        }
        try {
            const key = `lends_${this.currentUser.username}`;
            localStorage.setItem(key, JSON.stringify(this.lends));
        } catch (error) {
            console.error('Error saving lends to localStorage:', error);
            alert('Failed to save lends. Please check your browser storage settings.');
            throw error;
        }
    }

    loadLends() {
        if (!this.currentUser) return [];
        const key = `lends_${this.currentUser.username}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    }
}

// Initialize the application
let tracker;
let expenseTracker;
let lendTracker;
let authManager;

document.addEventListener('DOMContentLoaded', () => {
    // Set dark mode as default if no theme is stored
    if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        const savedTheme = localStorage.getItem('theme');
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    authManager = new AuthManager();
    
    // Check if user is logged in
    if (!authManager.isLoggedIn()) {
        showAuthModal();
    } else {
        // User is already logged in, show main content
        document.querySelector('.main-content').style.display = 'block';
        initializeApp();
    }
    
    setupAuthListeners();
});

function initializeApp() {
    const user = authManager.getCurrentUser();
    if (!user) {
        console.error('No user found');
        return;
    }
    
    // Hide auth modal first
    document.getElementById('authModal').classList.remove('active');
    
    // Show main content
    document.querySelector('.main-content').style.display = 'block';
    
    // Initialize trackers
    tracker = new GoalTracker(authManager);
    expenseTracker = new ExpenseTracker(authManager);
    lendTracker = new LendTracker(authManager);
    
    // Make trackers globally accessible for onclick handlers
    window.tracker = tracker;
    window.expenseTracker = expenseTracker;
    window.lendTracker = lendTracker;
    
    // Show user info
    document.getElementById('userName').textContent = user.name || user.username;
    document.getElementById('userInfo').style.display = 'flex';
    
    // Initialize new features
    setupThemeToggle();
    setupMainNavigation();
    setupDataImportExport();
    initParticles();
}

function showAuthModal() {
    const authModal = document.getElementById('authModal');
    const authForm = document.getElementById('authForm');
    
    // Reset form
    if (authForm) {
        authForm.reset();
    }
    
    // Reset to login tab
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(t => t.classList.remove('active'));
    const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
    if (loginTab) {
        loginTab.classList.add('active');
    }
    
    // Reset form fields visibility
    document.getElementById('registerFields').style.display = 'none';
    document.getElementById('emailFieldLogin').style.display = 'block';
    document.getElementById('confirmPasswordGroup').style.display = 'none';
    document.getElementById('authModalTitle').textContent = 'Welcome';
    document.getElementById('authSubmitBtn').textContent = 'Sign In';
    
    // Clear error/success messages
    const errorDiv = document.getElementById('authError');
    const successDiv = document.getElementById('authSuccess');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }
    if (successDiv) {
        successDiv.textContent = '';
        successDiv.style.display = 'none';
    }
    
    // Show modal and focus
    authModal.classList.add('active');
    document.getElementById('authUsername').focus();
    
    // Hide main content until logged in
    document.querySelector('.main-content').style.display = 'none';
}

function setupAuthListeners() {
    const authModal = document.getElementById('authModal');
    const authForm = document.getElementById('authForm');
    const authTabs = document.querySelectorAll('.auth-tab');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const logoutBtn = document.getElementById('logoutBtn');

    // Auth tabs (Login/Register)
    authTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            authTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            const isRegister = e.target.dataset.tab === 'register';
            document.getElementById('authModalTitle').textContent = isRegister ? 'Create Account' : 'Welcome';
            document.getElementById('registerFields').style.display = isRegister ? 'block' : 'none';
            document.getElementById('emailFieldLogin').style.display = isRegister ? 'none' : 'block';
            document.getElementById('confirmPasswordGroup').style.display = isRegister ? 'block' : 'none';
            document.getElementById('authSubmitBtn').textContent = isRegister ? 'Create Account' : 'Sign In';
            document.getElementById('authError').textContent = '';
            document.getElementById('authError').style.display = 'none';
            document.getElementById('authSuccess').textContent = '';
            document.getElementById('authSuccess').style.display = 'none';
            authForm.reset();
        });
    });

    // Close auth modal
    closeAuthModal.addEventListener('click', () => {
        if (!authManager.isLoggedIn()) {
            // Don't allow closing if not logged in
            return;
        }
        authModal.classList.remove('active');
    });

    // Auth form submission
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('authUsername').value.trim();
        const password = document.getElementById('authPassword').value;
        const errorDiv = document.getElementById('authError');
        const successDiv = document.getElementById('authSuccess');
        const isRegister = document.querySelector('.auth-tab.active').dataset.tab === 'register';

        // Clear previous messages
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
        successDiv.textContent = '';
        successDiv.style.display = 'none';

        if (!username) {
            errorDiv.textContent = 'Username is required!';
            errorDiv.style.display = 'block';
            return;
        }

        if (isRegister) {
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('authEmail').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password && confirmPassword && password !== confirmPassword) {
                errorDiv.textContent = 'Passwords do not match!';
                errorDiv.style.display = 'block';
                return;
            }
            
            const result = authManager.register(username, password, name, email);
            if (result.success) {
                successDiv.textContent = 'Registration successful! Logging you in...';
                successDiv.style.display = 'block';
                
                // Auto-login after registration
                setTimeout(() => {
                    const loginResult = authManager.login(username, password);
                    if (loginResult.success) {
                        successDiv.textContent = 'Login successful! Redirecting...';
                        // Close modal and redirect immediately
                        document.getElementById('authModal').classList.remove('active');
                        document.querySelector('.main-content').style.display = 'block';
                        initializeApp();
                    } else {
                        errorDiv.textContent = loginResult.message;
                        errorDiv.style.display = 'block';
                        successDiv.style.display = 'none';
                    }
                }, 800);
            } else {
                errorDiv.textContent = result.message;
                errorDiv.style.display = 'block';
            }
        } else {
            // Login attempt
            const email = document.getElementById('authEmailLogin').value.trim();
            const result = authManager.login(username, password);
            
            if (result.success) {
                successDiv.textContent = 'Login successful! Redirecting...';
                successDiv.style.display = 'block';
                errorDiv.style.display = 'none';
                
                // Close modal and redirect immediately
                setTimeout(() => {
                    document.getElementById('authModal').classList.remove('active');
                    document.querySelector('.main-content').style.display = 'block';
                    initializeApp();
                }, 300);
            } else {
                errorDiv.textContent = result.message;
                errorDiv.style.display = 'block';
                successDiv.style.display = 'none';
                console.error('Login failed:', result.message);
            }
        }
    });

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                authManager.logout();
                
                // Clear all trackers
                tracker = null;
                expenseTracker = null;
                lendTracker = null;
                
                // Hide user info and main content
                document.getElementById('userInfo').style.display = 'none';
                document.querySelector('.main-content').style.display = 'none';
                
                // Reset auth form and show login tab
                const authForm = document.getElementById('authForm');
                if (authForm) {
                    authForm.reset();
                }
                
                // Reset to login tab
                const authTabs = document.querySelectorAll('.auth-tab');
                authTabs.forEach(t => t.classList.remove('active'));
                const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
                if (loginTab) {
                    loginTab.classList.add('active');
                }
                
                // Reset form fields visibility
                document.getElementById('registerFields').style.display = 'none';
                document.getElementById('emailFieldLogin').style.display = 'block';
                document.getElementById('confirmPasswordGroup').style.display = 'none';
                document.getElementById('authModalTitle').textContent = 'Welcome';
                document.getElementById('authSubmitBtn').textContent = 'Sign In';
                
                // Clear error/success messages
                const errorDiv = document.getElementById('authError');
                const successDiv = document.getElementById('authSuccess');
                if (errorDiv) {
                    errorDiv.textContent = '';
                    errorDiv.style.display = 'none';
                }
                if (successDiv) {
                    successDiv.textContent = '';
                    successDiv.style.display = 'none';
                }
                
                // Show auth modal
                showAuthModal();
            }
        });
    }

    // Prevent closing auth modal by clicking outside if not logged in
    authModal.addEventListener('click', (e) => {
        if (e.target.id === 'authModal' && !authManager.isLoggedIn()) {
            // Don't allow closing
            return;
        }
    });
}

// Data Import/Export Functions
function setupDataImportExport() {
    const downloadBtn = document.getElementById('downloadDataBtn');
    const uploadBtn = document.getElementById('uploadDataBtn');
    const fileInput = document.getElementById('dataFileInput');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            downloadAllData();
        });
    }

    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                uploadData(file);
            }
            // Reset input so same file can be selected again
            e.target.value = '';
        });
    }
}

function downloadAllData() {
    const currentUser = authManager.getCurrentUser();
    if (!currentUser) {
        alert('Please login first to download data');
        return;
    }

    try {
        // Get all user data
        const username = currentUser.username;
        const goalsKey = `goals_${username}`;
        const expensesKey = `expenses_${username}`;
        const lendsKey = `lends_${username}`;

        const goals = JSON.parse(localStorage.getItem(goalsKey) || '[]');
        const expenses = JSON.parse(localStorage.getItem(expensesKey) || '[]');
        const lends = JSON.parse(localStorage.getItem(lendsKey) || '[]');
        const users = authManager.getUsers();
        const userData = users[username] || {};

        // Create export data object
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            username: username,
            user: {
                username: userData.username,
                name: userData.name,
                email: userData.email,
                createdAt: userData.createdAt
            },
            goals: goals,
            expenses: expenses,
            lends: lends,
            theme: localStorage.getItem('theme') || 'dark'
        };

        // Create blob and download
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `goal-tracker-backup-${username}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert('Data downloaded successfully!');
    } catch (error) {
        console.error('Error downloading data:', error);
        alert('Failed to download data. Please try again.');
    }
}

function uploadData(file) {
    const currentUser = authManager.getCurrentUser();
    if (!currentUser) {
        alert('Please login first to upload data');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const importData = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!importData.goals || !importData.expenses || !importData.lends) {
                alert('Invalid data file. Please make sure it\'s a valid backup file.');
                return;
            }

            // Use current logged-in user's username, not the imported username
            const currentUsername = currentUser.username;
            
            // Confirm upload
            if (!confirm(`This will replace all your current data for user "${currentUsername}". Are you sure you want to continue?`)) {
                return;
            }

            // Use current user's keys, not the imported username's keys
            const goalsKey = `goals_${currentUsername}`;
            const expensesKey = `expenses_${currentUsername}`;
            const lendsKey = `lends_${currentUsername}`;

            // Import data to current user's storage keys
            const goalsData = importData.goals || [];
            const expensesData = importData.expenses || [];
            const lendsData = importData.lends || [];

            localStorage.setItem(goalsKey, JSON.stringify(goalsData));
            localStorage.setItem(expensesKey, JSON.stringify(expensesData));
            localStorage.setItem(lendsKey, JSON.stringify(lendsData));

            // Verify data was saved
            const savedGoals = JSON.parse(localStorage.getItem(goalsKey) || '[]');
            const savedExpenses = JSON.parse(localStorage.getItem(expensesKey) || '[]');
            const savedLends = JSON.parse(localStorage.getItem(lendsKey) || '[]');

            console.log('Data import summary:', {
                currentUser: currentUsername,
                goalsImported: goalsData.length,
                expensesImported: expensesData.length,
                lendsImported: lendsData.length,
                goalsSaved: savedGoals.length,
                expensesSaved: savedExpenses.length,
                lendsSaved: savedLends.length
            });

            // Import theme if provided
            if (importData.theme) {
                localStorage.setItem('theme', importData.theme);
                document.documentElement.setAttribute('data-theme', importData.theme);
                const icon = document.getElementById('themeIcon');
                if (icon) {
                    icon.className = importData.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
            }

            // Show success message with details
            const summary = `Imported: ${goalsData.length} goals, ${expensesData.length} expenses, ${lendsData.length} lends`;
            alert(`Data imported successfully!\n\n${summary}\n\nReloading page...`);
            
            // Reload the application to show imported data
            setTimeout(() => {
                location.reload();
            }, 500);

        } catch (error) {
            console.error('Error importing data:', error);
            alert('Failed to import data. Please make sure the file is valid JSON and try again.');
        }
    };

    reader.onerror = () => {
        alert('Error reading file. Please try again.');
    };

    reader.readAsText(file);
}

// Theme Toggle
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const currentTheme = localStorage.getItem('theme') || 'dark'; // Default to dark mode
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Search Functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    
    searchInput.addEventListener('input', (e) => {
        if (tracker) {
            tracker.searchQuery = e.target.value;
            tracker.renderGoals();
        }
        clearSearch.style.display = e.target.value ? 'flex' : 'none';
    });
    
    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        clearSearch.style.display = 'none';
        if (tracker) {
            tracker.searchQuery = '';
            tracker.renderGoals();
        }
    });
}

// Sort Functionality
function setupSort() {
    const sortBtn = document.getElementById('sortBtn');
    const sortMenu = document.getElementById('sortMenu');
    const sortText = document.getElementById('sortText');
    const sortOptions = document.querySelectorAll('.sort-option');
    
    sortBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sortMenu.classList.toggle('active');
    });
    
    document.addEventListener('click', (e) => {
        if (!sortBtn.contains(e.target) && !sortMenu.contains(e.target)) {
            sortMenu.classList.remove('active');
        }
    });
    
    sortOptions.forEach(option => {
        option.addEventListener('click', () => {
            const sortType = option.dataset.sort;
            if (tracker) {
                tracker.currentSort = sortType;
                tracker.renderGoals();
                sortText.textContent = option.textContent;
                sortMenu.classList.remove('active');
            }
        });
    });
}

// Export/Import
function setupExportImport() {
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    
    exportBtn.addEventListener('click', () => {
        if (!tracker) return;
        const data = {
            goals: tracker.goals,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `goals-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });
    
    importBtn.addEventListener('click', () => {
        importFile.click();
    });
    
    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.goals && Array.isArray(data.goals)) {
                    if (confirm(`Import ${data.goals.length} goals? This will add them to your existing goals.`)) {
                        if (tracker) {
                            tracker.goals = [...tracker.goals, ...data.goals];
                            tracker.saveGoals();
                            tracker.renderGoals();
                            tracker.updateStats();
                            alert('Goals imported successfully!');
                        }
                    }
                } else {
                    alert('Invalid file format!');
                }
            } catch (error) {
                alert('Error importing file: ' + error.message);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });
}

// Statistics
function setupStatistics() {
    const statsBtn = document.getElementById('statsBtn');
    const statsModal = document.getElementById('statsModal');
    const closeStatsModal = document.getElementById('closeStatsModal');
    
    statsBtn.addEventListener('click', () => {
        if (tracker) {
            updateStatistics();
            statsModal.classList.add('active');
        }
    });
    
    closeStatsModal.addEventListener('click', () => {
        statsModal.classList.remove('active');
    });
    
    statsModal.addEventListener('click', (e) => {
        if (e.target.id === 'statsModal') {
            statsModal.classList.remove('active');
        }
    });
}

function updateStatistics() {
    if (!tracker) return;
    
    const goals = tracker.goals;
    const total = goals.length;
    const completed = goals.filter(g => g.completed).length;
    const active = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    document.getElementById('statTotalGoals').textContent = total;
    document.getElementById('statCompleted').textContent = completed;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statProgress').textContent = progress + '%';
    
    // Category chart
    const categoryCounts = {};
    goals.forEach(g => {
        const cat = g.category || 'other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    const categoryChart = document.getElementById('categoryChart');
    categoryChart.innerHTML = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, count]) => `
            <div class="chart-item">
                <div class="chart-label">${tracker.formatCategory(cat)}</div>
                <div class="chart-bar">
                    <div class="chart-fill" style="width: ${(count / total) * 100}%">${count}</div>
                </div>
            </div>
        `).join('');
    
    // Priority chart
    const priorityCounts = { high: 0, medium: 0, low: 0 };
    goals.forEach(g => {
        const pri = g.priority || 'medium';
        priorityCounts[pri] = (priorityCounts[pri] || 0) + 1;
    });
    
    const priorityChart = document.getElementById('priorityChart');
    priorityChart.innerHTML = ['high', 'medium', 'low'].map(pri => {
        const count = priorityCounts[pri] || 0;
        return `
            <div class="chart-item">
                <div class="chart-label">${tracker.formatPriority(pri)}</div>
                <div class="chart-bar">
                    <div class="chart-fill" style="width: ${total > 0 ? (count / total) * 100 : 0}%">${count}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Templates
function setupTemplates() {
    const templateBtn = document.getElementById('templateBtn');
    const templateModal = document.getElementById('templateModal');
    const closeTemplateModal = document.getElementById('closeTemplateModal');
    const templatesGrid = document.getElementById('templatesGrid');
    
    const templates = [
        { icon: '💼', title: 'Career Growth', description: 'Advance in your career', category: 'career', priority: 'high' },
        { icon: '💪', title: 'Fitness Goal', description: 'Get in shape and stay healthy', category: 'health', priority: 'high' },
        { icon: '📚', title: 'Learn New Skill', description: 'Master a new technology or skill', category: 'education', priority: 'medium' },
        { icon: '💰', title: 'Save Money', description: 'Build your savings', category: 'finance', priority: 'high' },
        { icon: '🎨', title: 'Creative Project', description: 'Complete a creative endeavor', category: 'hobby', priority: 'low' },
        { icon: '🏠', title: 'Home Improvement', description: 'Improve your living space', category: 'personal', priority: 'medium' }
    ];
    
    templatesGrid.innerHTML = templates.map(t => `
        <div class="template-card" data-template='${JSON.stringify(t)}'>
            <span class="template-icon">${t.icon}</span>
            <div class="template-title">${t.title}</div>
            <div class="template-description">${t.description}</div>
            <span class="template-badge">${tracker ? tracker.formatCategory(t.category) : t.category}</span>
        </div>
    `).join('');
    
    templateBtn.addEventListener('click', () => {
        templateModal.classList.add('active');
    });
    
    closeTemplateModal.addEventListener('click', () => {
        templateModal.classList.remove('active');
    });
    
    templateModal.addEventListener('click', (e) => {
        if (e.target.id === 'templateModal') {
            templateModal.classList.remove('active');
        }
    });
    
    templatesGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.template-card');
        if (card && tracker) {
            const template = JSON.parse(card.dataset.template);
            tracker.openModal();
            setTimeout(() => {
                document.getElementById('goalTitle').value = template.title;
                document.getElementById('goalDescription').value = template.description;
                document.getElementById('goalCategory').value = template.category;
                document.getElementById('goalPriority').value = template.priority;
            }, 100);
            templateModal.classList.remove('active');
        }
    });
}

// Particle Animation
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = 'rgba(99, 102, 241, 0.3)';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${Math.random() * 20 + 10}s infinite ease-in-out`;
        particle.style.animationDelay = Math.random() * 5 + 's';
        particlesContainer.appendChild(particle);
    }
}

// Main Navigation
function setupMainNavigation() {
    const navTabs = document.querySelectorAll('.main-nav-tab');
    const goalsSection = document.getElementById('goalsSection');
    const expensesSection = document.getElementById('expensesSection');
    const lendSection = document.getElementById('lendSection');

    navTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            
            // Update active states
            navTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            // Show/hide sections
            if (section === 'goals') {
                goalsSection.classList.add('active');
                expensesSection.classList.remove('active');
                if (lendSection) lendSection.classList.remove('active');
            } else if (section === 'expenses') {
                goalsSection.classList.remove('active');
                expensesSection.classList.add('active');
                if (lendSection) lendSection.classList.remove('active');
            } else if (section === 'lend') {
                goalsSection.classList.remove('active');
                expensesSection.classList.remove('active');
                if (lendSection) lendSection.classList.add('active');
            }
        });
    });
}

// Add float animation to CSS via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        33% { transform: translate(30px, -30px) rotate(120deg); }
        66% { transform: translate(-20px, 20px) rotate(240deg); }
    }
`;
document.head.appendChild(style);
