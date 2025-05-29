
import { FilterOption } from "./FilterOption";

interface FilterSectionProps {
  title: string;
  options: { value: string; label: string; icon: string }[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  multiSelect?: boolean;
  gridCols?: string;
}

export function FilterSection({
  title,
  options,
  selectedValues,
  onToggle,
  multiSelect = false,
  gridCols = "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6"
}: FilterSectionProps) {
  const handleOptionClick = (value: string) => {
    if (multiSelect) {
      onToggle(value);
    } else {
      // For single select, toggle off if already selected, otherwise select
      const newValue = selectedValues.includes(value) ? undefined : value;
      onToggle(newValue as string);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">{title}</h4>
      <div className={`grid ${gridCols} gap-2`}>
        {options.map((option) => (
          <FilterOption
            key={option.value}
            value={option.value}
            label={option.label}
            icon={option.icon}
            isSelected={selectedValues.includes(option.value)}
            onClick={() => handleOptionClick(option.value)}
          />
        ))}
      </div>
    </div>
  );
}
