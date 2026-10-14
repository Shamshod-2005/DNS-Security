import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import React from "react";
import type { ToastMessage } from "../../types";

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const icon = {
          success: (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ),
          warning: (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          ),
          error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
        }[toast.type];

        const borderBg = {
          success:
            "border-emerald-500/30 bg-slate-900/95 text-slate-100 shadow-emerald-950/40",
          warning:
            "border-amber-500/30 bg-slate-900/95 text-slate-100 shadow-amber-950/40",
          error:
            "border-rose-500/30 bg-slate-900/95 text-slate-100 shadow-rose-950/40",
          info: "border-blue-500/30 bg-slate-900/95 text-slate-100 shadow-blue-950/40",
        }[toast.type];

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${borderBg}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-tight">
                {toast.title}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                {toast.timestamp}
              </span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-slate-800"
              title="Dismiss"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
