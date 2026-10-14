import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router";
import { getCurrentUser } from "../api/auth";
import { ROUTES } from "./routes";
import { Loader2 } from "lucide-react";

/**
 * PublicRoute — Faqat tizimga kirmagan mehmonlar uchun mo'ljallangan yo'l (masalan /login).
 * Agar foydalanuvchi tizimga allaqachon kirgan bo'lsa, uni avtomatik tarzda /dashboard ga yo'naltiradi.
 */
export const PublicRoute: React.FC = () => {
  const isLoggedOut = typeof window !== "undefined" && sessionStorage.getItem("logged_out") === "true";

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 0,
    enabled: !isLoggedOut,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-blue-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Foydalanuvchi allaqachon login qilgan bo'lsa, dashboardga o'tkaziladi
  if (user && user.username) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;

