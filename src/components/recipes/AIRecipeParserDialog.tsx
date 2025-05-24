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
import { Circle, Plus, X, Upload, Link, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AIRecipeParserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

export function AIRecipeParserDialog({ open, onOpenChange, onSave }: AIRecipeParserDialogProps) {
  const { toast } = useToast();
  const [recipeText, setRecipeText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [parsedRecipe, setParsedRecipe] = useState<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("text");

  const handleExtractRecipe = async () => {
    if (activeTab === "text" && !recipeText.trim()) {
      toast({
        title: "Oops!",
        description: "Please add some recipe text first so I can work my magic! 🪄",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "url" && !imageUrl.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter an image URL first! 📸",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "upload" && !imageFile) {
      toast({
        title: "No image selected",
        description: "Please select an image file to upload! 📁",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('🚀 Starting recipe extraction...');
    
    try {
      let requestData: any = {};

      if (activeTab === "text") {
        requestData.recipeText = recipeText.trim();
      } else if (activeTab === "url") {
        requestData.imageUrl = imageUrl.trim();
      } else if (activeTab === "upload" && imageFile) {
        // Convert file to base64 data URL
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        requestData.imageUrl = await base64Promise;
      }

      console.log('📤 Sending request to AI service...');
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: requestData
      });

      console.log('📥 Response received:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.parsedRecipe) {
        console.error('No recipe data in response:', data);
        throw new Error('No recipe information was extracted. Please try with clearer text or image.');
      }

      const recipe = data.parsedRecipe;
      console.log('✅ Recipe extracted successfully:', recipe.title);
      
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
        title: "🎉 Recipe magic complete!",
        description: "I've extracted all the delicious details! Take a look and adjust anything you'd like.",
      });

    } catch (error) {
      console.error('💥 Error extracting recipe:', error);
      const errorMessage = error.message;
      
      if (errorMessage?.includes('API key')) {
        toast({
          title: "Setup needed",
          description: "The AI service needs to be configured. Please check your API settings.",
          variant: "destructive",
        });
      } else if (errorMessage?.includes('Invalid response') || errorMessage?.includes('parse')) {
        toast({
          title: "Hmm, that didn't work",
          description: "I had trouble understanding that content. Could you try with clearer text or a different image?",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Something went wrong",
          description: errorMessage || "Please try again in a moment!",
          variant: "destructive",
        });
      }
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
    setImageUrl("");
    setImageFile(null);
    setParsedRecipe(null);
    setShowPreview(false);
    setActiveTab("text");
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
              <p className="text-sm text-muted-foreground mb-4">
                Got a recipe to organize? I can help! Just paste some text, share an image URL, or upload a photo. 
                I'll extract all the ingredients, steps, and details for you! 🍳
              </p>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Image URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-2">
                  <Label htmlFor="recipe-text">Recipe Text</Label>
                  <textarea
                    id="recipe-text"
                    value={recipeText}
                    onChange={(e) => setRecipeText(e.target.value)}
                    placeholder="Paste any recipe here! From a website, cookbook, handwritten note, or even that crumpled paper from grandma. I'll organize it beautifully! ✨"
                    className="w-full h-64 p-3 border rounded-md resize-none"
                  />
                </TabsContent>
                
                <TabsContent value="url" className="space-y-2">
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input
                    id="image-url"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/recipe-image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    I can read recipes from images! Just paste a URL to any recipe photo or screenshot.
                  </p>
                </TabsContent>
                
                <TabsContent value="upload" className="space-y-2">
                  <Label htmlFor="image-file">Upload Recipe Image</Label>
                  <Input
                    id="image-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  {imageFile && (
                    <p className="text-sm text-green-600">📁 {imageFile.name} selected</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload a photo of a recipe from a cookbook, screen, or handwritten note!
                  </p>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
              <Circle className="h-4 w-4 text-blue-500" />
              <span>I'll automatically extract the title, ingredients, cooking steps, and even suggest helpful categories!</span>
            </div>
          </div>
        ) : parsedRecipe ? (
          <div className="space-y-4">
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-sm text-green-700 font-medium">🎉 Recipe extracted successfully! Everything looks good, but feel free to make any adjustments:</p>
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
              onClick={handleExtractRecipe} 
              disabled={isLoading || (activeTab === "text" && !recipeText.trim()) || (activeTab === "url" && !imageUrl.trim()) || (activeTab === "upload" && !imageFile)}
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
                  ✨ Extract Recipe
                </>
              )}
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(false)}
              >
                ← Back to Input
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
