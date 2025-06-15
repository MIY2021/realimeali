
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Plus, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MealPlan, Recipe } from "@/types";

interface MealCardActionsProps {
  mealPlan: MealPlan;
  recipe?: Recipe | undefined;
  onComplete: () => void;
  onCreateLeftover?: () => void;
  onRemove: () => void;
}

export const MealCardActions = ({
  mealPlan,
  recipe,
  onComplete,
  onCreateLeftover,
  onRemove,
}: MealCardActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-accent flex-shrink-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px] bg-white border shadow-lg">
        <DropdownMenuItem 
          onClick={onComplete} 
          className={`${
            mealPlan.is_completed 
              ? 'text-green-600 focus:text-green-600 hover:bg-green-50' 
              : 'text-gray-600 focus:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Check className="mr-2 h-4 w-4" />
          <span>Meal Made!</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {!mealPlan.is_leftover && recipe && onCreateLeftover && (
          <>
            <DropdownMenuItem onClick={onCreateLeftover} className="text-green-600 focus:text-green-600 hover:bg-green-50">
              <Plus className="mr-2 h-4 w-4" />
              <span>Add Leftover Lunch</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit Recipe</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-500 focus:text-red-500 hover:bg-red-50" onClick={onRemove}>
          <X className="mr-2 h-4 w-4" />
          <span>Remove from plan</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
