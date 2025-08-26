
import { Label } from "@/components/ui/label";
import { DIET_LIFESTYLE_OPTIONS } from "@/utils/recipeClassification";

interface DietLifestyleSelectorProps {
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export function DietLifestyleSelector({ selectedValues, onChange }: DietLifestyleSelectorProps) {
  const toggleDietLifestyle = (value: string) => {
    onChange(
      selectedValues.includes(value)
        ? selectedValues.filter(item => item !== value)
        : [...selectedValues, value]
    );
  };

  return (
    <div>
      <Label className="text-sm font-medium mb-3 block">Diet & Lifestyle (select multiple)</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {DIET_LIFESTYLE_OPTIONS.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleDietLifestyle(option.value)}
              className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                isSelected
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300 bg-white/50 hover:bg-white/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm">{option.label}</span>
              </div>
              {isSelected && (
                <div className="absolute top-1 right-1">
                  <div className="h-5 w-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
