import { ReactNode } from "react";

interface PageHeaderProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ icon: Icon, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 mb-4 sm:mb-6">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1A1A1A] flex items-center gap-2">
            <span className="inline-flex !text-[#F5B82E]" style={{ color: '#F5B82E' }}>
              <Icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
            </span>
            {title}
          </h1>
          {actions}
        </div>
        <p className="text-sm text-[#6B6B6B] max-w-3xl">
          {description}
        </p>
      </div>
    </div>
  );
}
