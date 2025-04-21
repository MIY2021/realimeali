
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MealType } from "@/types";
import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (mealType: MealType) => void;
};

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner"];

export function AddToMealPlanDialog({ open, onClose, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select meal type</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {mealTypes.map(type => (
            <Button key={type} onClick={() => { onSelect(type); onClose(); }} variant="outline" className="capitalize">
              {type}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
