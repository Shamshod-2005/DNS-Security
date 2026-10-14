import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  KeyRound,
  Lock,
  AtSign,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import {
  accountCredentialsSchema,
  type AccountCredentialsFormData,
} from "../../../schemas/account.schema";
import type { AuthChangeRequest } from "../../../api/types";

interface AccountCredentialsFormProps {
  currentUsername?: string;
  isPending: boolean;
  errorMsg: string | null;
  successMsg: string | null;
  onClearSuccess: () => void;
  onSubmit: (payload: AuthChangeRequest) => void;
}

export const AccountCredentialsForm: React.FC<AccountCredentialsFormProps> = ({
  currentUsername = "admin",
  isPending,
  errorMsg,
  successMsg,
  onClearSuccess,
  onSubmit,
}) => {
  const { t } = useTranslation();

  // Show / Hide password states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // CapsLock indicator state
  const [capsLockActive, setCapsLockActive] = useState(false);

  // React Hook Form — barcha validatsiyani Zod sxemasi orqali boshqaradi
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AccountCredentialsFormData>({
    resolver: zodResolver(accountCredentialsSchema),
    mode: "onChange",
    defaultValues: {
      current_password: "",
      username: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const newPasswordValue = watch("new_password");
  const confirmPasswordValue = watch("confirm_password");

  // Muvaffaqiyatli saqlanganda formani tozalash
  useEffect(() => {
    if (successMsg) {
      reset();
    }
  }, [successMsg, reset]);

  // CapsLock bosilganini tekshirish
  const handleKeyModifierCheck = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState("CapsLock"));
    }
  };

  const handleReset = () => {
    reset();
    if (successMsg) onClearSuccess();
  };

  // Parol mustahkamligi vizual indikatori
  const passwordStrength = useMemo(() => {
    const pwd = newPasswordValue || "";
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd) && /[a-zA-Z]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score === 1) return { score: 1, label: "Weak", color: "bg-rose-500" };
    if (score === 2) return { score: 2, label: "Medium", color: "bg-amber-500" };
    return { score: 3, label: "Strong", color: "bg-emerald-500" };
  }, [newPasswordValue]);

  const onValidSubmit = (data: AccountCredentialsFormData) => {
    const payload: AuthChangeRequest = {
      current_password: data.current_password,
    };
    if (data.username?.trim()) {
      payload.username = data.username.trim();
    }
    if (data.new_password?.trim()) {
      payload.new_password = data.new_password;
      payload.confirm_password = data.confirm_password;
    }
    onSubmit(payload);
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-6 transition-colors">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("account.credentialsTitle")}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t("account.credentialsSubtitle")}
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={onClearSuccess}
            className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* CapsLock Warning */}
      {capsLockActive && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 dark:text-amber-400 text-xs flex items-center gap-2 font-mono animate-in fade-in duration-150">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
          <span>Diqqat: CapsLock yoqilgan!</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-5">
        {/* 1. CURRENT PASSWORD */}
        <div className="space-y-1.5">
          <label
            htmlFor="current_password"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            {t("account.currentPassword")} <span className="text-rose-500">*</span>
          </label>
          <div
            className={`relative flex items-center rounded-xl bg-slate-50 dark:bg-[#0b0f19] border transition-all ${
              errors.current_password
                ? "border-rose-500/80 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20"
                : "border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
            }`}
          >
            <div className="pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="current_password"
              type={showCurrentPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••••"
              {...register("current_password")}
              onKeyDown={handleKeyModifierCheck}
              onKeyUp={handleKeyModifierCheck}
              className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              title={showCurrentPassword ? "Hide password" : "Show password"}
            >
              {showCurrentPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.current_password && (
            <p className="text-xs text-rose-500 font-mono flex items-center gap-1 animate-in fade-in duration-150">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.current_password.message}</span>
            </p>
          )}
        </div>

        {/* 2. USERNAME */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <label
              htmlFor="username"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {t("account.username")}
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t("account.usernameHint")}
            </span>
          </div>
          <div
            className={`relative flex items-center rounded-xl bg-slate-50 dark:bg-[#0b0f19] border transition-all ${
              errors.username
                ? "border-rose-500/80 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20"
                : "border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
            }`}
          >
            <div className="pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
              <AtSign className="w-4 h-4" />
            </div>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder={t("account.currentUsername", {
                user: currentUsername,
              })}
              {...register("username")}
              className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none font-mono"
            />
          </div>
          {errors.username && (
            <p className="text-xs text-rose-500 font-mono flex items-center gap-1 animate-in fade-in duration-150">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.username.message}</span>
            </p>
          )}
        </div>

        {/* 3. NEW PASSWORD & CONFIRM PASSWORD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="new_password"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {t("account.newPassword")}
            </label>
            <div
              className={`relative flex items-center rounded-xl bg-slate-50 dark:bg-[#0b0f19] border transition-all ${
                errors.new_password
                  ? "border-rose-500/80 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20"
                  : "border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
              }`}
            >
              <div className="pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="new_password"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••••••"
                {...register("new_password")}
                onKeyDown={handleKeyModifierCheck}
                onKeyUp={handleKeyModifierCheck}
                className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                title={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {errors.new_password && (
              <p className="text-xs text-rose-500 font-mono flex items-center gap-1 animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.new_password.message}</span>
              </p>
            )}

            {/* Password Strength Meter */}
            {newPasswordValue && (
              <div className="space-y-1 pt-1 animate-in fade-in duration-150">
                <div className="flex gap-1 h-1.5">
                  <div
                    className={`flex-1 rounded-full ${
                      passwordStrength.score >= 1
                        ? passwordStrength.color
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                  <div
                    className={`flex-1 rounded-full ${
                      passwordStrength.score >= 2
                        ? passwordStrength.color
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                  <div
                    className={`flex-1 rounded-full ${
                      passwordStrength.score >= 3
                        ? passwordStrength.color
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Murakkablik:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Repeat New Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirm_password"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {t("account.repeatNewPassword")}
            </label>
            <div
              className={`relative flex items-center rounded-xl bg-slate-50 dark:bg-[#0b0f19] border transition-all ${
                errors.confirm_password
                  ? "border-rose-500/80 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20"
                  : "border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
              }`}
            >
              <div className="pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••••••"
                disabled={!newPasswordValue}
                {...register("confirm_password")}
                onKeyDown={handleKeyModifierCheck}
                onKeyUp={handleKeyModifierCheck}
                className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none font-mono disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={!newPasswordValue}
                className="pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {errors.confirm_password ? (
              <p className="text-xs text-rose-500 font-mono flex items-center gap-1 animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.confirm_password.message}</span>
              </p>
            ) : (
              confirmPasswordValue &&
              newPasswordValue && (
                <div className="pt-0.5 text-[11px] font-mono animate-in fade-in duration-150">
                  <span className="text-emerald-500 flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    {t("account.passwordsMatch")}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            {t("account.cancel")}
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer select-none"
          >
            {isPending ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <KeyRound className="w-3.5 h-3.5" />
            )}
            <span>
              {isPending
                ? t("account.saving")
                : t("account.save")}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
