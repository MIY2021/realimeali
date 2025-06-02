
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-1 sm:gap-2 min-w-[100px] sm:min-w-[140px] justify-between px-2 sm:px-4 text-xs sm:text-sm"
          >
            <span className="truncate">{title}</span>
            {selectedValues.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 sm:h-5 min-w-4 sm:min-w-5 flex items-center justify-center p-0.5 sm:p-1 text-xs">
                {selectedValues.length}
              </Badge>
            )}
            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
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
