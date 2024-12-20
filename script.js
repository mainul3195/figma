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

// Dummy expense data
const dummyExpenses = [
    { id: 1, title: 'Grocery Shopping', amount: 150.50, category: 'food', date: new Date('2024-12-19') },
    { id: 2, title: 'Bus Ticket', amount: 25.00, category: 'transport', date: new Date('2024-12-18') },
    { id: 3, title: 'Electricity Bill', amount: 80.00, category: 'utilities', date: new Date('2024-12-17') },
    { id: 4, title: 'Movie Night', amount: 45.00, category: 'entertainment', date: new Date('2024-12-16') }
];

// State
let currentUser = null;
let expenses = [...dummyExpenses];
let totalBudget = 2000; // Default budget

// Authentication functions
function login(email, password) {
    const user = dummyUsers.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        loginForm.classList.add('hidden');
        dashboard.classList.remove('hidden');
        document.querySelector('.navbar').innerHTML = `
            <div class="logo">ExpenseTracker</div>
            <div class="nav-links">
                <span>Welcome, ${user.name}</span>
                <button id="logoutBtn" onclick="logout()">Logout</button>
            </div>
        `;
        loadDummyData();
        return true;
    }
    return false;
}

function logout() {
    currentUser = null;
    expenses = [];
    dashboard.classList.add('hidden');
    loginForm.classList.remove('hidden');
    document.querySelector('.navbar').innerHTML = `
        <div class="logo">ExpenseTracker</div>
        <div class="nav-links">
            <button id="loginBtn">Login</button>
            <button id="signupBtn">Sign Up</button>
        </div>
    `;
    // Reattach event listeners after DOM change
    attachEventListeners();
}

function loadDummyData() {
    expenses = [...dummyExpenses];
    updateSummary();
    displayExpenses();
    updateCharts();
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
                    data: [totalBudget],
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
    // Update expense by category chart
    const categoryTotals = {
        food: 0,
        transport: 0,
        utilities: 0,
        entertainment: 0,
        other: 0
    };

    expenses.forEach(expense => {
        categoryTotals[expense.category] += expense.amount;
    });

    expenseChart.data.datasets[0].data = Object.values(categoryTotals);
    expenseChart.update();

    // Update budget vs expenses chart
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    budgetChart.data.datasets[1].data = [totalExpenses];
    budgetChart.update();
}

// Update dashboard summary
function updateSummary() {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = totalBudget - totalExpenses;

    document.getElementById('totalBudget').textContent = `$${totalBudget.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
    document.getElementById('remaining').textContent = `$${remaining.toFixed(2)}`;
}

// Add new expense
function addExpense(title, amount, category) {
    const expense = {
        id: Date.now(),
        title,
        amount: parseFloat(amount),
        category,
        date: new Date()
    };

    expenses.push(expense);
    updateSummary();
    displayExpenses();
    updateCharts();
}

// Display expenses list
function displayExpenses() {
    expensesList.innerHTML = '';
    expenses.slice().reverse().forEach(expense => {
        const expenseElement = document.createElement('div');
        expenseElement.className = 'expense-item';
        expenseElement.innerHTML = `
            <div class="expense-info">
                <h4>${expense.title}</h4>
                <p>${expense.category}</p>
                <small>${expense.date.toLocaleDateString()}</small>
            </div>
            <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
        `;
        expensesList.appendChild(expenseElement);
    });
}

// Event Listeners
function attachEventListeners() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            // Auto-fill the login form with dummy data
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

expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('expenseTitle').value;
    const amount = document.getElementById('expenseAmount').value;
    const category = document.getElementById('expenseCategory').value;

    if (title && amount && category) {
        addExpense(title, amount, category);
        expenseForm.reset();
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    updateSummary();
    attachEventListeners();
});
