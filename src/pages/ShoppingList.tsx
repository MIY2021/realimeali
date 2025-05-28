import { useState, useEffect } from "react";
import ShoppingListHeader from "@/components/shopping-list/ShoppingListHeader";
import ShoppingListWeekSelector from "@/components/shopping-list/ShoppingListWeekSelector";
import ShoppingListSkeleton from "@/components/shopping-list/ShoppingListSkeleton";
import ShoppingListGenerationProgress from "@/components/shopping-list/ShoppingListGenerationProgress";
import ShoppingListCreationInfo from "@/components/shopping-list/ShoppingListCreationInfo";
import ShoppingListItems from "@/components/shopping-list/ShoppingListItems";
import ShoppingListEmptyState from "@/components/shopping-list/ShoppingListEmptyState";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useShoppingListGeneration } from "@/hooks/useShoppingListGeneration";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ShoppingList() {
  useDocumentTitle("Shopping List | RealiMeali");
  
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { getMealPlansForWeek } = useMealPlan();
  const { toast } = useToast();
  const { setScrollKey, restoreScrollPosition, saveScrollPosition } = useScrollPosition();
  const [weekNumber, setWeekNumber] = useState<1 | 2>(1);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  
  const {
    shoppingList,
    isLoading,
    toggleItemChecked,
    clearAll,
    refreshList,
  } = useShoppingList(weekNumber);

  const {
    isGenerating,
    generationProgress,
    lastGenerated,
    setLastGenerated,
    handleGenerate
  } = useShoppingListGeneration(weekNumber, clearAll, refreshList);

  // Set up scroll position management
  useEffect(() => {
    const scrollKey = `shopping-list-week-${weekNumber}`;
    setScrollKey(scrollKey);
    
    // Check if we should restore scroll position
    const shouldRestore = sessionStorage.getItem('restoreShoppingListScroll') === 'true';
    if (shouldRestore) {
      console.log('Restoring shopping list scroll position');
      sessionStorage.removeItem('restoreShoppingListScroll');
      
      // Delay restoration to ensure content is rendered
      setTimeout(() => {
        restoreScrollPosition(scrollKey);
      }, 100);
    }
  }, [weekNumber, setScrollKey, restoreScrollPosition]);

  // Save scroll position before unmounting and when navigating
  useEffect(() => {
    const handleBeforeUnload = () => {
      const scrollKey = `shopping-list-week-${weekNumber}`;
      saveScrollPosition(scrollKey);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      const scrollKey = `shopping-list-week-${weekNumber}`;
      saveScrollPosition(scrollKey);
    };
  }, [weekNumber, saveScrollPosition]);

  // Check for existing shopping list creation time on load
  useEffect(() => {
    if (shoppingList.length > 0) {
      // Get the oldest item's creation time as the list creation time
      const oldestItem = shoppingList.reduce((oldest, current) => {
        const currentTime = new Date(current.createdAt || '').getTime();
        const oldestTime = new Date(oldest.createdAt || '').getTime();
        return currentTime < oldestTime ? current : oldest;
      });
      
      if (oldestItem.createdAt) {
        setLastGenerated(new Date(oldestItem.createdAt));
      }
    }
  }, [shoppingList, setLastGenerated]);

  const mealPlans = getMealPlansForWeek(weekNumber);
  const hasMealPlans = mealPlans.length > 0;

  const getRecipeNames = (recipeIds: string[]): string => {
    const uniqueRecipeIds = [...new Set(recipeIds)];
    const recipeNames = uniqueRecipeIds
      .map(id => {
        const recipe = recipes.find(r => r.id === id);
        return recipe ? recipe.title : `Recipe ${id.substring(0, 8)}`;
      })
      .filter(Boolean);
    
    return recipeNames.length > 0 ? recipeNames.join(', ') : 'Unknown Recipe';
  };

  const handleCopyItem = (itemId: string) => {
    setCopiedItemId(itemId);
    setTimeout(() => {
      setCopiedItemId(null);
    }, 2000);
  };

  const handleShare = () => {
    const listText = shoppingList
      .map(item => {
        const qty = item.consolidatedQuantity && item.consolidatedQuantity > 1 
          ? ` (${item.consolidatedQuantity}${item.consolidatedUnit ? ` ${item.consolidatedUnit}` : ''})`
          : '';
        return `• ${item.name}${qty}`;
      })
      .join('\n');

    if (navigator.share) {
      navigator.share({
        title: `Shopping List - Week ${weekNumber}`,
        text: listText,
      });
    } else {
      navigator.clipboard.writeText(listText);
      toast({
        title: "Copied to clipboard",
        description: "Shopping list has been copied to your clipboard",
      });
    }
  };

  // Show loading state while recipes are loading
  if (recipesLoading) {
    return (
      <div className="container max-w-4xl py-4 px-4 sm:py-8 sm:px-6">
        <ShoppingListHeader 
          onShare={handleShare} 
          weekNumber={weekNumber}
        />
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-4 px-4 sm:py-8 sm:px-6">
      <ShoppingListHeader 
        onShare={handleShare} 
        weekNumber={weekNumber}
      />

      {!user ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Please log in to view and manage your shopping list.</p>
        </div>
      ) : !currentHousehold ? (
        <div className="py-10 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-navy mb-2">No Household Selected</h2>
            <p className="text-muted-foreground mb-6">
              You need to create or join a household to manage shopping lists.
            </p>
            <Button asChild className="bg-terracotta hover:bg-terracotta/90">
              <Link to="/household">
                Manage Household
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <ShoppingListWeekSelector 
            selectedWeek={weekNumber} 
            onWeekSelect={setWeekNumber}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            hasItems={shoppingList.length > 0}
          />

          <ShoppingListGenerationProgress
            isGenerating={isGenerating}
            generationProgress={generationProgress}
          />

          {isLoading ? (
            <ShoppingListSkeleton />
          ) : (
            <>
              {shoppingList.length === 0 ? (
                <ShoppingListEmptyState
                  weekNumber={weekNumber}
                  hasMealPlans={hasMealPlans}
                />
              ) : (
                <>
                  <ShoppingListCreationInfo lastGenerated={lastGenerated} />
                  <ShoppingListItems
                    shoppingList={shoppingList}
                    copiedItemId={copiedItemId}
                    onToggleItem={toggleItemChecked}
                    onCopyItem={handleCopyItem}
                    getRecipeNames={getRecipeNames}
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
