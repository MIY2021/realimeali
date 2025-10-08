import { Grid2X2, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewToggleButtonsProps {
  value: string;
  onChange: (value: string) => void;
}

export function ViewToggleButtons({ value, onChange }: ViewToggleButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange('2')}
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center transition-all",
          value === '2'
            ? "bg-white border-2 border-[#F5B82E] text-[#F5B82E]"
            : "bg-white border border-gray-300 text-gray-400 hover:border-gray-400"
        )}
        aria-label="Grid view"
      >
        <Grid2X2 className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange('1')}
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center transition-all",
          value === '1'
            ? "bg-white border-2 border-[#F5B82E] text-[#F5B82E]"
            : "bg-white border border-gray-300 text-gray-400 hover:border-gray-400"
        )}
        aria-label="List view"
      >
        <Menu className="h-4 w-4" />
      </button>
    </div>
  );
}
