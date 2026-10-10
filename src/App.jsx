import { useRef, useState } from "react";
import AppRoutes from "./AppRoutes.jsx";
import AppFooter from "./components/appFooter/index.jsx";
import AppHeader from "./components/appHeader/index.jsx";
import ConfirmDialog from "./components/confirmDialog/index.jsx";
import ScrollToTop from "./components/scrollToTop/index.jsx";
import ToastViewport from "./components/toastViewport/index.jsx";
import { seedCompany, seedCompliance, seedInvoices, seedOrders, seedRfqs } from "./data/seedData.js";
import styles from "./App.module.css";

const App = () => {
    const [rfqs, setRfqs] = useState(seedRfqs);
    const [orders, setOrders] = useState(seedOrders);
    const [invoices, setInvoices] = useState(seedInvoices);
    const [company, setCompany] = useState(seedCompany);
    const [compliance, setCompliance] = useState(seedCompliance);
    const [toasts, setToasts] = useState([]);
    const [confirmation, setConfirmation] = useState(null);
    const [globalSearch, setGlobalSearch] = useState("");
    const toastId = useRef(0);

    const addToast = (message, tone = "success") => {
        const id = ++toastId.current;
        setToasts((current) => [...current, { id, message, tone }]);
        return id;
    };

    const dismissToast = (id) => setToasts((current) => current.filter((toast) => toast.id !== id));
    const requestConfirmation = (details) => setConfirmation(details);
    const closeConfirmation = () => setConfirmation(null);

    const confirmAction = () => {
        if (!confirmation) return;
        const action = confirmation.onConfirm;
        setConfirmation(null);
        action?.();
    };

    const submitQuote = (rfqId, quote) => {
        setRfqs((current) => current.map((rfq) => (
            rfq.id === rfqId ? { ...rfq, status: "Quoted", quote: { ...quote } } : rfq
        )));
    };

    const withdrawQuote = (rfqId) => {
        setRfqs((current) => current.map((rfq) => (
            rfq.id === rfqId ? { ...rfq, status: "Open", quote: null } : rfq
        )));
    };

    const updateOrder = (orderId, changes) => {
        setOrders((current) => current.map((order) => (
            order.id === orderId ? { ...order, ...changes } : order
        )));
    };

    const addInvoice = (invoice) => {
        const sequence = Math.max(3400, ...invoices.map((item) => Number(item.id.replace("INV-", "")))) + 1;
        const created = { ...invoice, id: `INV-${sequence}`, status: "Draft" };
        setInvoices((current) => [created, ...current]);
        return created;
    };

    const updateInvoice = (invoiceId, changes) => {
        setInvoices((current) => current.map((invoice) => (
            invoice.id === invoiceId ? { ...invoice, ...changes } : invoice
        )));
    };

    const removeInvoice = (invoiceId) => {
        setInvoices((current) => current.filter((invoice) => invoice.id !== invoiceId));
    };

    const updateCompany = (changes) => setCompany((current) => ({ ...current, ...changes }));

    const updateCompliance = (documentId, changes) => {
        setCompliance((current) => current.map((document) => (
            document.id === documentId ? { ...document, ...changes } : document
        )));
    };

    const addCompliance = (document) => {
        const id = `DOC-${String(Date.now()).slice(-5)}`;
        setCompliance((current) => [...current, { ...document, id }]);
    };

    const removeCompliance = (documentId) => {
        setCompliance((current) => current.filter((document) => document.id !== documentId));
    };

    const pageProps = {
        rfqs,
        orders,
        invoices,
        company,
        compliance,
        globalSearch,
        submitQuote,
        withdrawQuote,
        updateOrder,
        addInvoice,
        updateInvoice,
        removeInvoice,
        updateCompany,
        updateCompliance,
        addCompliance,
        removeCompliance,
        requestConfirmation,
        addToast,
    };

    return (
        <div className={styles.app}>
            <AppHeader addToast={addToast} globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />
            <ScrollToTop />
            <main className={styles.main} id="main-content">
                <AppRoutes pageProps={pageProps} />
            </main>
            <AppFooter />
            <ConfirmDialog confirmation={confirmation} onCancel={closeConfirmation} onConfirm={confirmAction} />
            <ToastViewport onDismiss={dismissToast} toasts={toasts} />
        </div>
    );
};

export default App;
