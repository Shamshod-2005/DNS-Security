import { type ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export default function Card({
  title,
  children,
  className = "",
  action,
}: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-lg overflow-hidden shadow-sm ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          {title && (
            <h2 className="text-sm font-semibold text-text-heading">{title}</h2>
          )}
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
