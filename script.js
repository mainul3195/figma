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

// Edit expense
function editExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
        // Fill the form with expense data
        document.getElementById('expenseTitle').value = expense.title;
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expenseCategory').value = expense.category;
        
        // Change form state to edit mode
        const form = document.getElementById('expenseForm');
        form.setAttribute('data-edit-id', id);
        document.querySelector('.add-expense h2').textContent = 'Edit Expense';
        document.querySelector('#expenseForm button[type="submit"]').textContent = 'Update Expense';
        
        // Add cancel button if it doesn't exist
        if (!document.getElementById('cancelEdit')) {
            const cancelBtn = document.createElement('button');
            cancelBtn.id = 'cancelEdit';
            cancelBtn.type = 'button';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.onclick = cancelEditMode;
            form.appendChild(cancelBtn);
        }
    }
}

function cancelEditMode() {
    const form = document.getElementById('expenseForm');
    form.removeAttribute('data-edit-id');
    form.reset();
    document.querySelector('.add-expense h2').textContent = 'Add New Expense';
    document.querySelector('#expenseForm button[type="submit"]').textContent = 'Add Expense';
    
    const cancelBtn = document.getElementById('cancelEdit');
    if (cancelBtn) {
        cancelBtn.remove();
    }
}

function updateExpense(id, title, amount, category) {
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
        expenses[index] = {
            ...expenses[index],
            title,
            amount: parseFloat(amount),
            category,
            date: new Date() // Update the date to show it was modified
        };
        updateSummary();
        displayExpenses();
        updateCharts();
        cancelEditMode();
    }
}

function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(e => e.id !== id);
        updateSummary();
        displayExpenses();
        updateCharts();
    }
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
            <div class="expense-details">
                <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
                <div class="expense-actions">
                    <button class="edit-btn" onclick="editExpense(${expense.id})">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </button>
                    <button class="delete-btn" onclick="deleteExpense(${expense.id})">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
            </div>
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
        const editId = e.target.getAttribute('data-edit-id');
        if (editId) {
            updateExpense(parseInt(editId), title, amount, category);
        } else {
            addExpense(title, amount, category);
        }
        e.target.reset();
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    updateSummary();
    attachEventListeners();
});
