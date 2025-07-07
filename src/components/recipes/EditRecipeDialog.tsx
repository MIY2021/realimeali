import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Recipe } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, Plus, X, Camera, Search, Loader, Eye, Check, Upload, Trash2, LayoutGrid, ArrowRight, ArrowLeft } from "lucide-react";
import { UnsplashService } from "@/services/unsplashService";
import { supabase } from "@/integrations/supabase/client";

interface UnsplashPhoto {
  id: string;
  urls: {
    thumb: string;
    small: string;
    regular: string;
    full: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
  };
  alt_description?: string;
}

interface EditRecipeDialogProps {
  recipe: Recipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecipeUpdate: (recipe: Recipe) => void;
}

export function EditRecipeDialog({
  recipe,
  open,
  onOpenChange,
  onRecipeUpdate,
}: EditRecipeDialogProps) {
  const [editedRecipe, setEditedRecipe] = useState<Recipe>(recipe);
  const [newIngredient, setNewIngredient] = useState("");
  const [newInstruction, setNewInstruction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  
  // Image editing state
  const [activeImageTab, setActiveImageTab] = useState("ai");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiProgress, setAiProgress] = useState("");
  const [progressValue, setProgressValue] = useState(0);
  
  // Unsplash state
  const [searchQuery, setSearchQuery] = useState("");
  const [unsplashPhotos, setUnsplashPhotos] = useState<UnsplashPhoto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<UnsplashPhoto | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setEditedRecipe(recipe);
  }, [recipe]);

  const isHeader = (ingredient: string) => {
    return ingredient.trim().endsWith(':') && !ingredient.match(/\d+.*:/);
  };

  const convertToGroup = (index: number) => {
    const ingredient = editedRecipe.ingredients[index];
    const groupHeader = ingredient.trim().endsWith(':') ? ingredient.trim() : `${ingredient.trim()}:`;
    
    const newIngredients = [...editedRecipe.ingredients];
    newIngredients[index] = groupHeader;
    
    setEditedRecipe({
      ...editedRecipe,
      ingredients: newIngredients,
    });

    toast({
      title: "Converted to Group",
      description: "Ingredient converted to group header successfully!",
    });
  };

  const convertToIngredient = (index: number) => {
    const groupHeader = editedRecipe.ingredients[index];
    const ingredient = groupHeader.replace(/(:|\.)$/, '').trim();
    
    const newIngredients = [...editedRecipe.ingredients];
    newIngredients[index] = ingredient;
    
    setEditedRecipe({
      ...editedRecipe,
      ingredients: newIngredients,
    });

    toast({
      title: "Converted to Ingredient",
      description: "Group header converted to ingredient successfully!",
    });
  };

  const generateEnhancedPrompt = (recipeName: string, ingredients: string[], instructions: string[], description?: string) => {
    const basePrompt = `A photorealistic, professionally styled cookbook photo of ${recipeName}. The dish is the clear focal point, beautifully plated and shot in a natural home or studio kitchen setting with soft, diffused lighting. The background is clean and minimal, such as wood, marble, linen or slate — subtle and textured but not distracting.

Adjust styling based on the food type:

• **Hearty mains (curries, pasta, stews, rice bowls, roasts):** Presented in a shallow ceramic bowl or rimmed plate, slightly cropped at the edge of the frame. Shot at a 45-degree or overhead angle. Ingredients look fresh, moist, and steaming hot if appropriate. Include subtle garnishes like herbs, lemon wedges, or a spoon.

• **Sandwiches, burgers, wraps:** Shown whole and slightly angled on a rustic board or plate. Use a side angle or close-up 3/4 profile to highlight layers (e.g., fillings, melted cheese, crusty bread). Include crumbs, paper wrapping, or pickle garnish nearby. Background should be soft-focus kitchen wood or linen.

• **Soups and broths:** Served in a deep bowl, with toppings or a drizzle (e.g., cream swirl, croutons, herbs). Shot directly overhead or at a slight 30–45° angle. Spoon and napkin optional at the edge of frame.

• **Salads:** Shot overhead to show color, composition and variety of ingredients. Served in a wide shallow bowl with visible textures — crunchy leaves, shiny dressings, and sprinkled seeds or herbs.

• **Desserts (cakes, brownies, tarts, puddings):** Beautifully styled single portions on a neutral plate, with crumbs, dusted sugar, or fruit garnish. Shot at a 45-degree angle or macro close-up to highlight texture (e.g. gooey centre, flaky crust). Warm, soft lighting enhances richness.

• **Breakfasts (pancakes, eggs, porridge):** Cozy, morning-style setting with natural light. Show stack height or texture up close (e.g. syrup pouring). Angle varies by dish — top-down for porridge or flatlays, 45° for eggs on toast.

• **Drinks (coffee, smoothies, cocktails):** Served in an appropriate glass or mug. Capture light reflecting through the drink. Use close-up or side-profile, with optional props like a napkin, straw, or garnish.

Image composition:
- The food should fill most of the frame, often with part of the bowl/plate cropped artistically.
- Depth of field should highlight the food, blurring the background naturally.
- No filters, no artificial gloss — just clean, vibrant, real-looking food.
- Styled like a modern, minimal high-end food magazine or cookbook.
- Keep lighting bright and airy, avoiding dark or moody tones.

Lighting: natural daylight style or softbox imitation — bright but soft shadows. Colors are natural, slightly warm, never oversaturated.`;

    let contextualPrompt = basePrompt;
    
    if (description && description.trim()) {
      contextualPrompt += `\n\nRecipe context: ${description.trim()}`;
    }
    
    if (ingredients && ingredients.length > 0) {
      const mainIngredients = ingredients.slice(0, 6).join(', ');
      contextualPrompt += `\n\nKey ingredients visible in the dish: ${mainIngredients}`;
    }
    
    if (instructions && instructions.length > 0) {
      const cookingMethod = instructions[0];
      contextualPrompt += `\n\nCooking method context: ${cookingMethod}`;
    }
    
    return contextualPrompt;
  };

  const handleAIGeneration = async () => {
    setIsGeneratingAI(true);
    setProgressValue(0);
    
    try {
      const messages = [
        "🎨 Preparing AI generation...",
        "📋 Analyzing recipe details...",
        "🧄 Processing ingredients...",
        "👨‍🍳 Understanding cooking method...",
        "🖼️ Creating detailed prompt...",
        "📸 Generating light, professional image...",
        "⚡ Optimizing for web performance...",
        "✨ Finalizing composition..."
      ];
      
      let messageIndex = 0;
      const progressInterval = setInterval(() => {
        if (messageIndex < messages.length) {
          setAiProgress(messages[messageIndex]);
          setProgressValue((messageIndex + 1) * (100 / messages.length));
          messageIndex++;
        }
      }, 1200); // Slower animation - changed from 700ms to 1200ms

      // Use simple prompt without custom styling
      const simplePrompt = `A high-quality, professional photo of ${editedRecipe.title}`;
      
      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { 
          prompt: simplePrompt
        },
      });

      clearInterval(progressInterval);

      if (error) throw error;
      if (!data?.imageUrl) throw new Error('No image received from AI generation');

      setAiProgress("✅ Light, professional image generated!");
      setProgressValue(100);
      
      setEditedRecipe(prev => ({ ...prev, image: data.imageUrl }));
      
      toast({
        title: "Image Generated!",
        description: "Professional recipe image created!",
      });

      setTimeout(() => {
        setAiProgress("");
        setProgressValue(0);
      }, 1500);

    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleUnsplashSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await UnsplashService.searchPhotos(searchQuery, 1, 12);
      if (response.error) {
        toast({
          title: "Search Failed",
          description: response.error,
          variant: "destructive",
        });
        return;
      }
      setUnsplashPhotos(response.results);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePhotoPreview = (photo: UnsplashPhoto) => {
    setSelectedPhoto(photo);
    setShowPreview(true);
  };

  const handleConfirmUnsplash = () => {
    if (selectedPhoto) {
      setEditedRecipe(prev => ({ ...prev, image: selectedPhoto.urls.regular }));
      toast({
        title: "Image Updated!",
        description: `Image by ${selectedPhoto.user.name} from Unsplash applied to your recipe.`,
      });
      setShowPreview(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB for performance)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB for optimal performance.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEditedRecipe(prev => ({ ...prev, image: result }));
        toast({
          title: "Image Uploaded!",
          description: "Your custom image has been applied to the recipe.",
        });
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setEditedRecipe(prev => ({ ...prev, image: undefined }));
    setSelectedFile(null);
    toast({
      title: "Image Removed",
      description: "Recipe image has been removed.",
    });
  };

  const handleSave = async () => {
    if (!editedRecipe.title.trim()) {
      toast({
        title: "Error",
        description: "Recipe title is required",
        variant: "destructive",
      });
      return;
    }

    if (editedRecipe.ingredients.length === 0) {
      toast({
        title: "Error",
        description: "At least one ingredient is required",
        variant: "destructive",
      });
      return;
    }

    if (editedRecipe.instructions.length === 0) {
      toast({
        title: "Error",
        description: "At least one instruction is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onRecipeUpdate(editedRecipe);
      toast({
        title: "Success",
        description: "Recipe updated successfully!",
      });
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Error",
        description: "Failed to update recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setEditedRecipe({
        ...editedRecipe,
        ingredients: [...editedRecipe.ingredients, newIngredient.trim()],
      });
      setNewIngredient("");
    }
  };

  const addGroup = () => {
    if (newGroup.trim()) {
      const groupHeader = newGroup.trim().endsWith(':') ? newGroup.trim() : `${newGroup.trim()}:`;
      setEditedRecipe({
        ...editedRecipe,
        ingredients: [...editedRecipe.ingredients, groupHeader],
      });
      setNewGroup("");
      setIsAddingGroup(false);
    }
  };

  const removeIngredient = (index: number) => {
    setEditedRecipe({
      ...editedRecipe,
      ingredients: editedRecipe.ingredients.filter((_, i) => i !== index),
    });
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...editedRecipe.ingredients];
    newIngredients[index] = value;
    setEditedRecipe({
      ...editedRecipe,
      ingredients: newIngredients,
    });
  };

  const addInstruction = () => {
    if (newInstruction.trim()) {
      setEditedRecipe({
        ...editedRecipe,
        instructions: [...editedRecipe.instructions, newInstruction.trim()],
      });
      setNewInstruction("");
    }
  };

  const removeInstruction = (index: number) => {
    setEditedRecipe({
      ...editedRecipe,
      instructions: editedRecipe.instructions.filter((_, i) => i !== index),
    });
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...editedRecipe.instructions];
    newInstructions[index] = value;
    setEditedRecipe({
      ...editedRecipe,
      instructions: newInstructions,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Recipe</DialogTitle>
            <DialogDescription>
              Make changes to your recipe. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Image Editing Section */}
            <div className="grid gap-2">
              <Label className="text-base font-medium">Recipe Image</Label>
              
              {/* Current Image Preview */}
              {editedRecipe.image && (
                <div className="relative">
                  <img
                    src={editedRecipe.image}
                    alt={editedRecipe.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    onClick={handleRemoveImage}
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Tabs value={activeImageTab} onValueChange={setActiveImageTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ai">AI Generation</TabsTrigger>
                  <TabsTrigger value="unsplash">Unsplash</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>

                <TabsContent value="ai" className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Generate a professional photo of your recipe.
                  </p>
                  
                  {isGeneratingAI && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Generating image...</span>
                        <span className="text-sm text-muted-foreground">{Math.round(progressValue)}%</span>
                      </div>
                      <Progress value={progressValue} className="w-full" />
                      {aiProgress && (
                        <p className="text-sm text-blue-600">{aiProgress}</p>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={handleAIGeneration}
                    disabled={isGeneratingAI}
                    className="w-full"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Generating Professional Image...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Generate Professional Image
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="unsplash" className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search for food images..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUnsplashSearch()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleUnsplashSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      variant="outline"
                    >
                      {isSearching ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {unsplashPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                      {unsplashPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="relative cursor-pointer border rounded-lg overflow-hidden hover:border-blue-500 transition-colors group"
                          onClick={() => handlePhotoPreview(photo)}
                        >
                          <img
                            src={photo.urls.thumb}
                            alt={photo.alt_description || 'Food photo'}
                            className="w-full h-20 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="upload" className="space-y-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full"
                  />
                  {selectedFile && (
                    <div className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
                    </div>
                  )}
                  <Button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedRecipe.title}
                onChange={(e) =>
                  setEditedRecipe({ ...editedRecipe, title: e.target.value })
                }
                placeholder="Recipe title"
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedRecipe.description}
                onChange={(e) =>
                  setEditedRecipe({ ...editedRecipe, description: e.target.value })
                }
                placeholder="Brief description of your recipe"
                className="min-h-[80px]"
              />
            </div>

            {/* Top Tip */}
            <div className="grid gap-2">
              <Label htmlFor="top-tip">Chef's Top Tip</Label>
              <Textarea
                id="top-tip"
                value={editedRecipe.top_tip || ""}
                onChange={(e) =>
                  setEditedRecipe({ ...editedRecipe, top_tip: e.target.value })
                }
                placeholder="Share your best tip for making this recipe (optional)"
                className="min-h-[60px]"
                rows={2}
              />
            </div>

            {/* Recipe Details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prepTime">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Prep Time (min)
                </Label>
                <Input
                  id="prepTime"
                  type="number"
                  value={editedRecipe.prep_time || ""}
                  onChange={(e) =>
                    setEditedRecipe({
                      ...editedRecipe,
                      prep_time: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cookTime">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Cook Time (min)
                </Label>
                <Input
                  id="cookTime"
                  type="number"
                  value={editedRecipe.cook_time || ""}
                  onChange={(e) =>
                    setEditedRecipe({
                      ...editedRecipe,
                      cook_time: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="servings">
                  <Users className="h-4 w-4 inline mr-1" />
                  Servings
                </Label>
                <Input
                  id="servings"
                  type="number"
                  value={editedRecipe.servings || ""}
                  onChange={(e) =>
                    setEditedRecipe({
                      ...editedRecipe,
                      servings: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                />
              </div>
            </div>

            {/* Ingredients */}
            <div className="grid gap-2">
              <Label>Ingredients</Label>
              <div className="space-y-2">
                {editedRecipe.ingredients.map((ingredient, index) => {
                  const ingredientIsHeader = isHeader(ingredient);
                  
                  return (
                    <div key={index} className={`flex items-center gap-2 ${
                      ingredientIsHeader 
                        ? 'bg-sage-100 p-4 rounded-lg border-l-4 border-sage-500 shadow-sm' 
                        : 'bg-white p-2 rounded-lg border border-gray-200'
                    }`}>
                      {ingredientIsHeader ? (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-sage-600 font-bold text-lg">▷</div>
                          <Badge variant="secondary" className="bg-sage-200 text-sage-800 font-medium">
                            GROUP
                          </Badge>
                        </div>
                      ) : (
                        <div className="w-2 h-2 bg-gray-300 rounded-full flex-shrink-0 ml-2"></div>
                      )}
                      
                      <Input
                        value={ingredient}
                        onChange={(e) => updateIngredient(index, e.target.value)}
                        className={`flex-1 ${
                          ingredientIsHeader 
                            ? 'border-sage-300 bg-sage-50/50 font-medium text-sage-900' 
                            : 'border-gray-200'
                        }`}
                        placeholder={
                          ingredientIsHeader 
                            ? "Group name (e.g., 'For the sauce')" 
                            : "Ingredient (e.g., '2 cups flour')"
                        }
                      />
                      
                      <div className="flex gap-1 flex-shrink-0">
                        {ingredientIsHeader ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => convertToIngredient(index)}
                            className="text-sage-600 border-sage-300 hover:bg-sage-50"
                            title="Convert to regular ingredient"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => convertToGroup(index)}
                            className="text-sage-600 border-sage-300 hover:bg-sage-50"
                            title="Convert to group header"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeIngredient(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                {/* Add Group Input */}
                {isAddingGroup ? (
                  <div className="space-y-2 bg-sage-50 p-4 rounded-lg border-2 border-sage-200 border-dashed">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-sage-600 font-bold text-lg">▷</div>
                      <Badge variant="secondary" className="bg-sage-200 text-sage-800 font-medium">
                        NEW GROUP
                      </Badge>
                    </div>
                    <Input
                      value={newGroup}
                      onChange={(e) => setNewGroup(e.target.value)}
                      placeholder="Group name (e.g., 'For the sauce', 'Marinade ingredients')"
                      onKeyPress={(e) => handleKeyPress(e, addGroup)}
                      autoFocus
                      className="border-sage-300 bg-white"
                    />
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        onClick={addGroup} 
                        disabled={!newGroup.trim()}
                        size="sm"
                        className="bg-sage-600 hover:bg-sage-700 text-white"
                      >
                        <LayoutGrid className="h-4 w-4 mr-1" />
                        Add Group
                      </Button>
                      <Button 
                        type="button"
                        onClick={() => {
                          setIsAddingGroup(false);
                          setNewGroup("");
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Regular ingredient input */}
                    <div className="flex gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-2 h-2 bg-gray-300 rounded-full flex-shrink-0 mt-3 ml-2"></div>
                      <Input
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                        placeholder="Add new ingredient (e.g., '2 cups flour', '1 tbsp olive oil')"
                        onKeyPress={(e) => e.key === "Enter" && addIngredient()}
                        className="flex-1 border-gray-200"
                      />
                      <Button type="button" onClick={addIngredient} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Add Group Button */}
                    <Button 
                      type="button"
                      onClick={() => setIsAddingGroup(true)}
                      variant="outline"
                      size="sm"
                      className="w-full border-sage-300 text-sage-700 hover:bg-sage-50 hover:text-sage-800 border-2 border-dashed"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Ingredient Group
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="grid gap-2">
              <Label>Instructions</Label>
              <div className="space-y-2">
                {editedRecipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="flex-1 min-h-[60px]"
                      placeholder="Enter instruction"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeInstruction(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Textarea
                    value={newInstruction}
                    onChange={(e) => setNewInstruction(e.target.value)}
                    placeholder="Add new instruction"
                    className="min-h-[60px]"
                  />
                  <Button type="button" onClick={addInstruction} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Recipe"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsplash Preview Dialog */}
      {showPreview && selectedPhoto && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Preview Image</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedPhoto.urls.regular}
                  alt={selectedPhoto.alt_description || 'Preview'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Unsplash</Badge>
                  <Badge variant="secondary">Free to Use</Badge>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm">
                  <span className="font-medium">Photo by:</span>{' '}
                  <a 
                    href={selectedPhoto.user.links.html} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {selectedPhoto.user.name}
                  </a>
                  {' '}on{' '}
                  <a 
                    href="https://unsplash.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Unsplash
                  </a>
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleConfirmUnsplash}>
                  <Check className="h-4 w-4 mr-2" />
                  Use This Image
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
