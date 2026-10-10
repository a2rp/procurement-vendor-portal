![Sourcelane vendor workspace overview](./screenshot.png)

# Sourcelane | Procurement Vendor Portal

Sourcelane is a responsive procurement workspace for suppliers. It brings buyer quote requests, purchase order progress, delivery milestones, invoices, and company compliance details into one focused interface.

## Screenshots

The images below were captured from the finished app. They show every route and each available modal or confirmation dialog.

### Pages

| Page | Preview |
| --- | --- |
| Overview | ![Overview with supplier work queue, procurement metrics, and delivery desk](./screenshots/pages/overview.png) |
| Requests for quotation | ![RFQ list with quote status and buyer requests](./screenshots/pages/rfqs.png) |
| Purchase orders | ![Purchase order book with fulfillment steps and selected order details](./screenshots/pages/orders.png) |
| Invoices | ![Invoice register with drafts and payment statuses](./screenshots/pages/invoices.png) |
| Company profile | ![Supplier company information and compliance register](./screenshots/pages/company.png) |
| Not found | ![Custom not found page for unknown routes](./screenshots/pages/not-found.png) |

### Modals and confirmations

<details>
<summary>RFQ details and quote workflow</summary>

- RFQ details: ![Buyer request details for an RFQ](./screenshots/modals/rfq-details.png)
- Prepare quote: ![Quote form with price, lead time, expiry, and buyer note](./screenshots/modals/rfq-quote-create.png)
- Revise quote: ![Existing quote form for editing a submitted quote](./screenshots/modals/rfq-quote-edit.png)
- Withdraw quote confirmation: ![Custom confirmation dialog before withdrawing a quote](./screenshots/modals/rfq-quote-withdraw-confirmation.png)

</details>

<details>
<summary>Order fulfillment and invoicing</summary>

- Shipping details: ![Carrier and tracking form for an order ready to dispatch](./screenshots/modals/order-shipping-details.png)
- Create invoice: ![Invoice form linked to a purchase order](./screenshots/modals/invoice-create.png)
- Invoice details: ![Invoice summary and review status](./screenshots/modals/invoice-details.png)
- Edit invoice draft: ![Editable draft invoice form](./screenshots/modals/invoice-edit-draft.png)
- Revise invoice: ![Invoice form for changes requested by a buyer](./screenshots/modals/invoice-revise-requested-changes.png)
- Submit invoice confirmation: ![Custom confirmation dialog before submitting an invoice](./screenshots/modals/invoice-submit-confirmation.png)
- Delete invoice confirmation: ![Custom confirmation dialog before deleting a draft invoice](./screenshots/modals/invoice-delete-confirmation.png)

</details>

<details>
<summary>Company profile and compliance</summary>

- Edit company profile: ![Company profile form with contact and business details](./screenshots/modals/company-edit-profile.png)
- Add compliance record: ![Form for adding a compliance document record](./screenshots/modals/compliance-add-record.png)
- Edit compliance record: ![Form for editing an existing compliance record](./screenshots/modals/compliance-edit-record.png)
- Remove compliance confirmation: ![Custom confirmation dialog before removing a compliance record](./screenshots/modals/compliance-remove-confirmation.png)

</details>

## Routes and features

- **Overview** at /: supplier work queue, open RFQ and invoice counts, pending receivables, and recent purchase orders.
- **Requests for quotation** at /rfqs: search and filter buyer requests, inspect request details, create or revise quotes, validate quote fields, withdraw a quote with confirmation, and export the visible request list as CSV.
- **Purchase orders** at /orders: review order details and line items, accept an order, mark it ready to ship, enter carrier and tracking details, dispatch it, and record delivery.
- **Invoices** at /invoices: create an invoice from an eligible order, save drafts, edit drafts, revise invoices marked for changes, inspect invoice details, submit or resubmit for review, and delete a draft after confirmation.
- **Company profile** at /company: edit supplier contact and business details, add or edit compliance records, and remove a record after confirmation.
- **Unknown routes** show a custom not found page. GitHub Pages uses the included 404.html build output to load client-side routes directly.

## Using the demo

Use the navigation to move between the five work areas. Forms provide inline validation, save actions update the shared app state, and toast notifications report the result. Destructive actions use custom confirmation dialogs. The header search supports Ctrl+K, and RFQ results can be downloaded as a CSV file.

The app uses React state with seeded example data. Changes remain available while navigating within the current page session, but refreshing the browser resets them. No browser storage or backend is used. The sample buyers, orders, quotes, invoices, and company details are illustrative demo data.

This frontend does not contact buyers, transmit invoices, process payments, upload or securely store files, or synchronize with an ERP, carrier, or accounting service. The saved warehouse image is a relevant Unsplash photograph: [view the source image](https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d).

## Local development

Requires Node.js and npm.

1. Install dependencies with npm install.
2. Start the development server with npm run dev -- --host 127.0.0.1.
3. Run ESLint with npm run lint.
4. Create a production build with npm run build.
5. Publish the build to GitHub Pages with npm run deploy.

Live app: [https://a2rp.github.io/procurement-vendor-portal/](https://a2rp.github.io/procurement-vendor-portal/)

## Future improvements

These are backend extensions and are not implemented in this frontend demo:

- Shared supplier and buyer accounts with workspace membership and role permissions.
- Server-backed RFQ submissions, buyer responses, and notifications.
- Secure document upload and hosted compliance files with access controls.
- Carrier tracking, accounting, and e-invoicing integrations.
- Server-side activity history and audit records for procurement changes.

## Links

- Portfolio: [https://www.ashishranjan.net](https://www.ashishranjan.net)
- GitHub: [https://github.com/a2rp](https://github.com/a2rp)
- CodePen: [https://codepen.io/ash1198](https://codepen.io/ash1198)
- LinkedIn: [https://www.linkedin.com/in/aashishranjan](https://www.linkedin.com/in/aashishranjan)
- Facebook: [https://www.facebook.com/theash.ashish/](https://www.facebook.com/theash.ashish/)
- YouTube: [https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1](https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1)
- Email: [mailto:ash.ranjan09@gmail.com](mailto:ash.ranjan09@gmail.com)

## Support

- Support: [https://a2rp-donation-page.netlify.app/](https://a2rp-donation-page.netlify.app/)
- Buy Me a Coffee: [https://buymeacoffee.com/ashishranjan](https://buymeacoffee.com/ashishranjan)
- Patreon: [https://www.patreon.com/ashishranjan](https://www.patreon.com/ashishranjan)
