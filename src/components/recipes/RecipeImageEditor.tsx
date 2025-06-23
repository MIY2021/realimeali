
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Camera, Search, Loader, Eye, Check, X, Upload } from "lucide-react";
import { UnsplashService } from "@/services/unsplashService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";

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

interface RecipeImageEditorProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  onImageUpdate: (imageUrl: string) => void;
}

export function RecipeImageEditor({ recipe, isOpen, onClose, onImageUpdate }: RecipeImageEditorProps) {
  const [activeTab, setActiveTab] = useState("ai");
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

  const generateDetailedPrompt = (recipeName: string, recipeDescription?: string) => {
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

Lighting: natural daylight style or softbox imitation — bright but soft shadows. Colors are natural, slightly warm, never oversaturated.`;

    if (recipeDescription) {
      return `${basePrompt}\n\nAdditional context: ${recipeDescription}`;
    }
    
    return basePrompt;
  };

  const handleAIGeneration = async () => {
    setIsGeneratingAI(true);
    setProgressValue(0);
    
    try {
      const messages = [
        "🎨 Preparing AI generation...",
        "📋 Analyzing recipe details...",
        "🖼️ Creating detailed prompt...",
        "🎭 Generating photorealistic image...",
        "✨ Adding professional styling...",
        "🎯 Finalizing composition..."
      ];
      
      let messageIndex = 0;
      const progressInterval = setInterval(() => {
        if (messageIndex < messages.length) {
          setAiProgress(messages[messageIndex]);
          setProgressValue((messageIndex + 1) * (100 / messages.length));
          messageIndex++;
        }
      }, 800);

      const prompt = generateDetailedPrompt(recipe.title, recipe.description);
      
      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { 
          prompt: prompt,
          isCommunityRecipe: false
        },
      });

      clearInterval(progressInterval);

      if (error) throw error;
      if (!data?.imageUrl) throw new Error('No image received from AI generation');

      setAiProgress("✅ Image generated successfully!");
      setProgressValue(100);
      
      onImageUpdate(data.imageUrl);
      
      toast({
        title: "Image Generated!",
        description: "Professional recipe image created successfully!",
      });

      setTimeout(() => {
        setAiProgress("");
        setProgressValue(0);
        onClose();
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
      onImageUpdate(selectedPhoto.urls.regular);
      toast({
        title: "Image Updated!",
        description: `Image by ${selectedPhoto.user.name} from Unsplash applied to your recipe.`,
      });
      onClose();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
        onImageUpdate(result);
        toast({
          title: "Image Uploaded!",
          description: "Your custom image has been applied to the recipe.",
        });
        onClose();
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Recipe Image: {recipe.title}</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ai">AI Generation</TabsTrigger>
              <TabsTrigger value="unsplash">Unsplash</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-medium">AI Image Generation</Label>
                <p className="text-sm text-muted-foreground">
                  Generate a professional cookbook-style photo using advanced AI based on your recipe details.
                </p>
                
                {isGeneratingAI && (
                  <div className="space-y-3">
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
                  size="lg"
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
              </div>
            </TabsContent>

            <TabsContent value="unsplash" className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-medium">Search Unsplash</Label>
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
                  <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                    {unsplashPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative cursor-pointer border rounded-lg overflow-hidden hover:border-blue-500 transition-colors group"
                        onClick={() => handlePhotoPreview(photo)}
                      >
                        <img
                          src={photo.urls.thumb}
                          alt={photo.alt_description || 'Food photo'}
                          className="w-full h-24 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1">
                          <span className="truncate block">{photo.user.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-medium">Upload Custom Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full"
                />
                {selectedFile && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name}
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
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Unsplash Preview Dialog */}
      {showPreview && selectedPhoto && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-3xl">
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
