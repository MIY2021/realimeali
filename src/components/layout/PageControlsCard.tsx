import { ReactNode } from "react";

interface PageControlsCardProps {
  children: ReactNode;
  className?: string;
}

export function PageControlsCard({ children, className = "" }: PageControlsCardProps) {
  return (
    <div className={`rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
