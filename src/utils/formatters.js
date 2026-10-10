const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
});

export const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

export const formatDate = (value, options = { month: "short", day: "numeric", year: "numeric" }) => {
    if (!value) return "Not set";
    return new Intl.DateTimeFormat("en-US", options).format(new Date(`${value}T12:00:00`));
};

export const formatLongDate = (value) => formatDate(value, {
    weekday: "long",
    month: "long",
    day: "numeric",
});

export const getDaysUntil = (value) => {
    if (!value) return null;
    const target = new Date(`${value}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86400000);
};

export const formatDueLabel = (value) => {
    const days = getDaysUntil(value);
    if (days === null) return "No due date";
    if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `Due in ${days} days`;
};

export const getInitials = (name = "") => name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export const downloadCsv = (rows, fileName) => {
    if (!rows.length) return false;
    const headers = Object.keys(rows[0]);
    const content = [
        headers.map(escapeCsv).join(","),
        ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(",")),
    ].join("\r\n");
    const blob = new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    return true;
};