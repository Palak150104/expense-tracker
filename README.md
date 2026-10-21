# 💸 PennyWise — Expense Tracker

A clean, responsive personal finance dashboard built with **HTML, CSS, and JavaScript** to track income, manage expenses, and understand monthly spending.

## ✨ Features

- **Dashboard Overview** — View your balance, total income, expenses, and monthly savings.
- **Transaction Management** — Add, edit, and delete income or expense transactions.
- **Category-wise Tracking** — Organize transactions into categories such as Food, Transport, Shopping, Bills, and Salary.
- **Monthly Summary** — Review financial activity for a selected month.
- **Spending Breakdown** — Visualize expenses by category with percentage-based progress bars.
- **Search and Filters** — Find transactions by description or category and filter by type.
- **Persistent Storage** — Save transactions in browser `localStorage`, so they remain available after refreshing the page.
- **Responsive Design** — Use the dashboard on desktop, tablet, or mobile devices.
- **Indian Currency Support** — Display monetary values in Indian Rupees (INR).

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling, layout, and responsive design |
| JavaScript (ES6+) | Application logic, transaction management, and calculations |
| Browser localStorage | Persistent client-side data storage |
| GitHub Pages | Static website hosting |

## 🚀 Getting Started

### Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/Palak150104/expense-tracker.git
   ```

2. Open the project folder:

   ```bash
   cd expense-tracker
   ```

3. Open `index.html` in your browser, or use the **Live Server** extension in Visual Studio Code.

No package installation, build tools, or backend setup is required.

## 📂 Project Structure

```text
expense-tracker/
├── index.html    # Application structure
├── style.css     # Styling and responsive layout
├── script.js     # Transaction logic and calculations
└── README.md     # Project documentation
```

## 💡 How It Works

1. Add a transaction by entering its description, amount, type, category, and date.
2. The dashboard calculates monthly income, expenses, and net balance from the recorded transactions.
3. Review spending patterns through the category-wise breakdown.
4. Search, filter, edit, or delete transactions as needed.
5. Refresh the browser without losing saved transactions.

## 🔒 Data and Privacy

PennyWise stores transaction data in the browser's `localStorage`. No backend or external database is used.

- Data is specific to the browser and origin where the application runs.
- Transactions do not automatically synchronize across devices or browsers.
- Clearing browser site data may permanently remove saved transactions.
- This project is intended for personal tracking and learning, not as a secure banking or accounting system.

## 🗺️ Roadmap

Potential future improvements:

- [ ] Budget limits and spending alerts
- [ ] Interactive charts and financial trends
- [ ] Export transactions to CSV
- [ ] Recurring transactions
- [ ] Dark mode
- [ ] Backend integration and account-based synchronization

## 🌐 Live Demo

**[Launch PennyWise — Expense Tracker](https://palak150104.github.io/expense-tracker/)**

Try the live application to manage income, track expenses, and view your monthly spending breakdown.

## 👩‍💻 Author

**Palak**

Built as a hands-on project to practice frontend development, JavaScript fundamentals, DOM manipulation, data persistence, and responsive UI design.

---

If you find this project useful, consider giving the repository a ⭐.
