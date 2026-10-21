"use strict";

// ---------- Configuration ----------

const STORAGE_KEY = "pennywise_transactions_v1";

const CATEGORIES = {
    expense: ["Food", "Transport", "Shopping", "Bills", "Health", "Education", "Entertainment", "Rent", "Travel", "Other"],
    income: ["Salary", "Freelance", "Business", "Investment", "Gift", "Other"]
};

const CATEGORY_ICONS = {
    Food: "🍜",
    Transport: "🚕",
    Shopping: "🛍️",
    Bills: "🧾",
    Health: "💊",
    Education: "📚",
    Entertainment: "🎬",
    Rent: "🏠",
    Travel: "✈️",
    Salary: "💼",
    Freelance: "💻",
    Business: "🏢",
    Investment: "📈",
    Gift: "🎁",
    Other: "◈"
};

const moneyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
});

// ---------- HTML Elements ----------

const expenseForm = document.getElementById("expenseForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expensesElement = document.getElementById("expenses");
const savingsElement = document.getElementById("savings");
const savingsNote = document.getElementById("savingsNote");

const transactionList = document.getElementById("transactionList");
const transactionCount = document.getElementById("transactionCount");
const historyEmpty = document.getElementById("historyEmpty");

const categoryBreakdown = document.getElementById("categoryBreakdown");
const breakdownEmpty = document.getElementById("breakdownEmpty");

const monthFilter = document.getElementById("monthFilter");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const categoryFilter = document.getElementById("categoryFilter");

const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const formMessage = document.getElementById("formMessage");

const deleteDialog = document.getElementById("deleteDialog");
const keepTransactionBtn = document.getElementById("keepTransaction");
const confirmDeleteBtn = document.getElementById("confirmDelete");

// ---------- Application State ----------

let transactions = loadTransactions();
let editingId = null;
let pendingDeleteId = null;

const today = getLocalDateString();
monthFilter.value = today.slice(0, 7);
dateInput.value = today;

// ---------- Utility Functions ----------

function getLocalDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatMoney(amount) {
    return moneyFormatter.format(amount);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isValidDate(dateString) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return false;
    }

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year
        && date.getMonth() === month - 1
        && date.getDate() === day;
}

function formatDate(dateString) {
    if (!isValidDate(dateString)) {
        return dateString;
    }

    const [year, month, day] = dateString.split("-").map(Number);

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(new Date(year, month - 1, day));
}

function getSelectedMonth() {
    return monthFilter.value || today.slice(0, 7);
}

function getMonthTransactions() {
    const month = getSelectedMonth();

    return transactions.filter(function (transaction) {
        return transaction.date.startsWith(month);
    });
}

function getCategoryIcon(category) {
    return CATEGORY_ICONS[category] || "◈";
}

// ---------- Local Storage ----------

function loadTransactions() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) {
            return [];
        }

        // Ignore invalid records rather than breaking the application.
        return parsed.filter(function (transaction) {
            return transaction
                && typeof transaction.id === "string"
                && typeof transaction.description === "string"
                && transaction.description.trim().length > 0
                && Number.isFinite(transaction.amount)
                && transaction.amount > 0
                && ["income", "expense"].includes(transaction.type)
                && typeof transaction.category === "string"
                && isValidDate(transaction.date)
                && CATEGORIES[transaction.type].includes(transaction.category);
        });
    } catch (error) {
        console.error("Could not load saved transactions:", error);
        return [];
    }
}

function saveTransactions() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
        return true;
    } catch (error) {
        console.error("Could not save transactions:", error);
        showMessage(
            "Could not save data in this browser. Check available storage.",
            true
        );
        return false;
    }
}

// ---------- Form Setup ----------

function populateCategories() {
    const selectedType = typeInput.value;
    const categories = CATEGORIES[selectedType];

    categoryInput.replaceChildren();

    categories.forEach(function (category) {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = `${getCategoryIcon(category)} ${category}`;

        categoryInput.appendChild(option);
    });
}

