import { useState } from "react";
import { Recipe, RecipeCategory } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Circle, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AIRecipeParserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

export function AIRecipeParserDialog({ open, onOpenChange, onSave }: AIRecipeParserDialogProps) {
  const { toast } = useToast();
  const [recipeText, setRecipeText] = useState("");
  const [parsedRecipe, setParsedRecipe] = useState<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleParseRecipe = async () => {
    if (!recipeText.trim()) {
      toast({
        title: "Oops!",
        description: "Please paste some recipe text first so I can work my magic! 🪄",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('Starting recipe parsing...');
    
    try {
      console.log('Calling Supabase function with text:', recipeText.substring(0, 50) + '...');
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { recipeText: recipeText.trim() }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.parsedRecipe) {
        console.error('No parsed recipe in response:', data);
        throw new Error('No recipe data received from AI');
      }

      const recipe = data.parsedRecipe;
      console.log('Parsed recipe:', recipe);
      
      // Ensure all required fields are present
      const formattedRecipe = {
        title: recipe.title || "Untitled Recipe",
        description: recipe.description || "",
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        categories: Array.isArray(recipe.categories) ? recipe.categories : [],
        prepTime: Number(recipe.prepTime) || 0,
        cookTime: Number(recipe.cookTime) || 0,
        servings: Number(recipe.servings) || 1,
        image: undefined,
        isFavorite: false,
      };

      setParsedRecipe(formattedRecipe);
      setShowPreview(true);

      toast({
        title: "✨ Recipe magic complete!",
        description: "I've extracted all the good stuff from your recipe. Take a look and make any tweaks you'd like!",
      });

    } catch (error) {
      console.error('Error parsing recipe:', error);
      toast({
        title: "Hmm, something went wrong",
        description: error.message?.includes('API key') 
          ? "It looks like there's an issue with the AI service. Please try again in a moment."
          : "I had trouble understanding that recipe. Could you try pasting it again or check if it's formatted clearly?",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!parsedRecipe) return;
    
    onSave(parsedRecipe);
    handleClose();
  };

  const handleClose = () => {
    setRecipeText("");
    setParsedRecipe(null);
    setShowPreview(false);
    onOpenChange(false);
  };

  const updateParsedRecipe = (field: string, value: any) => {
    if (!parsedRecipe) return;
    setParsedRecipe({
      ...parsedRecipe,
      [field]: value
    });
  };

  const availableCategories: RecipeCategory[] = [
    "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish",
    "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ",
    "Faffy", "Pricey!", "Not Yet Made", "Snacks", "Breakfast"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-terracotta" />
            ✨ AI Recipe Magic
          </DialogTitle>
        </DialogHeader>

        {!showPreview ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Got a recipe to share? Just paste it here! 📝
              </label>
              <textarea
                value={recipeText}
                onChange={(e) => setRecipeText(e.target.value)}
                placeholder="Paste any recipe here - from a website, cookbook, handwritten note, even that crumpled paper from grandma! I'll magically organize it into ingredients, steps, and all the good stuff. ✨"
                className="w-full h-64 p-3 border rounded-md resize-none"
              />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
              <Circle className="h-4 w-4 text-blue-500" />
              <span>I'll automatically extract the title, ingredients, cooking steps, and even suggest helpful categories for you!</span>
            </div>
          </div>
        ) : parsedRecipe ? (
          <div className="space-y-4">
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-sm text-green-700 font-medium">🎉 Recipe parsed successfully! Everything looks good, but feel free to make any adjustments:</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={parsedRecipe.title}
                    onChange={(e) => updateParsedRecipe('title', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={parsedRecipe.description}
                    onChange={(e) => updateParsedRecipe('description', e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prep (min)</label>
                    <input
                      type="number"
                      value={parsedRecipe.prepTime}
                      onChange={(e) => updateParsedRecipe('prepTime', Number(e.target.value))}
                      className="w-full p-2 border rounded"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cook (min)</label>
                    <input
                      type="number"
                      value={parsedRecipe.cookTime}
                      onChange={(e) => updateParsedRecipe('cookTime', Number(e.target.value))}
                      className="w-full p-2 border rounded"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Servings</label>
                    <input
                      type="number"
                      value={parsedRecipe.servings}
                      onChange={(e) => updateParsedRecipe('servings', Number(e.target.value))}
                      className="w-full p-2 border rounded"
                      min={1}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categories</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {parsedRecipe.categories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center gap-1 bg-sage/20 text-sage rounded-full px-2 py-1 text-xs cursor-pointer hover:bg-red-100"
                        onClick={() => updateParsedRecipe('categories', parsedRecipe.categories.filter(c => c !== category))}
                      >
                        {category} ×
                      </span>
                    ))}
                  </div>
                  <select
                    onChange={(e) => {
                      const category = e.target.value as RecipeCategory;
                      if (category && !parsedRecipe.categories.includes(category)) {
                        updateParsedRecipe('categories', [...parsedRecipe.categories, category]);
                      }
                    }}
                    value=""
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Add category...</option>
                    {availableCategories.filter(cat => !parsedRecipe.categories.includes(cat)).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ingredients ({parsedRecipe.ingredients.length})</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto border rounded p-2">
                    {parsedRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="text-sm">• {ingredient}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Instructions ({parsedRecipe.instructions.length} steps)</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                    {parsedRecipe.instructions.map((instruction, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-sage">{index + 1}.</span> {instruction}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          
          {!showPreview ? (
            <Button 
              onClick={handleParseRecipe} 
              disabled={isLoading || !recipeText.trim()}
              className="bg-terracotta hover:bg-terracotta/90"
            >
              {isLoading ? (
                <>
                  <Circle className="h-4 w-4 mr-2 animate-spin" />
                  Working my magic...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  ✨ Parse with AI
                </>
              )}
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(false)}
              >
                ← Edit Text
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-terracotta hover:bg-terracotta/90"
              >
                Save Recipe
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
