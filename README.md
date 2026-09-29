# Expense Tracker

A small full-stack expense tracker built with Next.js (App Router) and TypeScript. The UI and the REST API live in one project; the API route handlers run on Node.js and store expenses in a local JSON file.

## Features

- Add, edit and delete expenses (description, amount, category, date)
- Summary: total spent, number of expenses, average, top category, and spending by category
- Filter the list and the summary by month
- Export the current view as a CSV file

## Run it

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal (http://localhost:3000 unless that port is taken).

For a production build: `npm run build`, then `npm start`.

## Where the data lives

Expenses are saved to `data/expenses.json`, created on the first save. The folder is git-ignored. Set the `EXPENSES_FILE` environment variable to store the file somewhere else.

## Currency and date format

Amounts show as US dollars by default. Change `LOCALE` and `CURRENCY` at the top of `src/lib/format.ts`, for example to `"en-IN"` and `"INR"`.

## API

| Method | Path | What it does |
| --- | --- | --- |
| `GET` | `/api/expenses` | List expenses, newest first |
| `POST` | `/api/expenses` | Create an expense |
| `PUT` | `/api/expenses/:id` | Replace an expense |
| `DELETE` | `/api/expenses/:id` | Delete an expense |
| `GET` | `/api/expenses/summary` | Totals, average and per-category breakdown |
| `GET` | `/api/expenses/export` | Download expenses as CSV |

The three `GET` list-style routes accept `?month=YYYY-MM` and `?category=Food` filters.

An expense body looks like this:

```json
{
  "description": "Groceries",
  "amount": 42.5,
  "category": "Food",
  "date": "2026-10-01"
}
```

Categories: Food, Transport, Housing, Bills, Shopping, Entertainment, Health, Other.

Invalid input returns `400` with a message per field:

```json
{
  "error": "Invalid expense.",
  "fields": { "amount": "Amount must be greater than 0." }
}
```

## Project layout

```
src/
  app/
    page.tsx                  Server component: loads the data for the first render
    api/expenses/             REST API route handlers
  components/                 Client UI: form, list, summary
  lib/
    store.ts                  Reads and writes the JSON file
    validation.ts             Input checks used by the API
    summary.ts                Totals and category breakdown
    csv.ts                    CSV export
    api.ts                    Browser-side fetch helpers
    format.ts                 Currency and date formatting
    types.ts                  Shared types and the category list
```
