
import { CreateRecipeHeader } from "@/components/recipes/create/CreateRecipeHeader";
import { CreateRecipeContainer } from "@/components/recipes/create/CreateRecipeContainer";
import { useRecipeSave } from "@/hooks/useRecipeSave";

export default function CreateRecipePage() {
  const { handleCancel } = useRecipeSave();

  return (
    <div className="min-h-screen bg-cream sm:bg-cream bg-white">
      <div className="w-full sm:container sm:max-w-4xl py-3 sm:py-6 px-4 sm:px-6">
        <CreateRecipeHeader onCancel={handleCancel} />
        <CreateRecipeContainer />
      </div>
    </div>
  );
}
