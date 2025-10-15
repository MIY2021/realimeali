import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Props = {
  onClearAll: () => void;
};

export default function MealActions({ onClearAll }: Props) {
  return (
    <Button 
      variant="destructive" 
      size="md" 
      onClick={onClearAll} 
      title="Clear all meals"
    >
      <Trash2 className="w-5 h-5" />
      Clear All
    </Button>
  );
}
