import { useState } from "react";
import { Recipe, RecipeCategory } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, X, Camera } from "lucide-react";
import { RecipeGenerateTab } from "./dialog/RecipeGenerateTab";
import { RecipeTextTab } from "./dialog/RecipeTextTab";
import { RecipeUrlTab } from "./dialog/RecipeUrlTab";
import { RecipeUploadTab } from "./dialog/RecipeUploadTab";
import { RecipeManualTab } from "./dialog/RecipeManualTab";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface CreateRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

// List of available categories - fixed to match exact RecipeCategory type
const AVAILABLE_CATEGORIES: RecipeCategory[] = [
  "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish",
  "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ",
  "Faffy", "Pricey!", "Not Yet Made", "Snacks", "Breakfast"
];

export function CreateRecipeDialog({ open, onOpenChange, onSave }: CreateRecipeDialogProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
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
  const [recipeText, setRecipeText] = useState("");
  const [recipeRequest, setRecipeRequest] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const resetForm = () => {
    setNewRecipe({
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
    setNewCategory("");
    setNewIngredient("");
    setNewInstruction("");
    setImagePreview(null);
    setRecipeText("");
    setRecipeRequest("");
    setRecipeUrl("");
    setUploadedImageFile(null);
    setIsGeneratingImage(false);
  };

  const handleSave = () => {
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

    onSave(newRecipe);
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`
        ${isMobile 
          ? 'w-[100vw] h-[100vh] max-w-none rounded-none p-4' 
          : 'sm:max-w-4xl h-[85vh] w-full'
        } 
        overflow-hidden flex flex-col
      `}>
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-xl font-bold">✨ Add New Recipe ✨</DialogTitle>
          <p className="text-muted-foreground text-sm">
            Add recipes to your collection from a variety of sources
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="text" className="w-full h-full flex flex-col">
            <TabsList className={`
              grid w-full grid-cols-5 flex-shrink-0 mb-4
              ${isMobile ? 'h-auto text-xs' : 'h-auto text-sm'}
            `}>
              <TabsTrigger value="text" className={isMobile ? "px-1 py-2 text-xs" : "px-3 py-2"}>
                {isMobile ? "📝 Text" : "📝 Recipe Text"}
              </TabsTrigger>
              <TabsTrigger value="url" className={isMobile ? "px-1 py-2 text-xs" : "px-3 py-2"}>
                {isMobile ? "🔗 URL" : "🔗 From URL"}
              </TabsTrigger>
              <TabsTrigger value="image" className={isMobile ? "px-1 py-2 text-xs" : "px-3 py-2"}>
                {isMobile ? "📷 Photo" : "📷 From Image"}
              </TabsTrigger>
              <TabsTrigger value="generate" className={isMobile ? "px-1 py-2 text-xs" : "px-3 py-2"}>
                {isMobile ? "🤖 AI" : "🤖 AI Generate"}
              </TabsTrigger>
              <TabsTrigger value="manual" className={isMobile ? "px-1 py-2 text-xs" : "px-3 py-2"}>
                {isMobile ? "⭐ Manual" : "⭐ Manual Entry"}
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="text" className="space-y-4 h-full flex flex-col m-0">
                <RecipeTextTab recipeText={recipeText} setRecipeText={setRecipeText} />
                <div className={`
                  flex gap-2 mt-auto pt-4 border-t bg-white sticky bottom-0
                  ${isMobile ? 'flex-col' : 'flex-row justify-end'}
                `}>
                  <Button variant="outline" onClick={handleCancel} className={isMobile ? "w-full" : ""}>
                    Cancel
                  </Button>
                  <Button className={isMobile ? "w-full" : ""}>Import Recipe</Button>
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4 h-full flex flex-col m-0">
                <RecipeUrlTab websiteUrl={recipeUrl} setWebsiteUrl={setRecipeUrl} />
                <div className={`
                  flex gap-2 mt-auto pt-4 border-t bg-white sticky bottom-0
                  ${isMobile ? 'flex-col' : 'flex-row justify-end'}
                `}>
                  <Button variant="outline" onClick={handleCancel} className={isMobile ? "w-full" : ""}>
                    Cancel
                  </Button>
                  <Button className={isMobile ? "w-full" : ""}>Import Recipe</Button>
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4 h-full flex flex-col m-0">
                <RecipeUploadTab uploadedImageFile={null} setUploadedImageFile={() => {}} />
                <div className={`
                  flex gap-2 mt-auto pt-4 border-t bg-white sticky bottom-0
                  ${isMobile ? 'flex-col' : 'flex-row justify-end'}
                `}>
                  <Button variant="outline" onClick={handleCancel} className={isMobile ? "w-full" : ""}>
                    Cancel
                  </Button>
                  <Button className={isMobile ? "w-full" : ""}>Import Recipe</Button>
                </div>
              </TabsContent>

              <TabsContent value="generate" className="space-y-4 h-full flex flex-col m-0">
                <RecipeGenerateTab 
                  recipeRequest={recipeRequest} 
                  setRecipeRequest={setRecipeRequest} 
                />
                <div className={`
                  flex gap-2 mt-auto pt-4 border-t bg-white sticky bottom-0
                  ${isMobile ? 'flex-col' : 'flex-row justify-end'}
                `}>
                  <Button variant="outline" onClick={handleCancel} className={isMobile ? "w-full" : ""}>
                    Cancel
                  </Button>
                  <Button className={isMobile ? "w-full" : ""}>Generate Recipe</Button>
                </div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-6 h-full pb-20 m-0">
                <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Recipe Title</label>
                      <input
                        type="text"
                        value={newRecipe.title}
                        onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                        className={`w-full p-3 border rounded-lg ${isMobile ? 'text-base' : 'text-sm'}`}
                        placeholder="What's this delicious dish called?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={newRecipe.description}
                        onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                        className={`w-full p-3 border rounded-lg ${isMobile ? 'text-base' : 'text-sm'}`}
                        rows={3}
                        placeholder="Tell us about this recipe..."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Prep (min)</label>
                        <input
                          type="number"
                          value={newRecipe.prepTime}
                          onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: Number(e.target.value) })}
                          className={`w-full p-3 border rounded-lg ${isMobile ? 'text-base' : 'text-sm'}`}
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Cook (min)</label>
                        <input
                          type="number"
                          value={newRecipe.cookTime}
                          onChange={(e) => setNewRecipe({ ...newRecipe, cookTime: Number(e.target.value) })}
                          className={`w-full p-3 border rounded-lg ${isMobile ? 'text-base' : 'text-sm'}`}
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Serves</label>
                        <input
                          type="number"
                          value={newRecipe.servings}
                          onChange={(e) => setNewRecipe({ ...newRecipe, servings: Number(e.target.value) })}
                          className={`w-full p-3 border rounded-lg ${isMobile ? 'text-base' : 'text-sm'}`}
                          min={1}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Recipe Photo</label>
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className={`w-full p-3 border rounded-lg ${isMobile ? 'text-base' : 'text-sm'}`}
                        />
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={handleGenerateImage}
                          disabled={isGeneratingImage || !newRecipe.title.trim()}
                          className={`w-full ${isMobile ? 'h-12' : ''}`}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          {isGeneratingImage ? "Creating image..." : "Generate AI Photo"}
                        </Button>
                        {imagePreview && (
                          <img src={imagePreview} alt="Recipe preview" className="w-full h-32 object-cover rounded-lg border" />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Categories</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {newRecipe.categories.map((category) => (
                          <div
                            key={category}
                            className="inline-flex items-center gap-1 bg-sage/20 text-sage rounded-full px-3 py-1"
                          >
                            <span className="text-sm">{category}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(category)}
                              className="text-sage hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className={`flex-1 p-3 border rounded-lg ${isMobile ? 'text-base' : 'text-sm'}`}
                        >
                          <option value="">Choose a category</option>
                          {AVAILABLE_CATEGORIES.filter(
                            (cat) => !newRecipe.categories.includes(cat)
                          ).map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <Button onClick={handleAddCategory} size="sm" className={isMobile ? 'px-4' : ''}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ingredients</label>
                      <ul className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                        {newRecipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="text-sm flex-1">{ingredient}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveIngredient(index)}
                              className="text-red-500 h-8 w-8 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newIngredient}
                          onChange={(e) => setNewIngredient(e.target.value)}
                          placeholder="Add an ingredient..."
                          className={`flex-1 p-3 border rounded-lg ${isMobile ? 'text-base' : 'text-sm'}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddIngredient();
                            }
                          }}
                        />
                        <Button onClick={handleAddIngredient} size="sm" className={isMobile ? 'px-4' : ''}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Cooking Steps</label>
                      <ol className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                        {newRecipe.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-white text-sm font-medium">
                              {index + 1}
                            </span>
                            <div className="flex-1 text-sm">{instruction}</div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveInstruction(index)}
                              className="text-red-500 h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ol>
                      <div className="flex gap-2">
                        <textarea
                          value={newInstruction}
                          onChange={(e) => setNewInstruction(e.target.value)}
                          placeholder="Add a cooking step..."
                          className={`flex-1 p-3 border rounded-lg ${isMobile ? 'text-base' : 'text-sm'}`}
                          rows={2}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              e.preventDefault();
                              handleAddInstruction();
                            }
                          }}
                        />
                        <Button onClick={handleAddInstruction} size="sm" className="self-start">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isMobile ? "Tap + to add step" : "Press Ctrl+Enter to add step"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`
                  flex gap-3 pt-4 border-t sticky bottom-0 bg-white
                  ${isMobile ? 'flex-col' : 'flex-row justify-end'}
                `}>
                  <Button variant="outline" onClick={handleCancel} className={isMobile ? "w-full h-12" : ""}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className={isMobile ? "w-full h-12" : ""}>
                    Create Recipe
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
