import styles from "./styles.module.css";

const Loading = ({ fullPage = false }) => (
    <div aria-label="Loading" className={`${styles.loading} ${fullPage ? styles.fullPage : ""}`} role="status">
        <span aria-hidden="true" className={styles.spinner} />
    </div>
);

export default Loading;
