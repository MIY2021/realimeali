
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Recipe } from "@/types";

interface RecipeFooterProps {
  recipe: Recipe;
}

export const RecipeFooter = ({ recipe }: RecipeFooterProps) => {
  return (
    <div className="mt-12 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-terracotta text-white">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span>Created {new Date(recipe.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
        <div>
          Last updated {new Date(recipe.updated_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
    </div>
  );
};
