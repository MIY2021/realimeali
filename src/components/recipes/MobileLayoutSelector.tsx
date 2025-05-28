
import { Columns } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface MobileLayoutSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MobileLayoutSelector({ value, onChange }: MobileLayoutSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[60px] h-10 px-2">
        <Columns className="h-4 w-4" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Single Column</SelectItem>
        <SelectItem value="2">Two Columns</SelectItem>
      </SelectContent>
    </Select>
  );
}
