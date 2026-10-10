import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiArrowUpRight, FiBriefcase, FiFileText, FiGrid, FiMenu, FiPackage, FiSearch, FiTruck, FiX } from "react-icons/fi";
import { FaGithub } from "react-icons/fa6";
import styles from "./styles.module.css";

const navigation = [
    { to: "/", label: "Overview", icon: FiGrid, end: true },
    { to: "/rfqs", label: "RFQs", icon: FiFileText },
    { to: "/orders", label: "Orders", icon: FiPackage },
    { to: "/invoices", label: "Invoices", icon: FiBriefcase },
    { to: "/company", label: "Company", icon: FiTruck },
];

const AppHeader = ({ globalSearch, setGlobalSearch, addToast }) => {
    const [isHidden, setIsHidden] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const searchRef = useRef(null);
    const previousScroll = useRef(0);
    const navigate = useNavigate();
    useEffect(() => {
        const handleScroll = () => {
            const current = window.scrollY;
            const movement = current - previousScroll.current;
            if (current <= 20) setIsHidden(false);
            else if (!menuOpen && movement > 5) setIsHidden(true);
            else if (movement < -5) setIsHidden(false);
            previousScroll.current = current;
        };
        previousScroll.current = window.scrollY;
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [menuOpen]);

    useEffect(() => {
        const handleHistoryNavigation = () => setMenuOpen(false);
        window.addEventListener("popstate", handleHistoryNavigation);
        return () => window.removeEventListener("popstate", handleHistoryNavigation);
    }, []);

    useEffect(() => {
        const handleShortcut = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleShortcut);
        return () => window.removeEventListener("keydown", handleShortcut);
    }, []);

    const openNewInvoice = () => {
        setMenuOpen(false);
        setGlobalSearch("");
        navigate("/invoices", { state: { createInvoice: true } });
    };

    const handleRepository = (event) => {
        if (!navigator.onLine) {
            event.preventDefault();
            addToast("The repository link needs an internet connection.", "warning");
        }
    };

    return (
        <header className={`${styles.header} ${isHidden && !menuOpen ? styles.hidden : ""}`}>
            <div className={styles.inner}>
                <NavLink aria-label="Sourcelane overview" className={styles.brand} end to="/">
                    <span aria-hidden="true" className={styles.brandMark}><FiTruck /></span>
                    <span className={styles.wordmark}>sourcelane<span>.</span></span>
                </NavLink>

                <nav aria-label="Main navigation" className={`${styles.navigation} ${menuOpen ? styles.navigationOpen : ""}`}>
                    {navigation.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
                            end={end}
                            key={to}
                            onClick={() => setMenuOpen(false)}
                            to={to}
                        >
                            <Icon aria-hidden="true" className={styles.mobileIcon} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.actions}>
                    <label className={styles.searchBox}>
                        <FiSearch aria-hidden="true" />
                        <input
                            aria-label="Search the current page"
                            onChange={(event) => setGlobalSearch(event.target.value)}
                            placeholder="Search workspace"
                            ref={searchRef}
                            type="search"
                            value={globalSearch}
                        />
                        {!globalSearch && <span aria-hidden="true" className={styles.shortcut}>Ctrl K</span>}
                    </label>
                    <button aria-label="Create a new invoice" className={styles.newInvoice} onClick={openNewInvoice} type="button">
                        <FiFileText aria-hidden="true" />
                        <span>New invoice</span>
                    </button>
                    <a
                        aria-label="Open the public source repository"
                        className={styles.repository}
                        href="https://github.com/a2rp/procurement-vendor-portal"
                        onClick={handleRepository}
                        rel="noreferrer"
                        target="_blank"
                    >
                        <FaGithub aria-hidden="true" />
                        <span>Repository</span>
                        <FiArrowUpRight aria-hidden="true" className={styles.externalArrow} />
                    </a>
                    <button
                        aria-expanded={menuOpen}
                        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                        className={styles.menuButton}
                        onClick={() => setMenuOpen((open) => !open)}
                        type="button"
                    >
                        {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
