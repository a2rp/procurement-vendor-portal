import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCompass, FiHome } from "react-icons/fi";
import styles from "./styles.module.css";

const NotFoundPage = () => (
    <div className={styles.page}>
        <div className={styles.paper}>
            <div className={styles.illustration} aria-hidden="true">
                <span>4</span>
                <FiCompass />
                <span>4</span>
            </div>
            <p className={styles.label}>PAGE NOT FOUND</p>
            <h1>This page is off the map.</h1>
            <p className={styles.description}>
                The link may have changed, or this route is not part of the
                supplier workspace.
            </p>
            <div className={styles.actions}>
                <Link className={styles.primary} to="/">
                    <FiHome aria-hidden="true" /> Return to overview
                </Link>
                <Link className={styles.secondary} to="/rfqs">
                    Browse requests <FiArrowRight aria-hidden="true" />
                </Link>
            </div>
            <button
                className={styles.backButton}
                onClick={() => {
                    if (window.history.length > 1) window.history.back();
                    else window.location.assign(import.meta.env.BASE_URL);
                }}
                type="button"
            >
                <FiArrowLeft aria-hidden="true" /> Go back to your last page
            </button>
        </div>
    </div>
);

export default NotFoundPage;
