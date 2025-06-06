
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { ExternalLink, Clock, Users, ChefHat, Globe } from "lucide-react";
import { ModerationActions } from "./ModerationActions";

interface SingleRecipeModerationViewProps {
  recipe: CommunityRecipe;
  onApprove: (recipeId: string) => void;
  onReject: (recipeId: string) => void;
  onUpdateImageUrl: (recipe: CommunityRecipe, imageUrl: string) => void;
  generatingAI: { [key: string]: boolean };
}

export function SingleRecipeModerationView({
  recipe,
  onApprove,
  onReject,
  onUpdateImageUrl,
  generatingAI,
}: SingleRecipeModerationViewProps) {
  const [moderatorNotes, setModeratorNotes] = useState(recipe.moderator_notes || "");
  const [editingImageUrl, setEditingImageUrl] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState(recipe.ai_generated_image_url || "");

  const handleImageUrlUpdate = () => {
    if (newImageUrl !== recipe.ai_generated_image_url) {
      onUpdateImageUrl(recipe, newImageUrl);
    }
    setEditingImageUrl(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in_review": return "bg-blue-100 text-blue-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Recipe Content - Left/Top */}
      <div className="lg:col-span-2 space-y-6">
        {/* Recipe Image */}
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
                  <ChefHat className="h-12 w-12" />
                </div>
              )}
            </div>
            
            {/* Image URL Management */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">AI Generated Image URL</Label>
              {editingImageUrl ? (
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Enter image URL..."
                  />
                  <Button onClick={handleImageUrlUpdate} size="sm">
                    Save
                  </Button>
                  <Button 
                    onClick={() => setEditingImageUrl(false)} 
                    variant="outline" 
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <p className="text-sm text-muted-foreground flex-1">
                    {recipe.ai_generated_image_url || "No AI image URL set"}
                  </p>
                  <Button 
                    onClick={() => setEditingImageUrl(true)} 
                    variant="outline" 
                    size="sm"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recipe Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{recipe.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(recipe.moderation_status)}>
                {recipe.moderation_status}
              </Badge>
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
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recipe Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Prep</p>
                  <p className="text-sm font-medium">{recipe.prep_time}m</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Cook</p>
                  <p className="text-sm font-medium">{recipe.cook_time}m</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Servings</p>
                  <p className="text-sm font-medium">{recipe.servings}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(recipe.source_url, '_blank')}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Source
                </Button>
              </div>
            </div>

            {/* Description Comparison */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Original Description</Label>
                <div className="mt-1 p-3 bg-muted/30 rounded border text-sm">
                  {recipe.description || "No original description provided"}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">AI Generated Description</Label>
                <div className="mt-1 p-3 bg-green-50 rounded border text-sm">
                  {recipe.ai_generated_description || "No AI description generated yet"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Panel - Right/Bottom */}
      <div className="space-y-6">
        {/* Submission Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submission Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Submitted By</Label>
              <p className="text-sm font-medium">{recipe.submitted_by_name || "Anonymous"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Submitted At</Label>
              <p className="text-sm">{formatDate(recipe.created_at)}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">View Count</Label>
              <p className="text-sm">{recipe.view_count}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Save Count</Label>
              <p className="text-sm">{recipe.save_count}</p>
            </div>
          </CardContent>
        </Card>

        {/* Moderator Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Moderator Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={moderatorNotes}
              onChange={(e) => setModeratorNotes(e.target.value)}
              placeholder="Add notes about this recipe submission..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Moderation Actions */}
        <ModerationActions
          recipe={recipe}
          onApprove={onApprove}
          onReject={onReject}
          moderatorNotes={moderatorNotes}
        />
      </div>
    </div>
  );
}
