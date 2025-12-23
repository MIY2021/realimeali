
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, UtensilsCrossed, Utensils, Leaf, Clock, ChefHat } from "lucide-react";

interface DropdownFilterSectionProps {
  title: string;
  icon?: string;
  options: { value: string; label: string; icon: string }[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}

export function DropdownFilterSection({
  title,
  icon,
  options,
  selectedValues,
  onToggle,
}: DropdownFilterSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (value: string, event: Event) => {
    // Prevent the dropdown from closing when clicking on items
    event.preventDefault();
    onToggle(value);
  };

  const hasActiveFilters = selectedValues.length > 0;

  const IconComponent = icon === 'utensils' ? UtensilsCrossed :
                       icon === 'cuisine' ? ChefHat :
                       icon === 'diet' ? Leaf :
                       icon === 'clock' ? Clock : null;

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`flex items-center gap-2 w-full justify-between h-10 px-3 text-sm font-medium rounded-lg ${
              hasActiveFilters 
                ? 'bg-[#FFF9E6] border-[#F5B82E] text-[#F5B82E]' 
                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {IconComponent && <IconComponent className="h-4 w-4" />}
              <span className="truncate">{title}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-56 max-h-96 overflow-y-auto bg-white border border-gray-200 shadow-lg z-50 rounded-lg" 
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={() => onToggle(option.value)}
              onSelect={(e) => handleItemClick(option.value, e)}
              className="flex items-center gap-2 py-2"
            >
              <span className="text-base">{option.icon}</span>
              <span className="text-sm">{option.label}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
