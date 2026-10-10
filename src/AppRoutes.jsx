import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Loading from "./components/loading/index.jsx";

const OverviewPage = lazy(() => import("./pages/overview/index.jsx"));
const RfqsPage = lazy(() => import("./pages/rfqs/index.jsx"));
const OrdersPage = lazy(() => import("./pages/orders/index.jsx"));
const InvoicesPage = lazy(() => import("./pages/invoices/index.jsx"));
const CompanyPage = lazy(() => import("./pages/company/index.jsx"));
const NotFoundPage = lazy(() => import("./pages/notFound/index.jsx"));

const AppRoutes = ({ pageProps }) => {
    const location = useLocation();

    return (
        <Suspense fallback={<Loading fullPage />} key={location.pathname}>
            <Routes location={location}>
                <Route element={<OverviewPage {...pageProps} />} path="/" />
                <Route element={<RfqsPage {...pageProps} />} path="/rfqs" />
                <Route element={<OrdersPage {...pageProps} />} path="/orders" />
                <Route
                    element={<InvoicesPage {...pageProps} />}
                    path="/invoices"
                />
                <Route
                    element={<CompanyPage {...pageProps} />}
                    path="/company"
                />
                <Route element={<NotFoundPage />} path="*" />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
