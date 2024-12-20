// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginForm = document.getElementById('loginForm');
const dashboard = document.querySelector('.dashboard');
const expenseForm = document.getElementById('expenseForm');
const expensesList = document.getElementById('expensesList');

// Dummy user data
const dummyUsers = [
    { email: 'user@example.com', password: 'password123', name: 'John Doe' },
    { email: 'demo@example.com', password: 'demo123', name: 'Demo User' }
];

// Authentication functions
function login(email, password) {
    const user = dummyUsers.find(u => u.email === email && u.password === password);
    if (user) {
        ExpenseTracker.setUser(user);
        loginForm.classList.add('hidden');
        dashboard.classList.remove('hidden');
        updateNavigation();
        ExpenseTracker.loadDummyData();
        updateUI();
        return true;
    }
    return false;
}

function logout() {
    ExpenseTracker.clearUser();
    dashboard.classList.add('hidden');
    loginForm.classList.remove('hidden');
    updateNavigation();
}

function updateNavigation() {
    const isAuthenticated = ExpenseTracker.isAuthenticated();
    document.querySelector('.navbar').innerHTML = isAuthenticated ? `
        <div class="logo">ExpenseTracker</div>
        <div class="nav-links">
            <a href="./index.html" class="nav-link active">Dashboard</a>
            <a href="./analysis.html" class="nav-link">Analysis</a>
            <button id="logoutBtn" onclick="logout()">Logout</button>
        </div>
    ` : `
        <div class="logo">ExpenseTracker</div>
        <div class="nav-links">
            <button id="loginBtn">Login</button>
            <button id="signupBtn">Sign Up</button>
        </div>
    `;

    if (!isAuthenticated) {
        attachEventListeners();
    }
}

// Initialize charts
let expenseChart, budgetChart;

function initializeCharts() {
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');
    const budgetCtx = document.getElementById('budgetChart').getContext('2d');

    // Expense by category chart
    expenseChart = new Chart(expenseCtx, {
        type: 'doughnut',
        data: {
            labels: ['Food', 'Transport', 'Utilities', 'Entertainment', 'Other'],
            datasets: [{
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    '#3B82F6',
                    '#10B981',
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Expenses by Category'
                }
            }
        }
    });

    // Budget vs Expenses chart
    budgetChart = new Chart(budgetCtx, {
        type: 'bar',
        data: {
            labels: ['Budget vs Expenses'],
            datasets: [
                {
                    label: 'Budget',
                    data: [ExpenseTracker.state.totalBudget],
                    backgroundColor: '#10B981'
                },
                {
                    label: 'Expenses',
                    data: [0],
                    backgroundColor: '#EF4444'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Budget vs Total Expenses'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateCharts() {
    const categoryTotals = ExpenseTracker.getCategoryExpenses();
    expenseChart.data.datasets[0].data = Object.values(categoryTotals);
    expenseChart.update();

    const totalExpenses = ExpenseTracker.getTotalExpenses();
    budgetChart.data.datasets[1].data = [totalExpenses];
    budgetChart.update();
}

// Update dashboard summary
function updateSummary() {
    const totalExpenses = ExpenseTracker.getTotalExpenses();
    const remaining = ExpenseTracker.state.totalBudget - totalExpenses;

    document.getElementById('totalBudget').textContent = `$${ExpenseTracker.state.totalBudget.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
    document.getElementById('remaining').textContent = `$${remaining.toFixed(2)}`;
}

// Display expenses list
function displayExpenses() {
    const expensesList = document.getElementById('expensesList');
    expensesList.innerHTML = '';
    
    // Sort expenses by date (most recent first)
    const sortedExpenses = ExpenseTracker.state.expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedExpenses.forEach(expense => {
        const expenseElement = document.createElement('div');
        expenseElement.className = 'expense-item';
        
        const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        expenseElement.innerHTML = `
            <div class="expense-info">
                <h4>${expense.title}</h4>
                <p>${expense.category}</p>
                <small>${formattedDate}</small>
            </div>
            <div class="expense-details">
                <span class="expense-amount">$${parseFloat(expense.amount).toFixed(2)}</span>
                <div class="expense-actions">
                    <button class="edit-btn" onclick="editExpense(${expense.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteExpense(${expense.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        expensesList.appendChild(expenseElement);
    });
}

function updateUI() {
    updateSummary();
    displayExpenses();
    updateCharts();
}

// Event Listeners
function attachEventListeners() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const loginForm = document.getElementById('loginForm');
            const emailInput = loginForm.querySelector('input[type="email"]');
            const passwordInput = loginForm.querySelector('input[type="password"]');
            
            emailInput.value = dummyUsers[0].email;
            passwordInput.value = dummyUsers[0].password;
            
            loginForm.classList.remove('hidden');
            dashboard.classList.add('hidden');
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            alert('Sign up functionality is not implemented in this demo. Please use the login feature with dummy data.');
        });
    }
}

// Handle login form submission
document.querySelector('#loginForm form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    
    if (login(email, password)) {
        e.target.reset();
    } else {
        alert('Invalid credentials. Please use the auto-filled dummy data.');
    }
});

// Handle expense form submission
expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('expenseTitle').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;

    if (title && amount && category) {
        const editId = e.target.getAttribute('data-edit-id');
        if (editId) {
            ExpenseTracker.updateExpense(parseInt(editId), { title, amount, category });
            cancelEditMode();
        } else {
            ExpenseTracker.addExpense({ title, amount, category });
        }
        e.target.reset();
        updateUI();
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    try {
        ExpenseTracker.init();
        if (ExpenseTracker.isAuthenticated()) {
            dashboard.classList.remove('hidden');
            loginForm.classList.add('hidden');
            updateNavigation();
        }
        initializeCharts();
        updateUI();
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        alert('There was an error loading the application. Please refresh the page.');
    }
});
