import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Eye, Link, Clock, Sparkles, Upload, Camera } from "lucide-react";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { useIsMobile } from "@/hooks/use-mobile";

interface RecipeCardProps {
  recipe: CommunityRecipe;
  showActions?: boolean;
  onGenerateAIDescription?: (recipe: CommunityRecipe) => Promise<void>;
  onUpdateImageUrl?: (recipe: CommunityRecipe, imageUrl: string) => Promise<void>;
  onApprove?: (recipeId: string) => Promise<void>;
  onReject?: (recipeId: string) => Promise<void>;
  generatingAI?: { [key: string]: boolean };
}

export function RecipeCard({ 
  recipe, 
  showActions = false,
  onGenerateAIDescription,
  onUpdateImageUrl,
  onApprove,
  onReject,
  generatingAI = {}
}: RecipeCardProps) {
  const [imageUrl, setImageUrl] = useState(recipe.ai_generated_image_url || '');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const isMobile = useIsMobile();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // For now, we'll need to implement actual file upload to storage
      // This would typically involve uploading to Supabase Storage
      console.log("File selected:", file.name);
    }
  };

  const handleUpdateImage = () => {
    if (uploadedFile) {
      // TODO: Implement actual file upload to Supabase Storage
      console.log("Would upload file:", uploadedFile.name);
      // For now, just show the file was selected
    } else if (imageUrl && onUpdateImageUrl) {
      onUpdateImageUrl(recipe, imageUrl);
    }
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className={`${isMobile ? 'px-3 py-3' : 'pb-3'}`}>
        <div className={`flex ${isMobile ? 'flex-col' : 'items-start justify-between'} gap-4`}>
          <div className="flex-1">
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} mb-1`}>{recipe.title}</CardTitle>
            <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-2 text-sm text-muted-foreground mb-2`}>
              <div className="flex items-center gap-2">
                <span>{recipe.submitted_by_name || 'Anonymous'}</span>
                <span>•</span>
                <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
              </div>
              <Badge variant="outline" className={`${isMobile ? 'self-start' : 'ml-2'}`}>
                {recipe.moderation_status}
              </Badge>
            </div>
            <div className={`flex ${isMobile ? 'flex-wrap' : 'items-center'} gap-2 mb-2`}>
              {recipe.category && (
                <Badge variant="secondary" className={`${isMobile ? 'text-xs' : ''}`}>{recipe.category}</Badge>
              )}
              {recipe.cuisine && (
                <Badge variant="outline" className={`${isMobile ? 'text-xs' : ''}`}>{recipe.cuisine}</Badge>
              )}
              {recipe.difficulty_level && (
                <Badge variant="outline" className={`${isMobile ? 'text-xs' : ''}`}>{recipe.difficulty_level}</Badge>
              )}
            </div>
          </div>
          {/* Much larger image preview for better visibility */}
          {(recipe.ai_generated_image_url || recipe.image_url) && (
            <img 
              src={recipe.ai_generated_image_url || recipe.image_url} 
              alt={recipe.title}
              className={`${isMobile ? 'w-full h-64' : 'w-64 h-48'} object-cover rounded-md border shadow-sm`}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className={`${isMobile ? 'px-3 pb-3' : ''}`}>
        {showActions && recipe.description && (
          <div className={`mb-4 p-3 bg-muted rounded-md`}>
            <h4 className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} mb-2`}>Original Description (Moderator Reference Only):</h4>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>{recipe.description}</p>
          </div>
        )}

        {recipe.ai_generated_description && (
          <div className="mb-4 p-3 bg-green-50 rounded-md border border-green-200">
            <h4 className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} mb-2 flex items-center gap-1`}>
              <Sparkles className="h-3 w-3 text-green-600" />
              AI-Generated Description (Public Display):
            </h4>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{recipe.ai_generated_description}</p>
          </div>
        )}
        
        <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mb-3`}>
          <Clock className="h-4 w-4" />
          <span>Prep: {recipe.prep_time}min</span>
          <span>•</span>
          <span>Cook: {recipe.cook_time}min</span>
          <span>•</span>
          <span>Serves: {recipe.servings}</span>
        </div>

        {showActions && onGenerateAIDescription && onUpdateImageUrl && onApprove && onReject && (
          <div className="space-y-4">
            <div>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => onGenerateAIDescription(recipe)}
                disabled={generatingAI[`${recipe.id}-desc`]}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {generatingAI[`${recipe.id}-desc`] ? 'Generating...' : 'Generate AI Summary'}
              </Button>
            </div>

            {/* Enhanced image management section */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-medium text-sm">Image Management</h4>
              
              {/* File upload option */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Upload New Image</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    onClick={handleUpdateImage}
                    disabled={!uploadedFile}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                </div>
                {uploadedFile && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {uploadedFile.name}
                  </p>
                )}
              </div>

              {/* URL input option */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Or paste image URL</label>
                <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-2`}>
                  <Input
                    placeholder="Paste image URL manually"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className={`${isMobile ? 'text-sm' : ''} flex-1`}
                  />
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    onClick={handleUpdateImage}
                    disabled={!imageUrl || imageUrl === recipe.ai_generated_image_url}
                    className={`${isMobile ? 'w-full' : ''}`}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Update URL
                  </Button>
                </div>
              </div>
            </div>

            {recipe.ai_generated_description && (
              <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'} pt-4 border-t gap-3`}>
                <div className={`flex ${isMobile ? 'justify-between w-full' : 'items-center'} gap-2`}>
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    onClick={() => window.open(recipe.source_url, '_blank')}
                    className={`${isMobile ? 'flex-1' : ''}`}
                  >
                    <Link className="h-4 w-4 mr-1" />
                    {isMobile ? 'Source' : 'View Source'}
                  </Button>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{recipe.view_count}</span>
                  </div>
                </div>
                
                <div className={`flex ${isMobile ? 'w-full' : 'items-center'} gap-2`}>
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    onClick={() => onApprove(recipe.id)}
                    className={`${isMobile ? 'flex-1' : ''} text-green-600 hover:text-green-700 hover:bg-green-50`}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    onClick={() => onReject(recipe.id)}
                    className={`${isMobile ? 'flex-1' : ''} text-red-600 hover:text-red-700 hover:bg-red-50`}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {!recipe.ai_generated_description && (
              <div className="text-center p-4 bg-amber-50 rounded-md border border-amber-200">
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-amber-800`}>
                  Generate AI content before approving this recipe for public display.
                </p>
              </div>
            )}
          </div>
        )}

        {!showActions && (
          <div className={`flex ${isMobile ? 'justify-between' : 'items-center justify-between'}`}>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => window.open(recipe.source_url, '_blank')}
              >
                <Link className="h-4 w-4 mr-1" />
                {isMobile ? 'Source' : 'View Source'}
              </Button>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{recipe.view_count}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
