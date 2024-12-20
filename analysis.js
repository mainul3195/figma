// Initialize charts
let categoryBudgetChart, budgetComparisonChart, monthlyTrendChart;

function initializeCharts() {
    const categoryExpenses = ExpenseTracker.getCategoryExpenses();
    const categories = ['food', 'transport', 'utilities', 'entertainment', 'other'];
    const categoryLabels = categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1));
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    // Category Budget Overview Chart
    const budgetCtx = document.getElementById('categoryBudgetChart').getContext('2d');
    const budgetData = categories.map(cat => ExpenseTracker.state.categoryBudgets[cat] || 0);
    
    categoryBudgetChart = new Chart(budgetCtx, {
        type: 'doughnut',
        data: {
            labels: categoryLabels,
            datasets: [{
                data: budgetData,
                backgroundColor: colors,
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Category Budget Distribution',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return ` $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });

    // Budget vs Actual Comparison Chart
    const comparisonCtx = document.getElementById('budgetComparisonChart').getContext('2d');
    const expenseData = categories.map(cat => categoryExpenses[cat] || 0);
    
    budgetComparisonChart = new Chart(comparisonCtx, {
        type: 'bar',
        data: {
            labels: categoryLabels,
            datasets: [
                {
                    label: 'Budget',
                    data: budgetData,
                    backgroundColor: '#10B981',
                    borderRadius: 4
                },
                {
                    label: 'Actual Expenses',
                    data: expenseData,
                    backgroundColor: '#EF4444',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Budget vs Actual Expenses by Category',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                }
            },
            barPercentage: 0.7,
            categoryPercentage: 0.8
        }
    });

    // Monthly Trend Chart
    const trendCtx = document.getElementById('monthlyTrendChart').getContext('2d');
    const monthlyData = calculateMonthlyTrend();
    monthlyTrendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: monthlyData.datasets
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Expense Trends by Category',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                },
                legend: {
                    position: 'bottom'
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function calculateMonthlyTrend() {
    const months = ExpenseTracker.getMonthlyExpenses();
    const categories = ['food', 'transport', 'utilities', 'entertainment', 'other'];
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const sortedMonths = Object.keys(months).sort();

    return {
        labels: sortedMonths.map(month => {
            const [year, monthNum] = month.split('-');
            return `${new Date(year, monthNum - 1).toLocaleString('default', { month: 'short' })} ${year}`;
        }),
        datasets: categories.map((category, index) => ({
            label: category.charAt(0).toUpperCase() + category.slice(1),
            data: sortedMonths.map(month => months[month][category] || 0),
            borderColor: colors[index],
            backgroundColor: colors[index] + '20',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5
        }))
    };
}

function updateCategoryBudgetList() {
    const budgetList = document.getElementById('categoryBudgetList');
    budgetList.innerHTML = '';
    const categoryExpenses = ExpenseTracker.getCategoryExpenses();

    Object.entries(ExpenseTracker.state.categoryBudgets).forEach(([category, budget]) => {
        const actual = categoryExpenses[category] || 0;
        const percentage = budget > 0 ? (actual / budget) * 100 : 0;
        const status = percentage > 100 ? 'over-budget' : percentage > 80 ? 'warning' : 'good';

        const budgetItem = document.createElement('div');
        budgetItem.className = `budget-item ${status}`;
        budgetItem.innerHTML = `
            <div class="budget-item-header">
                <h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                <span class="budget-amount">$${budget.toFixed(2)}</span>
            </div>
            <div class="budget-progress">
                <div class="progress-bar" style="width: ${Math.min(percentage, 100)}%"></div>
            </div>
            <div class="budget-details">
                <span>Spent: $${actual.toFixed(2)}</span>
                <span>${percentage.toFixed(1)}%</span>
            </div>
        `;
        budgetList.appendChild(budgetItem);
    });
}

function updateCharts() {
    const categoryExpenses = ExpenseTracker.getCategoryExpenses();
    const categories = ['food', 'transport', 'utilities', 'entertainment', 'other'];
    
    // Update Category Budget Chart
    const budgetData = categories.map(cat => ExpenseTracker.state.categoryBudgets[cat] || 0);
    categoryBudgetChart.data.datasets[0].data = budgetData;
    categoryBudgetChart.update();

    // Update Budget Comparison Chart
    const expenseData = categories.map(cat => categoryExpenses[cat] || 0);
    budgetComparisonChart.data.datasets[0].data = budgetData;
    budgetComparisonChart.data.datasets[1].data = expenseData;
    budgetComparisonChart.update();

    // Update Monthly Trend Chart
    const monthlyData = calculateMonthlyTrend();
    monthlyTrendChart.data.labels = monthlyData.labels;
    monthlyTrendChart.data.datasets = monthlyData.datasets;
    monthlyTrendChart.update();
}

// Event Listeners
document.getElementById('categoryBudgetForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const category = document.getElementById('budgetCategory').value;
    const amount = parseFloat(document.getElementById('categoryBudgetAmount').value);

    if (category && amount >= 0) {
        ExpenseTracker.setCategoryBudget(category, amount);
        updateCategoryBudgetList();
        updateCharts();
        e.target.reset();
    }
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    ExpenseTracker.clearUser();
    window.location.href = './index.html';
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    try {
        ExpenseTracker.init();
        
        // Check if user is logged in
        if (!ExpenseTracker.isAuthenticated()) {
            window.location.href = './index.html';
            return;
        }

        initializeCharts();
        updateCategoryBudgetList();
    } catch (error) {
        console.error('Error initializing analysis page:', error);
        alert('There was an error loading the analysis page. Please refresh the page.');
    }
});
