import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiBox, FiCalendar, FiCheck, FiCheckCircle, FiChevronDown, FiClipboard, FiPackage, FiTruck } from "react-icons/fi";
import Dialog from "../../components/dialog/index.jsx";
import { usePortal } from "../../context/usePortal.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import styles from "./styles.module.css";

const stages = ["Awaiting acceptance", "In production", "Ready to ship", "Dispatched", "Delivered"];

const OrdersPage = () => {
    const { orders, invoices, globalSearch, updateOrder, addToast } = usePortal();
    const [statusFilter, setStatusFilter] = useState("All orders");
    const [selectedId, setSelectedId] = useState(orders[0]?.id || "");
    const [dispatchOrder, setDispatchOrder] = useState(null);
    const [shipping, setShipping] = useState({ carrier: "", tracking: "" });
    const [formError, setFormError] = useState("");
    const navigate = useNavigate();

    const visibleOrders = useMemo(() => {
        const query = globalSearch.trim().toLowerCase();
        return orders.filter((order) => {
            const matchesQuery = !query || [order.id, order.title, order.buyer, order.reference, order.status, order.tracking || ""].some((value) => value.toLowerCase().includes(query));
            return matchesQuery && (statusFilter === "All orders" || order.status === statusFilter);
        }).sort((first, second) => second.orderDate.localeCompare(first.orderDate));
    }, [globalSearch, orders, statusFilter]);

    const selectedOrder = visibleOrders.find((order) => order.id === selectedId) || visibleOrders[0] || null;
    const invoiceExists = selectedOrder && invoices.some((invoice) => invoice.orderId === selectedOrder.id);
    const canInvoice = selectedOrder && ["Delivered", "Dispatched"].includes(selectedOrder.status) && !invoiceExists;

    const nextStep = (order) => {
        if (order.status === "Awaiting acceptance") {
            updateOrder(order.id, { status: "In production", acceptedDate: new Date().toISOString().slice(0, 10) });
            addToast(`${order.id} accepted. Production is now in progress.`, "success");
        } else if (order.status === "In production") {
            updateOrder(order.id, { status: "Ready to ship" });
            addToast(`${order.id} is marked ready to ship.`, "success");
        } else if (order.status === "Ready to ship") {
            setShipping({ carrier: order.carrier || "", tracking: order.tracking || "" });
            setFormError("");
            setDispatchOrder(order);
        } else if (order.status === "Dispatched") {
            updateOrder(order.id, { status: "Delivered", deliveredDate: new Date().toISOString().slice(0, 10) });
            addToast(`${order.id} delivery recorded in the demo workspace.`, "success");
        }
    };

    const saveDispatch = (event) => {
        event.preventDefault();
        if (shipping.carrier.trim().length < 2) return setFormError("Enter the name of the shipping carrier.");
        if (shipping.tracking.trim().length < 4) return setFormError("Enter a tracking reference with at least four characters.");
        updateOrder(dispatchOrder.id, { status: "Dispatched", carrier: shipping.carrier.trim(), tracking: shipping.tracking.trim(), dispatchedDate: new Date().toISOString().slice(0, 10) });
        addToast(`${dispatchOrder.id} marked as dispatched.`, "success");
        setDispatchOrder(null);
    };

    const openInvoice = () => {
        navigate("/invoices", { state: { createInvoice: true, orderId: selectedOrder.id } });
    };

    const actionLabel = (order) => ({
        "Awaiting acceptance": "Accept purchase order",
        "In production": "Mark ready to ship",
        "Ready to ship": "Add shipping details",
        Dispatched: "Record delivery",
    }[order.status]);

    return (
        <div className={styles.page}>
            <div className={styles.heading}>
                <div><p className={styles.breadcrumb}>Supplier desk <span>/</span> Purchase orders</p><h1>Purchase orders</h1><p className={styles.description}>Confirm the work, keep delivery moving, and give buyers a clear status at every step.</p></div>
                <div className={styles.orderCount}><FiClipboard aria-hidden="true" /><span>{orders.length} active purchase orders</span></div>
            </div>

            <div className={styles.orderWorkspace}>
                <section aria-label="Purchase order list" className={styles.orderIndex}>
                    <div className={styles.indexHeading}><div><h2>Order book</h2><p>Newest purchase orders first</p></div><label><span className={styles.srOnly}>Filter by status</span><FiChevronDown aria-hidden="true" /><select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option>All orders</option>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label></div>
                    <div className={styles.orderList}>
                        {visibleOrders.map((order) => (
                            <button aria-current={selectedOrder?.id === order.id ? "true" : undefined} className={`${styles.orderItem} ${selectedOrder?.id === order.id ? styles.selected : ""}`} key={order.id} onClick={() => setSelectedId(order.id)} type="button">
                                <span className={styles.itemIcon}><FiPackage aria-hidden="true" /></span>
                                <span className={styles.itemContent}><span className={styles.itemTop}><strong>{order.id}</strong><span>{formatCurrency(order.amount)}</span></span><span className={styles.itemTitle}>{order.title}</span><span className={styles.itemBuyer}>{order.buyer}</span><span className={styles.itemBottom}><span className={`${styles.status} ${styles[order.status.toLowerCase().replaceAll(" ", "-")]}`}>{order.status}</span><span>Due {formatDate(order.dueDate, { month: "short", day: "numeric" })}</span></span></span>
                                <FiArrowRight aria-hidden="true" className={styles.itemArrow} />
                            </button>
                        ))}
                        {visibleOrders.length === 0 && <div className={styles.empty}><FiBox aria-hidden="true" /><h3>No orders found</h3><p>Try another status or update your workspace search.</p></div>}
                    </div>
                    <div className={styles.indexFooter}><FiCheckCircle aria-hidden="true" /><span>Order updates remain in this session only.</span></div>
                </section>

                <section aria-label="Selected purchase order" className={styles.orderDetail}>
                    {selectedOrder ? <>
                        <div className={styles.detailHeader}>
                            <div><p className={styles.detailLabel}>PURCHASE ORDER</p><div className={styles.detailTitleRow}><h2>{selectedOrder.id}</h2><span className={`${styles.status} ${styles[ selectedOrder.status.toLowerCase().replaceAll(" ", "-")]}`}>{selectedOrder.status}</span></div><p className={styles.detailBuyer}>{selectedOrder.buyer} <span>·</span> Buyer reference {selectedOrder.reference}</p></div>
                            <div className={styles.amount}><span>Order total</span><strong>{formatCurrency(selectedOrder.amount)}</strong></div>
                        </div>

                        <div aria-label="Order progress" className={styles.progressTrack}>
                            {stages.map((stage, index) => {
                                const stageIndex = stages.indexOf(selectedOrder.status);
                                const isComplete = index < stageIndex;
                                const isCurrent = index === stageIndex;
                                return <div className={`${styles.progressStep} ${isComplete ? styles.complete : ""} ${isCurrent ? styles.current : ""}`} key={stage}><span className={styles.stepIcon}>{isComplete ? <FiCheck aria-hidden="true" /> : index + 1}</span><span>{stage}</span></div>;
                            })}
                        </div>

                        <div className={styles.detailGrid}>
                            <div className={styles.itemsPanel}><div className={styles.sectionTitle}><h3>Order contents</h3><span>{selectedOrder.quantity.toLocaleString()} units</span></div>{selectedOrder.lines.map((line) => <div className={styles.lineItem} key={line.name}><span className={styles.lineIcon}><FiBox aria-hidden="true" /></span><span className={styles.lineDescription}><strong>{line.name}</strong><span>{line.quantity.toLocaleString()} × {formatCurrency(line.unitPrice)}</span></span><strong>{formatCurrency(line.quantity * line.unitPrice)}</strong></div>)}</div>
                            <div className={styles.deliveryPanel}><div className={styles.sectionTitle}><h3>Delivery details</h3><FiTruck aria-hidden="true" /></div><dl><div><dt>Order received</dt><dd>{formatDate(selectedOrder.orderDate)}</dd></div><div><dt>Requested arrival</dt><dd><FiCalendar aria-hidden="true" /> {formatDate(selectedOrder.dueDate)}</dd></div>{selectedOrder.carrier && <div><dt>Carrier</dt><dd>{selectedOrder.carrier}</dd></div>}{selectedOrder.tracking && <div><dt>Tracking reference</dt><dd>{selectedOrder.tracking}</dd></div>}{selectedOrder.deliveredDate && <div><dt>Delivery recorded</dt><dd>{formatDate(selectedOrder.deliveredDate)}</dd></div>}</dl></div>
                        </div>

                        <div className={styles.orderActions}>
                            <p><span className={styles.liveDot} /> Supplier update <strong>{selectedOrder.status}</strong></p>
                            <div>{canInvoice && <button className={styles.secondaryButton} onClick={openInvoice} type="button"><FiClipboard aria-hidden="true" /> Create invoice</button>}{actionLabel(selectedOrder) && <button className={styles.primaryButton} onClick={() => nextStep(selectedOrder)} type="button">{actionLabel(selectedOrder)} <FiArrowRight aria-hidden="true" /></button>}</div>
                        </div>
                        <p className={styles.demoNote}>Status changes are a local product demo. Carrier and tracking details are not connected to a live delivery service.</p>
                    </> : <div className={styles.emptyDetail}><FiPackage aria-hidden="true" /><h2>Select a purchase order</h2><p>Choose an order from your book to review its delivery and update progress.</p></div>}
                </section>
            </div>

            <Dialog
                description={dispatchOrder ? `${dispatchOrder.id} · ${dispatchOrder.buyer}` : ""}
                footer={<><button className={styles.secondaryButton} onClick={() => setDispatchOrder(null)} type="button">Cancel</button><button className={styles.primaryButton} form="dispatch-form" type="submit"><FiTruck aria-hidden="true" /> Mark dispatched</button></>}
                isOpen={Boolean(dispatchOrder)}
                labelId="dispatch-title"
                onClose={() => setDispatchOrder(null)}
                size="small"
                title="Add shipping details"
            >
                <form className={styles.dispatchForm} id="dispatch-form" noValidate onSubmit={saveDispatch}><p>Enter the carrier and tracking reference that your buyer can use for this order.</p><label>Carrier<input autoComplete="organization" onChange={(event) => setShipping((current) => ({ ...current, carrier: event.target.value }))} placeholder="e.g. DHL Freight" required value={shipping.carrier} /></label><label>Tracking reference<input onChange={(event) => setShipping((current) => ({ ...current, tracking: event.target.value }))} placeholder="e.g. DHL-7641-8820" required value={shipping.tracking} /></label>{formError && <p className={styles.formError} role="alert">{formError}</p>}</form>
            </Dialog>
        </div>
    );
};

export default OrdersPage;
