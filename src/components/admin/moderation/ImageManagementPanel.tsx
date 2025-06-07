
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Upload, Loader } from "lucide-react";
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

  // Reset state whenever recipe changes with enhanced logging
  useEffect(() => {
    console.log("🖼️ Recipe changed in image panel, resetting state:", {
      newRecipeId: recipe.id,
      newRecipeTitle: recipe.title,
      currentImageUrl: recipe.ai_generated_image_url
    });
    
    setSelectedFile(null);
    setManualImageUrl(recipe.ai_generated_image_url || "");
    
    console.log("🖼️ State reset for recipe:", recipe.id);
  }, [recipe.id]); // Only depend on recipe.id

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
      <CardContent className="p-6">
        {/* Recipe identifier for debugging */}
        <div className="text-xs text-muted-foreground mb-2">
          Recipe: {recipe.title} (ID: {recipe.id.slice(0, 8)}...)
        </div>
        
        <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden mb-4">
          {recipe.ai_generated_image_url ? (
            <img
              src={recipe.ai_generated_image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
              key={`${recipe.id}-${recipe.ai_generated_image_url}`}
              onError={(e) => {
                console.error("🖼️ Image failed to load:", recipe.ai_generated_image_url);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log("🖼️ Image loaded successfully:", recipe.ai_generated_image_url);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <UtensilsCrossed className="h-12 w-12" />
            </div>
          )}
        </div>
        
        {/* Manual Image URL Input */}
        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">Image URL</Label>
          <div className="flex gap-2">
            <Input
              value={manualImageUrl}
              onChange={(e) => setManualImageUrl(e.target.value)}
              placeholder="Enter image URL"
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
        <div className="space-y-3 mb-6">
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
                Generate AI Image
              </>
            )}
          </Button>
          {(!recipe.title || !recipe.description) && (
            <p className="text-xs text-muted-foreground">
              Recipe title and description are required for AI generation
            </p>
          )}
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
        </div>
      </CardContent>
    </Card>
  );
}
