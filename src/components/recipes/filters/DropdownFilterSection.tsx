
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
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

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 min-w-[140px] justify-between"
          >
            <span className="truncate">{title}</span>
            {selectedValues.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 flex items-center justify-center p-1">
                {selectedValues.length}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 max-h-96 overflow-y-auto bg-popover border border-border shadow-lg z-50" align="start">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={() => onToggle(option.value)}
              className="flex items-center gap-2 py-2"
            >
              <span className="text-base">{option.icon}</span>
              <span className="text-sm">{option.label}</span>
              {selectedValues.includes(option.value) && (
                <Check className="h-4 w-4 ml-auto" />
              )}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
