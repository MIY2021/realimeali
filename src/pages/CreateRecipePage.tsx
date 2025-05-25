import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Recipe, RecipeCategory } from "@/types";
import { TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

// Components
import { CreateRecipeHeader } from "@/components/recipes/create/CreateRecipeHeader";
import { CreateRecipeActions } from "@/components/recipes/create/CreateRecipeActions";
import { CreateRecipeTabNavigation } from "@/components/recipes/create/CreateRecipeTabNavigation";
import { RecipeTextTab } from "@/components/recipes/create/tabs/RecipeTextTab";
import { RecipeUrlTab } from "@/components/recipes/create/tabs/RecipeUrlTab";
import { RecipeImageTab } from "@/components/recipes/create/tabs/RecipeImageTab";
import { RecipeGenerateTab } from "@/components/recipes/create/tabs/RecipeGenerateTab";
import { RecipeManualTab } from "@/components/recipes/create/tabs/RecipeManualTab";

// Utilities
import { 
  handleProcessText, 
  handleImportFromUrl, 
  handleProcessImage, 
  handleGenerateRecipe 
} from "@/utils/recipeHandlers";

export default function CreateRecipePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createRecipe } = useRecipes();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState("text");
  const [newRecipe, setNewRecipe] = useState<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>({
    title: "",
    description: "",
    ingredients: [],
    instructions: [],
    categories: [],
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    image: undefined,
    isFavorite: false,
    householdId: "",
  });

  const [newCategory, setNewCategory] = useState("");
  const [newIngredient, setNewIngredient] = useState("");
  const [newInstruction, setNewInstruction] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Input states for different tabs
  const [recipeText, setRecipeText] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSave = async () => {
    if (!user || !currentHousehold) {
      toast({
        title: "Error",
        description: "You must be logged in and have a household selected.",
        variant: "destructive",
      });
      return;
    }

    // Basic validation
    if (!newRecipe.title.trim()) {
      toast({
        title: "Error",
        description: "Recipe title is required",
        variant: "destructive",
      });
      return;
    }

    if (newRecipe.ingredients.length === 0) {
      toast({
        title: "Error",
        description: "At least one ingredient is required",
        variant: "destructive",
      });
      return;
    }

    if (newRecipe.instructions.length === 0) {
      toast({
        title: "Error",
        description: "At least one instruction is required",
        variant: "destructive",
      });
      return;
    }

    const recipe = await createRecipe(newRecipe, currentHousehold.id);
    if (recipe) {
      navigate("/recipes");
    }
  };

  const handleCancel = () => {
    navigate("/recipes");
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !newRecipe.categories.includes(newCategory as RecipeCategory)) {
      setNewRecipe({
        ...newRecipe,
        categories: [...newRecipe.categories, newCategory as RecipeCategory],
      });
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setNewRecipe({
      ...newRecipe,
      categories: newRecipe.categories.filter(cat => cat !== categoryToRemove),
    });
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setNewRecipe({
        ...newRecipe,
        ingredients: [...newRecipe.ingredients, newIngredient],
      });
      setNewIngredient("");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...newRecipe.ingredients];
    updatedIngredients.splice(index, 1);
    setNewRecipe({
      ...newRecipe,
      ingredients: updatedIngredients,
    });
  };

  const handleAddInstruction = () => {
    if (newInstruction.trim()) {
      setNewRecipe({
        ...newRecipe,
        instructions: [...newRecipe.instructions, newInstruction],
      });
      setNewInstruction("");
    }
  };

  const handleRemoveInstruction = (index: number) => {
    const updatedInstructions = [...newRecipe.instructions];
    updatedInstructions.splice(index, 1);
    setNewRecipe({
      ...newRecipe,
      instructions: updatedInstructions,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setNewRecipe({
          ...newRecipe,
          image: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!newRecipe.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recipe title first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { 
          prompt: `A delicious ${newRecipe.title}, food photography, professional lighting, appetizing presentation` 
        },
      });

      if (error) {
        throw error;
      }

      if (data?.imageUrl) {
        setImagePreview(data.imageUrl);
        setNewRecipe({
          ...newRecipe,
          image: data.imageUrl,
        });
        toast({
          title: "Image Generated",
          description: "Recipe image has been generated successfully!",
        });
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="container max-w-4xl py-6">
        <CreateRecipeHeader onCancel={handleCancel} />

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <CreateRecipeTabNavigation 
            isMobile={isMobile}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          >
            <TabsContent value="text">
              <RecipeTextTab
                recipeText={recipeText}
                setRecipeText={setRecipeText}
                isProcessing={isProcessing}
                onProcess={() => handleProcessText(recipeText, setIsProcessing)}
              />
            </TabsContent>

            <TabsContent value="url">
              <RecipeUrlTab
                recipeUrl={recipeUrl}
                setRecipeUrl={setRecipeUrl}
                isProcessing={isProcessing}
                onImport={() => handleImportFromUrl(recipeUrl, setIsProcessing)}
              />
            </TabsContent>

            <TabsContent value="image">
              <RecipeImageTab
                isProcessing={isProcessing}
                onProcessImage={(file) => handleProcessImage(file, setIsProcessing)}
              />
            </TabsContent>

            <TabsContent value="generate">
              <RecipeGenerateTab
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                isProcessing={isProcessing}
                onGenerate={() => handleGenerateRecipe(aiPrompt, setIsProcessing)}
              />
            </TabsContent>

            <TabsContent value="manual">
              <RecipeManualTab
                isMobile={isMobile}
                newRecipe={newRecipe}
                setNewRecipe={setNewRecipe}
                newCategory={newCategory}
                setNewCategory={setNewCategory}
                newIngredient={newIngredient}
                setNewIngredient={setNewIngredient}
                newInstruction={newInstruction}
                setNewInstruction={setNewInstruction}
                imagePreview={imagePreview}
                isGeneratingImage={isGeneratingImage}
                onImageChange={handleImageChange}
                onGenerateImage={handleGenerateImage}
                onAddCategory={handleAddCategory}
                onRemoveCategory={handleRemoveCategory}
                onAddIngredient={handleAddIngredient}
                onRemoveIngredient={handleRemoveIngredient}
                onAddInstruction={handleAddInstruction}
                onRemoveInstruction={handleRemoveInstruction}
              />
            </TabsContent>
          </CreateRecipeTabNavigation>
        </div>

        <CreateRecipeActions 
          isMobile={isMobile}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
