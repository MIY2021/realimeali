
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Props = {
  onClearAll: () => void;
};

export default function MealActions({ onClearAll }: Props) {
  return (
    <Button variant="ghost" size="icon" className="ml-2" onClick={onClearAll} title="Clear all meals">
      <X className="h-5 w-5 text-terracotta" />
      <span className="sr-only">Clear All Meals</span>
    </Button>
  );
}
