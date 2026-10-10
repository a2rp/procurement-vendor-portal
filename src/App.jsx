import AppRoutes from "./AppRoutes.jsx";
import AppFooter from "./components/appFooter/index.jsx";
import AppHeader from "./components/appHeader/index.jsx";
import ConfirmDialog from "./components/confirmDialog/index.jsx";
import ScrollToTop from "./components/scrollToTop/index.jsx";
import ToastViewport from "./components/toastViewport/index.jsx";
import { PortalProvider } from "./context/PortalProvider.jsx";
import { usePortal } from "./context/usePortal.js";
import styles from "./App.module.css";

const PortalNotifications = () => {
    const { confirmation, closeConfirmation, confirmAction, toasts, dismissToast } = usePortal();
    return <><ConfirmDialog confirmation={confirmation} onCancel={closeConfirmation} onConfirm={confirmAction} /><ToastViewport onDismiss={dismissToast} toasts={toasts} /></>;
};

const App = () => (
    <PortalProvider>
        <div className={styles.app}>
            <AppHeader />
            <ScrollToTop />
            <main className={styles.main} id="main-content">
                <AppRoutes />
            </main>
            <AppFooter />
            <PortalNotifications />
        </div>
    </PortalProvider>
);

export default App;
