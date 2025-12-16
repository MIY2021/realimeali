import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ icon, title, description, actions }: PageHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-3 mb-4 sm:mb-6">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1A1A1A] flex items-center gap-2">
            {icon}
            {title}
          </h1>
          <div className="flex items-center gap-3">
            {actions}
            {/* Elegant toggle button on the right */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-gray-100 transition-all duration-200",
                isExpanded && "text-[#1A1A1A] bg-gray-100"
              )}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Hide description" : "Show description"}
            >
              <span className="font-medium hidden sm:inline">
                {isExpanded ? "Less" : "More"}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-500 ease-in-out",
                  isExpanded && "rotate-180"
                )}
              />
            </button>
          </div>
        </div>
        {/* Collapsible description */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-500 ease-in-out",
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <p className="text-sm text-[#6B6B6B] max-w-3xl pt-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
