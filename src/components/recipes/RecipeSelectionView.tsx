import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useRecipeList } from "@/hooks/useRecipeList";
import { useMobileLayout } from "@/hooks/useMobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { RecipeGrid } from "./RecipeGrid";
import { SimpleRecipeFiltersComponent } from "./filters/SimpleRecipeFilters";
import { MobileLayoutSelector } from "./MobileLayoutSelector";
import { DropdownFilterSection } from "./filters/DropdownFilterSection";
import { ViewToggleButtons } from "./ViewToggleButtons";
import { Heart, X, Search, Plus, Loader, SlidersHorizontal, ChevronDown, Clock3, UtensilsCrossed, Leaf, Globe2, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useHousehold } from "@/contexts/HouseholdContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MEAL_TYPE_OPTIONS,
  CUISINE_REGION_OPTIONS,
  DIET_LIFESTYLE_OPTIONS,
  COOKING_DURATION_OPTIONS,
} from "@/utils/recipeClassification";
import { Recipe, MealType } from "@/types";

interface RecipeSelectionViewProps {
  recipes: Recipe[];
  isLoading: boolean;
  onSelectRecipe?: (recipe: Recipe) => void;
  prefilterMealType?: MealType;
  showAddToMealPlan?: boolean;
  onAddToMealPlan?: (recipe: Recipe) => void;
  defaultMobileLayout?: string;
  initialNotCookedFilter?: boolean;
  initialFavouritesFilter?: boolean;
}

