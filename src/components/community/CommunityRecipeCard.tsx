
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Globe, Heart, Eye } from "lucide-react";
import { CommunityRecipe, useCommunityRecipes } from "@/hooks/useCommunityRecipes";
import { useUrlRecipeProcessing } from "@/hooks/useUrlRecipeProcessing";
import { useRecipeForm } from "@/hooks/useRecipeForm";
import { useRecipeSave } from "@/hooks/useRecipeSave";

interface CommunityRecipeCardProps {
  recipe: CommunityRecipe;
}

export function CommunityRecipeCard({ recipe }: CommunityRecipeCardProps) {
  const { incrementViewCount, incrementSaveCount } = useCommunityRecipes();
  const { handleImportFromUrl } = useUrlRecipeProcessing();
  const { newRecipe, setNewRecipe } = useRecipeForm();
  const { handleSave } = useRecipeSave();
  const [isSaving, setIsSaving] = useState(false);

  const handleVisitRecipe = () => {
    incrementViewCount(recipe.id);
    window.open(recipe.source_url, '_blank');
  };

  const handleSaveRecipe = async () => {
    setIsSaving(true);
    try {
      // Import the recipe from URL and save it directly
      await handleImportFromUrl(
        setNewRecipe,
        newRecipe,
        () => {}, // No tab switching needed
        false // Don't download images, just hotlink
      );
      
      // Increment save count
      await incrementSaveCount(recipe.id);
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 h-full flex flex-col">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {recipe.image_url ? (
            <div className="relative">
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {recipe.image_credit && (
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {recipe.image_credit}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-sage to-terracotta flex items-center justify-center">
              <span className="text-white text-lg font-medium">No Image</span>
            </div>
          )}
          
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-white/95 text-navy text-sm font-medium px-3 py-1.5 shadow-sm">
              Community
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-navy group-hover:text-terracotta transition-colors">
          {recipe.title}
        </h3>

        {recipe.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
            {recipe.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {recipe.prep_time > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.prep_time + recipe.cook_time}min</span>
            </div>
          )}
          {recipe.servings > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{recipe.servings}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{recipe.view_count}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {recipe.category && (
            <Badge variant="outline" className="text-xs">
              {recipe.category}
            </Badge>
          )}
          {recipe.cuisine && (
            <Badge variant="outline" className="text-xs">
              {recipe.cuisine}
            </Badge>
          )}
          {recipe.difficulty_level && (
            <Badge variant="outline" className="text-xs">
              {recipe.difficulty_level}
            </Badge>
          )}
        </div>

        <div className="flex gap-2 mt-auto">
          <Button
            onClick={handleSaveRecipe}
            disabled={isSaving}
            className="flex-1 bg-terracotta hover:bg-terracotta/90"
            size="sm"
          >
            <Heart className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Recipe"}
          </Button>
          <Button
            onClick={handleVisitRecipe}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Globe className="h-4 w-4 mr-2" />
            Visit Recipe
          </Button>
        </div>

        <div className="text-xs text-muted-foreground mt-2 text-center">
          Shared by {recipe.submitted_by_name} • {recipe.save_count} saves
        </div>
      </CardContent>
    </Card>
  );
}
