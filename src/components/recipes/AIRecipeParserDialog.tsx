
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Type, Sparkles } from "lucide-react";
import { useRecipeSave } from "@/hooks/useRecipeSave";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types";

interface AIRecipeParserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIRecipeParserDialog({ open, onOpenChange }: AIRecipeParserDialogProps) {
  const [recipeText, setRecipeText] = useState("");
  const [recipePrompt, setRecipePrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedRecipe, setParsedRecipe] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"text" | "generate">("text");
  const [shareWithCommunity, setShareWithCommunity] = useState(false);
  const { handleSave } = useRecipeSave();

  const parseRecipe = async (content: string, type: "text" | "generate") => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { content, type }
      });

      if (error) throw error;

      if (data) {
        setParsedRecipe(data);
      }
    } catch (error) {
      console.error('Error parsing recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!parsedRecipe) return;
    
    const recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
      title: parsedRecipe.title,
      description: parsedRecipe.description,
      ingredients: parsedRecipe.ingredients,
      instructions: parsedRecipe.instructions,
      // New classification fields from AI
      mealType: parsedRecipe.mealType,
      cuisineRegion: parsedRecipe.cuisineRegion,
      cookingMethod: parsedRecipe.cookingMethod,
      dietLifestyle: parsedRecipe.dietLifestyle || [],
      complexityLevel: parsedRecipe.complexityLevel,
      mainIngredient: parsedRecipe.mainIngredient,
      prepTime: parsedRecipe.prepTime,
      cookTime: parsedRecipe.cookTime,
      servings: parsedRecipe.servings,
      topTip: parsedRecipe.topTip,
      isFavorite: false,
      householdId: "",
    };

    await handleSave(recipe, shareWithCommunity);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setRecipeText("");
    setRecipePrompt("");
    setParsedRecipe(null);
    setActiveTab("text");
    setShareWithCommunity(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            AI Recipe Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tab Selection */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTab("text")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "text"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Type className="h-4 w-4 inline mr-2" />
              Parse Recipe Text
            </button>
            <button
              onClick={() => setActiveTab("generate")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "generate"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Sparkles className="h-4 w-4 inline mr-2" />
              Generate Recipe
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === "text" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipeText">Recipe Text</Label>
                <Textarea
                  id="recipeText"
                  value={recipeText}
                  onChange={(e) => setRecipeText(e.target.value)}
                  placeholder="Paste your recipe text here. Include ingredients, instructions, cooking times, etc."
                  className="min-h-[200px] mt-1"
                />
              </div>
              <Button 
                onClick={() => parseRecipe(recipeText, "text")}
                disabled={!recipeText.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Parsing Recipe...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Parse Recipe
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipePrompt">Recipe Idea</Label>
                <Input
                  id="recipePrompt"
                  value={recipePrompt}
                  onChange={(e) => setRecipePrompt(e.target.value)}
                  placeholder="e.g., 'Quick pasta dinner with chicken and vegetables'"
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={() => parseRecipe(recipePrompt, "generate")}
                disabled={!recipePrompt.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Recipe...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Recipe
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Display parsed recipe */}
          {parsedRecipe && (
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <h3 className="text-lg font-semibold">{parsedRecipe.title}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Details</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Prep Time:</strong> {parsedRecipe.prepTime} minutes</p>
                    <p><strong>Cook Time:</strong> {parsedRecipe.cookTime} minutes</p>
                    <p><strong>Servings:</strong> {parsedRecipe.servings}</p>
                    <p><strong>Description:</strong> {parsedRecipe.description}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Classification</h4>
                  <div className="text-sm space-y-1">
                    {parsedRecipe.mealType && <p><strong>Meal Type:</strong> {parsedRecipe.mealType}</p>}
                    {parsedRecipe.cuisineRegion && <p><strong>Cuisine:</strong> {parsedRecipe.cuisineRegion}</p>}
                    {parsedRecipe.complexityLevel && <p><strong>Complexity:</strong> {parsedRecipe.complexityLevel}</p>}
                    {parsedRecipe.mainIngredient && <p><strong>Main Ingredient:</strong> {parsedRecipe.mainIngredient}</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Ingredients</h4>
                  <ul className="text-sm space-y-1">
                    {parsedRecipe.ingredients?.map((ingredient: string, index: number) => (
                      <li key={index}>• {ingredient}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Instructions</h4>
                  <ol className="text-sm space-y-1">
                    {parsedRecipe.instructions?.map((instruction: string, index: number) => (
                      <li key={index}>{index + 1}. {instruction}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {parsedRecipe.topTip && (
                <div>
                  <h4 className="font-medium mb-2">Chef's Tip</h4>
                  <p className="text-sm">{parsedRecipe.topTip}</p>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-4 border-t">
                <input
                  type="checkbox"
                  id="shareWithCommunity"
                  checked={shareWithCommunity}
                  onChange={(e) => setShareWithCommunity(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="shareWithCommunity" className="text-sm">
                  Share with community (submit for review)
                </Label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveRecipe} className="flex-1">
                  Save Recipe
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Start Over
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
