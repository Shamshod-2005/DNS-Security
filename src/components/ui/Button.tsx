import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  loading?: boolean;
}

const variantStyles = {
  primary: "bg-accent border-accent text-white hover:opacity-90 shadow-sm",
  secondary:
    "bg-surface-2 border-border text-text hover:bg-border/60 hover:text-text-heading",
  danger:
    "bg-danger-bg border-danger/30 text-danger hover:bg-danger hover:text-white",
  ghost:
    "bg-transparent border-transparent text-text-muted hover:bg-surface-2 hover:text-text",
};

const sizeStyles = {
  sm: "h-7 px-2.5 text-xs gap-1.5",
  md: "h-9 px-3.5 text-xs font-medium gap-2",
};

export default function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center border rounded-md font-medium cursor-pointer whitespace-nowrap transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span
          className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}
