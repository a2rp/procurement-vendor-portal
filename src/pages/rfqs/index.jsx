import { useMemo, useState } from "react";
import { FiArrowDownUp, FiArrowUpRight, FiCalendar, FiDownload, FiEye, FiFileText, FiFilter, FiPackage, FiPlus, FiSend, FiXCircle } from "react-icons/fi";
import Dialog from "../../components/dialog/index.jsx";
import { usePortal } from "../../context/usePortal.js";
import { downloadCsv, formatCurrency, formatDate, formatDueLabel, getDaysUntil } from "../../utils/formatters.js";
import styles from "./styles.module.css";

const today = new Date().toISOString().slice(0, 10);

const RfqsPage = () => {
    const { rfqs, globalSearch, submitQuote, withdrawQuote, requestConfirmation, addToast } = usePortal();
    const [statusFilter, setStatusFilter] = useState("All requests");
    const [categoryFilter, setCategoryFilter] = useState("All categories");
    const [sortBy, setSortBy] = useState("Closing soon");
    const [selectedRfq, setSelectedRfq] = useState(null);
    const [quoteRfq, setQuoteRfq] = useState(null);
    const [quote, setQuote] = useState({ unitPrice: "", leadDays: "", validTo: "", note: "" });
    const [formError, setFormError] = useState("");

    const categories = useMemo(() => [...new Set(rfqs.map((rfq) => rfq.category))].sort(), [rfqs]);
    const visibleRfqs = useMemo(() => {
        const query = globalSearch.trim().toLowerCase();
        const filtered = rfqs.filter((rfq) => {
            const matchesSearch = !query || [rfq.id, rfq.title, rfq.buyer, rfq.category, rfq.reference].some((value) => value.toLowerCase().includes(query));
            const matchesStatus = statusFilter === "All requests" || rfq.status === statusFilter;
            const matchesCategory = categoryFilter === "All categories" || rfq.category === categoryFilter;
            return matchesSearch && matchesStatus && matchesCategory;
        });
        return filtered.sort((first, second) => {
            if (sortBy === "Buyer") return first.buyer.localeCompare(second.buyer);
            if (sortBy === "Newest") return second.id.localeCompare(first.id);
            return first.dueDate.localeCompare(second.dueDate);
        });
    }, [categoryFilter, globalSearch, rfqs, sortBy, statusFilter]);

    const openQuote = (rfq) => {
        setQuoteRfq(rfq);
        setQuote(rfq.quote ? { ...rfq.quote, unitPrice: String(rfq.quote.unitPrice), leadDays: String(rfq.quote.leadDays) } : { unitPrice: "", leadDays: "", validTo: "", note: "" });
        setFormError("");
    };

    const closeQuote = () => {
        setQuoteRfq(null);
        setFormError("");
    };

    const saveQuote = (event) => {
        event.preventDefault();
        const unitPrice = Number(quote.unitPrice);
        const leadDays = Number(quote.leadDays);
        if (!Number.isFinite(unitPrice) || unitPrice <= 0) return setFormError("Enter a unit price greater than zero.");
        if (!Number.isInteger(leadDays) || leadDays < 1) return setFormError("Lead time must be at least one full day.");
        if (!quote.validTo || quote.validTo < today) return setFormError("Choose a quote validity date from today onward.");
        submitQuote(quoteRfq.id, { ...quote, unitPrice, leadDays });
        addToast(`Quote saved for ${quoteRfq.id}.`, "success");
        closeQuote();
    };

    const exportRequests = () => {
        const rows = visibleRfqs.map(({ id, title, buyer, category, quantity, unit, dueDate, status, reference }) => ({ id, title, buyer, category, quantity: `${quantity} ${unit}`, dueDate, status, reference }));
        if (!downloadCsv(rows, "sourcelane-rfq-list.csv")) return addToast("There are no matching requests to export.", "info");
        addToast(`Exported ${rows.length} requests as CSV.`, "success");
    };

    const confirmWithdraw = (rfq) => requestConfirmation({
        title: "Withdraw this quote?",
        description: `${rfq.id} for ${rfq.buyer}`,
        details: "The quote will be removed from this demo workspace and the request will return to Open. This does not notify the buyer.",
        confirmLabel: "Withdraw quote",
        cancelLabel: "Keep quote",
        dangerous: true,
        onConfirm: () => {
            withdrawQuote(rfq.id);
            addToast(`Quote withdrawn from ${rfq.id}.`, "info");
        },
    });

    const openCount = rfqs.filter((rfq) => rfq.status === "Open").length;
    const quotedCount = rfqs.filter((rfq) => rfq.status === "Quoted").length;
    const dueSoonCount = rfqs.filter((rfq) => [0, 1, 2, 3].includes(getDaysUntil(rfq.dueDate)) && rfq.status === "Open").length;

    return (
        <div className={styles.page}>
            <div className={styles.pageIntro}>
                <div>
                    <p className={styles.breadcrumb}>Supplier desk <span>/</span> Requests for quotation</p>
                    <h1>Requests for quotation</h1>
                    <p className={styles.description}>Review each buyer request, price your offer, and keep every closing date in view.</p>
                </div>
                <button className={styles.exportButton} onClick={exportRequests} type="button"><FiDownload aria-hidden="true" /> Export list</button>
            </div>

            <section aria-label="RFQ summary" className={styles.summary}>
                <div><span>Open opportunities</span><strong>{openCount}</strong><p>Ready for your quote</p></div>
                <div><span>Quotes in review</span><strong>{quotedCount}</strong><p>Submitted by your team</p></div>
                <div className={styles.summaryAttention}><span>Closing in 3 days</span><strong>{dueSoonCount}</strong><p>Check the due dates below</p></div>
            </section>

            <section aria-label="RFQ list" className={styles.workspace}>
                <div className={styles.listHeading}>
                    <div><h2>Buyer requests</h2><p>{visibleRfqs.length} matching {visibleRfqs.length === 1 ? "request" : "requests"}</p></div>
                    <div className={styles.filters}>
                        <label><FiFilter aria-hidden="true" /><span className={styles.srOnly}>Filter by status</span><select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option>All requests</option>{["Open", "Quoted", "Awarded", "Declined"].map((status) => <option key={status}>{status}</option>)}</select></label>
                        <label><FiPackage aria-hidden="true" /><span className={styles.srOnly}>Filter by category</span><select onChange={(event) => setCategoryFilter(event.target.value)} value={categoryFilter}><option>All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
                        <label><FiArrowDownUp aria-hidden="true" /><span className={styles.srOnly}>Sort requests</span><select onChange={(event) => setSortBy(event.target.value)} value={sortBy}><option>Closing soon</option><option>Buyer</option><option>Newest</option></select></label>
                    </div>
                </div>

                <div className={styles.requestList}>
                    {visibleRfqs.map((rfq) => {
                        const dueDays = getDaysUntil(rfq.dueDate);
                        const isUrgent = rfq.status === "Open" && dueDays !== null && dueDays <= 3;
                        return (
                            <article className={styles.requestRow} key={rfq.id}>
                                <div className={`${styles.dueMarker} ${isUrgent ? styles.dueSoon : ""}`} aria-hidden="true" />
                                <div className={styles.requestMain}>
                                    <div className={styles.requestMeta}><span>{rfq.id}</span><span>{rfq.reference}</span><span className={styles.category}>{rfq.category}</span></div>
                                    <h3>{rfq.title}</h3>
                                    <p className={styles.buyer}>{rfq.buyer}</p>
                                    <div className={styles.requestFacts}><span><FiPackage aria-hidden="true" /> {rfq.quantity.toLocaleString()} {rfq.unit}</span><span className={isUrgent ? styles.urgent : ""}><FiCalendar aria-hidden="true" /> {formatDueLabel(rfq.dueDate)} <span className={styles.date}>({formatDate(rfq.dueDate, { month: "short", day: "numeric" })})</span></span></div>
                                </div>
                                <div className={styles.requestStatus}>
                                    <span className={`${styles.statusBadge} ${styles[rfq.status.toLowerCase().replaceAll(" ", "-")]}`}>{rfq.status}</span>
                                    {rfq.quote && <strong>{formatCurrency(rfq.quote.unitPrice)} <span>/ unit</span></strong>}
                                </div>
                                <div className={styles.rowActions}>
                                    <button aria-label={`View ${rfq.id} details`} className={styles.iconButton} onClick={() => setSelectedRfq(rfq)} type="button"><FiEye aria-hidden="true" /></button>
                                    {(rfq.status === "Open" || rfq.status === "Quoted") && <button className={styles.quoteButton} onClick={() => openQuote(rfq)} type="button">{rfq.quote ? "Edit quote" : <><FiPlus aria-hidden="true" /> Prepare quote</>}</button>}
                                    {rfq.quote && <button aria-label={`Withdraw quote for ${rfq.id}`} className={styles.withdrawButton} onClick={() => confirmWithdraw(rfq)} type="button"><FiXCircle aria-hidden="true" /> <span>Withdraw</span></button>}
                                    <FiArrowUpRight aria-hidden="true" className={styles.rowArrow} />
                                </div>
                            </article>
                        );
                    })}
                    {visibleRfqs.length === 0 && <div className={styles.emptyState}><FiFileText aria-hidden="true" /><h3>No requests match these filters</h3><p>Clear a filter or search for a different buyer, item, or reference.</p><button onClick={() => { setStatusFilter("All requests"); setCategoryFilter("All categories"); }} type="button">Clear filters</button></div>}
                </div>
                <p className={styles.demoNote}>Buyer messages and quote submissions are demo interactions. No quote is sent outside this browser session.</p>
            </section>

            <Dialog
                description={selectedRfq?.buyer}
                footer={<><button className={styles.secondaryButton} onClick={() => setSelectedRfq(null)} type="button">Close details</button>{selectedRfq && (selectedRfq.status === "Open" || selectedRfq.status === "Quoted") && <button className={styles.primaryButton} onClick={() => { const current = rfqs.find((item) => item.id === selectedRfq.id); setSelectedRfq(null); openQuote(current); }} type="button">{selectedRfq.quote ? "Edit quote" : "Prepare quote"}<FiArrowUpRight aria-hidden="true" /></button>}</>}
                isOpen={Boolean(selectedRfq)}
                labelId="rfq-detail-title"
                onClose={() => setSelectedRfq(null)}
                size="medium"
                title={selectedRfq?.title || "Request details"}
            >
                {selectedRfq && <div className={styles.detailContent}><div className={styles.detailTop}><span>{selectedRfq.id}</span><span className={`${styles.statusBadge} ${styles[selectedRfq.status.toLowerCase().replaceAll(" ", "-")]}`}>{selectedRfq.status}</span></div><p>{selectedRfq.note}</p><dl><div><dt>Buyer reference</dt><dd>{selectedRfq.reference}</dd></div><div><dt>Requested quantity</dt><dd>{selectedRfq.quantity.toLocaleString()} {selectedRfq.unit}</dd></div><div><dt>Category</dt><dd>{selectedRfq.category}</dd></div><div><dt>Quote deadline</dt><dd>{formatDate(selectedRfq.dueDate)} · {formatDueLabel(selectedRfq.dueDate)}</dd></div>{selectedRfq.quote && <div><dt>Your quoted price</dt><dd>{formatCurrency(selectedRfq.quote.unitPrice)} / {selectedRfq.unit}, {selectedRfq.quote.leadDays} day lead time</dd></div>}</dl>{selectedRfq.quote?.note && <div className={styles.quoteNote}><strong>Note included with your quote</strong><p>{selectedRfq.quote.note}</p></div>}</div>}
            </Dialog>

            <Dialog
                description={quoteRfq ? `${quoteRfq.id} for ${quoteRfq.buyer} · ${quoteRfq.quantity.toLocaleString()} ${quoteRfq.unit}` : ""}
                footer={<><button className={styles.secondaryButton} onClick={closeQuote} type="button">Cancel</button><button className={styles.primaryButton} form="quote-form" type="submit"><FiSend aria-hidden="true" /> Save quote</button></>}
                isOpen={Boolean(quoteRfq)}
                labelId="rfq-quote-title"
                onClose={closeQuote}
                size="medium"
                title={quoteRfq?.quote ? "Revise your quote" : "Prepare a quote"}
            >
                <form className={styles.quoteForm} id="quote-form" onSubmit={saveQuote}>
                    <label>Unit price <span>USD</span><div className={styles.inputWithPrefix}><span>$</span><input min="0.01" onChange={(event) => setQuote((current) => ({ ...current, unitPrice: event.target.value }))} placeholder="0.00" required step="0.01" type="number" value={quote.unitPrice} /></div></label>
                    <label>Lead time <span>calendar days</span><div className={styles.inputWithSuffix}><input min="1" onChange={(event) => setQuote((current) => ({ ...current, leadDays: event.target.value }))} placeholder="e.g. 12" required type="number" value={quote.leadDays} /><span>days</span></div></label>
                    <label>Quote valid through<input min={today} onChange={(event) => setQuote((current) => ({ ...current, validTo: event.target.value }))} required type="date" value={quote.validTo} /></label>
                    <label className={styles.fullWidth}>Message to buyer <span>optional</span><textarea maxLength="220" onChange={(event) => setQuote((current) => ({ ...current, note: event.target.value }))} placeholder="Add a concise note about packaging, freight, or availability." rows="3" value={quote.note} /></label>
                    <p className={styles.helper}>This demo saves your quote in the page state. It does not contact the buyer.</p>
                    {formError && <p className={styles.formError} role="alert">{formError}</p>}
                </form>
            </Dialog>
        </div>
    );
};

export default RfqsPage;
