
import { CreateRecipeHeader } from "@/components/recipes/create/CreateRecipeHeader";
import { CreateRecipeContainer } from "@/components/recipes/create/CreateRecipeContainer";
import { useRecipeSave } from "@/hooks/useRecipeSave";

export default function CreateRecipePage() {
  const { handleCancel } = useRecipeSave();

  return (
    <div className="min-h-screen bg-cream">
      <div className="container max-w-4xl py-6">
        <CreateRecipeHeader onCancel={handleCancel} />
        <CreateRecipeContainer />
      </div>
    </div>
  );
}
