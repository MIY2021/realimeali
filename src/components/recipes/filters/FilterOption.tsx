
import { Button } from "@/components/ui/button";

interface FilterOptionProps {
  value: string;
  label: string;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
}

export function FilterOption({ 
  value, 
  label, 
  icon, 
  isSelected, 
  onClick 
}: FilterOptionProps) {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="h-auto p-2 flex flex-col items-center gap-1 min-w-[80px] data-[state=on]:bg-terracotta data-[state=on]:text-white hover:bg-terracotta/10"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs text-center leading-tight">{label}</span>
    </Button>
  );
}
