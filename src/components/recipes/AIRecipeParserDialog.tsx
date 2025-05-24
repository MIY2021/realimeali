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
import { Plus, X, Upload, FileText, Globe, Camera, Sparkles, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecipeTextTab } from "./dialog/RecipeTextTab";
import { RecipeUrlTab } from "./dialog/RecipeUrlTab";
import { RecipeUploadTab } from "./dialog/RecipeUploadTab";
import { RecipeIngredientsTab } from "./dialog/RecipeIngredientsTab";
import { RecipeGenerateTab } from "./dialog/RecipeGenerateTab";
import { RecipeManualTab } from "./dialog/RecipeManualTab";
import { RecipeAmendment } from "./dialog/RecipeAmendment";
import { ImageSelection } from "./dialog/ImageSelection";
import { RecipePreview } from "./dialog/RecipePreview";

interface AIRecipeParserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

export function AIRecipeParserDialog({ open, onOpenChange, onSave }: AIRecipeParserDialogProps) {
  const { toast } = useToast();
  const [recipeText, setRecipeText] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [cameraFile, setCameraFile] = useState<File | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [parsedRecipe, setParsedRecipe] = useState<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [websiteImages, setWebsiteImages] = useState<string[]>([]);
  const [showImageSelection, setShowImageSelection] = useState(false);
  const [recipeRequest, setRecipeRequest] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [amendmentRequest, setAmendmentRequest] = useState("");
  const [isAmending, setIsAmending] = useState(false);

  const handleGenerateRecipe = async () => {
    if (!recipeRequest.trim()) {
      toast({
        title: "Missing request",
        description: "Please tell me what kind of recipe you need!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: {
          recipeText: `Generate a complete recipe for: ${recipeRequest}. Include title, description, ingredients list, step-by-step instructions, prep time, cook time, and servings.`
        }
      });

      if (error) throw error;

      if (data?.parsedRecipe) {
        const recipe = data.parsedRecipe;
        const formattedRecipe = {
          title: recipe.title || "Generated Recipe",
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
        
        handleGenerateImage(formattedRecipe.title);
        
        toast({
          title: "🎉 Recipe generated successfully!",
          description: "I've created a custom recipe for you. Generating an image too!",
        });
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Could not generate recipe. Please try again!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmendRecipe = async () => {
    if (!amendmentRequest.trim() || !parsedRecipe) {
      toast({
        title: "Missing amendment",
        description: "Please tell me what you'd like to change!",
        variant: "destructive",
      });
      return;
    }

    setIsAmending(true);
    
    try {
      const currentRecipeText = `Current recipe: Title: ${parsedRecipe.title}, Description: ${parsedRecipe.description}, Ingredients: ${parsedRecipe.ingredients.join(', ')}, Instructions: ${parsedRecipe.instructions.join('. ')}, Prep time: ${parsedRecipe.prepTime} min, Cook time: ${parsedRecipe.cookTime} min, Servings: ${parsedRecipe.servings}`;
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: {
          recipeText: `${currentRecipeText}\n\nPlease amend this recipe based on this request: ${amendmentRequest}. Keep the same format with title, description, ingredients list, step-by-step instructions, prep time, cook time, and servings.`
        }
      });

      if (error) throw error;

      if (data?.parsedRecipe) {
        const recipe = data.parsedRecipe;
        const formattedRecipe = {
          title: recipe.title || parsedRecipe.title,
          description: recipe.description || parsedRecipe.description,
          ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : parsedRecipe.ingredients,
          instructions: Array.isArray(recipe.instructions) ? recipe.instructions : parsedRecipe.instructions,
          categories: Array.isArray(recipe.categories) ? recipe.categories : parsedRecipe.categories,
          prepTime: Number(recipe.prepTime) || parsedRecipe.prepTime,
          cookTime: Number(recipe.cookTime) || parsedRecipe.cookTime,
          servings: Number(recipe.servings) || parsedRecipe.servings,
          image: parsedRecipe.image,
          isFavorite: false,
        };

        setParsedRecipe(formattedRecipe);
        setAmendmentRequest("");
        
        toast({
          title: "🎉 Recipe updated!",
          description: "I've amended your recipe as requested!",
        });
      }
    } catch (error) {
      toast({
        title: "Amendment failed",
        description: "Could not amend recipe. Please try again!",
        variant: "destructive",
      });
    } finally {
      setIsAmending(false);
    }
  };

  const handleGenerateImage = async (recipeTitle: string) => {
    setIsGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: {
          prompt: `A beautiful, appetising photo of ${recipeTitle}, professionally styled food photography, natural lighting, high quality`
        }
      });

      if (error) throw error;

      if (data?.image) {
        setSelectedImage(data.image);
        updateParsedRecipe('image', data.image);
      }
    } catch (error) {
      console.log('Image generation failed, but recipe creation succeeded');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleExtractRecipe = async () => {
    if (activeTab === "generate") {
      await handleGenerateRecipe();
      return;
    }

    if (activeTab === "manual") {
      setShowPreview(true);
      setParsedRecipe({
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
      });
      return;
    }

    if (activeTab === "text" && !recipeText.trim()) {
      toast({
        title: "Oops!",
        description: "Please add some recipe text first so I can work my magic! 🪄",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "url" && !websiteUrl.trim()) {
      toast({
        title: "Missing Website URL",
        description: "Please enter a recipe website URL first! 🌐",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "ingredient-helper" && !cameraFile) {
      toast({
        title: "No photo taken",
        description: "Please take a photo of your ingredients first! 📷",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "upload" && !uploadedImageFile) {
      toast({
        title: "No image uploaded",
        description: "Please upload an image of a recipe first! 📸",
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
        requestData.websiteUrl = websiteUrl.trim();
        requestData.extractImages = true;
      } else if (activeTab === "ingredient-helper" && cameraFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(cameraFile);
        });
        requestData.imageUrl = await base64Promise;
        requestData.recipeText = "Analyse these ingredients and create a recipe using what's available. Suggest a delicious meal that can be made with these ingredients.";
      } else if (activeTab === "upload" && uploadedImageFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(uploadedImageFile);
        });
        requestData.imageUrl = await base64Promise;
        requestData.recipeText = "Extract the recipe from this image. Please read all text carefully and extract the title, ingredients, instructions, cooking times, and servings.";
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
        const errorCode = data.code || 'UNKNOWN_ERROR';
        
        if (errorCode === 'NO_API_KEY') {
          toast({
            title: "Setup needed",
            description: "The AI service needs to be configured. Please check your API settings.",
            variant: "destructive",
          });
        } else if (errorCode === 'RATE_LIMIT') {
          toast({
            title: "Too many requests",
            description: "The AI service is busy. Please wait a moment and try again.",
            variant: "destructive",
          });
        } else if (errorCode === 'INVALID_API_KEY') {
          toast({
            title: "API Key Issue",
            description: "There's an issue with the OpenAI API key. Please check the configuration.",
            variant: "destructive",
          });
        } else if (errorCode === 'INVALID_AI_RESPONSE' || errorCode === 'INVALID_JSON_RESPONSE') {
          toast({
            title: "Hmm, that didn't work",
            description: "I had trouble understanding that content. Could you try with clearer text or a different image?",
            variant: "destructive",
          });
        } else if (errorCode === 'WEBSITE_FETCH_ERROR' || errorCode === 'NETWORK_ERROR') {
          toast({
            title: "Website access issue",
            description: data.error || "Could not access the website. Please check the URL and try again.",
            variant: "destructive",
          });
        } else if (errorCode === 'INSUFFICIENT_CONTENT') {
          toast({
            title: "Not enough content",
            description: "Could not extract enough recipe content from the website. Please try a different URL.",
            variant: "destructive",
          });
        } else if (errorCode === 'INVALID_URL') {
          toast({
            title: "Invalid URL",
            description: "Please provide a valid website URL.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Something went wrong",
            description: data.error || "Please try again in a moment!",
            variant: "destructive",
          });
        }
        return;
      }

      if (!data?.parsedRecipe) {
        console.error('No recipe data in response:', data);
        toast({
          title: "No recipe found",
          description: "No recipe information was extracted. Please try with clearer text, image, or website URL.",
          variant: "destructive",
        });
        return;
      }

      const recipe = data.parsedRecipe;
      console.log('✅ Recipe extracted successfully:', recipe.title);
      
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

      if (data.websiteImages && data.websiteImages.length > 0) {
        setWebsiteImages(data.websiteImages);
        setShowPreview(true);
      } else if (activeTab === "text" || activeTab === "upload") {
        setShowImageSelection(true);
        setShowPreview(true);
      } else {
        setShowPreview(true);
      }

      const successMessage = activeTab === "ingredient-helper" 
        ? "🎉 Recipe created from your ingredients! I've suggested a delicious meal you can make."
        : activeTab === "upload"
        ? "🎉 Recipe extracted from image! I've read all the details from your recipe photo."
        : "🎉 Recipe magic complete! I've extracted all the delicious details! Take a look and adjust anything you'd like.";

      toast({
        title: successMessage,
      });

    } catch (error) {
      console.error('💥 Error extracting recipe:', error);
      const errorMessage = error.message;
      
      toast({
        title: "Something went wrong",
        description: errorMessage || "Please try again in a moment!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      updateParsedRecipe('image', result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!parsedRecipe) return;
    
    onSave(parsedRecipe);
    handleClose();
  };

  const handleClose = () => {
    setRecipeText("");
    setWebsiteUrl("");
    setImageFile(null);
    setCameraFile(null);
    setUploadedImageFile(null);
    setParsedRecipe(null);
    setShowPreview(false);
    setActiveTab("text");
    setSelectedImage("");
    setWebsiteImages([]);
    setShowImageSelection(false);
    setRecipeRequest("");
    setIsGeneratingImage(false);
    setAmendmentRequest("");
    setIsAmending(false);
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
      <DialogContent className="sm:max-w-4xl h-[90vh] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-terracotta" />
            Add New Recipe
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {!showPreview ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Got a recipe to organise? I can help! Just paste some text, share a recipe website URL, take a photo of your ingredients, upload an image from a cookbook, let me generate a custom recipe for you, or enter one manually! 🍳
                </p>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
                    <TabsTrigger value="text" className="flex flex-col items-center gap-1 text-xs p-2 h-auto">
                      <FileText className="h-3 w-3" />
                      <span className="hidden sm:inline">✨ AI Text</span>
                      <span className="sm:hidden">✨ Text</span>
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex flex-col items-center gap-1 text-xs p-2 h-auto">
                      <Globe className="h-3 w-3" />
                      <span className="hidden sm:inline">✨ AI URL</span>
                      <span className="sm:hidden">✨ URL</span>
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex flex-col items-center gap-1 text-xs p-2 h-auto">
                      <Upload className="h-3 w-3" />
                      <span className="hidden sm:inline">✨ Upload</span>
                      <span className="sm:hidden">✨ Upload</span>
                    </TabsTrigger>
                    <TabsTrigger value="ingredient-helper" className="flex flex-col items-center gap-1 text-xs p-2 h-auto">
                      <Camera className="h-3 w-3" />
                      <span className="hidden sm:inline">✨ AI Ingredients</span>
                      <span className="sm:hidden">✨ Photo</span>
                    </TabsTrigger>
                    <TabsTrigger value="generate" className="flex flex-col items-center gap-1 text-xs p-2 h-auto">
                      <Sparkles className="h-3 w-3" />
                      <span className="hidden sm:inline">✨ AI Generate</span>
                      <span className="sm:hidden">✨ Gen</span>
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="flex flex-col items-center gap-1 text-xs p-2 h-auto">
                      <Pencil className="h-3 w-3" />
                      <span className="hidden sm:inline">Manual</span>
                      <span className="sm:hidden">Manual</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text">
                    <RecipeTextTab 
                      recipeText={recipeText}
                      setRecipeText={setRecipeText}
                    />
                  </TabsContent>

                  <TabsContent value="url">
                    <RecipeUrlTab 
                      websiteUrl={websiteUrl}
                      setWebsiteUrl={setWebsiteUrl}
                    />
                  </TabsContent>

                  <TabsContent value="upload">
                    <RecipeUploadTab 
                      uploadedImageFile={uploadedImageFile}
                      setUploadedImageFile={setUploadedImageFile}
                    />
                  </TabsContent>

                  <TabsContent value="ingredient-helper">
                    <RecipeIngredientsTab 
                      cameraFile={cameraFile}
                      setCameraFile={setCameraFile}
                    />
                  </TabsContent>

                  <TabsContent value="generate">
                    <RecipeGenerateTab 
                      recipeRequest={recipeRequest}
                      setRecipeRequest={setRecipeRequest}
                    />
                  </TabsContent>

                  <TabsContent value="manual">
                    <RecipeManualTab />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          ) : parsedRecipe ? (
            <div className="space-y-4">
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-sm text-green-700 font-medium">🎉 Recipe ready! Everything looks good, but feel free to make any adjustments:</p>
              </div>

              <RecipeAmendment
                amendmentRequest={amendmentRequest}
                setAmendmentRequest={setAmendmentRequest}
                onAmendRecipe={handleAmendRecipe}
                isAmending={isAmending}
                activeTab={activeTab}
              />

              <ImageSelection
                websiteImages={websiteImages}
                selectedImage={selectedImage}
                onImageSelect={(img) => {
                  setSelectedImage(img);
                  updateParsedRecipe('image', img);
                }}
                showImageSelection={showImageSelection}
                onImageUpload={handleImageUpload}
                isGeneratingImage={isGeneratingImage}
              />
              
              <RecipePreview
                parsedRecipe={parsedRecipe}
                onUpdateRecipe={updateParsedRecipe}
              />
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          
          {!showPreview ? (
            <Button 
              onClick={handleExtractRecipe} 
              disabled={isLoading || 
                (activeTab === "text" && !recipeText.trim()) || 
                (activeTab === "url" && !websiteUrl.trim()) ||
                (activeTab === "ingredient-helper" && !cameraFile) ||
                (activeTab === "upload" && !uploadedImageFile) ||
                (activeTab === "generate" && !recipeRequest.trim())}
              className="bg-terracotta hover:bg-terracotta/90"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {activeTab === "generate" ? "Generating..." : 
                   activeTab === "ingredient-helper" ? "Analysing ingredients..." : 
                   activeTab === "upload" ? "Reading recipe..." :
                   "Working my magic..."}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {activeTab === "generate" ? "✨ Generate Recipe" : 
                   activeTab === "ingredient-helper" ? "🧑‍🍳 Create Recipe from Ingredients" : 
                   activeTab === "upload" ? "📖 Extract Recipe from Image" :
                   activeTab === "manual" ? "📝 Create Manual Recipe" : 
                   "✨ Extract Recipe"}
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
