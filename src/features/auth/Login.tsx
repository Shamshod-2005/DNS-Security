import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  changeCredentials,
  loginUser,
  logoutUser,
} from "../../api/auth";
import { resetRedirectFlag } from "../../config/axios";
import { useTheme } from "../../hooks/useTheme";
import { ROUTES } from "../../router/routes";
import {
  changePasswordSchema,
  loginSchema,
  type ChangePasswordFormData,
  type LoginFormData,
} from "../../schemas/auth.schema";

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Login sahifasiga kelganda har doim toza DARK rejimga o'rnatiladi
  useEffect(() => {
    try {
      localStorage.setItem("mdns.theme", "dark");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } catch {
      // ignore
    }
  }, []);

  // Mode: "login" or "change" (for forced initial password change)
  const [mode, setMode] = useState<"login" | "change">("login");

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // CapsLock indicator state
  const [capsLockActive, setCapsLockActive] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // 1. React Hook Form for Login
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // 2. React Hook Form for Change Password
  const changeForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      username: "",
      new_password: "",
      confirm_password: "",
    },
  });

  // CapsLock key handler
  const handleKeyModifierCheck = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState("CapsLock"));
    }
  };

  // Handle standard Login submission with React Hook Form
  const onLoginSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setLoading(true);

    try {
      const res = await loginUser({
        username: data.username,
        password: data.password,
      });

      if (!res.ok) {
        setServerError(res.error || "Foydalanuvchi nomi yoki parol noto'g'ri.");
        setLoading(false);
        return;
      }

      if (res.must_change) {
        setMode("change");
        changeForm.setValue("current_password", data.password);
        changeForm.setValue("username", data.username);
        setLoading(false);
        return;
      }

      // Success -> React Query keshini yangilaymiz va dashboardga yo'naltiramiz
      try {
        sessionStorage.removeItem("logged_out");
      } catch {
        // ignore
      }
      queryClient.setQueryData(["auth", "me"], {
        username: res.username || data.username,
        must_change: false,
      });
      resetRedirectFlag();
      navigate(ROUTES.DASHBOARD, { replace: true });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    } catch {
      setServerError("Server bilan aloqa xatoligi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Change submission with React Hook Form
  const onChangeSubmit = async (data: ChangePasswordFormData) => {
    setServerError(null);
    setLoading(true);

    try {
      await changeCredentials({
        current_password: data.current_password,
        username: data.username.trim(),
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });

      // Success -> React Query keshini yangilaymiz va dashboardga yo'naltiramiz
      try {
        sessionStorage.removeItem("logged_out");
      } catch {
        // ignore
      }
      queryClient.setQueryData(["auth", "me"], {
        username: data.username.trim(),
        must_change: false,
      });
      resetRedirectFlag();
      navigate(ROUTES.DASHBOARD, { replace: true });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Parolni o'zgartirishda xatolik yuz berdi.";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  // Real-time password criteria
  const watchedNewPassword = changeForm.watch("new_password") || "";
  const isLenMet = watchedNewPassword.length >= 8;

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center px-4 py-8 bg-[#0b0f19] text-slate-100 selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
      {/* ??? Cyber Mesh Backdrop ??? */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(59, 130, 246, 0.12) 1.5px, transparent 1.5px), radial-gradient(circle at 50% 15%, rgba(37, 99, 235, 0.15) 0%, transparent 60%), radial-gradient(circle at 85% 85%, rgba(99, 102, 241, 0.08) 0%, transparent 45%)",
          backgroundSize: "28px 28px, 100% 100%, 100% 100%",
        }}
      />

      <div className="w-full max-w-[440px] relative z-10 flex flex-col items-center gap-5">
        {/* ??? Brand Logo & Title ??? */}
        <div className="flex flex-col items-center text-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-500/25 ring-1 ring-blue-400/30 text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-mono tracking-tight text-white flex items-center justify-center gap-1.5">
              MALICIOUS<span className="text-blue-400">DNS</span>
            </h1>
          </div>
        </div>

        {/* ??? Auth Card ??? */}
        <div className="w-full bg-[#11192e]/90 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-7 sm:p-8 shadow-2xl shadow-black/80 relative overflow-hidden ring-1 ring-white/5">
          {/* Top highlight light beam */}
          <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />

          {mode === "login" ? (
            /* ??????? LOGIN MODE ??????? */
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Tizimga kirish
                </h2>
              </div>

              {/* Server Error Alert */}
              {serverError && (
                <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{serverError}</span>
                </div>
              )}

              {/* CapsLock Warning */}
              {capsLockActive && (
                <div className="mb-4 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center gap-2 font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Diqqat: CapsLock yoqilgan!</span>
                </div>
              )}

              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-4"
              >
                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                    Foydalanuvchi nomi
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      id="login-username-input"
                      {...loginForm.register("username")}
                      autoFocus
                      autoComplete="username"
                      placeholder="admin"
                      className={`w-full h-11 pl-10 pr-4 rounded-xl bg-[#090e1a] border text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all font-mono ${
                        loginForm.formState.errors.username
                          ? "border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25"
                          : "border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
                      }`}
                    />
                  </div>
                  {loginForm.formState.errors.username && (
                    <p className="mt-1 text-xs text-rose-400 font-mono">
                      {loginForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                    Parol
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="login-password-input"
                      {...loginForm.register("password")}
                      onKeyDown={handleKeyModifierCheck}
                      onKeyUp={handleKeyModifierCheck}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={`w-full h-11 pl-10 pr-11 rounded-xl bg-[#090e1a] border text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all font-mono ${
                        loginForm.formState.errors.password
                          ? "border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25"
                          : "border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer rounded-lg hover:bg-white/5"
                      title={
                        showPassword
                          ? "Parolni yashirish"
                          : "Parolni ko'rsatish"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-rose-400 font-mono">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  id="login-submit-btn"
                  className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 ring-1 ring-blue-400/30 cursor-pointer active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Tekshirilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <span>Boshqaruv paneliga kirish</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ??????? CHANGE PASSWORD MODE ??????? */
            <>
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium mb-2.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Xavfsizlik talabi</span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Parolni yangilash
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Standart xavfsizlik qoidasiga ko'ra, dastlabki kirishda yangi
                  mustahkam parol o'rnatilishi shart.
                </p>
              </div>

              {/* Server Error Alert */}
              {serverError && (
                <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{serverError}</span>
                </div>
              )}

              {/* CapsLock Warning */}
              {capsLockActive && (
                <div className="mb-4 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center gap-2 font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Diqqat: CapsLock yoqilgan!</span>
                </div>
              )}

              <form
                onSubmit={changeForm.handleSubmit(onChangeSubmit)}
                className="space-y-4"
              >
                {/* Current password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                    Joriy parol
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type="password"
                      {...changeForm.register("current_password")}
                      onKeyDown={handleKeyModifierCheck}
                      onKeyUp={handleKeyModifierCheck}
                      placeholder="Joriy parol"
                      className={`w-full h-11 pl-10 pr-4 rounded-xl bg-[#090e1a] border text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all font-mono ${
                        changeForm.formState.errors.current_password
                          ? "border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25"
                          : "border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
                      }`}
                    />
                  </div>
                  {changeForm.formState.errors.current_password && (
                    <p className="mt-1 text-xs text-rose-400 font-mono">
                      {changeForm.formState.errors.current_password.message}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                    Foydalanuvchi nomi
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      {...changeForm.register("username")}
                      className={`w-full h-11 pl-10 pr-4 rounded-xl bg-[#090e1a] border text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all font-mono ${
                        changeForm.formState.errors.username
                          ? "border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25"
                          : "border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
                      }`}
                    />
                  </div>
                  {changeForm.formState.errors.username && (
                    <p className="mt-1 text-xs text-rose-400 font-mono">
                      {changeForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                {/* New password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                    Yangi parol
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      {...changeForm.register("new_password")}
                      onKeyDown={handleKeyModifierCheck}
                      onKeyUp={handleKeyModifierCheck}
                      placeholder="Kamida 8 ta belgi"
                      className={`w-full h-11 pl-10 pr-11 rounded-xl bg-[#090e1a] border text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all font-mono ${
                        changeForm.formState.errors.new_password
                          ? "border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25"
                          : "border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer rounded-lg hover:bg-white/5"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {changeForm.formState.errors.new_password && (
                    <p className="mt-1 text-xs text-rose-400 font-mono">
                      {changeForm.formState.errors.new_password.message}
                    </p>
                  )}

                  {/* Requirements checklist */}
                  <div className="mt-2 p-2.5 rounded-lg bg-[#090e1a] border border-slate-800 text-[11px] font-mono flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                        isLenMet
                          ? "bg-emerald-500 text-slate-950 font-bold"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span
                      className={
                        isLenMet
                          ? "text-emerald-400 font-medium"
                          : "text-slate-400"
                      }
                    >
                      Kamida 8 ta belgidan iborat
                    </span>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                    Yangi parolni takrorlang
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...changeForm.register("confirm_password")}
                      onKeyDown={handleKeyModifierCheck}
                      onKeyUp={handleKeyModifierCheck}
                      placeholder="Parolni qayta kiriting"
                      className={`w-full h-11 pl-10 pr-11 rounded-xl bg-[#090e1a] border text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all font-mono ${
                        changeForm.formState.errors.confirm_password
                          ? "border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25"
                          : "border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer rounded-lg hover:bg-white/5"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {changeForm.formState.errors.confirm_password && (
                    <p className="mt-1 text-xs text-rose-400 font-mono">
                      {changeForm.formState.errors.confirm_password.message}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 ring-1 ring-blue-400/30 cursor-pointer active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saqlanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <span>Saqlash va davom etish</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                {/* Cancel / Logout */}
                <button
                  type="button"
                  onClick={() => logoutUser()}
                  className="w-full h-10 rounded-xl border border-slate-700/80 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-mono transition-all cursor-pointer"
                >
                  Bekor qilish va chiqish
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
