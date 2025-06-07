
import { Label } from "@/components/ui/label";
import { CategoryButton } from "./CategoryButton";
import { COMPLEXITY_LEVEL_OPTIONS } from "@/utils/recipeClassification";

interface ComplexitySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ComplexitySelector({ value, onChange }: ComplexitySelectorProps) {
  return (
    <div>
      <Label className="text-sm font-medium mb-3 block">Complexity Level</Label>
      <div className="flex flex-wrap gap-2">
        {COMPLEXITY_LEVEL_OPTIONS.map((option) => (
          <CategoryButton
            key={option.value}
            option={option}
            isSelected={value === option.value}
            onClick={() => onChange(option.value)}
          />
        ))}
      </div>
    </div>
  );
}
