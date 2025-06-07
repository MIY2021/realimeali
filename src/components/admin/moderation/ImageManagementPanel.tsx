
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Upload, Loader, Eye, AlertCircle } from "lucide-react";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { UtensilsCrossed } from "lucide-react";

interface ImageManagementPanelProps {
  recipe: CommunityRecipe;
  onGenerateAI: (recipe: CommunityRecipe) => void;
  onUploadFile: (recipe: CommunityRecipe, file: File) => void;
  onUpdateImageUrl: (recipe: CommunityRecipe, imageUrl: string) => void;
  isGeneratingAI: boolean;
  isUploadingFile: boolean;
}

export function ImageManagementPanel({
  recipe,
  onGenerateAI,
  onUploadFile,
  onUpdateImageUrl,
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
      currentImageUrl: recipe.ai_generated_image_url
    });
    
    setSelectedFile(null);
    setManualImageUrl(recipe.ai_generated_image_url || "");
    
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
    if (manualImageUrl.trim() !== recipe.ai_generated_image_url) {
      console.log("🔗 Updating image URL for recipe:", recipe.id, "New URL:", manualImageUrl.trim());
      onUpdateImageUrl(recipe, manualImageUrl.trim());
    }
  };

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
              This image is used as reference for AI generation but cannot be used directly due to copyright restrictions.
            </p>
          </div>
        )}

        {/* AI Generated Image - Public Use */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">AI Generated Image</Label>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              ✓ Safe for Public Use
            </div>
          </div>
          <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
            {recipe.ai_generated_image_url ? (
              <img
                src={recipe.ai_generated_image_url}
                alt={`AI generated: ${recipe.title}`}
                className="w-full h-full object-cover"
                key={`${recipe.id}-${recipe.ai_generated_image_url}`}
                onError={(e) => {
                  console.error("🖼️ AI image failed to load:", recipe.ai_generated_image_url);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log("🖼️ AI image loaded successfully:", recipe.ai_generated_image_url);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <UtensilsCrossed className="h-12 w-12" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            This AI-generated image will be used publicly for the community recipe.
          </p>
        </div>
        
        {/* Manual Image URL Input */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">AI Image URL</Label>
          <div className="flex gap-2">
            <Input
              value={manualImageUrl}
              onChange={(e) => setManualImageUrl(e.target.value)}
              placeholder="Enter AI-generated image URL"
              className="flex-1"
            />
            <Button
              onClick={handleUpdateImageUrl}
              disabled={!manualImageUrl.trim() || manualImageUrl.trim() === recipe.ai_generated_image_url}
              variant="outline"
              size="sm"
            >
              Update
            </Button>
          </div>
        </div>

        {/* AI Generation Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">AI Image Generation</Label>
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
                {recipe.image_url ? 'Recreate with Reference Image' : 'Generate AI Image'}
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
        </div>

        {/* File Upload Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Upload AI Image File</Label>
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
      </CardContent>
    </Card>
  );
}
