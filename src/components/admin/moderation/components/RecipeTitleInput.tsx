
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RecipeTitleInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function RecipeTitleInput({ value, onChange }: RecipeTitleInputProps) {
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">Recipe Title</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter recipe title"
        className="w-full"
      />
    </div>
  );
}
