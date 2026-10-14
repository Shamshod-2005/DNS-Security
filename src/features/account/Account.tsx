import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, changeCredentials, logoutUser } from "../../api/auth";
import type { AuthChangeRequest } from "../../api/types";
import { ApiError } from "../../api/client";
import {
  AccountHeader,
  AccountProfileCard,
  AccountSecurityAdvice,
  AccountCredentialsForm,
  AccountDangerZone,
} from "./components";

export default function Account() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
  });

  const mutation = useMutation({
    mutationFn: changeCredentials,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      setSuccessMsg(t("account.credentialsSuccess", { user: data.username }));
      setTimeout(() => setSuccessMsg(null), 5000);
    },
  });

  const handleCredentialsSubmit = (payload: AuthChangeRequest) => {
    mutation.reset();
    setSuccessMsg(null);
    mutation.mutate(payload);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutUser();
  };

  const errorMsg =
    mutation.error instanceof ApiError ? mutation.error.message : null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* 1. Header with Radial Glow Accent */}
      <AccountHeader />

      {/* 2. Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Identity & Security Guidelines */}
        <div className="lg:col-span-4 space-y-6">
          <AccountProfileCard user={user} isLoading={isLoading} />
          <AccountSecurityAdvice />
        </div>

        {/* Right Column: Credentials Form & Session Termination */}
        <div className="lg:col-span-8 space-y-6">
          <AccountCredentialsForm
            currentUsername={user?.username}
            isPending={mutation.isPending}
            errorMsg={errorMsg}
            successMsg={successMsg}
            onClearSuccess={() => setSuccessMsg(null)}
            onSubmit={handleCredentialsSubmit}
          />
          <AccountDangerZone
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
        </div>
      </div>
    </div>
  );
}
