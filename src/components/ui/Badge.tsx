import { type ReactNode } from "react";

type BadgeVariant = "success" | "danger" | "warning" | "info" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-2 text-text-muted border border-border",
  success: "bg-success-bg text-success border border-success/20",
  danger: "bg-danger-bg text-danger border border-danger/20",
  warning: "bg-warning-bg text-warning border border-warning/20",
  info: "bg-info-bg text-info border border-info/20",
};

export default function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