function populateCategoryFilter() {
    const previousValue = categoryFilter.value;

    const usedCategories = [...new Set(
        transactions.map(function (transaction) {
            return transaction.category;
        })
    )].sort();

    categoryFilter.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All categories";
    categoryFilter.appendChild(allOption);

    usedCategories.forEach(function (category) {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    categoryFilter.value = usedCategories.includes(previousValue)
        ? previousValue
        : "all";
}

function showMessage(message, isError = false) {
    formMessage.textContent = message;
    formMessage.classList.toggle("error", isError);
}

function resetForm() {
    editingId = null;
    expenseForm.reset();

    typeInput.value = "expense";
    populateCategories();
    dateInput.value = getLocalDateString();

    formTitle.textContent = "Add transaction";
    submitBtn.textContent = "Add transaction";
    cancelEditBtn.classList.add("hidden");

    showMessage("");
}

function validateForm() {
    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!description) {
        showMessage("Please enter a description.", true);
        descriptionInput.focus();
        return null;
    }

    if (!Number.isFinite(amount) || amount <= 0 || amount > 1e12) {
        showMessage("Enter an amount greater than ₹0.", true);
        amountInput.focus();
        return null;
    }

    if (!CATEGORIES[type] || !CATEGORIES[type].includes(category)) {
        showMessage("Please choose a valid category.", true);
        categoryInput.focus();
        return null;
    }

    if (!isValidDate(date)) {
        showMessage("Please select a valid date.", true);
        dateInput.focus();
        return null;
    }

    return {
        description: description,
        amount: Math.round(amount * 100) / 100,
        type: type,
        category: category,
        date: date
    };
}

// ---------- Add and Edit Transactions ----------

expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = validateForm();

    if (!formData) {
        return;
    }

    if (editingId !== null) {
        const index = transactions.findIndex(function (transaction) {
            return transaction.id === editingId;
        });

        if (index === -1) {
            showMessage("Transaction not found. Please try again.", true);
            resetForm();
            return;
        }

        const previousTransaction = transactions[index];

        transactions[index] = {
            ...previousTransaction,
            ...formData
        };

        if (!saveTransactions()) {
            transactions[index] = previousTransaction;
            return;
        }

        resetForm();
        renderApp();
        showMessage("Transaction updated successfully.");
        return;
    }

    const newTransaction = {
        id: createId(),
        ...formData
    };

    transactions.unshift(newTransaction);

    if (!saveTransactions()) {
        transactions.shift();
        return;
    }

    resetForm();

    // Show the month in which the newly added transaction occurred.
    monthFilter.value = newTransaction.date.slice(0, 7);

    // Clear restrictive filters so the new transaction is visible.
    searchInput.value = "";
    typeFilter.value = "all";
    categoryFilter.value = "all";

    renderApp();
    showMessage("Transaction added successfully.");
});

typeInput.addEventListener("change", function () {
    populateCategories();
});

cancelEditBtn.addEventListener("click", function () {
    resetForm();
});

function startEditing(id) {
    const transaction = transactions.find(function (item) {
        return item.id === id;
    });

    if (!transaction) {
        return;
    }

    editingId = id;

    descriptionInput.value = transaction.description;
    amountInput.value = transaction.amount;
    typeInput.value = transaction.type;

    populateCategories();
    categoryInput.value = transaction.category;
    dateInput.value = transaction.date;

    formTitle.textContent = "Edit transaction";
    submitBtn.textContent = "Save changes";
    cancelEditBtn.classList.remove("hidden");

    showMessage("Editing transaction.");

    document.getElementById("expenseForm").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    descriptionInput.focus({ preventScroll: true });
}

// ---------- Delete Transactions ----------

function requestDelete(id) {
    if (!transactions.some(function (transaction) {
        return transaction.id === id;
    })) {
        return;
    }

    pendingDeleteId = id;

    if (typeof deleteDialog.showModal === "function") {
        deleteDialog.showModal();
    } else {
        // Fallback for older browsers.
        if (window.confirm("Delete this transaction permanently?")) {
            deleteTransaction(id);
        }

        pendingDeleteId = null;
    }
}

function deleteTransaction(id) {
    const index = transactions.findIndex(function (transaction) {
        return transaction.id === id;
    });

    if (index === -1) {
        return;
    }

    const removed = transactions.splice(index, 1)[0];

    if (!saveTransactions()) {
        transactions.splice(index, 0, removed);
        renderApp();
        return;
    }

    if (editingId === id) {
        resetForm();
    }

    renderApp();
    showMessage("Transaction deleted.");
}

confirmDeleteBtn.addEventListener("click", function () {
    if (pendingDeleteId !== null) {
        deleteTransaction(pendingDeleteId);
    }

    pendingDeleteId = null;
    deleteDialog.close();
});

keepTransactionBtn.addEventListener("click", function () {
    pendingDeleteId = null;
    deleteDialog.close();
});

deleteDialog.addEventListener("close", function () {
    pendingDeleteId = null;
});

// ---------- Summary Calculations ----------

function updateSummary() {
    const monthlyTransactions = getMonthTransactions();

    let income = 0;
    let expenses = 0;

    monthlyTransactions.forEach(function (transaction) {
        if (transaction.type === "income") {
            income += transaction.amount;
        } else {
            expenses += transaction.amount;
        }
    });

    income = Math.round(income * 100) / 100;
    expenses = Math.round(expenses * 100) / 100;

    const balance = income - expenses;
    const savingsRate = income > 0
        ? ((balance / income) * 100)
        : null;

    balanceElement.textContent = formatMoney(balance);
    incomeElement.textContent = formatMoney(income);
    expensesElement.textContent = formatMoney(expenses);
    savingsElement.textContent = formatMoney(balance);

    savingsNote.textContent = savingsRate === null
        ? "No income recorded this month"
        : `${savingsRate.toFixed(1)}% net savings rate`;

    savingsElement.classList.toggle("expense-text", balance < 0);
    savingsElement.classList.toggle("income-text", balance > 0);
}

// ---------- Transaction Rendering ----------

