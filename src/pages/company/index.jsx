import { useMemo, useState } from "react";
import { FiArrowUpRight, FiBriefcase, FiCheck, FiCheckCircle, FiEdit3, FiExternalLink, FiFilePlus, FiGlobe, FiMail, FiMapPin, FiPhone, FiPlus, FiShield, FiTrash2 } from "react-icons/fi";
import Dialog from "../../components/dialog/index.jsx";
import { usePortal } from "../../context/usePortal.js";
import { downloadCsv, formatDate, getDaysUntil } from "../../utils/formatters.js";
import styles from "./styles.module.css";

const today = new Date().toISOString().slice(0, 10);
const emptyDocument = () => ({ name: "", status: "In review", expires: "", owner: "" });
const isSampleDomain = (value = "") => /\.example$/i.test(value.replace(/^https?:\/\//, ""));

const CompanyPage = () => {
    const { company, compliance, globalSearch, updateCompany, updateCompliance, addCompliance, removeCompliance, requestConfirmation, addToast } = usePortal();
    const [companyOpen, setCompanyOpen] = useState(false);
    const [companyForm, setCompanyForm] = useState({ ...company, categories: company.categories.join(", ") });
    const [documentEditor, setDocumentEditor] = useState(null);
    const [documentForm, setDocumentForm] = useState(emptyDocument());
    const [formError, setFormError] = useState("");

    const visibleDocuments = useMemo(() => {
        const query = globalSearch.trim().toLowerCase();
        return compliance.filter((document) => !query || [document.name, document.status, document.owner, document.expires, document.id].some((value) => String(value || "").toLowerCase().includes(query)));
    }, [compliance, globalSearch]);

    const getRecordStatus = (record) => {
        if (record.expires && record.expires < today) return "Expired";
        if (record.expires && getDaysUntil(record.expires) <= 30 && record.status === "Verified") return "Renewal due";
        return record.status;
    };

    const requiredProfileFields = [company.name, company.contact, company.email, company.phone, company.address];
    const completedProfile = requiredProfileFields.filter(Boolean).length;
    const requiredNames = ["W-9 tax form", "ISO 9001 certificate", "Certificate of insurance"];
    const verifiedDocuments = requiredNames.filter((name) => compliance.some((record) => record.name === name && getRecordStatus(record) === "Verified")).length;
    const readiness = Math.round(((completedProfile + verifiedDocuments) / (requiredProfileFields.length + requiredNames.length)) * 100);

    const openCompanyEditor = () => {
        setCompanyForm({ ...company, categories: company.categories.join(", ") });
        setFormError("");
        setCompanyOpen(true);
    };

    const saveCompany = (event) => {
        event.preventDefault();
        if (companyForm.name.trim().length < 2) return setFormError("Enter your registered business name.");
        if (companyForm.contact.trim().length < 2) return setFormError("Enter the name of your primary contact.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyForm.email.trim())) return setFormError("Enter a valid contact email address.");
        if (companyForm.phone.trim().length < 7) return setFormError("Enter a phone number with at least seven characters.");
        if (companyForm.address.trim().length < 8) return setFormError("Enter your registered business address.");
        updateCompany({ ...companyForm, name: companyForm.name.trim(), contact: companyForm.contact.trim(), email: companyForm.email.trim(), phone: companyForm.phone.trim(), address: companyForm.address.trim(), website: companyForm.website.trim(), tagline: companyForm.tagline.trim(), about: companyForm.about.trim(), categories: companyForm.categories.split(",").map((item) => item.trim()).filter(Boolean) });
        setCompanyOpen(false);
        addToast("Company profile updated.", "success");
    };

    const openNewDocument = () => {
        setDocumentEditor({ mode: "create", id: null });
        setDocumentForm(emptyDocument());
        setFormError("");
    };

    const openEditDocument = (document) => {
        setDocumentEditor({ mode: "edit", id: document.id });
        setDocumentForm({ name: document.name, status: document.status, expires: document.expires || "", owner: document.owner || "" });
        setFormError("");
    };

    const saveDocument = (event) => {
        event.preventDefault();
        if (documentForm.name.trim().length < 3) return setFormError("Enter a clear name for this record.");
        if (documentForm.owner.trim().length < 2) return setFormError("Add the person or team responsible for this record.");
        const document = { ...documentForm, name: documentForm.name.trim(), owner: documentForm.owner.trim() };
        if (documentEditor.mode === "edit") {
            updateCompliance(documentEditor.id, document);
            addToast(`${document.name} details updated.`, "success");
        } else {
            addCompliance(document);
            addToast(`${document.name} added to the register.`, "success");
        }
        setDocumentEditor(null);
    };

    const confirmRemoveDocument = (record) => requestConfirmation({
        title: "Remove this compliance record?",
        description: record.name,
        details: "The record will be removed from your company profile in this demo session. This will not remove any file from an external service.",
        confirmLabel: "Remove record",
        cancelLabel: "Keep record",
        dangerous: true,
        onConfirm: () => {
            removeCompliance(record.id);
            addToast(`${record.name} removed from the register.`, "info");
        },
    });

    const exportRegister = () => {
        const rows = visibleDocuments.map((record) => ({ name: record.name, status: getRecordStatus(record), expires: record.expires || "No expiry date", owner: record.owner || "Unassigned" }));
        if (!downloadCsv(rows, "sourcelane-compliance-register.csv")) return addToast("There are no compliance records to export.", "info");
        addToast(`Exported ${rows.length} compliance records.`, "success");
    };

    const statusClass = (status) => styles[status.toLowerCase().replaceAll(" ", "-")] || "";

    return (
        <div className={styles.page}>
            <div className={styles.heading}>
                <div><p className={styles.breadcrumb}>Supplier desk <span>/</span> Company profile</p><h1>Company profile</h1><p className={styles.description}>Keep your buyer-facing business details and supplier records up to date.</p></div>
                <button className={styles.exportButton} onClick={exportRegister} type="button"><FiFilePlus aria-hidden="true" /> Export records</button>
            </div>

            <section className={styles.readiness}>
                <div className={styles.readinessIcon}><FiShield aria-hidden="true" /></div>
                <div className={styles.readinessCopy}><div><h2>Supplier profile readiness</h2><strong>{readiness}% complete</strong></div><p>Company details and three core compliance records make it easier for buyers to assess your profile.</p><div aria-label={`${readiness}% complete`} className={styles.progress}><span style={{ width: `${readiness}%` }} /></div></div>
                <div className={styles.readyChecks}><span><FiCheck aria-hidden="true" /> {completedProfile} of 5 profile details</span><span><FiCheck aria-hidden="true" /> {verifiedDocuments} of 3 verified documents</span></div>
            </section>

            <div className={styles.contentGrid}>
                <section aria-label="Company information" className={styles.companyCard}>
                    <div className={styles.companyCover}><span className={styles.coverMark}><FiBriefcase aria-hidden="true" /></span><span className={styles.vendorId}>{company.vendorId}</span><span className={styles.coverMesh} aria-hidden="true" /></div>
                    <div className={styles.companyBody}>
                        <div className={styles.companyTitle}><div><h2>{company.name}</h2><p>{company.tagline}</p></div><button aria-label="Edit company profile" className={styles.editIcon} onClick={openCompanyEditor} type="button"><FiEdit3 aria-hidden="true" /></button></div>
                        <p className={styles.about}>{company.about}</p>
                        <div className={styles.categoryList}>{company.categories.map((category) => <span key={category}>{category}</span>)}</div>
                        <div className={styles.contactList}>
                            <div><FiBriefcase aria-hidden="true" /><span><strong>{company.contact}</strong><small>Primary contact</small></span></div>
                            {isSampleDomain(company.email) ? <div><FiMail aria-hidden="true" /><span><strong>{company.email}</strong><small>Sample email address</small></span></div> : <a href={`mailto:${company.email}`}><FiMail aria-hidden="true" /><span><strong>{company.email}</strong><small>Email contact</small></span><FiArrowUpRight aria-hidden="true" className={styles.externalIcon} /></a>}
                            <a href={`tel:${company.phone.replace(/[^+\d]/g, "")}`}><FiPhone aria-hidden="true" /><span><strong>{company.phone}</strong><small>Business phone</small></span><FiArrowUpRight aria-hidden="true" className={styles.externalIcon} /></a>
                            <div><FiMapPin aria-hidden="true" /><span><strong>{company.address}</strong><small>Registered address</small></span></div>
                            {company.website && (isSampleDomain(company.website) ? <div><FiGlobe aria-hidden="true" /><span><strong>{company.website}</strong><small>Sample website address</small></span></div> : <a href={`https://${company.website.replace(/^https?:\/\//, "")}`} rel="noreferrer" target="_blank"><FiGlobe aria-hidden="true" /><span><strong>{company.website}</strong><small>Company website</small></span><FiExternalLink aria-hidden="true" className={styles.externalIcon} /></a>)}
                        </div>
                        <button className={styles.editProfile} onClick={openCompanyEditor} type="button">Edit company details <FiArrowUpRight aria-hidden="true" /></button>
                    </div>
                </section>

                <section aria-label="Compliance register" className={styles.complianceCard}>
                    <div className={styles.complianceHeading}><div><h2>Compliance register</h2><p>{compliance.length} records for your buyer profile</p></div><button className={styles.addButton} onClick={openNewDocument} type="button"><FiPlus aria-hidden="true" /> Add record</button></div>
                    <div className={styles.recordList}>
                        {visibleDocuments.map((record) => {
                            const status = getRecordStatus(record);
                            const days = getDaysUntil(record.expires);
                            return <article className={styles.record} key={record.id}><div className={`${styles.recordIcon} ${statusClass(status)}`}><FiFilePlus aria-hidden="true" /></div><div className={styles.recordInfo}><div className={styles.recordTop}><h3>{record.name}</h3><span className={`${styles.status} ${statusClass(status)}`}>{status}</span></div><p>{record.owner || "Owner not assigned"}{record.expires ? ` · ${status === "Expired" ? "Expired" : days <= 30 ? "Expires" : "Valid through"} ${formatDate(record.expires)}` : " · No expiry date"}</p></div><div className={styles.recordActions}><button aria-label={`Edit ${record.name}`} className={styles.iconButton} onClick={() => openEditDocument(record)} type="button"><FiEdit3 aria-hidden="true" /></button><button aria-label={`Remove ${record.name}`} className={styles.deleteButton} onClick={() => confirmRemoveDocument(record)} type="button"><FiTrash2 aria-hidden="true" /></button></div></article>;
                        })}
                        {visibleDocuments.length === 0 && <div className={styles.emptyState}><FiShield aria-hidden="true" /><h3>No records match your search</h3><p>Try another name or add a compliance record.</p><button onClick={openNewDocument} type="button">Add a record</button></div>}
                    </div>
                    <div className={styles.complianceNote}><FiCheckCircle aria-hidden="true" /><p>This register stores labels, owners, dates, and status only. No document is uploaded or shared.</p></div>
                </section>
            </div>

            <Dialog description="The company information buyers see in this demo workspace." footer={<><button className={styles.secondaryButton} onClick={() => setCompanyOpen(false)} type="button">Cancel</button><button className={styles.primaryButton} form="company-form" type="submit">Save company profile <FiCheck aria-hidden="true" /></button></>} isOpen={companyOpen} labelId="company-editor-title" onClose={() => setCompanyOpen(false)} size="large" title="Edit company profile">
                <form className={styles.companyForm} id="company-form" onSubmit={saveCompany}><label>Registered company name<input autoComplete="organization" onChange={(event) => setCompanyForm((current) => ({ ...current, name: event.target.value }))} required value={companyForm.name} /></label><label>Primary contact<input autoComplete="name" onChange={(event) => setCompanyForm((current) => ({ ...current, contact: event.target.value }))} required value={companyForm.contact} /></label><label>Contact email<input autoComplete="email" onChange={(event) => setCompanyForm((current) => ({ ...current, email: event.target.value }))} required type="email" value={companyForm.email} /></label><label>Business phone<input autoComplete="tel" onChange={(event) => setCompanyForm((current) => ({ ...current, phone: event.target.value }))} required value={companyForm.phone} /></label><label className={styles.fullWidth}>Registered address<input autoComplete="street-address" onChange={(event) => setCompanyForm((current) => ({ ...current, address: event.target.value }))} required value={companyForm.address} /></label><label>Website<input onChange={(event) => setCompanyForm((current) => ({ ...current, website: event.target.value }))} placeholder="atlascomponents.example" value={companyForm.website} /></label><label>Product categories <span>comma separated</span><input onChange={(event) => setCompanyForm((current) => ({ ...current, categories: event.target.value }))} placeholder="Packaging, Fasteners" value={companyForm.categories} /></label><label className={styles.fullWidth}>One-line introduction<input maxLength="120" onChange={(event) => setCompanyForm((current) => ({ ...current, tagline: event.target.value }))} value={companyForm.tagline} /></label><label className={styles.fullWidth}>About your company<textarea maxLength="320" onChange={(event) => setCompanyForm((current) => ({ ...current, about: event.target.value }))} rows="3" value={companyForm.about} /></label>{formError && <p className={styles.formError} role="alert">{formError}</p>}</form>
            </Dialog>

            <Dialog description={documentEditor?.mode === "edit" ? "Update this record's name, owner, status, or renewal date." : "Add a company record to your local supplier profile."} footer={<><button className={styles.secondaryButton} onClick={() => setDocumentEditor(null)} type="button">Cancel</button><button className={styles.primaryButton} form="document-form" type="submit">{documentEditor?.mode === "edit" ? "Save changes" : "Add record"} <FiCheck aria-hidden="true" /></button></>} isOpen={Boolean(documentEditor)} labelId="document-editor-title" onClose={() => setDocumentEditor(null)} size="medium" title={documentEditor?.mode === "edit" ? "Edit compliance record" : "Add compliance record"}>
                <form className={styles.documentForm} id="document-form" onSubmit={saveDocument}><label>Record name<input autoFocus onChange={(event) => setDocumentForm((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Certificate of insurance" required value={documentForm.name} /></label><label>Owner<input onChange={(event) => setDocumentForm((current) => ({ ...current, owner: event.target.value }))} placeholder="Person or team" required value={documentForm.owner} /></label><label>Status<select onChange={(event) => setDocumentForm((current) => ({ ...current, status: event.target.value }))} value={documentForm.status}>{["Verified", "In review", "Renewal due", "Missing"].map((status) => <option key={status}>{status}</option>)}</select></label><label>Expiry date <span>optional</span><input onChange={(event) => setDocumentForm((current) => ({ ...current, expires: event.target.value }))} type="date" value={documentForm.expires} /></label><p className={styles.documentDisclaimer}><FiShield aria-hidden="true" /> Only record metadata is stored here. Secure file upload needs a backend service.</p>{formError && <p className={styles.formError} role="alert">{formError}</p>}</form>
            </Dialog>
        </div>
    );
};

export default CompanyPage;
