import { useRef } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import Dialog from "../dialog/index.jsx";
import styles from "./styles.module.css";

const ConfirmDialog = ({ confirmation, onCancel, onConfirm }) => {
    const cancelRef = useRef(null);
    const isOpen = Boolean(confirmation);

    return (
        <Dialog
            description={confirmation?.description}
            initialFocusRef={cancelRef}
            isOpen={isOpen}
            labelId="portal-confirm-title"
            onClose={onCancel}
            size="small"
            title={confirmation?.title || "Please confirm"}
            footer={(
                <>
                    <button className={styles.cancelButton} onClick={onCancel} ref={cancelRef} type="button">
                        {confirmation?.cancelLabel || "Cancel"}
                    </button>
                    <button
                        className={`${styles.confirmButton} ${confirmation?.dangerous ? styles.dangerous : ""}`}
                        onClick={onConfirm}
                        type="button"
                    >
                        {confirmation?.icon && <FiAlertTriangle aria-hidden="true" />}
                        {confirmation?.confirmLabel || "Confirm"}
                    </button>
                </>
            )}
        >
            {confirmation?.details && <p className={styles.details}>{confirmation.details}</p>}
        </Dialog>
    );
};

export default ConfirmDialog;
