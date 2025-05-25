import { useState } from "react";
import { Recipe, RecipeCategory } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RecipeTextTab } from "./dialog/RecipeTextTab";
import { RecipeUrlTab } from "./dialog/RecipeUrlTab";
import { RecipeUploadTab } from "./dialog/RecipeUploadTab";
import { RecipeIngredientsTab } from "./dialog/RecipeIngredientsTab";
import { RecipePreview } from "./dialog/RecipePreview";
import { ImageSelection } from "./dialog/ImageSelection";
import { RecipeAmendment } from "./dialog/RecipeAmendment";

interface AIRecipeParserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

interface ParsedRecipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  categories: RecipeCategory[];
  prepTime: number;
  cookTime: number;
  servings: number;
}

export function AIRecipeParserDialog({ open, onOpenChange, onSave }: AIRecipeParserDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("text");
  const [recipeText, setRecipeText] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [cameraFile, setCameraFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipe | null>(null);
  const [websiteImages, setWebsiteImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [showAmendment, setShowAmendment] = useState(false);

  const resetForm = () => {
    setRecipeText("");
    setWebsiteUrl("");
    setUploadedImageFile(null);
    setCameraFile(null);
    setParsedRecipe(null);
    setWebsiteImages([]);
    setSelectedImage("");
    setShowAmendment(false);
    setActiveTab("text");
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleParseRecipe = async () => {
    setIsLoading(true);
    console.log("🚀 Starting recipe parsing...");
    console.log("📝 Active tab:", activeTab);
    console.log("📄 Recipe text length:", recipeText.length);
    console.log("🌐 Website URL:", websiteUrl);
    console.log("📷 Uploaded image file:", !!uploadedImageFile);
    console.log("📱 Camera file:", !!cameraFile);

    try {
      let requestBody: any = {};

      if (activeTab === "text" && recipeText.trim()) {
        requestBody.recipeText = recipeText.trim();
        console.log("📝 Using text input");
      } else if (activeTab === "url" && websiteUrl.trim()) {
        requestBody.websiteUrl = websiteUrl.trim();
        requestBody.extractImages = true;
        console.log("🌐 Using website URL with image extraction");
      } else if (activeTab === "upload" && uploadedImageFile) {
        console.log("📷 Converting uploaded image to base64...");
        const base64Image = await convertImageToBase64(uploadedImageFile);
        requestBody.imageUrl = base64Image;
        console.log("📷 Using uploaded image OCR");
      } else if (activeTab === "ingredients" && cameraFile) {
        console.log("📱 Converting camera image to base64...");
        const base64Image = await convertImageToBase64(cameraFile);
        requestBody.imageUrl = base64Image;
        console.log("📱 Using camera image for ingredient recognition");
      } else {
        toast({
          title: "Missing Input",
          description: "Please provide recipe text, URL, or upload an image.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log("📡 Calling parse-recipe-ai function...");
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: requestBody,
      });

      console.log("📥 Function response:", { data, error });

      if (error) {
        console.error("❌ Supabase function error:", error);
        throw new Error(error.message || 'Failed to parse recipe');
      }

      if (!data?.parsedRecipe) {
        console.error("❌ No parsed recipe in response:", data);
        throw new Error('No recipe data received from AI');
      }

      console.log("✅ Successfully parsed recipe:", data.parsedRecipe.title);
      setParsedRecipe(data.parsedRecipe);
      
      if (data.websiteImages && data.websiteImages.length > 0) {
        console.log("🖼️ Setting website images:", data.websiteImages.length);
        setWebsiteImages(data.websiteImages);
      }

      toast({
        title: "Recipe Parsed Successfully!",
        description: `Found recipe: ${data.parsedRecipe.title}`,
      });

    } catch (error) {
      console.error("💥 Error parsing recipe:", error);
      toast({
        title: "Parsing Failed",
        description: error instanceof Error ? error.message : "Failed to parse recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = () => {
    if (!parsedRecipe) {
      toast({
        title: "No Recipe to Save",
        description: "Please parse a recipe first.",
        variant: "destructive",
      });
      return;
    }

    console.log("💾 Saving recipe to household:", parsedRecipe.title);
    console.log("🖼️ Selected image:", selectedImage);

    const recipeToSave: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
      title: parsedRecipe.title,
      description: parsedRecipe.description,
      ingredients: parsedRecipe.ingredients,
      instructions: parsedRecipe.instructions,
      categories: parsedRecipe.categories,
      prepTime: parsedRecipe.prepTime,
      cookTime: parsedRecipe.cookTime,
      servings: parsedRecipe.servings,
      image: selectedImage || undefined,
      isFavorite: false,
      householdId: "", // This will be set by the parent component
    };

    console.log("📋 Final recipe object:", recipeToSave);
    onSave(recipeToSave);
    resetForm();
    onOpenChange(false);
  };

  const handleAmendRecipe = (amendedRecipe: ParsedRecipe) => {
    console.log("✏️ Recipe amended:", amendedRecipe.title);
    setParsedRecipe(amendedRecipe);
    setShowAmendment(false);
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
          <DialogTitle className="text-xl font-bold">AI Recipe Assistant</DialogTitle>
          <p className="text-muted-foreground">
            Extract and save recipes from text, websites, or images using AI
          </p>
        </DialogHeader>

        {!parsedRecipe ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="text">Recipe Text</TabsTrigger>
              <TabsTrigger value="url">Website URL</TabsTrigger>
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="ingredients">Photo Ingredients</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4 mt-6">
              <RecipeTextTab
                recipeText={recipeText}
                setRecipeText={setRecipeText}
              />
            </TabsContent>

            <TabsContent value="url" className="space-y-4 mt-6">
              <RecipeUrlTab
                websiteUrl={websiteUrl}
                setWebsiteUrl={setWebsiteUrl}
              />
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-6">
              <RecipeUploadTab
                uploadedImageFile={uploadedImageFile}
                setUploadedImageFile={setUploadedImageFile}
              />
            </TabsContent>

            <TabsContent value="ingredients" className="space-y-4 mt-6">
              <RecipeIngredientsTab
                cameraFile={cameraFile}
                setCameraFile={setCameraFile}
              />
            </TabsContent>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleParseRecipe} 
                disabled={isLoading}
                style={{ backgroundColor: '#e38165' }}
                className="hover:opacity-90 text-white"
              >
                {isLoading ? "Parsing..." : "Parse Recipe with AI"}
              </Button>
            </div>
          </Tabs>
        ) : showAmendment ? (
          <RecipeAmendment
            recipe={parsedRecipe}
            availableCategories={availableCategories}
            onSave={handleAmendRecipe}
            onCancel={() => setShowAmendment(false)}
          />
        ) : (
          <div className="space-y-4">
            <RecipePreview recipe={parsedRecipe} />
            
            {websiteImages.length > 0 && (
              <ImageSelection
                images={websiteImages}
                selectedImage={selectedImage}
                onImageSelect={setSelectedImage}
              />
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={resetForm}>
                Start Over
              </Button>
              <Button variant="outline" onClick={() => setShowAmendment(true)}>
                Amend Recipe
              </Button>
              <Button 
                onClick={handleSaveRecipe}
                style={{ backgroundColor: '#e38165' }}
                className="hover:opacity-90 text-white"
              >
                Save to Household Recipes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
