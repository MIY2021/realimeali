
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Eye, Link, Clock, Sparkles, Upload } from "lucide-react";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";

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
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{recipe.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>by {recipe.submitted_by_name || 'Anonymous'}</span>
              <span>•</span>
              <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
              <Badge variant="outline" className="ml-2">
                {recipe.moderation_status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-2">
              {recipe.category && (
                <Badge variant="secondary">{recipe.category}</Badge>
              )}
              {recipe.cuisine && (
                <Badge variant="outline">{recipe.cuisine}</Badge>
              )}
              {recipe.difficulty_level && (
                <Badge variant="outline">{recipe.difficulty_level}</Badge>
              )}
            </div>
          </div>
          {(recipe.ai_generated_image_url || recipe.image_url) && (
            <img 
              src={recipe.ai_generated_image_url || recipe.image_url} 
              alt={recipe.title}
              className="w-20 h-20 object-cover rounded-md ml-4"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showActions && recipe.description && (
          <div className="mb-4 p-3 bg-muted rounded-md">
            <h4 className="font-medium text-sm mb-2">Original Description (Moderator Reference Only):</h4>
            <p className="text-sm text-muted-foreground">{recipe.description}</p>
          </div>
        )}

        {recipe.ai_generated_description && (
          <div className="mb-4 p-3 bg-green-50 rounded-md border border-green-200">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-green-600" />
              AI-Generated Description (Public Display):
            </h4>
            <p className="text-sm">{recipe.ai_generated_description}</p>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
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
                size="sm"
                onClick={() => onGenerateAIDescription(recipe)}
                disabled={generatingAI[`${recipe.id}-desc`]}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {generatingAI[`${recipe.id}-desc`] ? 'Generating...' : 'Generate AI Summary'}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Paste image URL manually"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateImageUrl(recipe, imageUrl)}
                disabled={!imageUrl || imageUrl === recipe.ai_generated_image_url}
              >
                <Upload className="h-4 w-4 mr-1" />
                Update
              </Button>
            </div>

            {recipe.ai_generated_description && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(recipe.source_url, '_blank')}
                  >
                    <Link className="h-4 w-4 mr-1" />
                    View Source
                  </Button>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{recipe.view_count}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApprove(recipe.id)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReject(recipe.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {!recipe.ai_generated_description && (
              <div className="text-center p-4 bg-amber-50 rounded-md border border-amber-200">
                <p className="text-sm text-amber-800">
                  Generate AI content before approving this recipe for public display.
                </p>
              </div>
            )}
          </div>
        )}

        {!showActions && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(recipe.source_url, '_blank')}
              >
                <Link className="h-4 w-4 mr-1" />
                View Source
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
