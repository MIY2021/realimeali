import { ReactNode } from "react";

interface PageWrapperProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageWrapper({ isLoading, skeleton, children, className = "" }: PageWrapperProps) {
  return (
    <div className={`transition-opacity duration-150 ${className}`}>
      {isLoading ? skeleton : children}
    </div>
  );
}
