
import { Label } from "@/components/ui/label";
import { CategoryButton } from "./CategoryButton";
import { CUISINE_REGION_OPTIONS } from "@/utils/recipeClassification";

interface CuisineSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CuisineSelector({ value, onChange }: CuisineSelectorProps) {
  return (
    <div>
      <Label className="text-sm font-medium mb-3 block">Cuisine</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {CUISINE_REGION_OPTIONS.map((option) => (
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
