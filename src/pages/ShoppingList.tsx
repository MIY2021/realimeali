
import { useState, useEffect, useRef } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Share } from "lucide-react";
import { Link } from "react-router-dom";

export default function ShoppingList() {
  useDocumentTitle("Shopping List | RealiMeali");
  
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { getMealPlansForWeek } = useMealPlan();
  const { toast } = useToast();
  const { setScrollKey, restoreScrollPosition, saveScrollPosition } = useScrollPosition();
  const isMobile = useIsMobile();
  const [weekNumber, setWeekNumber] = useState<1 | 2>(1);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [showOnlyUnchecked, setShowOnlyUnchecked] = useState(false);
  const initialLoadRef = useRef(false);
  
  const {
    shoppingList,
    isLoading,
    toggleItemChecked,
    addCustomItem,
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

  // Load toggle state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('realiMeali_showOnlyUnchecked');
    if (saved) {
      setShowOnlyUnchecked(JSON.parse(saved));
    }
  }, []);

  // Save toggle state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('realiMeali_showOnlyUnchecked', JSON.stringify(showOnlyUnchecked));
  }, [showOnlyUnchecked]);

  // Track when we've initially loaded to prevent unnecessary skeleton flashing
  useEffect(() => {
    if (!initialLoadRef.current && (shoppingList.length > 0 || !isLoading)) {
      initialLoadRef.current = true;
      setHasInitiallyLoaded(true);
    }
  }, [shoppingList.length, isLoading]);

  // Set up scroll position management
  useEffect(() => {
    const scrollKey = `shopping-list-week-${weekNumber}`;
    setScrollKey(scrollKey);
    
    // Check if we should restore scroll position
    const shouldRestore = sessionStorage.getItem('restoreShoppingListScroll') === 'true';
    if (shouldRestore) {
      console.log('Restoring shopping list scroll position');
      sessionStorage.removeItem('restoreShoppingListScroll');
      
      // Only restore if we have data to avoid flashing
      if (hasInitiallyLoaded || shoppingList.length > 0) {
        setTimeout(() => {
          restoreScrollPosition(scrollKey);
        }, 50); // Reduced delay for faster restoration
      }
    }
  }, [weekNumber, setScrollKey, restoreScrollPosition, hasInitiallyLoaded, shoppingList.length]);

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

  // Filter shopping list based on toggle
  const filteredShoppingList = showOnlyUnchecked 
    ? shoppingList.filter(item => !item.isChecked)
    : shoppingList;

  // Calculate item counts
  const totalItems = shoppingList.length;
  const completedItems = shoppingList.filter(item => item.isChecked).length;

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

  // Show loading state while recipes are loading, but only on initial load
  if (recipesLoading && !hasInitiallyLoaded) {
    return (
      <div className="container max-w-4xl py-4 px-4 sm:py-8 sm:px-6">
        <ShoppingListHeader 
          onShare={handleShare} 
          weekNumber={weekNumber}
          onAddItem={addCustomItem}
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
        onAddItem={addCustomItem}
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

          {/* Mobile control row */}
          {isMobile && user && currentHousehold && (
            <div className="flex items-center justify-between gap-2 mb-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const itemName = prompt("Enter item name:");
                  if (itemName?.trim()) {
                    addCustomItem(itemName.trim());
                  }
                }}
                className="flex items-center gap-1 h-8 text-xs"
              >
                <Plus className="h-3 w-3" />
                Add Item
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-1 h-8 text-xs"
              >
                <Share className="h-3 w-3" />
                Share
              </Button>
              
              <div className="flex items-center gap-2">
                <label htmlFor="show-unchecked" className="text-xs font-medium whitespace-nowrap">
                  Show Only Unchecked
                </label>
                <Switch
                  id="show-unchecked"
                  checked={showOnlyUnchecked}
                  onCheckedChange={setShowOnlyUnchecked}
                />
              </div>
            </div>
          )}

          {/* Only show skeleton if we're loading AND we haven't loaded before AND we don't have data */}
          {isLoading && !hasInitiallyLoaded && shoppingList.length === 0 ? (
            <ShoppingListSkeleton />
          ) : (
            <div className={`transition-opacity duration-200 ${isLoading && !hasInitiallyLoaded ? 'opacity-50' : 'opacity-100'}`}>
              {shoppingList.length === 0 ? (
                <ShoppingListEmptyState
                  weekNumber={weekNumber}
                  hasMealPlans={hasMealPlans}
                />
              ) : (
                <>
                  <ShoppingListCreationInfo 
                    lastGenerated={lastGenerated}
                    createdByUserId={shoppingList.length > 0 ? shoppingList[0].createdBy : undefined}
                    totalItems={totalItems}
                    completedItems={completedItems}
                  />
                  <ShoppingListItems
                    shoppingList={filteredShoppingList}
                    copiedItemId={copiedItemId}
                    onToggleItem={toggleItemChecked}
                    onCopyItem={handleCopyItem}
                    getRecipeNames={getRecipeNames}
                  />
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
