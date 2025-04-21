
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MealType } from "@/types";
import React, { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (mealType: MealType, week: 1 | 2) => void;
};

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner"];

export function AddToMealPlanDialog({ open, onClose, onSelect }: Props) {
  const [selectedWeek, setSelectedWeek] = useState<1 | 2>(1);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Select week & meal type
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-2">
          {[1, 2].map((week) => (
            <Button
              key={week}
              variant={selectedWeek === week ? "default" : "outline"}
              className={selectedWeek === week ? "bg-sage text-white" : ""}
              onClick={() => setSelectedWeek(week as 1 | 2)}
            >
              Week {week}
            </Button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {mealTypes.map(type => (
            <Button
              key={type}
              onClick={() => { onSelect(type, selectedWeek); onClose(); }}
              variant="outline"
              className="capitalize"
            >
              {type} - Week {selectedWeek}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
