
import { CreateRecipeHeader } from "@/components/recipes/create/CreateRecipeHeader";
import { CreateRecipeContainer } from "@/components/recipes/create/CreateRecipeContainer";
import { CreateRecipeActions } from "@/components/recipes/create/CreateRecipeActions";
import { useRecipeSave } from "@/hooks/useRecipeSave";
import { useRecipeForm } from "@/hooks/useRecipeForm";
import { Plus } from "lucide-react";

export default function CreateRecipePage() {
  const { handleCancel, handleSave } = useRecipeSave();
  const { newRecipe } = useRecipeForm();

  const onSave = () => {
    handleSave(newRecipe);
  };

  return (
    <div className="min-h-screen bg-cream sm:bg-cream bg-white">
      <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
        {/* Title Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy flex items-center gap-3 mb-2">
            <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-sage" />
            Add New Recipe
          </h1>
          <p className="text-lg text-muted-foreground">
            Create a new recipe for your household
          </p>
        </div>

        <CreateRecipeContainer />

        {/* Bottom Actions */}
        <div className="mt-8 pt-6 border-t">
          <CreateRecipeActions 
            isMobile={false}
            onCancel={handleCancel}
            onSave={onSave}
            showBackButton={false}
          />
        </div>
      </div>
    </div>
  );
}