export function RecipeSelectionView({ 
  recipes, 
  isLoading, 
  onSelectRecipe,
  prefilterMealType,
  showAddToMealPlan = true,
  onAddToMealPlan,
  defaultMobileLayout,
  initialNotCookedFilter,
  initialFavouritesFilter
}: RecipeSelectionViewProps) {
  const {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filters,
    handleFiltersChange,
    filtersOpen,
    toggleFilters,
    filteredAndSortedRecipes,
    visibleRecipes,
    hasMoreRecipes,
    handleLoadMore,
  } = useRecipeList({ 
    recipes,
    initialFilters: prefilterMealType ? {
      searchTerm: "",
      mealTypes: [prefilterMealType],
      cuisineRegions: [],
      dietLifestyle: [],
      cookingDurations: [],
      showFavoritesOnly: false,
      showNotCookedOnly: false,
    } : initialNotCookedFilter ? {
      searchTerm: "",
      mealTypes: [],
      cuisineRegions: [],
      dietLifestyle: [],
      cookingDurations: [],
      showFavoritesOnly: false,
      showNotCookedOnly: true,
    } : initialFavouritesFilter ? {
      searchTerm: "",
      mealTypes: [],
      cuisineRegions: [],
      dietLifestyle: [],
      cookingDurations: [],
      showFavoritesOnly: true,
      showNotCookedOnly: false,
    } : undefined
  });

  const { mobileLayout, handleMobileLayoutChange } = useMobileLayout();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  
  // Use default layout if provided, otherwise use the stored layout
  const currentMobileLayout = defaultMobileLayout || mobileLayout;

  // Infinite scroll
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useInfiniteScroll({
    onLoadMore: () => {
      setIsLoadingMore(true);
      handleLoadMore();
      // Reset loading state after a short delay to show the spinner
      setTimeout(() => setIsLoadingMore(false), 300);
    },
    hasMore: hasMoreRecipes,
    isLoading: isLoadingMore,
    threshold: 300
  });

  const handleRecipeClick = useCallback((recipe: Recipe) => {
    if (onSelectRecipe) {
      onSelectRecipe(recipe);
    }
  }, [onSelectRecipe]);

  const toggleArrayFilter = (key: keyof typeof filters, value: string) => {
    const currentArray = filters[key] as string[];
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    handleFiltersChange({ ...filters, [key]: updatedArray });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'searchTerm') return false;
    if (key === 'showFavoritesOnly' || key === 'showNotCookedOnly') return value === true;
    if (Array.isArray(value)) return value.length > 0;
    return false;
  });

  const activeFilterCount = filters.mealTypes.length + 
                           filters.cuisineRegions.length + 
                           filters.dietLifestyle.length + 
                           filters.cookingDurations.length + 
                           (filters.showFavoritesOnly ? 1 : 0) +
                           (filters.showNotCookedOnly ? 1 : 0);

  const clearAllFilters = () => {
    handleFiltersChange({
      searchTerm: filters.searchTerm,
      mealTypes: prefilterMealType ? [prefilterMealType] : [],
      cuisineRegions: [],
      dietLifestyle: [],
      cookingDurations: [],
      showFavoritesOnly: false,
      showNotCookedOnly: false,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Show filter structure immediately */}
        {isMobile ? (
        <div className="space-y-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search recipes..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className={`w-full pl-10 h-11 bg-white border-border/70 rounded-xl text-sm shadow-sm ${searchTerm?"pr-10":""}`} />{searchTerm&&<button onClick={()=>setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-label="Clear search"><X className="h-4 w-4"/></button>}</div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={toggleFilters} className="h-11 flex-1 justify-between rounded-xl border-border/70 bg-white px-4 text-sm font-semibold shadow-sm"><span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-[#E77B61]"/>Filters{activeFilterCount>0&&<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E77B61] px-1.5 text-[11px] font-bold text-white">{activeFilterCount}</span>}</span><ChevronDown className="h-4 w-4 text-muted-foreground"/></Button>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value)=>{const [newSortBy,newSortOrder]=value.split("-");setSortBy(newSortBy as "title"|"prepTime"|"cookTime"|"dateAdded");setSortOrder(newSortOrder as "asc"|"desc");}}><SelectTrigger className="h-11 w-[132px] rounded-xl border-border/70 bg-white text-sm font-semibold shadow-sm"><SelectValue placeholder="Sort"/></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="dateAdded-desc">Newest First</SelectItem><SelectItem value="dateAdded-asc">Oldest First</SelectItem><SelectItem value="title-asc">Title A-Z</SelectItem><SelectItem value="title-desc">Title Z-A</SelectItem><SelectItem value="prepTime-asc">Quickest Prep</SelectItem><SelectItem value="cookTime-asc">Quickest Cook</SelectItem></SelectContent></Select>
            {!defaultMobileLayout&&<ViewToggleButtons value={mobileLayout} onChange={handleMobileLayoutChange}/>}
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 pt-1 scrollbar-hide">{[{label:"Favourites",active:filters.showFavoritesOnly,toggle:()=>handleFiltersChange({...filters,showFavoritesOnly:!filters.showFavoritesOnly})},{label:"Not cooked",active:filters.showNotCookedOnly,toggle:()=>handleFiltersChange({...filters,showNotCookedOnly:!filters.showNotCookedOnly})}].map((chip)=><button key={chip.label} type="button" onClick={chip.toggle} className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium ${chip.active?"border-[#E77B61] bg-[#E77B61]/10 text-[#C85F47]":"border-border/70 bg-white text-muted-foreground"}`}>{chip.active&&<Check className="h-3.5 w-3.5"/>}{chip.label}</button>)}{hasActiveFilters&&<button type="button" onClick={clearAllFilters} className="h-9 shrink-0 rounded-full px-3 text-xs font-medium text-muted-foreground underline underline-offset-2">Clear all</button>}</div>
          <Dialog open={filtersOpen} onOpenChange={toggleFilters}><DialogContent className="top-auto bottom-0 max-h-[88vh] translate-y-0 overflow-hidden rounded-t-[28px] rounded-b-none p-0 sm:top-[50%] sm:bottom-auto sm:translate-y-[-50%] sm:rounded-2xl"><div className="max-h-[88vh] overflow-y-auto"><DialogHeader className="border-b border-border/60 px-5 pb-4 pt-5 text-left"><DialogTitle className="text-xl">Filter recipes</DialogTitle><DialogDescription>Choose as many as you like. Your recipes update instantly.</DialogDescription></DialogHeader><div className="space-y-6 px-5 py-5">{[{title:"Meal",icon:UtensilsCrossed,key:"mealTypes" as const,options:MEAL_TYPE_OPTIONS},{title:"Cuisine",icon:Globe2,key:"cuisineRegions" as const,options:CUISINE_REGION_OPTIONS},{title:"Diet & lifestyle",icon:Leaf,key:"dietLifestyle" as const,options:DIET_LIFESTYLE_OPTIONS},{title:"Duration",icon:Clock3,key:"cookingDurations" as const,options:COOKING_DURATION_OPTIONS}].map(({title,icon:Icon,key,options})=><section key={key}><div className="mb-3 flex items-center gap-2 text-sm font-bold"><Icon className="h-4 w-4 text-[#E77B61]"/>{title}</div><div className="flex flex-wrap gap-2">{options.map(option=>{const active=(filters[key] as string[]).includes(option.value);return <button key={option.value} type="button" onClick={()=>toggleArrayFilter(key,option.value)} className={`rounded-full border px-3.5 py-2 text-sm font-medium ${active?"border-[#E77B61] bg-[#E77B61] text-white":"border-border/70 bg-white text-foreground"}`}>{option.label}</button>})}</div></section>)}<div className="grid grid-cols-2 gap-3">{[{label:"Favourites",active:filters.showFavoritesOnly,key:"showFavoritesOnly" as const},{label:"Not cooked",active:filters.showNotCookedOnly,key:"showNotCookedOnly" as const}].map(item=><button key={item.key} type="button" onClick={()=>handleFiltersChange({...filters,[item.key]:!item.active})} className={`rounded-xl border p-3 text-left text-sm font-semibold ${item.active?"border-[#E77B61] bg-[#E77B61]/10 text-[#C85F47]":"border-border/70 bg-white"}`}>{item.label}<span className="mt-1 block text-xs font-normal text-muted-foreground">{item.active?"On":"Off"}</span></button>)}</div></div><DialogFooter className="border-t border-border/60 bg-background px-5 py-4 sm:flex-row"><Button type="button" variant="ghost" onClick={clearAllFilters} className="rounded-xl sm:mr-auto">Clear all</Button><Button type="button" onClick={toggleFilters} className="rounded-xl bg-[#E77B61] px-6 text-white hover:bg-[#D86E55]">Show {filteredAndSortedRecipes.length} {filteredAndSortedRecipes.length===1?"recipe":"recipes"}</Button></DialogFooter></div></DialogContent></Dialog>
        </div>
      ) : (
          <div>
            <div className="flex gap-3 mb-6">
              <div className="h-10 flex-1 bg-muted animate-pulse rounded-lg" />
              <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>
        )}

        {/* Recipe Grid Skeleton */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          {Array.from({ length: isMobile ? 6 : 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="w-full aspect-[4/3] bg-muted animate-pulse rounded-lg" />
              <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'min-h-screen' : ''}`}>
      {/* Mobile Grid Layout */}
      {isMobile ? (
        <div className="space-y-3">
          {/* Row 1: Search Bar - Full Width */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 h-11 bg-white border-gray-300 rounded-lg text-sm ${searchTerm ? 'pr-10' : ''}`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Row 2: Sort Dropdown + View Toggle */}
          <div className="flex items-center gap-2">
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split('-');
              setSortBy(newSortBy as "title" | "prepTime" | "cookTime" | "dateAdded");
              setSortOrder(newSortOrder as "asc" | "desc");
            }}>
              <SelectTrigger className="flex-1 h-9 bg-white border-gray-300 rounded-full text-sm font-medium text-gray-700">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="dateAdded-desc">Newest First</SelectItem>
                <SelectItem value="dateAdded-asc">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
                <SelectItem value="prepTime-asc">Prep Time ↑</SelectItem>
                <SelectItem value="prepTime-desc">Prep Time ↓</SelectItem>
                <SelectItem value="cookTime-asc">Cook Time ↑</SelectItem>
                <SelectItem value="cookTime-desc">Cook Time ↓</SelectItem>
              </SelectContent>
            </Select>

            {!defaultMobileLayout && (
              <ViewToggleButtons
                value={mobileLayout}
                onChange={handleMobileLayoutChange}
              />
            )}
          </div>

          {/* Row 3: Filter Buttons - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2">
            <DropdownFilterSection
              title="Meal"
              icon="utensils"
              options={MEAL_TYPE_OPTIONS}
              selectedValues={filters.mealTypes}
              onToggle={(value) => toggleArrayFilter('mealTypes', value)}
            />

            <DropdownFilterSection
              title="Cuisine"
              icon="cuisine"
              options={CUISINE_REGION_OPTIONS}
              selectedValues={filters.cuisineRegions}
              onToggle={(value) => toggleArrayFilter('cuisineRegions', value)}
            />

            <DropdownFilterSection
              title="Diet"
              icon="diet"
              options={DIET_LIFESTYLE_OPTIONS}
              selectedValues={filters.dietLifestyle}
              onToggle={(value) => toggleArrayFilter('dietLifestyle', value)}
            />

            <DropdownFilterSection
              title="Duration"
              icon="clock"
              options={COOKING_DURATION_OPTIONS}
              selectedValues={filters.cookingDurations}
              onToggle={(value) => toggleArrayFilter('cookingDurations', value)}
            />
          </div>

          {/* Row 4: Favorites and Not Cooked toggles + Add Recipe button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Favourites</span>
                <Switch
                  checked={filters.showFavoritesOnly}
                  onCheckedChange={(checked) => handleFiltersChange({ ...filters, showFavoritesOnly: checked })}
                  className="data-[state=checked]:bg-[#F5B82E]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Not Cooked</span>
                <Switch
                  checked={filters.showNotCookedOnly}
                  onCheckedChange={(checked) => handleFiltersChange({ ...filters, showNotCookedOnly: checked })}
                  className="data-[state=checked]:bg-[#F5B82E]"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear ({activeFilterCount})
                </button>
              )}
              
              {user && currentHousehold && (
                <Button asChild className="h-6 w-6 !min-h-0 !min-w-0 rounded-full bg-[#F5B82E]/50 hover:bg-[#F5B82E]/70 text-white p-0 border-0">
                  <Link to="/my-recipes/new">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add Recipe</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Layout */
        <div>
          {/* Search, Sort Controls */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${searchTerm ? 'pr-10' : ''}`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="w-32 sm:w-48">
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-');
                setSortBy(newSortBy as "title" | "prepTime" | "cookTime" | "dateAdded");
                setSortOrder(newSortOrder as "asc" | "desc");
              }}>
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dateAdded-desc">Newest First</SelectItem>
                  <SelectItem value="dateAdded-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="prepTime-asc">Prep Time (Low to High)</SelectItem>
                  <SelectItem value="prepTime-desc">Prep Time (High to Low)</SelectItem>
                  <SelectItem value="cookTime-asc">Cook Time (Low to High)</SelectItem>
                  <SelectItem value="cookTime-desc">Cook Time (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filters directly under search bar */}
          <SimpleRecipeFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isOpen={filtersOpen}
            onToggle={toggleFilters}
            alwaysVisible={true}
          />
        </div>
      )}
      
      {filteredAndSortedRecipes.length === 0 ? (
        <div className="text-center py-8 px-4">
          <p className="text-muted-foreground">No recipes found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <RecipeGrid
            recipes={visibleRecipes}
            mobileLayout={currentMobileLayout}
            onRecipeClick={handleRecipeClick}
            onAddToMealPlan={showAddToMealPlan ? onAddToMealPlan : undefined}
          />
          
          {/* Infinite scroll sentinel and loading state */}
          <div className="flex flex-col items-center gap-4 mt-6 px-4">
            {hasMoreRecipes && (
              <div ref={sentinelRef} className="w-full flex justify-center py-4">
                {isLoadingMore && (
                  <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                )}
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Showing {visibleRecipes.length} of {filteredAndSortedRecipes.length} recipes
            </p>
          </div>
        </>
      )}
    </div>
  );
}