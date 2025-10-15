import { Button } from "@/components/ui/button";

interface SegmentedControlProps {
  value: 1 | 2;
  onChange: (value: 1 | 2) => void;
  disabled?: boolean;
}

export function SegmentedControl({ value, onChange, disabled = false }: SegmentedControlProps) {
  return (
    <div className="inline-flex bg-gray-50 rounded-[12px] p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
      <Button
        variant={value === 1 ? "primary" : "secondary"}
        size="md"
        onClick={() => onChange(1)}
        disabled={disabled}
        aria-pressed={value === 1}
        className={`flex-1 min-w-[90px] ${
          value === 1 
            ? "shadow-sm" 
            : "border-0 bg-transparent hover:bg-white/60"
        }`}
      >
        Week 1
      </Button>
      <Button
        variant={value === 2 ? "primary" : "secondary"}
        size="md"
        onClick={() => onChange(2)}
        disabled={disabled}
        aria-pressed={value === 2}
        className={`flex-1 min-w-[90px] ${
          value === 2 
            ? "shadow-sm" 
            : "border-0 bg-transparent hover:bg-white/60"
        }`}
      >
        Week 2
      </Button>
    </div>
  );
}
