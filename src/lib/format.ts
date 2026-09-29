// Change these two to show amounts and dates your way, e.g. "en-IN" and "INR".
export const LOCALE = "en-US";
export const CURRENCY = "USD";

const currencyFormat = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
});
const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "medium",
  timeZone: "UTC",
});
const monthFormat = new Intl.DateTimeFormat(LOCALE, {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const percentFormat = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
  return currencyFormat.format(amount);
}

export function formatPercent(ratio: number): string {
  return percentFormat.format(ratio);
}

/** "2026-10-01" -> "Oct 1, 2026" */
export function formatDate(date: string): string {
  return dateFormat.format(new Date(`${date}T00:00:00Z`));
}

/** "2026-10" -> "October 2026" */
export function formatMonth(month: string): string {
  return monthFormat.format(new Date(`${month}-01T00:00:00Z`));
}

/** Today's date in the viewer's own time zone, as YYYY-MM-DD. */
export function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
