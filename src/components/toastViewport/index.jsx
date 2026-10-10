import { useEffect } from "react";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import styles from "./styles.module.css";

const toneIcons = {
    success: FiCheckCircle,
    error: FiAlertCircle,
    warning: FiAlertCircle,
    info: FiInfo,
};

const ToastViewport = ({ toasts = [], onDismiss }) => {
    useEffect(() => {
        if (!toasts.length) return undefined;
        const timers = toasts.map(({ id }) => window.setTimeout(() => onDismiss(id), 5600));
        return () => timers.forEach(window.clearTimeout);
    }, [toasts, onDismiss]);

    return (
        <div aria-label="Notifications" className={styles.viewport}>
            {toasts.map((toast) => {
                const Icon = toneIcons[toast.tone] || FiInfo;
                return (
                    <article
                        aria-live={toast.tone === "error" ? "assertive" : "polite"}
                        className={`${styles.toast} ${styles[toast.tone] || styles.info}`}
                        key={toast.id}
                        role="status"
                    >
                        <Icon aria-hidden="true" className={styles.icon} />
                        <p>{toast.message}</p>
                        <button aria-label="Dismiss notification" className={styles.dismiss} onClick={() => onDismiss(toast.id)} type="button">
                            <FiX aria-hidden="true" />
                        </button>
                    </article>
                );
            })}
        </div>
    );
};

export default ToastViewport;
