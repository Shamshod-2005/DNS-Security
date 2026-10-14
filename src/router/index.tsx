import { Routes, Route, Navigate } from "react-router";
import Layout from "../components/layout/Layout";
import Dashboard from "../features/dashboard/Dashboard";
import QueryLog from "../features/logs/QueryLog";
import EncryptedLog from "../features/logs/EncryptedLog";
import BlockedLog from "../features/logs/BlockedLog";
import Filter from "../features/filter/Filter";
import Pcap from "../features/pcap/Pcap";
import Account from "../features/account/Account";
import Login from "../features/auth/Login";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import { ROUTES } from "./routes";

export { ROUTES, PrivateRoute, PublicRoute };

// ─── Asosiy Router Komponenti ───────────────────────────────────────────────
export function AppRoutes() {
  return (
    <Routes>
      {/* 1. Ochiq yo'nalishlar (Public Routes) — faqat tizimga kirmaganlar uchun */}
      <Route element={<PublicRoute />}>
        <Route path={ROUTES.LOGIN} element={<Login />} />
      </Route>

      {/* 2. Himoyalangan asosiy ilova qismi (faqat autentifikatsiyadan o'tgan foydalanuvchilar uchun) */}
      <Route element={<PrivateRoute />}>
        <Route path={ROUTES.HOME} element={<Layout />}>
          {/* / manziliga kirganda avtomatik /dashboard ga yo'naltirish */}
          <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="querylog" element={<QueryLog />} />
          <Route path="dot" element={<EncryptedLog />} />
          <Route path="blocked" element={<BlockedLog />} />
          <Route path="filter" element={<Filter />} />
          <Route path="pcap" element={<Pcap />} />
          <Route path="account" element={<Account />} />

          {/* Noma'lum yo'llar bo'lsa dashboardga yo'naltiramiz */}
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Route>
      </Route>

      {/* 3. Barcha boshqa noma'lum yo'llar login sahifasiga yo'naltiriladi */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}

export default AppRoutes;
