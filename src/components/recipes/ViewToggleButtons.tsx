import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewToggleButtonsProps {
  value: string;
  onChange: (value: string) => void;
}

// Custom icon: one square with lines underneath
const SingleColumnIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Square/Rectangle */}
    <rect x="2" y="2" width="12" height="8" />
    {/* Lines underneath */}
    <line x1="4" y1="12" x2="12" y2="12" />
    <line x1="4" y1="14" x2="12" y2="14" />
  </svg>
);

export function ViewToggleButtons({ value, onChange }: ViewToggleButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange('1')}
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center transition-all",
          value === '1'
            ? "bg-white border-2 border-[#F5B82E] text-[#F5B82E]"
            : "bg-white border border-gray-300 text-gray-400 hover:border-gray-400"
        )}
        aria-label="Single column view"
      >
        <SingleColumnIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange('2')}
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center transition-all",
          value === '2'
            ? "bg-white border-2 border-[#F5B82E] text-[#F5B82E]"
            : "bg-white border border-gray-300 text-gray-400 hover:border-gray-400"
        )}
        aria-label="Double column view"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
    </div>
  );
}
