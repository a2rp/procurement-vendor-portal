import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import styles from "./styles.module.css";

const focusableSelector =
    "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

const Dialog = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = "medium",
    labelId = "portal-dialog-title",
    initialFocusRef,
}) => {
    const dialogRef = useRef(null);
    const previouslyFocused = useRef(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return undefined;
        previouslyFocused.current = document.activeElement;
        const firstFocusable =
            dialogRef.current?.querySelector(focusableSelector);
        (
            initialFocusRef?.current ||
            firstFocusable ||
            dialogRef.current
        )?.focus();

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                onCloseRef.current?.();
                return;
            }
            if (event.key !== "Tab" || !dialogRef.current) return;
            const items = [
                ...dialogRef.current.querySelectorAll(focusableSelector),
            ];
            if (!items.length) {
                event.preventDefault();
                dialogRef.current.focus();
                return;
            }
            const first = items[0];
            const last = items.at(-1);
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previouslyFocused.current?.focus?.();
        };
    }, [isOpen, initialFocusRef]);

    if (!isOpen) return null;

    return (
        <div
            className={styles.backdrop}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose?.();
            }}
        >
            <section
                aria-describedby={
                    description ? `${labelId}-description` : undefined
                }
                aria-labelledby={labelId}
                aria-modal="true"
                className={`${styles.dialog} ${styles[size] || ""}`}
                ref={dialogRef}
                role="dialog"
                tabIndex={-1}
            >
                <header className={styles.header}>
                    <div className={styles.heading}>
                        <h2 id={labelId}>{title}</h2>
                        {description && (
                            <p id={`${labelId}-description`}>{description}</p>
                        )}
                    </div>
                    <button
                        aria-label="Close dialog"
                        className={styles.closeButton}
                        onClick={onClose}
                        type="button"
                    >
                        <FiX aria-hidden="true" />
                    </button>
                </header>
                <div className={styles.content}>{children}</div>
                {footer && <footer className={styles.footer}>{footer}</footer>}
            </section>
        </div>
    );
};

export default Dialog;
