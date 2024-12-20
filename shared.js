// Shared state management
const ExpenseTracker = {
    // Default state
    state: {
        currentUser: null,
        expenses: [],
        categoryBudgets: {
            food: 0,
            transport: 0,
            utilities: 0,
            entertainment: 0,
            other: 0
        },
        totalBudget: 2000
    },

    // Initialize state from localStorage
    init() {
        try {
            // Load user
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                this.state.currentUser = JSON.parse(savedUser);
            }

            // Load expenses
            const savedExpenses = localStorage.getItem('expenses');
            if (savedExpenses) {
                this.state.expenses = JSON.parse(savedExpenses).map(expense => ({
                    ...expense,
                    date: new Date(expense.date)
                }));
            }

            // Load category budgets
            const savedCategoryBudgets = localStorage.getItem('categoryBudgets');
            if (savedCategoryBudgets) {
                this.state.categoryBudgets = JSON.parse(savedCategoryBudgets);
            }

            // Load total budget
            const savedTotalBudget = localStorage.getItem('totalBudget');
            if (savedTotalBudget) {
                this.state.totalBudget = parseFloat(savedTotalBudget);
            }

            // Ensure all category budgets exist
            const categories = ['food', 'transport', 'utilities', 'entertainment', 'other'];
            categories.forEach(category => {
                if (!(category in this.state.categoryBudgets)) {
                    this.state.categoryBudgets[category] = 0;
                }
            });
        } catch (error) {
            console.error('Error initializing ExpenseTracker:', error);
            this.resetState();
        }
    },

    // Reset state to defaults
    resetState() {
        this.state = {
            currentUser: null,
            expenses: [],
            categoryBudgets: {
                food: 0,
                transport: 0,
                utilities: 0,
                entertainment: 0,
                other: 0
            },
            totalBudget: 2000
        };
        this.saveState();
    },

    // Save state to localStorage
    saveState() {
        try {
            localStorage.setItem('currentUser', JSON.stringify(this.state.currentUser));
            localStorage.setItem('expenses', JSON.stringify(this.state.expenses));
            localStorage.setItem('categoryBudgets', JSON.stringify(this.state.categoryBudgets));
            localStorage.setItem('totalBudget', this.state.totalBudget.toString());
        } catch (error) {
            console.error('Error saving state:', error);
        }
    },

    // User management
    setUser(user) {
        this.state.currentUser = user;
        this.saveState();
    },

    clearUser() {
        this.resetState();
    },

    // Expense management
    addExpense(expense) {
        this.state.expenses.push({
            ...expense,
            id: Date.now(),
            date: new Date(),
            amount: parseFloat(expense.amount)
        });
        this.saveState();
    },

    updateExpense(id, updatedExpense) {
        const index = this.state.expenses.findIndex(e => e.id === id);
        if (index !== -1) {
            this.state.expenses[index] = {
                ...this.state.expenses[index],
                ...updatedExpense,
                amount: parseFloat(updatedExpense.amount),
                date: new Date()
            };
            this.saveState();
        }
    },

    deleteExpense(id) {
        this.state.expenses = this.state.expenses.filter(e => e.id !== id);
        this.saveState();
    },

    // Budget management
    setCategoryBudget(category, amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            amount = 0;
        }
        this.state.categoryBudgets[category] = Math.max(0, amount);
        this.saveState();
    },

    setTotalBudget(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            amount = 0;
        }
        this.state.totalBudget = Math.max(0, amount);
        this.saveState();
    },

    // Data retrieval
    getCategoryExpenses() {
        const categoryTotals = {
            food: 0,
            transport: 0,
            utilities: 0,
            entertainment: 0,
            other: 0
        };

        this.state.expenses.forEach(expense => {
            const amount = parseFloat(expense.amount) || 0;
            if (expense.category in categoryTotals) {
                categoryTotals[expense.category] += amount;
            }
        });

        return categoryTotals;
    },

    getMonthlyExpenses() {
        const months = {};
        
        this.state.expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!months[monthKey]) {
                months[monthKey] = {
                    food: 0,
                    transport: 0,
                    utilities: 0,
                    entertainment: 0,
                    other: 0
                };
            }
            
            if (expense.category in months[monthKey]) {
                months[monthKey][expense.category] += parseFloat(expense.amount) || 0;
            }
        });

        return months;
    },

    getTotalExpenses() {
        return this.state.expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    },

    // Authentication check
    isAuthenticated() {
        return !!this.state.currentUser;
    },

    // Initialize with dummy data if needed
    loadDummyData() {
        // Set initial category budgets first
        this.state.categoryBudgets = {
            food: 800,        // Monthly grocery and dining budget
            transport: 300,   // Transportation and fuel costs
            utilities: 500,   // Bills, internet, phone, etc.
            entertainment: 400, // Movies, activities, hobbies
            other: 600       // Miscellaneous expenses
        };

        // Only load dummy expenses if none exist
        if (this.state.expenses.length === 0) {
            const now = new Date();
            
            // Create expenses for the current month
            this.state.expenses = [
                // Food expenses
                { id: 1, title: 'Grocery Shopping', amount: 150.50, category: 'food', date: new Date(now.getFullYear(), now.getMonth(), 5) },
                { id: 2, title: 'Restaurant Dinner', amount: 85.00, category: 'food', date: new Date(now.getFullYear(), now.getMonth(), 8) },
                { id: 3, title: 'Lunch with Colleagues', amount: 25.00, category: 'food', date: new Date(now.getFullYear(), now.getMonth(), 12) },
                { id: 4, title: 'Weekly Groceries', amount: 200.00, category: 'food', date: new Date(now.getFullYear(), now.getMonth(), 15) },
                
                // Transport expenses
                { id: 5, title: 'Monthly Bus Pass', amount: 60.00, category: 'transport', date: new Date(now.getFullYear(), now.getMonth(), 1) },
                { id: 6, title: 'Taxi Ride', amount: 35.00, category: 'transport', date: new Date(now.getFullYear(), now.getMonth(), 7) },
                { id: 7, title: 'Car Fuel', amount: 80.00, category: 'transport', date: new Date(now.getFullYear(), now.getMonth(), 10) },
                
                // Utilities expenses
                { id: 8, title: 'Electricity Bill', amount: 120.00, category: 'utilities', date: new Date(now.getFullYear(), now.getMonth(), 3) },
                { id: 9, title: 'Water Bill', amount: 45.00, category: 'utilities', date: new Date(now.getFullYear(), now.getMonth(), 3) },
                { id: 10, title: 'Internet Bill', amount: 65.00, category: 'utilities', date: new Date(now.getFullYear(), now.getMonth(), 5) },
                { id: 11, title: 'Phone Bill', amount: 50.00, category: 'utilities', date: new Date(now.getFullYear(), now.getMonth(), 8) },
                
                // Entertainment expenses
                { id: 12, title: 'Movie Night', amount: 45.00, category: 'entertainment', date: new Date(now.getFullYear(), now.getMonth(), 2) },
                { id: 13, title: 'Concert Tickets', amount: 120.00, category: 'entertainment', date: new Date(now.getFullYear(), now.getMonth(), 9) },
                { id: 14, title: 'Gaming Subscription', amount: 15.00, category: 'entertainment', date: new Date(now.getFullYear(), now.getMonth(), 15) },
                
                // Other expenses
                { id: 15, title: 'Clothing Purchase', amount: 150.00, category: 'other', date: new Date(now.getFullYear(), now.getMonth(), 6) },
                { id: 16, title: 'Gift for Friend', amount: 50.00, category: 'other', date: new Date(now.getFullYear(), now.getMonth(), 11) },
                { id: 17, title: 'Home Supplies', amount: 95.00, category: 'other', date: new Date(now.getFullYear(), now.getMonth(), 14) }
            ];

            // Add some expenses from previous month for trend data
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
            const previousExpenses = [
                { id: 18, title: 'Last Month Groceries', amount: 300.00, category: 'food', date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 15) },
                { id: 19, title: 'Last Month Transport', amount: 150.00, category: 'transport', date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 20) },
                { id: 20, title: 'Last Month Utilities', amount: 250.00, category: 'utilities', date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 10) },
                { id: 21, title: 'Last Month Entertainment', amount: 180.00, category: 'entertainment', date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 5) },
                { id: 22, title: 'Last Month Other', amount: 200.00, category: 'other', date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 25) }
            ];

            this.state.expenses = [...this.state.expenses, ...previousExpenses];
        }

        // Update total budget based on category budgets
        this.state.totalBudget = Object.values(this.state.categoryBudgets).reduce((sum, budget) => sum + budget, 0);

        this.saveState();
    }
};
