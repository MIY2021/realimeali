
import { useState, useEffect, useRef } from "react";
import ShoppingListHeader from "@/components/shopping-list/ShoppingListHeader";
import ShoppingListSkeleton from "@/components/shopping-list/ShoppingListSkeleton";
import ShoppingListGenerationProgress from "@/components/shopping-list/ShoppingListGenerationProgress";
import ShoppingListCreationInfo from "@/components/shopping-list/ShoppingListCreationInfo";
import { ShoppingListInfoDialog } from "@/components/shopping-list/ShoppingListInfoDialog";
import ShoppingListItems from "@/components/shopping-list/ShoppingListItems";
import ShoppingListEmptyState from "@/components/shopping-list/ShoppingListEmptyState";
import { WeekSelector } from "@/components/shared/WeekSelector";
import { CalendarMonthModal } from "@/components/shared/CalendarMonthModal";
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
import { Share, Trash2, Plus, Sparkles, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { getCurrentWeekKey } from "@/utils/weekUtils";
import { HeaderControls } from "@/components/layout/HeaderControls";

export default function ShoppingList() {
  useDocumentTitle("Shopping List | RealiMeali");
  
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { getMealPlansForWeek, mealPlans: allMealPlans, copyWeek } = useMealPlan();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Use same localStorage key as meal planner for consistency
  const WEEK_STORAGE_KEY = "meal-planner-current-week";
  const [currentWeek, setCurrentWeek] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return getCurrentWeekKey();
    }
    try {
      const saved = localStorage.getItem(WEEK_STORAGE_KEY);
      if (saved && /^\d{4}-W\d{1,2}$/.test(saved)) {
        return saved;
      }
    } catch (e) {
      // Ignore
    }
    return getCurrentWeekKey();
  });
  
  const [allWeeksModalOpen, setAllWeeksModalOpen] = useState(false);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [showOnlyUnchecked, setShowOnlyUnchecked] = useState(false);
  const [infoDialog, setInfoDialog] = useState(false);
  
  // Sync week with localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WEEK_STORAGE_KEY && e.newValue && /^\d{4}-W\d{1,2}$/.test(e.newValue)) {
        setCurrentWeek(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(WEEK_STORAGE_KEY, currentWeek);
  }, [currentWeek]);
  
  const {
    shoppingList,
    isLoading,
    toggleItemChecked,
    addCustomItem,
    updateItem,
    clearAll,
    refreshList,
  } = useShoppingList(currentWeek);

  const {
    isGenerating,
    generationProgress,
    lastGenerated,
    setLastGenerated,
    handleGenerate
  } = useShoppingListGeneration(currentWeek, clearAll, refreshList);

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

  const mealPlans = getMealPlansForWeek(currentWeek);
  const hasMealPlans = mealPlans.length > 0;

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
        title: `Shopping List`,
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
  if (recipesLoading && shoppingList.length === 0) {
  return (
    <div className="container max-w-4xl py-4 px-4 sm:py-8 sm:px-6" data-scroll-content>
        <ShoppingListHeader 
          onShare={handleShare} 
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
    <div className="container max-w-4xl py-4 px-4 sm:py-8 sm:px-6 space-y-3" data-scroll-content>
      <ShoppingListHeader
        onShare={handleShare} 
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
          <HeaderControls
            weekControl={
              <WeekSelector 
                currentWeek={currentWeek} 
                onWeekChange={setCurrentWeek}
                onWeekClick={() => setAllWeeksModalOpen(true)}
                isLoading={isGenerating}
              />
            }
            utilityActions={
              <>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  aria-busy={isGenerating}
                  className="h-9 px-3"
                  title="Generate Shopping List"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="ml-2">Generate</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span className="ml-2">Generate</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShare}
                  className="h-9 w-9 p-0"
                  title="Share"
                >
                  <Share className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearAll}
                  className="h-9 w-9 p-0"
                  title="Clear All"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            }
            rightActions={
              user && currentHousehold ? (
                <div className="flex items-center gap-2">
                  <label htmlFor="show-unchecked" className="text-xs font-medium whitespace-nowrap text-muted-foreground">
                    Hide Checked
                  </label>
                  <Switch
                    id="show-unchecked"
                    checked={showOnlyUnchecked}
                    onCheckedChange={setShowOnlyUnchecked}
                  />
                </div>
              ) : null
            }
          />
          
          <CalendarMonthModal
            open={allWeeksModalOpen}
            onOpenChange={setAllWeeksModalOpen}
            currentWeek={currentWeek}
            onWeekSelect={setCurrentWeek}
            mealPlans={allMealPlans}
            onCopyWeek={copyWeek}
          />

          {/* Action rows */}
          {user && currentHousehold && (
            <div className="space-y-2 mb-4">
              {/* Row 1: Item count on left, Add button on right */}
              <div className="flex items-center justify-between gap-2 min-h-[24px]">
                {shoppingList.length > 0 ? (
                  <p className="text-sm animate-in fade-in-0 duration-300" style={{ color: 'hsl(var(--shopping-grey))' }}>
                    {completedItems} of {totalItems} items completed
                  </p>
                ) : (
                  <div className="h-5 w-32 bg-muted/30 rounded animate-pulse" />
                )}
                
                {/* Override min-height/min-width with !important to allow h-6 w-6 (24px) sizing */}
                <Button
                  onClick={() => {
                    const itemName = prompt("Enter item name:");
                    if (itemName?.trim()) {
                      addCustomItem(itemName.trim());
                    }
                  }}
                  className="h-6 w-6 !min-h-0 !min-w-0 rounded-full bg-[#F5B82E]/50 hover:bg-[#F5B82E]/70 text-white p-0 border-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Only show skeleton if we're loading AND we don't have data */}
          {isLoading && shoppingList.length === 0 ? (
            <ShoppingListSkeleton />
          ) : (
            <div className={`transition-opacity duration-150 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
              {shoppingList.length === 0 ? (
                <ShoppingListEmptyState
                  hasMealPlans={hasMealPlans}
                />
              ) : (
                <>
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
