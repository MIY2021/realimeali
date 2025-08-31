import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, RotateCcw, Calendar, AlertCircle } from "lucide-react";
import { useRecipes } from "@/contexts/RecipesContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Recipe } from "@/types";
import { RestoreRecipeDialog } from "./RestoreRecipeDialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const DeletedRecipesSection = () => {
  const [deletedRecipes, setDeletedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showPermanentDeleteDialog, setShowPermanentDeleteDialog] = useState(false);

  const { fetchDeletedRecipes, restoreRecipe, permanentDeleteRecipe } = useRecipes();
  const { currentHousehold } = useHousehold();

  useEffect(() => {
    loadDeletedRecipes();
  }, [currentHousehold?.id]);

  const loadDeletedRecipes = async () => {
    if (!currentHousehold?.id) return;
    
    setIsLoading(true);
    try {
      const recipes = await fetchDeletedRecipes(currentHousehold.id);
      setDeletedRecipes(recipes);
    } catch (error) {
      console.error('Error loading deleted recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedRecipe) return;
    
    const success = await restoreRecipe(selectedRecipe.id);
    if (success) {
      setDeletedRecipes(prev => prev.filter(r => r.id !== selectedRecipe.id));
      setShowRestoreDialog(false);
      setSelectedRecipe(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedRecipe) return;
    
    const success = await permanentDeleteRecipe(selectedRecipe.id);
    if (success) {
      setDeletedRecipes(prev => prev.filter(r => r.id !== selectedRecipe.id));
      setShowPermanentDeleteDialog(false);
      setSelectedRecipe(null);
    }
  };

  const getDaysRemaining = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysRemaining);
  };

  const formatDeletedDate = (deletedAt: string) => {
    return new Date(deletedAt).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Deleted Recipes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading deleted recipes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Deleted Recipes
          </CardTitle>
          <CardDescription>
            Manage recipes you've deleted. Recipes are automatically removed after 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {deletedRecipes.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No deleted recipes found.</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Deleted recipes will appear here and can be restored within 30 days.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                  Recipes are automatically permanently deleted after 30 days.
                </p>
              </div>
              
              <div className="space-y-3">
                {deletedRecipes.map((recipe, index) => {
                  const daysRemaining = getDaysRemaining((recipe as any).deleted_at);
                  const isExpiringSoon = daysRemaining <= 7;
                  
                  return (
                    <div key={recipe.id}>
                      <div className="p-4 rounded-lg border bg-card space-y-3">
                        <div className="space-y-2">
                          <h4 className="font-medium text-base leading-tight">{recipe.title}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 flex-shrink-0" />
                              <span>Deleted {formatDeletedDate((recipe as any).deleted_at)}</span>
                            </div>
                            <Badge 
                              variant={isExpiringSoon ? "destructive" : "secondary"}
                              className="text-xs w-fit"
                            >
                              {daysRemaining} days left
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRecipe(recipe);
                              setShowRestoreDialog(true);
                            }}
                            className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span>Restore</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedRecipe(recipe);
                              setShowPermanentDeleteDialog(true);
                            }}
                            className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Forever</span>
                          </Button>
                        </div>
                      </div>
                      {index < deletedRecipes.length - 1 && <Separator className="my-3" />}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <RestoreRecipeDialog
        open={showRestoreDialog}
        onOpenChange={setShowRestoreDialog}
        onConfirm={handleRestore}
        recipe={selectedRecipe}
      />

      <AlertDialog open={showPermanentDeleteDialog} onOpenChange={setShowPermanentDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Permanently Delete Recipe?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{selectedRecipe?.title}"? 
              This action cannot be undone and the recipe will be lost forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};