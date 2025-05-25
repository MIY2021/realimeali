import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Recipe, RecipeCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, X, Camera, Upload, Globe, Sparkles, PenTool } from "lucide-react";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

// Available categories - fixed to match exact RecipeCategory type
const AVAILABLE_CATEGORIES: RecipeCategory[] = [
  "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish",
  "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ",
  "Faffy", "Pricey!", "Not Yet Made", "Snacks", "Breakfast"
];

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

  const handleProcessText = async () => {
    if (!recipeText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some recipe text first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implement recipe text parsing
      toast({
        title: "Coming Soon",
        description: "Recipe text processing will be implemented soon!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process recipe text",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportFromUrl = async () => {
    if (!recipeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a website URL first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implement URL import
      toast({
        title: "Coming Soon",
        description: "Website import will be implemented soon!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import from website",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessImage = async (file: File) => {
    setIsProcessing(true);
    try {
      // TODO: Implement image processing
      toast({
        title: "Coming Soon",
        description: "Recipe image extraction will be implemented soon!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract recipe from image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateRecipe = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe what kind of recipe you want",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implement AI recipe generation
      toast({
        title: "Coming Soon",
        description: "AI recipe generation will be implemented soon!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate recipe",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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

  const tabOptions = [
    { value: "text", label: "Recipe Text", icon: PenTool },
    { value: "url", label: "From Website", icon: Globe },
    { value: "image", label: "From Photo", icon: Upload },
    { value: "generate", label: "AI Generate", icon: Sparkles },
    { value: "manual", label: "Manual Entry", icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <div className="container max-w-4xl py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleCancel} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Recipes
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-navy">Add New Recipe</h1>
            <p className="text-muted-foreground">Create a new recipe for your household</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Mobile Dropdown */}
            {isMobile ? (
              <div className="mb-6">
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {tabOptions.find(tab => tab.value === activeTab)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {tabOptions.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <SelectItem key={tab.value} value={tab.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {tab.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              /* Desktop Tabs */
              <TabsList className="grid w-full grid-cols-5 mb-6">
                {tabOptions.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger key={tab.value} value={tab.value} className="p-2">
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            )}

            <TabsContent value="text" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Paste Your Recipe</label>
                <textarea
                  value={recipeText}
                  onChange={(e) => setRecipeText(e.target.value)}
                  placeholder="Paste your recipe text here and we'll extract the ingredients and instructions for you..."
                  className="w-full h-64 p-4 border rounded-lg resize-none"
                />
              </div>
              <Button 
                onClick={handleProcessText} 
                disabled={isProcessing || !recipeText.trim()}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Extract Recipe Details"}
              </Button>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Recipe Website URL</label>
                <input
                  type="url"
                  value={recipeUrl}
                  onChange={(e) => setRecipeUrl(e.target.value)}
                  placeholder="https://example.com/recipe"
                  className="w-full p-4 border rounded-lg"
                />
              </div>
              <Button 
                onClick={handleImportFromUrl} 
                disabled={isProcessing || !recipeUrl.trim()}
                className="w-full"
              >
                {isProcessing ? "Importing..." : "Import from Website"}
              </Button>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Recipe Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleProcessImage(file);
                    }
                  }}
                  className="w-full p-4 border rounded-lg"
                />
              </div>
              <Button 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? "Extracting..." : "Choose Photo to Extract Recipe"}
              </Button>
            </TabsContent>

            <TabsContent value="generate" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Describe Your Recipe</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Tell us what kind of recipe you want to create - ingredients you have, cuisine type, dietary requirements, etc..."
                  className="w-full h-32 p-4 border rounded-lg resize-none"
                />
              </div>
              <Button 
                onClick={handleGenerateRecipe} 
                disabled={isProcessing || !aiPrompt.trim()}
                className="w-full"
              >
                {isProcessing ? "Generating..." : "Create Recipe with AI"}
              </Button>
            </TabsContent>

            <TabsContent value="manual" className="space-y-6">
              <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Recipe Title</label>
                    <input
                      type="text"
                      value={newRecipe.title}
                      onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                      placeholder="What's this delicious dish called?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={newRecipe.description}
                      onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                      className="w-full p-3 border rounded-lg"
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
                        className="w-full p-3 border rounded-lg"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cook (min)</label>
                      <input
                        type="number"
                        value={newRecipe.cookTime}
                        onChange={(e) => setNewRecipe({ ...newRecipe, cookTime: Number(e.target.value) })}
                        className="w-full p-3 border rounded-lg"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Serves</label>
                      <input
                        type="number"
                        value={newRecipe.servings}
                        onChange={(e) => setNewRecipe({ ...newRecipe, servings: Number(e.target.value) })}
                        className="w-full p-3 border rounded-lg"
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
                        className="w-full p-3 border rounded-lg"
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage || !newRecipe.title.trim()}
                        className="w-full"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {isGeneratingImage ? "Creating image..." : "Generate AI Photo"}
                      </Button>
                      {imagePreview && (
                        <img src={imagePreview} alt="Recipe preview" className="w-full h-48 object-cover rounded-lg border" />
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
                        className="flex-1 p-3 border rounded-lg"
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
                      <Button onClick={handleAddCategory} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ingredients</label>
                    <div className="space-y-3">
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {newRecipe.ingredients.map((ingredient, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="text-sm flex-1">{ingredient}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveIngredient(index)}
                              className="text-red-500 h-8 w-8 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newIngredient}
                          onChange={(e) => setNewIngredient(e.target.value)}
                          placeholder="Add an ingredient..."
                          className="flex-1 p-3 border rounded-lg"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddIngredient();
                            }
                          }}
                        />
                        <Button onClick={handleAddIngredient} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cooking Steps</label>
                    <div className="space-y-3">
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {newRecipe.instructions.map((instruction, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
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
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <textarea
                          value={newInstruction}
                          onChange={(e) => setNewInstruction(e.target.value)}
                          placeholder="Add a cooking step..."
                          className="flex-1 p-3 border rounded-lg"
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
                      <p className="text-xs text-muted-foreground">
                        Press Ctrl+Enter to add step
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-3 mt-6 ${isMobile ? 'flex-col' : 'justify-end'}`}>
          <Button variant="outline" onClick={handleCancel} className={isMobile ? "w-full" : ""}>
            Cancel
          </Button>
          <Button onClick={handleSave} className={isMobile ? "w-full" : ""}>
            Create Recipe
          </Button>
        </div>
      </div>
    </div>
  );
}
