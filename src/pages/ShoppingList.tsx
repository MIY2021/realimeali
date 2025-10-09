
import { useState, useEffect, useRef } from "react";
import ShoppingListHeader from "@/components/shopping-list/ShoppingListHeader";
import ShoppingListWeekSelector from "@/components/shopping-list/ShoppingListWeekSelector";
import ShoppingListSkeleton from "@/components/shopping-list/ShoppingListSkeleton";
import ShoppingListGenerationProgress from "@/components/shopping-list/ShoppingListGenerationProgress";
import ShoppingListCreationInfo from "@/components/shopping-list/ShoppingListCreationInfo";
import { ShoppingListInfoDialog } from "@/components/shopping-list/ShoppingListInfoDialog";
import ShoppingListItems from "@/components/shopping-list/ShoppingListItems";
import ShoppingListEmptyState from "@/components/shopping-list/ShoppingListEmptyState";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useShoppingListGeneration } from "@/hooks/useShoppingListGeneration";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { usePageTransition } from "@/hooks/usePageTransition";
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
  const isMobile = useIsMobile();
  const [weekNumber, setWeekNumber] = useState<1 | 2>(1);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [showOnlyUnchecked, setShowOnlyUnchecked] = useState(false);
  const [infoDialog, setInfoDialog] = useState(false);
  const initialLoadRef = useRef(false);
  
  const {
    shoppingList,
    isLoading,
    toggleItemChecked,
    addCustomItem,
    updateItem,
    clearAll,
    refreshList,
  } = useShoppingList(weekNumber);

  // Get shopping lists for both weeks to determine most recent
  const { shoppingList: week1List } = useShoppingList(1);
  const { shoppingList: week2List } = useShoppingList(2);

  const { shouldShowSkeleton } = usePageTransition(isLoading || recipesLoading, {
    enableSkeleton: true,
    skeletonDuration: 500
  });

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

  // Determine which week has the most recent shopping list items
  const getMostRecentShoppingWeek = (): 1 | 2 | null => {
    const week1Latest = week1List.length > 0 
      ? Math.max(...week1List.map(item => new Date(item.createdAt || 0).getTime()))
      : 0;
    const week2Latest = week2List.length > 0 
      ? Math.max(...week2List.map(item => new Date(item.createdAt || 0).getTime()))
      : 0;

    if (week1Latest === 0 && week2Latest === 0) return null;
    if (week1Latest === 0) return 2;
    if (week2Latest === 0) return 1;
    
    return week1Latest > week2Latest ? 1 : 2;
  };

  const mostRecentShoppingWeek = getMostRecentShoppingWeek();

  // Filter and sort shopping list - custom meals ("everything for") at top
  const filteredShoppingList = (showOnlyUnchecked 
    ? shoppingList.filter(item => !item.isChecked)
    : shoppingList)
    .sort((a, b) => {
      // Prioritize custom meal items ("Everything for") at the top
      const aIsCustom = a.name.toLowerCase().startsWith('everything for');
      const bIsCustom = b.name.toLowerCase().startsWith('everything for');
      
      if (aIsCustom && !bIsCustom) return -1;
      if (!aIsCustom && bIsCustom) return 1;
      
      // Keep original order for items of the same type
      return 0;
    });

  // Calculate item counts
  const totalItems = shoppingList.length;
  const completedItems = shoppingList.filter(item => item.isChecked).length;

  const getRecipeNames = (recipeIds: string[]): string => {
    const uniqueRecipeIds = [...new Set(recipeIds)];
    const recipeNames = uniqueRecipeIds
      .map(id => {
        // First try to find it as a recipe
        const recipe = recipes.find(r => r.id === id);
        if (recipe) {
          return recipe.title;
        }
        
        // If not found as recipe, check if it's a custom meal (meal plan ID)
        const mealPlans = getMealPlansForWeek(weekNumber);
        const customMeal = mealPlans.find(mp => mp.id === id && mp.is_freetyped && mp.meal_name);
        if (customMeal) {
          return 'Custom Entry';
        }
        
        return `Recipe ${id.substring(0, 8)}`;
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
    <div className="container max-w-4xl py-4 px-4 sm:py-8 sm:px-6" data-scroll-content>
        <ShoppingListHeader 
          onShare={handleShare} 
          weekNumber={weekNumber}
          onAddItem={addCustomItem}
          onInfoClick={() => setInfoDialog(true)}
        />
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-4 px-4 sm:py-8 sm:px-6" data-scroll-content style={{ backgroundColor: 'hsl(var(--shopping-cream))' }}>
      <ShoppingListHeader
        onShare={handleShare} 
        weekNumber={weekNumber}
        onAddItem={addCustomItem}
        onInfoClick={() => setInfoDialog(true)}
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
            mostRecentWeek={mostRecentShoppingWeek}
          />

          <ShoppingListGenerationProgress
            isGenerating={isGenerating}
            generationProgress={generationProgress}
          />

          {/* Action row - always visible */}
          {user && currentHousehold && (
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const itemName = prompt("Enter item name:");
                    if (itemName?.trim()) {
                      addCustomItem(itemName.trim());
                    }
                  }}
                  className="flex items-center gap-2 h-9 px-3 rounded-lg font-medium"
                  style={{ 
                    backgroundColor: 'hsl(var(--muted))',
                    color: 'hsl(var(--shopping-navy))'
                  }}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Add Item</span>
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2 h-9 px-3 rounded-lg font-medium"
                  style={{ 
                    backgroundColor: 'hsl(var(--muted))',
                    color: 'hsl(var(--shopping-navy))'
                  }}
                >
                  <Share className="h-4 w-4" />
                  <span className="text-sm">Share</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <label htmlFor="show-unchecked" className="text-sm font-medium whitespace-nowrap" style={{ color: 'hsl(var(--shopping-navy))' }}>
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
                    onUpdateItem={updateItem}
                    getRecipeNames={getRecipeNames}
                  />
                </>
              )}
            </div>
          )}

          <ShoppingListInfoDialog
            open={infoDialog}
            onOpenChange={setInfoDialog}
            lastGenerated={lastGenerated}
            createdByUserId={shoppingList.length > 0 ? shoppingList[0].createdBy : undefined}
          />
        </>
      )}
    </div>
  );
}
