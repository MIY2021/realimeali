
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Clock, Users, Utensils, Heart, Edit, Trash2, Share2, CalendarPlus, Lightbulb } from "lucide-react";
import { Recipe } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { AddToMealPlanDialog } from "./AddToMealPlanDialog";

interface RecipeDetailProps {
  recipe: Recipe;
  onAddToMealPlan: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: () => void;
  isOwner: boolean;
}

export function RecipeDetail({ 
  recipe, 
  onAddToMealPlan, 
  onEdit, 
  onDelete, 
  isOwner 
}: RecipeDetailProps) {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showAddToMealPlan, setShowAddToMealPlan] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    // Mock sharing functionality
    setTimeout(() => {
      toast({
        title: "Recipe Shared!",
        description: "Share link copied to clipboard",
      });
      setIsSharing(false);
    }, 1000);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Recipe Header */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {recipe.image && (
            <div className="lg:w-1/2">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full aspect-video object-cover rounded-lg shadow-lg"
              />
            </div>
          )}
          
          <div className={`${recipe.image ? 'lg:w-1/2' : 'w-full'} space-y-4`}>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy leading-tight">
              {recipe.title}
            </h1>
            
            {/* Recipe Categories */}
            <div className="flex flex-wrap gap-2">
              {recipe.mealType && (
                <Badge variant="secondary" className="text-xs">
                  {recipe.mealType.charAt(0).toUpperCase() + recipe.mealType.slice(1)}
                </Badge>
              )}
              {recipe.cuisine && (
                <Badge variant="outline" className="text-xs">
                  {recipe.cuisine.charAt(0).toUpperCase() + recipe.cuisine.slice(1)}
                </Badge>
              )}
            </div>
            
            {recipe.description && (
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {recipe.description}
              </p>
            )}
            
            {/* Recipe Stats */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Prep: {recipe.prepTime || 0} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>Cook: {recipe.cookTime || 0} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <span>Serves: {recipe.servings || 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span>Total: {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button 
                onClick={() => setShowAddToMealPlan(true)}
                className="w-full sm:w-auto bg-terracotta hover:bg-terracotta/90"
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                Add to Meal Plan
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={handleShare}
                  disabled={isSharing}
                  className="w-full sm:w-auto"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {isSharing ? "Sharing..." : "Share Recipe"}
                </Button>
                
                {isOwner && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => onEdit(recipe)}
                      className="w-full sm:w-auto"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{recipe.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Recipe
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Ingredients */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-terracotta" />
                Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-terracotta font-bold text-lg leading-none mt-1">•</span>
                    <span className="text-sm leading-relaxed">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="bg-terracotta text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-relaxed pt-1">{instruction}</p>
                  </li>
                ))}
              </ol>
              
              {/* Top Tip */}
              {recipe.topTip && (
                <>
                  <Separator />
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-2">Chef's Tip</h4>
                        <p className="text-sm text-yellow-700 leading-relaxed">{recipe.topTip}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddToMealPlanDialog
        recipe={recipe}
        open={showAddToMealPlan}
        onOpenChange={setShowAddToMealPlan}
      />
    </div>
  );
}
