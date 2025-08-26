
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Upload, Loader, Eye, AlertCircle } from "lucide-react";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { UtensilsCrossed } from "lucide-react";
import { UnsplashImageSearch } from "./UnsplashImageSearch";

interface ImageManagementPanelProps {
  recipe: CommunityRecipe;
  onGenerateAI: (recipe: CommunityRecipe) => void;
  onUploadFile: (recipe: CommunityRecipe, file: File) => void;
  onUpdateImageUrl: (recipe: CommunityRecipe, imageUrl: string) => void;
  onUpdateUnsplashImage: (recipe: CommunityRecipe, imageUrl: string, photographerName: string, photographerUrl: string) => void;
  isGeneratingAI: boolean;
  isUploadingFile: boolean;
}

export function ImageManagementPanel({
  recipe,
  onGenerateAI,
  onUploadFile,
  onUpdateImageUrl,
  onUpdateUnsplashImage,
  isGeneratingAI,
  isUploadingFile,
}: ImageManagementPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualImageUrl, setManualImageUrl] = useState("");

  // Reset state whenever recipe changes
  useEffect(() => {
    console.log("🖼️ Recipe changed in image panel, resetting state:", {
      newRecipeId: recipe.id,
      newRecipeTitle: recipe.title,
      currentImageUrl: recipe.ai_generated_image_url || recipe.unsplash_image_url
    });
    
    setSelectedFile(null);
    setManualImageUrl(recipe.ai_generated_image_url || recipe.unsplash_image_url || "");
    
    console.log("🖼️ State reset for recipe:", recipe.id);
  }, [recipe.id]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("📁 File selected:", file.name, file.size, file.type);
      setSelectedFile(file);
    }
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      console.log("📤 Starting file upload for recipe:", recipe.id);
      onUploadFile(recipe, selectedFile);
      setSelectedFile(null);
    }
  };

  const handleGenerateAI = () => {
    console.log("🎨 Generating AI image for recipe:", recipe.id, recipe.title);
    onGenerateAI(recipe);
  };

  const handleUpdateImageUrl = () => {
    if (manualImageUrl.trim() !== (recipe.ai_generated_image_url || recipe.unsplash_image_url)) {
      console.log("🔗 Updating image URL for recipe:", recipe.id, "New URL:", manualImageUrl.trim());
      onUpdateImageUrl(recipe, manualImageUrl.trim());
    }
  };

  const handleUnsplashImageSelect = (imageUrl: string, photographerName: string, photographerUrl: string) => {
    console.log("🌄 Selecting Unsplash image for recipe:", recipe.id, { imageUrl, photographerName });
    onUpdateUnsplashImage(recipe, imageUrl, photographerName, photographerUrl);
  };

  // Determine which image to display (priority: Unsplash > AI > Original)
  const displayImageUrl = recipe.unsplash_image_url || recipe.ai_generated_image_url;
  const isUnsplashImage = !!recipe.unsplash_image_url;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Image Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recipe identifier for debugging */}
        <div className="text-xs text-muted-foreground">
          Recipe: {recipe.title} (ID: {recipe.id.slice(0, 8)}...)
        </div>

        {/* Original Submitted Image - Reference Only */}
        {recipe.image_url && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Original Submitted Image</Label>
              <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                <AlertCircle className="h-3 w-3" />
                Reference Only - Not for Public Use
              </div>
            </div>
            <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
              <img
                src={recipe.image_url}
                alt={`Original submission: ${recipe.title}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("🖼️ Original image failed to load:", recipe.image_url);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log("🖼️ Original image loaded successfully:", recipe.image_url);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This image is used as reference but cannot be used directly due to copyright restrictions.
            </p>
          </div>
        )}

        {/* Community Image - Public Use */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Community Image</Label>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              ✓ Safe for Public Use
            </div>
          </div>
          <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
            {displayImageUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={displayImageUrl}
                  alt={`Community image: ${recipe.title}`}
                  className="w-full h-full object-cover"
                  key={`${recipe.id}-${displayImageUrl}`}
                  onError={(e) => {
                    console.error("🖼️ Community image failed to load:", displayImageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log("🖼️ Community image loaded successfully:", displayImageUrl);
                  }}
                />
                {/* Unsplash Attribution */}
                {isUnsplashImage && recipe.photographer_name && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2">
                    <p>
                      Photo by{' '}
                      <a 
                        href={recipe.photographer_profile_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-300"
                      >
                        {recipe.photographer_name}
                      </a>
                      {' '}on{' '}
                      <a 
                        href="https://unsplash.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-300"
                      >
                        Unsplash
                      </a>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <UtensilsCrossed className="h-12 w-12" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            This image will be used publicly for the community recipe.
          </p>
        </div>

        {/* Unsplash Search Section */}
        <div className="border-t pt-6">
          <UnsplashImageSearch 
            recipe={recipe}
            onImageSelect={handleUnsplashImageSelect}
          />
        </div>
        
        {/* Manual Image URL Input */}
        <div className="space-y-3 border-t pt-6">
          <Label className="text-sm font-medium">Manual Image URL</Label>
          <div className="flex gap-2">
            <Input
              value={manualImageUrl}
              onChange={(e) => setManualImageUrl(e.target.value)}
              placeholder="Enter image URL manually"
              className="flex-1"
            />
            <Button
              onClick={handleUpdateImageUrl}
              disabled={!manualImageUrl.trim() || manualImageUrl.trim() === displayImageUrl}
              variant="outline"
              size="sm"
            >
              Update
            </Button>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Upload Image File</Label>
          <div className="flex gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="flex-1"
              key={`file-input-${recipe.id}`}
            />
            <Button
              onClick={handleFileUpload}
              disabled={!selectedFile || isUploadingFile}
              variant="outline"
            >
              {isUploadingFile ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
          </div>
          {selectedFile && (
            <p className="text-xs text-muted-foreground">
              Selected: {selectedFile.name}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Only upload AI-generated or copyright-free images
          </p>
        </div>

        {/* AI Generation Section - Now positioned as "Last Resort" */}
        <div className="space-y-3 border-t pt-6">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">AI Image Generation</Label>
            <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
              Last Resort Option
            </div>
          </div>
          <Button
            onClick={handleGenerateAI}
            disabled={isGeneratingAI || !recipe.title || !recipe.description}
            className="w-full"
            variant="outline"
          >
            {isGeneratingAI ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Generating AI Image...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {recipe.image_url ? 'Generate AI Recreation' : 'Generate AI Image'}
              </>
            )}
          </Button>
          {(!recipe.title || !recipe.description) && (
            <p className="text-xs text-muted-foreground">
              Recipe title and description are required for AI generation
            </p>
          )}
          {recipe.image_url && (
            <p className="text-xs text-green-600">
              Will use original image as reference to recreate food while changing background
            </p>
          )}
          <p className="text-xs text-orange-600">
            Use AI generation only if no suitable Unsplash image is found
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
