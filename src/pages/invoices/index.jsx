import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowUpRight, FiCheckCircle, FiClipboard, FiDownload, FiEye, FiFilePlus, FiFilter, FiPlus, FiRepeat, FiTrash2 } from "react-icons/fi";
import Dialog from "../../components/dialog/index.jsx";
import { usePortal } from "../../context/usePortal.js";
import { downloadCsv, formatCurrency, formatDate } from "../../utils/formatters.js";
import styles from "./styles.module.css";

const today = new Date().toISOString().slice(0, 10);
const addDays = (value, days) => {
    const date = new Date(`${value}T12:00:00`);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
};
const invoiceForm = (invoice) => ({
    orderId: invoice?.orderId || "",
    issueDate: invoice?.issueDate || today,
    dueDate: invoice?.dueDate || addDays(today, 30),
    amount: invoice ? String(invoice.amount) : "",
    note: invoice?.note || "",
});

const InvoicesPage = () => {
    const { invoices, orders, globalSearch, addInvoice, updateInvoice, removeInvoice, requestConfirmation, addToast } = usePortal();
    const [statusFilter, setStatusFilter] = useState("All invoices");
    const [sortBy, setSortBy] = useState("Newest");
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [form, setForm] = useState(invoiceForm());
    const [formError, setFormError] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    const visibleInvoices = useMemo(() => {
        const query = globalSearch.trim().toLowerCase();
        const filtered = invoices.filter((invoice) => {
            const matchesQuery = !query || [invoice.id, invoice.orderId, invoice.title, invoice.buyer, invoice.status].some((value) => value.toLowerCase().includes(query));
            return matchesQuery && (statusFilter === "All invoices" || invoice.status === statusFilter);
        });
        return filtered.sort((first, second) => sortBy === "Due date" ? first.dueDate.localeCompare(second.dueDate) : sortBy === "Amount" ? second.amount - first.amount : second.issueDate.localeCompare(first.issueDate));
    }, [globalSearch, invoices, sortBy, statusFilter]);

    const routeIntent = location.state?.createInvoice ? location.state : null;
    const routeInvoice = routeIntent?.orderId ? invoices.find((invoice) => invoice.orderId === routeIntent.orderId) : null;
    const activeInvoice = editingInvoice || routeInvoice;
    const editorOpen = createOpen || Boolean(routeIntent);
    const initialOrder = routeIntent?.orderId ? orders.find((order) => order.id === routeIntent.orderId) : null;
    const alreadyInvoicedOrderIds = invoices.map((invoice) => invoice.orderId);
    const eligibleOrders = orders.filter((order) => ["Dispatched", "Delivered"].includes(order.status) && !alreadyInvoicedOrderIds.includes(order.id));
    const activeOrder = activeInvoice ? orders.find((order) => order.id === activeInvoice.orderId) : null;
    const formOrderId = form.orderId || initialOrder?.id || eligibleOrders[0]?.id || "";
    const orderOptions = activeOrder ? [activeOrder, ...eligibleOrders.filter((order) => order.id !== activeOrder.id)] : eligibleOrders;
    const selectedOrder = orders.find((order) => order.id === formOrderId);
    const activeForm = activeInvoice && !editingInvoice ? invoiceForm(activeInvoice) : form;
    const statusOptions = ["Draft", "Submitted", "Under review", "Needs update", "Paid"];

    const openNewInvoice = () => {
        setEditingInvoice(null);
        setForm(invoiceForm());
        setFormError("");
        setCreateOpen(true);
    };

    const openEditInvoice = (invoice) => {
        if (!["Draft", "Needs update"].includes(invoice.status)) return;
        setSelectedInvoice(null);
        setEditingInvoice(invoice);
        setForm(invoiceForm(invoice));
        setFormError("");
        setCreateOpen(false);
    };

    const closeEditor = () => {
        setEditingInvoice(null);
        setCreateOpen(false);
        setFormError("");
        if (routeIntent) navigate("/invoices", { replace: true, state: null });
    };

    const saveInvoice = (event) => {
        event.preventDefault();
        const order = orders.find((item) => item.id === formOrderId);
        const amount = Number(activeForm.amount || order?.amount);
        const issueDate = activeForm.issueDate || today;
        const dueDate = activeForm.dueDate || addDays(issueDate, 30);
        if (!order) return setFormError("Choose a delivered or dispatched purchase order.");
        if (!activeInvoice && (!eligibleOrders.some((item) => item.id === order.id))) return setFormError("This purchase order already has an invoice or is not ready to bill.");
        if (!Number.isFinite(amount) || amount <= 0) return setFormError("Enter an invoice total greater than zero.");
        if (dueDate < issueDate) return setFormError("The due date must be on or after the issue date.");
        const changes = { orderId: order.id, title: order.title, buyer: order.buyer, issueDate, dueDate, amount, note: activeForm.note.trim() };
        if (activeInvoice) {
            updateInvoice(activeInvoice.id, changes);
            addToast(`${activeInvoice.id} changes saved.`, "success");
        } else {
            const created = addInvoice(changes);
            addToast(`${created.id} saved as a draft.`, "success");
        }
        closeEditor();
    };

    const confirmSubmit = (invoice) => requestConfirmation({
        title: `Submit ${invoice.id} for review?`,
        description: `${invoice.title} for ${invoice.buyer}`,
        details: "The invoice will move to Under review in this demo workspace. No buyer is contacted and no payment is processed.",
        confirmLabel: "Submit invoice",
        cancelLabel: "Keep as draft",
        onConfirm: () => {
            updateInvoice(invoice.id, { status: "Under review" });
            addToast(`${invoice.id} marked as submitted for review.`, "success");
        },
    });

    const confirmDelete = (invoice) => requestConfirmation({
        title: "Delete this draft invoice?",
        description: `${invoice.id} for ${invoice.buyer}`,
        details: "This draft will be removed from the current demo session. Submitted invoices cannot be deleted here.",
        confirmLabel: "Delete draft",
        cancelLabel: "Keep draft",
        dangerous: true,
        onConfirm: () => {
            removeInvoice(invoice.id);
            addToast(`${invoice.id} deleted.`, "info");
        },
    });

    const exportInvoices = () => {
        const rows = visibleInvoices.map(({ id, orderId, title, buyer, issueDate, dueDate, amount, status }) => ({ id, orderId, title, buyer, issueDate, dueDate, amount: Number(amount).toFixed(2), status }));
        if (!downloadCsv(rows, "sourcelane-invoices.csv")) return addToast("There are no matching invoices to export.", "info");
        addToast(`Exported ${rows.length} invoices as CSV.`, "success");
    };

    const pendingTotal = invoices.filter((invoice) => ["Submitted", "Under review", "Needs update"].includes(invoice.status)).reduce((total, invoice) => total + Number(invoice.amount), 0);
    const paidTotal = invoices.filter((invoice) => invoice.status === "Paid").reduce((total, invoice) => total + Number(invoice.amount), 0);
    const needsActionCount = invoices.filter((invoice) => ["Draft", "Needs update"].includes(invoice.status)).length;

    const statusClass = (status) => styles[status.toLowerCase().replaceAll(" ", "-")] || "";

    return (
        <div className={styles.page}>
            <div className={styles.heading}>
                <div><p className={styles.breadcrumb}>Supplier desk <span>/</span> Invoices</p><h1>Invoices &amp; statements</h1><p className={styles.description}>Prepare accurate invoices against completed orders and keep your receivables together.</p></div>
                <div className={styles.headingActions}><button className={styles.exportButton} onClick={exportInvoices} type="button"><FiDownload aria-hidden="true" /> Export CSV</button><button className={styles.newButton} onClick={openNewInvoice} type="button"><FiPlus aria-hidden="true" /> New invoice</button></div>
            </div>

            <section aria-label="Invoice summary" className={styles.summary}>
                <div><span>Awaiting buyer review</span><strong>{formatCurrency(pendingTotal)}</strong><p>Submitted and needs update</p></div>
                <div><span>Marked paid</span><strong>{formatCurrency(paidTotal)}</strong><p>Based on demo records</p></div>
                <div><span>Your next action</span><strong>{needsActionCount}</strong><p>Draft or revision needed</p></div>
            </section>

            <section aria-label="Invoice register" className={styles.register}>
                <div className={styles.registerHeader}><div><h2>Invoice register</h2><p>{visibleInvoices.length} invoices shown</p></div><div className={styles.filters}><label><FiFilter aria-hidden="true" /><span className={styles.srOnly}>Filter invoice status</span><select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option>All invoices</option>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label><label><FiRepeat aria-hidden="true" /><span className={styles.srOnly}>Sort invoices</span><select onChange={(event) => setSortBy(event.target.value)} value={sortBy}><option>Newest</option><option>Due date</option><option>Amount</option></select></label></div></div>
                <div className={styles.tableScroll}><table><thead><tr><th>Invoice</th><th>Buyer &amp; order</th><th>Dates</th><th>Status</th><th>Amount</th><th><span className={styles.srOnly}>Actions</span></th></tr></thead><tbody>
                    {visibleInvoices.map((invoice) => (
                        <tr key={invoice.id}>
                            <td><button className={styles.invoiceId} onClick={() => setSelectedInvoice(invoice)} type="button"><span className={styles.invoiceIcon}><FiFilePlus aria-hidden="true" /></span><span><strong>{invoice.id}</strong><small>{invoice.title}</small></span></button></td>
                            <td><strong className={styles.buyerName}>{invoice.buyer}</strong><span className={styles.orderId}>{invoice.orderId}</span></td>
                            <td><span className={styles.dateBlock}><span>Issued {formatDate(invoice.issueDate, { month: "short", day: "numeric" })}</span><span>Due {formatDate(invoice.dueDate, { month: "short", day: "numeric" })}</span></span></td>
                            <td><span className={`${styles.status} ${statusClass(invoice.status)}`}>{invoice.status}</span></td>
                            <td className={styles.amountCell}>{formatCurrency(invoice.amount)}</td>
                            <td><div className={styles.rowActions}><button aria-label={`View ${invoice.id}`} className={styles.iconButton} onClick={() => setSelectedInvoice(invoice)} type="button"><FiEye aria-hidden="true" /></button>{["Draft", "Needs update"].includes(invoice.status) && <button className={styles.textAction} onClick={() => openEditInvoice(invoice)} type="button">Edit</button>}{["Draft", "Needs update"].includes(invoice.status) && <button aria-label={`${invoice.status === "Draft" ? "Submit" : "Resubmit"} ${invoice.id}`} className={styles.iconButton} onClick={() => confirmSubmit(invoice)} type="button"><FiArrowUpRight aria-hidden="true" /></button>}{invoice.status === "Draft" && <button aria-label={`Delete ${invoice.id}`} className={styles.deleteButton} onClick={() => confirmDelete(invoice)} type="button"><FiTrash2 aria-hidden="true" /></button>}</div></td>
                        </tr>
                    ))}
                </tbody></table></div>
                {visibleInvoices.length === 0 && <div className={styles.emptyState}><FiClipboard aria-hidden="true" /><h3>No invoices in this view</h3><p>Adjust the status filter or create an invoice from a delivered purchase order.</p><button onClick={() => { setStatusFilter("All invoices"); setSortBy("Newest"); }} type="button">Show all invoices</button></div>}
                <div className={styles.registerFooter}><FiCheckCircle aria-hidden="true" /><p>Invoice changes are held in React state and reset when you refresh this demo.</p><span>Currency: USD</span></div>
            </section>

            <Dialog description={selectedInvoice ? `${selectedInvoice.id} · ${selectedInvoice.buyer}` : ""} footer={<><button className={styles.secondaryButton} onClick={() => setSelectedInvoice(null)} type="button">Close</button>{selectedInvoice && ["Draft", "Needs update"].includes(selectedInvoice.status) && <button className={styles.secondaryButton} onClick={() => openEditInvoice(selectedInvoice)} type="button">Edit invoice <FiArrowUpRight aria-hidden="true" /></button>}{["Draft", "Needs update"].includes(selectedInvoice?.status) && <button className={styles.primaryButton} onClick={() => { confirmSubmit(selectedInvoice); setSelectedInvoice(null); }} type="button">{selectedInvoice.status === "Draft" ? "Submit for review" : "Resubmit for review"} <FiArrowUpRight aria-hidden="true" /></button>}</>} isOpen={Boolean(selectedInvoice)} labelId="invoice-detail-title" onClose={() => setSelectedInvoice(null)} size="medium" title={selectedInvoice?.title || "Invoice details"}>
                {selectedInvoice && <div className={styles.detailContent}><div className={styles.detailStatus}><span className={`${styles.status} ${statusClass(selectedInvoice.status)}`}>{selectedInvoice.status}</span><strong>{formatCurrency(selectedInvoice.amount)}</strong></div><dl><div><dt>Purchase order</dt><dd>{selectedInvoice.orderId}</dd></div><div><dt>Buyer</dt><dd>{selectedInvoice.buyer}</dd></div><div><dt>Issue date</dt><dd>{formatDate(selectedInvoice.issueDate)}</dd></div><div><dt>Due date</dt><dd>{formatDate(selectedInvoice.dueDate)}</dd></div></dl>{selectedInvoice.note && <div className={styles.detailNote}><strong>Invoice note</strong><p>{selectedInvoice.note}</p></div>}<p className={styles.detailDisclaimer}>Status is a frontend demo only. No invoice was delivered to a buyer and no payment was processed.</p></div>}
            </Dialog>

            <Dialog description={activeInvoice ? `${activeInvoice.id} · ${activeInvoice.buyer}` : "Create an invoice from a delivered or dispatched purchase order."} footer={<><button className={styles.secondaryButton} onClick={closeEditor} type="button">Cancel</button><button className={styles.primaryButton} form="invoice-form" type="submit">{activeInvoice ? "Save changes" : "Save as draft"} <FiArrowUpRight aria-hidden="true" /></button></>} isOpen={editorOpen} labelId="invoice-editor-title" onClose={closeEditor} size="medium" title={activeInvoice ? activeInvoice.status === "Needs update" ? "Revise invoice" : "Edit invoice draft" : "Create an invoice"}>
                <form className={styles.invoiceForm} id="invoice-form" noValidate onSubmit={saveInvoice}>
                    <label className={styles.fullWidth}>Purchase order <select disabled={Boolean(activeInvoice)} onChange={(event) => { setForm((current) => ({ ...current, orderId: event.target.value, amount: String(orders.find((order) => order.id === event.target.value)?.amount || "") })); setFormError(""); }} required value={formOrderId}><option value="">Select a delivered order</option>{orderOptions.map((order) => <option key={order.id} value={order.id}>{order.id} · {order.buyer} · {order.status}</option>)}</select>{selectedOrder && <span className={styles.formHint}>{selectedOrder.title} · {formatCurrency(selectedOrder.amount)} order value</span>}</label>
                    <label>Invoice total <div className={styles.amountInput}><span>$</span><input min="0.01" onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} required step="0.01" type="number" value={activeForm.amount || selectedOrder?.amount || ""} /></div></label>
                    <label>Issue date<input onChange={(event) => setForm((current) => ({ ...current, issueDate: event.target.value }))} required type="date" value={activeForm.issueDate || today} /></label>
                    <label>Payment due<input min={activeForm.issueDate || today} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} required type="date" value={activeForm.dueDate || addDays(activeForm.issueDate || today, 30)} /></label>
                    <label className={styles.fullWidth}>Note <span>optional</span><textarea maxLength="220" onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="Add payment terms or a note for your team." rows="3" value={activeForm.note || ""} /></label>
                    <p className={styles.formDisclaimer}><FiCheckCircle aria-hidden="true" /> This creates a local draft. It does not send or process a payment.</p>
                    {formError && <p className={styles.formError} role="alert">{formError}</p>}
                </form>
            </Dialog>
        </div>
    );
};

export default InvoicesPage;
