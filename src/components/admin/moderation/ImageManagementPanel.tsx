
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Upload, Loader2 } from "lucide-react";
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      onUploadFile(recipe, selectedFile);
      setSelectedFile(null);
    }
  };

  const handleGenerateAI = () => {
    onGenerateAI(recipe);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden mb-4">
          {recipe.ai_generated_image_url ? (
            <img
              src={recipe.ai_generated_image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <UtensilsCrossed className="h-12 w-12" />
            </div>
          )}
        </div>
        
        {/* Current Image URL Display */}
        <div className="mb-4">
          <Label className="text-sm font-medium">Current Image URL</Label>
          <p className="text-sm text-muted-foreground mt-1">
            {recipe.ai_generated_image_url || "No image URL set"}
          </p>
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
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
            />
            <Button
              onClick={handleFileUpload}
              disabled={!selectedFile || isUploadingFile}
              variant="outline"
            >
              {isUploadingFile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
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
