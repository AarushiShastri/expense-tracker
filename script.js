document.addEventListener("DOMContentLoaded", () => {
    const expenseForm = document.getElementById("expense-form");
    const expenseList = document.getElementById("expense-list");
    const totalAmount = document.getElementById("total-amount");
    const filterCategory = document.getElementById("filter-category");
    const expenseCategory = document.getElementById("expense-category");
    const newCategoryInput = document.getElementById("new-category");
    const addCategoryBtn = document.getElementById("add-category-btn");
    const deleteCategoryBtn = document.getElementById("delete-category-btn");
    const userBudgetInput = document.getElementById("user-budget");
    const setBudgetBtn = document.getElementById("set-budget-btn");
    const budgetWarning = document.getElementById("budget-warning");
    const exportBtn = document.getElementById("export-btn");
    let chart; // For Chart.js instance

    let expenses = [];
    let categories = ['Food', 'Transport', 'Entertainment', 'Other'];
    let userBudget = 0;

    // Initialize dropdowns
    updateCategoryDropdowns();

    // Event Listeners
    expenseForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("expense-name").value;
        const amount = parseFloat(document.getElementById("expense-amount").value);
        const category = expenseCategory.value;
        const date = document.getElementById("expense-date").value;

        const expense = {
            id: Date.now(),
            name,
            amount,
            category,
            date
        };

        expenses.push(expense);
        displayExpenses(expenses);
        updateTotalAmount();
        checkBudget();
        expenseForm.reset();
    });

    expenseList.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const id = parseInt(e.target.dataset.id);
            expenses = expenses.filter(expense => expense.id !== id);
            displayExpenses(expenses);
            updateTotalAmount();
            checkBudget();
        }
        if (e.target.classList.contains("edit-btn")) {
            const id = parseInt(e.target.dataset.id);
            const expense = expenses.find(expense => expense.id === id);
            document.getElementById("expense-name").value = expense.name;
            document.getElementById("expense-amount").value = expense.amount;
            expenseCategory.value = expense.category;
            document.getElementById("expense-date").value = expense.date;
            expenses = expenses.filter(expense => expense.id !== id);
            displayExpenses(expenses);
            updateTotalAmount();
            checkBudget();
        }
    });

    filterCategory.addEventListener("change", (e) => {
        const category = e.target.value;
        if (category === "All") {
            displayExpenses(expenses);
        } else {
            const filteredExpenses = expenses.filter(expense => expense.category === category);
            displayExpenses(filteredExpenses);
        }
    });

    addCategoryBtn.addEventListener("click", () => {
        const newCat = newCategoryInput.value.trim();
        if (newCat && !categories.includes(newCat)) {
            categories.push(newCat);
            updateCategoryDropdowns();
            newCategoryInput.value = "";
        }
    });

    deleteCategoryBtn.addEventListener("click", () => {
        const selectedCat = expenseCategory.value;
        if (selectedCat && categories.includes(selectedCat)) {
            if (confirm(`Delete category "${selectedCat}"? This will remove it from the dropdowns, but not from existing expenses.`)) {
                categories = categories.filter(cat => cat !== selectedCat);
                updateCategoryDropdowns();
            }
        }
    });

    setBudgetBtn.addEventListener("click", () => {
        userBudget = parseFloat(userBudgetInput.value) || 0;
        checkBudget();
    });

    exportBtn.addEventListener("click", () => {
        const csvContent = "data:text/csv;charset=utf-8," +
            "Name,Amount,Category,Date\n" +
            expenses.map(e => `${e.name},${e.amount},${e.category},${e.date}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "expenses.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Functions
    function updateCategoryDropdowns() {
        expenseCategory.innerHTML = '<option value="" disabled selected>Select Category</option>';
        filterCategory.innerHTML = '<option value="All">All</option>';
        categories.forEach(cat => {
            expenseCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
            filterCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
    }

    function displayExpenses(expensesToShow) {
        expenseList.innerHTML = "";
        expensesToShow.forEach(expense => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${expense.name}</td>
                <td>$${expense.amount.toFixed(2)}</td>
                <td>${expense.category}</td>
                <td>${expense.date}</td>
                <td>
                    <button class="edit-btn" data-id="${expense.id}">Edit</button>
                    <button class="delete-btn" data-id="${expense.id}">Delete</button>
                </td>
            `;
            expenseList.appendChild(row);
        });
        renderChart(expensesToShow);
    }

    function updateTotalAmount() {
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        totalAmount.textContent = total.toFixed(2);
    }

    function checkBudget() {
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        if (userBudget > 0 && total >= userBudget) {
            budgetWarning.textContent = "Warning: You have exceeded or reached your budget!";
        } else if (userBudget > 0 && total >= userBudget * 0.9) {
            budgetWarning.textContent = "Warning: You are close to your budget!";
        } else {
            budgetWarning.textContent = "";
        }
    }

    function renderChart(expensesToShow) {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        const categorySum = {};
        categories.forEach(cat => categorySum[cat] = 0);
        expensesToShow.forEach(exp => {
            if (exp.category in categorySum) categorySum[exp.category] += exp.amount;
        });

        // Destroy previous chart if it exists
        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(categorySum),
                datasets: [{
                    data: Object.values(categorySum),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                }]
            }
        });
    }
});
