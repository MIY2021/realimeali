import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
    return new Date(deletedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-[#EAE5DE] bg-white p-5 shadow-[0_8px_28px_rgba(35,45,63,0.04)] sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8EEE9] text-[#B96C56]">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#232D3F]">Your deleted recipes</h3>
            <p className="text-sm text-[#77766F]">Loading your recently deleted recipes…</p>
          </div>
        </div>
        <div className="mt-6 space-y-3" aria-hidden="true">
          <div className="h-16 animate-pulse rounded-xl bg-[#F7F5F1]" />
          <div className="h-16 animate-pulse rounded-xl bg-[#F7F5F1]" />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-[#EAE5DE] bg-white shadow-[0_8px_28px_rgba(35,45,63,0.04)]">
        <div className="flex items-center gap-3 border-b border-[#F0ECE6] px-5 py-5 sm:px-7">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8EEE9] text-[#B96C56]">
            <Trash2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[#232D3F]">Your deleted recipes</h3>
            <p className="text-sm leading-5 text-[#77766F]">
              Recipes are kept here for 30 days before they are permanently removed.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {deletedRecipes.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F5F1] text-[#96928B]">
                <Trash2 className="h-6 w-6" />
              </div>
              <p className="font-medium text-[#343944]">Your bin is empty</p>
              <p className="mt-1 max-w-sm text-sm leading-6 text-[#77766F]">
                Recipes you delete will appear here, where you can restore them for up to 30 days.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-[#FBF8F2] px-3.5 py-3 text-sm text-[#76664B]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#A88A55]" />
                <p>Recipes are permanently removed 30 days after deletion. Restore anything you want to keep.</p>
              </div>

              <div>
                {deletedRecipes.map((recipe, index) => {
                  const deletedAt = (recipe as any).deleted_at as string;
                  const daysRemaining = getDaysRemaining(deletedAt);
                  const isExpiringSoon = daysRemaining <= 7;

                  return (
                    <div
                      key={recipe.id}
                      className={index < deletedRecipes.length - 1 ? "border-b border-[#F0ECE6]" : ""}
                    >
                      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-1">
                          <h4 className="truncate font-medium text-[#343944]">{recipe.title}</h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#85827B]">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              Deleted {formatDeletedDate(deletedAt)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className={isExpiringSoon ? "font-medium text-[#B45F4D]" : ""}>
                              {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedRecipe(recipe);
                              setShowRestoreDialog(true);
                            }}
                            className="rounded-lg px-3"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Restore
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedRecipe(recipe);
                              setShowPermanentDeleteDialog(true);
                            }}
                            className="rounded-lg px-3"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete forever
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

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