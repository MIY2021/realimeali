import { Columns } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface MealPlannerLayoutSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MealPlannerLayoutSelector({ value, onChange }: MealPlannerLayoutSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[60px] h-8 px-2">
        <Columns className="h-4 w-4" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="list">List View</SelectItem>
        <SelectItem value="1">Single Column</SelectItem>
        <SelectItem value="2">Two Columns</SelectItem>
      </SelectContent>
    </Select>
  );
}