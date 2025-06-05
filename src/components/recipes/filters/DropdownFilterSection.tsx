
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface DropdownFilterSectionProps {
  title: string;
  options: { value: string; label: string; icon: string }[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}

export function DropdownFilterSection({
  title,
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

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`flex items-center gap-1 w-full justify-between h-10 px-2 sm:px-3 text-xs sm:text-sm ${
              hasActiveFilters 
                ? 'bg-sage/20 border-sage/40 text-sage hover:bg-sage/30' 
                : ''
            }`}
          >
            <span className="truncate flex-1 text-left">{title}</span>
            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 opacity-50 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-56 max-h-96 overflow-y-auto bg-popover border border-border shadow-lg z-50" 
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
