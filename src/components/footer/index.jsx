import {
    FaCoffee,
    FaCodepen,
    FaFacebookF,
    FaGithub,
    FaLinkedinIn,
    FaPatreon,
    FaYoutube,
} from "react-icons/fa";
import { FiGlobe, FiLifeBuoy, FiMail } from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import styles from "./styles.module.css";

const links = [
    {
        label: "Source code",
        detail: "github.com/a2rp/procurement-vendor-portal",
        icon: <FaGithub aria-hidden="true" />,
        href: "https://github.com/a2rp/procurement-vendor-portal",
    },
    {
        label: "Portfolio",
        detail: "ashishranjan.net",
        icon: <FiGlobe aria-hidden="true" />,
        href: "https://www.ashishranjan.net",
    },
    {
        label: "GitHub",
        detail: "github.com/a2rp",
        icon: <FaGithub aria-hidden="true" />,
        href: "https://github.com/a2rp",
    },
    {
        label: "CodePen",
        detail: "codepen.io/ash1198",
        icon: <FaCodepen aria-hidden="true" />,
        href: "https://codepen.io/ash1198",
    },
    {
        label: "LinkedIn",
        detail: "linkedin.com/in/aashishranjan",
        icon: <FaLinkedinIn aria-hidden="true" />,
        href: "https://www.linkedin.com/in/aashishranjan",
    },
    {
        label: "Facebook",
        detail: "facebook.com/theash.ashish",
        icon: <FaFacebookF aria-hidden="true" />,
        href: "https://www.facebook.com/theash.ashish/",
    },
    {
        label: "YouTube",
        detail: "youtube.com/@ashishranjan-ashz",
        icon: <FaYoutube aria-hidden="true" />,
        href: "https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1",
    },
    {
        label: "Email",
        detail: "ash.ranjan09@gmail.com",
        icon: <FiMail aria-hidden="true" />,
        href: "mailto:ash.ranjan09@gmail.com",
    },
    {
        label: "Support",
        detail: "a2rp-donation-page.netlify.app",
        icon: <FiLifeBuoy aria-hidden="true" />,
        href: "https://a2rp-donation-page.netlify.app/",
    },
    {
        label: "Buy Me a Coffee",
        detail: "buymeacoffee.com/ashishranjan",
        icon: <FaCoffee aria-hidden="true" />,
        href: "https://buymeacoffee.com/ashishranjan",
    },
    {
        label: "Patreon",
        detail: "patreon.com/ashishranjan",
        icon: <FaPatreon aria-hidden="true" />,
        href: "https://www.patreon.com/ashishranjan",
    },
];

const AppFooter = () => (
    <footer className={styles.footer}>
        <div className={styles.inner}>
            <div className={styles.identity}>
                <a
                    aria-label="Visit Ashish Ranjan's portfolio"
                    className={styles.brand}
                    href="https://www.ashishranjan.net"
                    rel="noreferrer"
                    target="_blank"
                >
                    <img alt="" src={`${import.meta.env.BASE_URL}logo.png`} />
                    <span>
                        sourcelane<span className={styles.brandDot}>.</span>
                    </span>
                </a>
                <p>
                    © {new Date().getFullYear()}{" "}
                    <a
                        href="https://github.com/a2rp"
                        rel="noreferrer"
                        target="_blank"
                    >
                        Ashish Ranjan
                    </a>
                    . All rights reserved.
                </p>
            </div>
            <nav aria-label="Footer links" className={styles.links}>
                {links.map((item) => (
                    <a
                        aria-label={`${item.label}: ${item.detail}`}
                        data-tooltip-detail={item.detail}
                        data-tooltip-id="footer-links-tooltip"
                        data-tooltip-label={item.label}
                        href={item.href}
                        key={item.label}
                        rel={
                            item.href.startsWith("http")
                                ? "noreferrer"
                                : undefined
                        }
                        target={
                            item.href.startsWith("http") ? "_blank" : undefined
                        }
                    >
                        {item.icon}
                    </a>
                ))}
                <Tooltip
                    arrowSize={7}
                    border="1px solid rgb(255 255 255 / 14%)"
                    className={styles.tooltip}
                    classNameArrow={styles.tooltipArrow}
                    id="footer-links-tooltip"
                    offset={8}
                    opacity={1}
                    place="top"
                    render={({ activeAnchor }) => (
                        <div className={styles.tooltipContent}>
                            <strong>
                                {activeAnchor?.getAttribute(
                                    "data-tooltip-label",
                                )}
                            </strong>
                            <span>
                                {activeAnchor?.getAttribute(
                                    "data-tooltip-detail",
                                )}
                            </span>
                        </div>
                    )}
                />
            </nav>
        </div>
    </footer>
);

export default AppFooter;