function renderTransactions() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedType = typeFilter.value;
    const selectedCategory = categoryFilter.value;

    const visibleTransactions = getMonthTransactions()
        .filter(function (transaction) {
            const matchesSearch = (
                transaction.description.toLowerCase().includes(searchTerm)
                || transaction.category.toLowerCase().includes(searchTerm)
            );

            const matchesType = selectedType === "all"
                || transaction.type === selectedType;

            const matchesCategory = selectedCategory === "all"
                || transaction.category === selectedCategory;

            return matchesSearch && matchesType && matchesCategory;
        })
        .sort(function (a, b) {
            return b.date.localeCompare(a.date)
                || b.id.localeCompare(a.id);
        });

    transactionList.replaceChildren();

    visibleTransactions.forEach(function (transaction) {
        const row = document.createElement("tr");

        const descriptionCell = document.createElement("td");
        const descriptionWrapper = document.createElement("div");
        descriptionWrapper.className = "description-cell";

        const symbol = document.createElement("span");
        symbol.className = "transaction-symbol";
        symbol.textContent = getCategoryIcon(transaction.category);

        const description = document.createElement("span");
        description.textContent = transaction.description;

        descriptionWrapper.append(symbol, description);
        descriptionCell.appendChild(descriptionWrapper);

        const categoryCell = document.createElement("td");
        categoryCell.textContent = transaction.category;

        const dateCell = document.createElement("td");
        dateCell.textContent = formatDate(transaction.date);

        const typeCell = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = `type-badge ${transaction.type}`;
        badge.textContent = transaction.type === "income" ? "Income" : "Expense";
        typeCell.appendChild(badge);

        const amountCell = document.createElement("td");
        amountCell.className = `amount-cell amount-column ${transaction.type}`;
        const sign = transaction.type === "income" ? "+" : "−";
        amountCell.textContent = `${sign} ${formatMoney(transaction.amount)}`;

        const actionsCell = document.createElement("td");
        actionsCell.className = "actions-cell";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "action-btn";
        editButton.textContent = "Edit";
        editButton.setAttribute("aria-label", `Edit ${transaction.description}`);
        editButton.addEventListener("click", function () {
            startEditing(transaction.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "action-btn delete-action";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", `Delete ${transaction.description}`);
        deleteButton.addEventListener("click", function () {
            requestDelete(transaction.id);
        });

        actionsCell.append(editButton, deleteButton);
        row.append(
            descriptionCell,
            categoryCell,
            dateCell,
            typeCell,
            amountCell,
            actionsCell
        );

        transactionList.appendChild(row);
    });

    historyEmpty.classList.toggle("hidden", visibleTransactions.length > 0);

    transactionCount.textContent = `${visibleTransactions.length} ${
        visibleTransactions.length === 1 ? "transaction" : "transactions"
    }`;
}

// ---------- Spending Breakdown ----------

function renderBreakdown() {
    const categoryTotals = {};

    getMonthTransactions().forEach(function (transaction) {
        if (transaction.type !== "expense") {
            return;
        }

        categoryTotals[transaction.category] =
            (categoryTotals[transaction.category] || 0) + transaction.amount;
    });

    const categories = Object.entries(categoryTotals)
        .sort(function (a, b) {
            return b[1] - a[1];
        });

    const totalExpenses = categories.reduce(function (total, item) {
        return total + item[1];
    }, 0);

    categoryBreakdown.replaceChildren();
    breakdownEmpty.classList.toggle("hidden", categories.length > 0);

    categories.forEach(function ([category, amount]) {
        const percentage = totalExpenses > 0
            ? (amount / totalExpenses) * 100
            : 0;

        const row = document.createElement("div");
        row.className = "category-row";

        const labels = document.createElement("div");
        labels.className = "category-labels";

        const name = document.createElement("span");
        name.className = "category-name";
        name.textContent = `${getCategoryIcon(category)} ${category}`;

        const value = document.createElement("span");
        value.className = "category-value";
        value.textContent = `${formatMoney(amount)} · ${percentage.toFixed(1)}%`;

        labels.append(name, value);

        const track = document.createElement("div");
        track.className = "progress-track";
        track.setAttribute("role", "progressbar");
        track.setAttribute("aria-label", `${category} spending`);
        track.setAttribute("aria-valuemin", "0");
        track.setAttribute("aria-valuemax", "100");
        track.setAttribute("aria-valuenow", percentage.toFixed(1));

        const bar = document.createElement("div");
        bar.className = "progress-bar";
        bar.style.width = `${percentage}%`;

        track.appendChild(bar);
        row.append(labels, track);
        categoryBreakdown.appendChild(row);
    });
}

// ---------- App Rendering ----------

function renderApp() {
    populateCategoryFilter();
    updateSummary();
    renderBreakdown();
    renderTransactions();
}

// ---------- Filters ----------

monthFilter.addEventListener("change", function () {
    renderApp();
});

searchInput.addEventListener("input", function () {
    renderTransactions();
});

typeFilter.addEventListener("change", function () {
    renderTransactions();
});

categoryFilter.addEventListener("change", function () {
    renderTransactions();
});

// ---------- Start Application ----------

populateCategories();
populateCategoryFilter();
renderApp();