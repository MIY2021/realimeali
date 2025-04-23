
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Props = {
  onClearAll: () => void;
};

export default function MealActions({ onClearAll }: Props) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="ml-2 text-terracotta border-terracotta hover:bg-terracotta/10" 
      onClick={onClearAll} 
      title="Clear all meals"
    >
      <Trash2 className="h-4 w-4 mr-1" />
      Clear All
    </Button>
  );
}
