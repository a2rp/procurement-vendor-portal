import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiArrowUpRight, FiCalendar, FiCheckCircle, FiClock, FiFileText, FiPackage, FiTruck } from "react-icons/fi";
import { usePortal } from "../../context/usePortal.js";
import { formatCurrency, formatDate, formatDueLabel, formatLongDate, getDaysUntil } from "../../utils/formatters.js";
import styles from "./styles.module.css";

const OverviewPage = () => {
    const { rfqs, orders, invoices, company, globalSearch } = usePortal();
    const query = globalSearch.trim().toLowerCase();
    const currentDate = new Date().toISOString().slice(0, 10);

    const openRfqs = rfqs.filter((rfq) => rfq.status === "Open").sort((first, second) => first.dueDate.localeCompare(second.dueDate));
    const movingOrders = orders.filter((order) => order.status !== "Delivered");
    const invoicesToWork = invoices.filter((invoice) => ["Draft", "Needs update"].includes(invoice.status));
    const latestOrders = [...orders].sort((first, second) => second.orderDate.localeCompare(first.orderDate)).slice(0, 4);
    const nextRfqs = openRfqs.slice(0, 3);
    const nextInvoice = invoicesToWork[0];
    const nextOrder = orders.find((order) => order.status === "Awaiting acceptance");

    const searchResults = useMemo(() => {
        if (!query) return [];
        return [
            ...rfqs.filter((rfq) => [rfq.id, rfq.title, rfq.buyer, rfq.reference].some((value) => value.toLowerCase().includes(query))).map((rfq) => ({ type: "RFQ", id: rfq.id, title: rfq.title, buyer: rfq.buyer, route: "/rfqs" })),
            ...orders.filter((order) => [order.id, order.title, order.buyer, order.reference, order.status].some((value) => value.toLowerCase().includes(query))).map((order) => ({ type: "Purchase order", id: order.id, title: order.title, buyer: order.buyer, route: "/orders" })),
            ...invoices.filter((invoice) => [invoice.id, invoice.orderId, invoice.title, invoice.buyer, invoice.status].some((value) => value.toLowerCase().includes(query))).map((invoice) => ({ type: "Invoice", id: invoice.id, title: invoice.title, buyer: invoice.buyer, route: "/invoices" })),
        ].slice(0, 8);
    }, [invoices, orders, query, rfqs]);

    const statusClass = (status) => styles[status.toLowerCase().replaceAll(" ", "-")] || "";
    const dueDays = (value) => getDaysUntil(value);

    return (
        <div className={styles.page}>
            <p className={styles.breadcrumb}>Supplier desk <span>/</span> Overview</p>

            {query && <section aria-label="Search results" className={styles.searchResults}><div className={styles.searchHeader}><div><span>SEARCH RESULTS</span><h1>Matches for “{globalSearch.trim()}”</h1></div><span>{searchResults.length} records</span></div>{searchResults.length ? <div className={styles.resultList}>{searchResults.map((item) => <Link className={styles.searchResult} key={`${item.type}-${item.id}`} to={item.route}><span><FiFileText aria-hidden="true" /></span><span><small>{item.type} · {item.id}</small><strong>{item.title}</strong><span>{item.buyer}</span></span><FiArrowUpRight aria-hidden="true" /></Link>)}</div> : <p className={styles.noResults}>No matching records. Try a buyer name, item, purchase order, invoice, or request number.</p>}</section>}

            <section className={styles.hero}>
                <div className={styles.heroText}><span className={styles.dateLabel}><FiCalendar aria-hidden="true" /> {formatLongDate(currentDate)}</span><h1>Good morning, {company.contact.split(" ")[0]}.</h1><p>Your supplier workbench is ready. Review opportunities, move orders forward, and keep buyer records current.</p><div className={styles.heroActions}><Link className={styles.heroPrimary} to="/rfqs">Review open requests <FiArrowRight aria-hidden="true" /></Link><Link className={styles.heroSecondary} to="/company">Update your profile <FiArrowUpRight aria-hidden="true" /></Link></div></div>
                <div className={styles.heroImage}><img alt="Warehouse aisles with inventory ready for supplier fulfillment" src={`${import.meta.env.BASE_URL}images/vendor-warehouse.jpg`} /><span className={styles.imageCaption}><FiTruck aria-hidden="true" /> Ready for the next order</span></div>
            </section>

            <section aria-label="Supplier workspace summary" className={styles.stats}>
                <Link to="/rfqs"><span>Open requests</span><strong>{openRfqs.length}</strong><small><FiFileText aria-hidden="true" /> Opportunities to quote</small><FiArrowUpRight aria-hidden="true" className={styles.statArrow} /></Link>
                <Link to="/orders"><span>Orders moving</span><strong>{movingOrders.length}</strong><small><FiPackage aria-hidden="true" /> Production through delivery</small><FiArrowUpRight aria-hidden="true" className={styles.statArrow} /></Link>
                <Link to="/invoices"><span>Invoices to work</span><strong>{invoicesToWork.length}</strong><small><FiClock aria-hidden="true" /> Drafts and revisions</small><FiArrowUpRight aria-hidden="true" className={styles.statArrow} /></Link>
                <div><span>Pending receivables</span><strong>{formatCurrency(invoices.filter((invoice) => ["Submitted", "Under review", "Needs update"].includes(invoice.status)).reduce((sum, invoice) => sum + Number(invoice.amount), 0))}</strong><small><FiCheckCircle aria-hidden="true" /> Across submitted invoices</small></div>
            </section>

            <div className={styles.workGrid}>
                <section aria-label="Next supplier actions" className={styles.actionPanel}>
                    <div className={styles.panelHeading}><div><span>WORK QUEUE</span><h2>Next up for your team</h2></div><span>{openRfqs.length + invoicesToWork.length + (nextOrder ? 1 : 0)} actions</span></div>
                    <div className={styles.actionList}>
                        {nextRfqs.slice(0, 2).map((rfq) => <Link className={styles.actionItem} key={rfq.id} to="/rfqs"><span className={`${styles.actionIcon} ${dueDays(rfq.dueDate) <= 3 ? styles.actionUrgent : ""}`}><FiFileText aria-hidden="true" /></span><span className={styles.actionCopy}><small>QUOTE REQUEST · {rfq.id}</small><strong>{rfq.title}</strong><span>{rfq.buyer} · {formatDueLabel(rfq.dueDate)}</span></span><FiArrowRight aria-hidden="true" className={styles.actionArrow} /></Link>)}
                        {nextOrder && <Link className={styles.actionItem} to="/orders"><span className={`${styles.actionIcon} ${styles.actionAmber}`}><FiPackage aria-hidden="true" /></span><span className={styles.actionCopy}><small>PURCHASE ORDER · {nextOrder.id}</small><strong>Confirm {nextOrder.title}</strong><span>{nextOrder.buyer} · due {formatDate(nextOrder.dueDate, { month: "short", day: "numeric" })}</span></span><FiArrowRight aria-hidden="true" className={styles.actionArrow} /></Link>}
                        {nextInvoice && <Link className={styles.actionItem} to="/invoices"><span className={`${styles.actionIcon} ${styles.actionBlue}`}><FiFileText aria-hidden="true" /></span><span className={styles.actionCopy}><small>INVOICE · {nextInvoice.id}</small><strong>{nextInvoice.status === "Needs update" ? "Review requested changes" : "Finish your invoice draft"}</strong><span>{nextInvoice.buyer} · {formatCurrency(nextInvoice.amount)}</span></span><FiArrowRight aria-hidden="true" className={styles.actionArrow} /></Link>}
                        {openRfqs.length === 0 && !nextOrder && !nextInvoice && <div className={styles.allClear}><FiCheckCircle aria-hidden="true" /><strong>Your work queue is clear.</strong><span>New buyer requests will appear here.</span></div>}
                    </div>
                    <Link className={styles.panelLink} to="/rfqs">View all buyer requests <FiArrowRight aria-hidden="true" /></Link>
                </section>

                <section aria-label="Recent purchase orders" className={styles.ordersPanel}>
                    <div className={styles.panelHeading}><div><span>DELIVERY DESK</span><h2>Recent purchase orders</h2></div><Link aria-label="View all purchase orders" to="/orders"><FiArrowUpRight aria-hidden="true" /></Link></div>
                    <div className={styles.orderTimeline}>{latestOrders.map((order, index) => <Link className={styles.timelineItem} key={order.id} to="/orders"><span className={`${styles.timelineMarker} ${statusClass(order.status)}`}><FiPackage aria-hidden="true" /></span><span className={styles.timelineCopy}><span><strong>{order.id}</strong><span className={`${styles.status} ${statusClass(order.status)}`}>{order.status}</span></span><strong>{order.title}</strong><small>{order.buyer} · {formatCurrency(order.amount)}</small></span>{index < latestOrders.length - 1 && <span className={styles.timelineLine} />}</Link>)}</div>
                    <Link className={styles.panelLink} to="/orders">Open order book <FiArrowRight aria-hidden="true" /></Link>
                </section>
            </div>
        </div>
    );
};

export default OverviewPage;
