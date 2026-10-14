import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router";
import { getCurrentUser } from "../api/auth";
import { ROUTES } from "./routes";
import { Loader2 } from "lucide-react";

/**
 * PrivateRoute — Faqat autentifikatsiyadan o'tgan foydalanuvchilar uchun ruxsat beruvchi yo'l himoyachisi.
 * Agar foydalanuvchi tizimga kirmagan bo'lsa (401 yoki xatolik), uni darhol /login sahifasiga yo'naltiradi.
 */
export const PrivateRoute: React.FC = () => {
  const location = useLocation();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-blue-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (isError || !user || !user.username) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;

