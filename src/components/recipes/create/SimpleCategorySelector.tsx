
import { Recipe } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useState, useMemo, useRef } from "react";
import {
  MEAL_TYPE_OPTIONS,
  CUISINE_REGION_OPTIONS,
  DIET_LIFESTYLE_OPTIONS,
} from "@/utils/recipeClassification";

interface SimpleCategorySelectorProps {
  recipe: Recipe | Omit<Recipe, "id" | "created_at" | "updated_at" | "created_by">;
  onRecipeChange: (recipe: Recipe | Omit<Recipe, "id" | "created_at" | "updated_at" | "created_by">) => void;
}

export function SimpleCategorySelector({ recipe, onRecipeChange }: SimpleCategorySelectorProps) {
  // Track confirmed suggestions per category
  const suggestedTags = (recipe as any).suggestedTags || null;
  const [confirmedSuggestions, setConfirmedSuggestions] = useState<Set<string>>(new Set());
  // Track interacted items to preserve their position
  const [interactedItems, setInteractedItems] = useState<Set<string>>(new Set());
  // Track the locked order of items for each category (locked once any item is interacted with)
  const mealTypeOrderRef = useRef<string[] | null>(null);
  const cuisineOrderRef = useRef<string[] | null>(null);
  const dietLifestyleOrderRef = useRef<string[] | null>(null);

  const updateRecipeField = (field: keyof Recipe, value: any) => {
    onRecipeChange({ ...recipe, [field]: value });
  };

  const toggleDietLifestyle = (value: string) => {
    const current = recipe.diet_lifestyle || [];
    const updated = current.includes(value as any)
      ? current.filter(item => item !== value)
      : [...current, value as any];
    updateRecipeField('diet_lifestyle', updated);
  };

  const handleConfirmSuggestion = (category: string, value: string) => {
    setConfirmedSuggestions(prev => new Set([...prev, `${category}:${value}`]));
    setInteractedItems(prev => new Set([...prev, `${category}:${value}`]));
    
    // Prepare recipe field updates
    let updatedRecipe: any = { ...recipe };
    
    // Select the value when confirmed
    if (category === 'cuisine') {
      updatedRecipe.cuisine_region = value;
    } else if (category === 'meal_types') {
      const currentTypes = recipe.meal_types || [];
      if (!currentTypes.includes(value)) {
        updatedRecipe.meal_types = [...currentTypes, value];
      }
    } else if (category === 'diet_lifestyle') {
      const current = recipe.diet_lifestyle || [];
      if (!current.includes(value)) {
        updatedRecipe.diet_lifestyle = [...current, value];
      }
    }
    
    // Remove from suggestedTags if all suggestions are confirmed
    const updatedSuggestedTags = { ...suggestedTags };
    if (category === 'meal_types') {
      updatedSuggestedTags.meal_types = (updatedSuggestedTags.meal_types || []).filter((v: string) => v !== value);
    } else if (category === 'cuisine') {
      updatedSuggestedTags.cuisine_region = Array.isArray(updatedSuggestedTags.cuisine_region) 
        ? updatedSuggestedTags.cuisine_region.filter((v: string) => v !== value)
        : null;
    } else if (category === 'diet_lifestyle') {
      updatedSuggestedTags.diet_lifestyle = (updatedSuggestedTags.diet_lifestyle || []).filter((v: string) => v !== value);
    }
    
    // Remove suggestedTags if all are empty
    const hasRemainingSuggestions = 
      (updatedSuggestedTags.meal_types?.length > 0) ||
      (Array.isArray(updatedSuggestedTags.cuisine_region) ? updatedSuggestedTags.cuisine_region.length > 0 : updatedSuggestedTags.cuisine_region) ||
      (updatedSuggestedTags.diet_lifestyle?.length > 0);
    
    // Combine all updates into a single call
    if (!hasRemainingSuggestions) {
      const { suggestedTags, ...rest } = updatedRecipe;
      onRecipeChange(rest);
    } else {
      onRecipeChange({ ...updatedRecipe, suggestedTags: updatedSuggestedTags });
    }
  };

  const handleRejectSuggestion = (category: string, value: string) => {
    setConfirmedSuggestions(prev => new Set([...prev, `${category}:${value}`]));
    setInteractedItems(prev => new Set([...prev, `${category}:${value}`]));
    
    // Prepare recipe field updates
    let updatedRecipe: any = { ...recipe };
    
    // Remove from selected if it was auto-selected
    if (category === 'meal_types') {
      const currentTypes = recipe.meal_types || [];
      updatedRecipe.meal_types = currentTypes.filter((t: string) => t !== value);
    } else if (category === 'cuisine' && recipe.cuisine_region === value) {
      updatedRecipe.cuisine_region = undefined;
    } else if (category === 'diet_lifestyle') {
      const current = recipe.diet_lifestyle || [];
      updatedRecipe.diet_lifestyle = current.filter((d: string) => d !== value);
    }
    
    // Remove from suggestedTags
    const updatedSuggestedTags = { ...suggestedTags };
    if (category === 'meal_types') {
      updatedSuggestedTags.meal_types = (updatedSuggestedTags.meal_types || []).filter((v: string) => v !== value);
    } else if (category === 'cuisine') {
      updatedSuggestedTags.cuisine_region = Array.isArray(updatedSuggestedTags.cuisine_region) 
        ? updatedSuggestedTags.cuisine_region.filter((v: string) => v !== value)
        : null;
    } else if (category === 'diet_lifestyle') {
      updatedSuggestedTags.diet_lifestyle = (updatedSuggestedTags.diet_lifestyle || []).filter((v: string) => v !== value);
    }
    
    // Remove suggestedTags if all are empty
    const hasRemainingSuggestions = 
      (updatedSuggestedTags.meal_types?.length > 0) ||
      (Array.isArray(updatedSuggestedTags.cuisine_region) ? updatedSuggestedTags.cuisine_region.length > 0 : updatedSuggestedTags.cuisine_region) ||
      (updatedSuggestedTags.diet_lifestyle?.length > 0);
    
    // Combine all updates into a single call
    if (!hasRemainingSuggestions) {
      const { suggestedTags, ...rest } = updatedRecipe;
      onRecipeChange(rest);
    } else {
      onRecipeChange({ ...updatedRecipe, suggestedTags: updatedSuggestedTags });
    }
  };

  const isSuggestionConfirmed = (category: string, value: string) => {
    return confirmedSuggestions.has(`${category}:${value}`);
  };

  const CategoryButton = ({ 
    option, 
    isSelected, 
    onClick,
    isSuggested = false,
    category = ''
  }: { 
    option: { value: string; label: string; icon: string }; 
    isSelected: boolean; 
    onClick: () => void;
    isSuggested?: boolean;
    category?: string;
  }) => {
    const isConfirmed = isSuggestionConfirmed(category, option.value);
    const showSuggestionButtons = isSuggested && !isConfirmed;
    
    return (
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={onClick}
          className={`w-full p-2.5 rounded-[10px] border transition-all text-left relative hover:shadow-sm ${
            isSelected
              ? showSuggestionButtons
                ? 'border-amber-400 bg-amber-50 text-amber-900'
                : 'border-sage bg-sage/10 text-sage-dark'
              : 'border-[#E3E3E3] hover:border-sage/40 bg-white hover:bg-sage/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{option.icon}</span>
            <span className="text-xs sm:text-sm font-medium">{option.label}</span>
          </div>
          {isSelected && !showSuggestionButtons && (
            <div className="absolute top-1 right-1">
              <div className="h-4 w-4 bg-sage text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
            </div>
          )}
        </button>
        {isSuggested && (
          <div className="flex items-center justify-end gap-1">
            {showSuggestionButtons ? (
              <>
                <span className="text-[9px] text-[#6B6B6B] font-medium">AutoTag</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirmSuggestion(category, option.value);
                  }}
                  className="h-6 px-2 rounded-[6px] bg-sage/70 hover:bg-sage/80 text-white text-[10px] font-medium"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRejectSuggestion(category, option.value);
                  }}
                  className="h-6 px-2 rounded-[6px] bg-gray-400 hover:bg-gray-500 text-white text-[10px] font-medium"
                >
                  Reject
                </button>
              </>
            ) : (
              <>
                <span className="text-[9px] text-[#6B6B6B] font-medium">AutoTag</span>
                <div className="h-6 px-2 rounded-[6px] bg-gray-100 text-gray-600 text-[10px] font-medium flex items-center">
                  {isSelected ? 'Confirmed' : 'Rejected'}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="rounded-[12px] border border-[#E3E3E3] shadow-sm bg-white">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <CardTitle className="text-base font-semibold text-[#1A1A1A]">Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6">
        {/* Meal Type */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1 block">
            Meal Type
          </label>
          <p className="text-[10px] sm:text-xs text-[#6B6B6B] mb-2">Select all that apply</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5">
            {(() => {
              const sortedMealTypes = useMemo(() => {
                // If order is locked (any item has been interacted with), preserve it
                if (mealTypeOrderRef.current) {
                  const orderMap = new Map(mealTypeOrderRef.current.map((val, idx) => [val, idx]));
                  return [...MEAL_TYPE_OPTIONS].sort((a, b) => {
                    const aIdx = orderMap.get(a.value) ?? Infinity;
                    const bIdx = orderMap.get(b.value) ?? Infinity;
                    return aIdx - bIdx;
                  });
                }
                
                // Initial sort: put suggested items first
                const sorted = [...MEAL_TYPE_OPTIONS].sort((a, b) => {
                  const aIsSuggested = suggestedTags?.meal_types?.includes(a.value);
                  const bIsSuggested = suggestedTags?.meal_types?.includes(b.value);
                  if (aIsSuggested && !bIsSuggested) return -1;
                  if (!aIsSuggested && bIsSuggested) return 1;
                  return 0;
                });
                
                // Save the order for future renders
                mealTypeOrderRef.current = sorted.map(opt => opt.value);
                
                return sorted;
              }, [suggestedTags?.meal_types]);
              
              return sortedMealTypes.map((option) => {
                const isSelected = (recipe.meal_types || []).includes(option.value);
                const isSuggested = suggestedTags?.meal_types?.includes(option.value);
                return (
                  <CategoryButton
                    key={option.value}
                    option={option}
                    isSelected={isSelected}
                    isSuggested={isSuggested}
                    category="meal_types"
                    onClick={() => {
                      const currentTypes = recipe.meal_types || [];
                      const isCurrentlySelected = currentTypes.includes(option.value);
                      
                      if (isCurrentlySelected) {
                        // Remove if already selected
                        const newTypes = currentTypes.filter(type => type !== option.value);
                        updateRecipeField('meal_types', newTypes);
                      } else {
                        // Add if not selected
                        const newTypes = [...currentTypes, option.value];
                        updateRecipeField('meal_types', newTypes);
                      }
                    }}
                  />
                );
              });
            })()}
          </div>
        </div>

        {/* Cuisine */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1 block">
            Cuisine
          </label>
          <p className="text-[10px] sm:text-xs text-[#6B6B6B] mb-2">Select all that apply</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5">
            {(() => {
              const cuisineSuggestions = Array.isArray(suggestedTags?.cuisine_region) 
                ? suggestedTags.cuisine_region 
                : (suggestedTags?.cuisine_region ? [suggestedTags.cuisine_region] : []);
              
              const sortedCuisines = useMemo(() => {
                // If order is locked (any item has been interacted with), preserve it
                if (cuisineOrderRef.current) {
                  const orderMap = new Map(cuisineOrderRef.current.map((val, idx) => [val, idx]));
                  return [...CUISINE_REGION_OPTIONS].sort((a, b) => {
                    const aIdx = orderMap.get(a.value) ?? Infinity;
                    const bIdx = orderMap.get(b.value) ?? Infinity;
                    return aIdx - bIdx;
                  });
                }
                
                // Initial sort: put suggested items first
                const sorted = [...CUISINE_REGION_OPTIONS].sort((a, b) => {
                  const aIsSuggested = cuisineSuggestions.includes(a.value);
                  const bIsSuggested = cuisineSuggestions.includes(b.value);
                  if (aIsSuggested && !bIsSuggested) return -1;
                  if (!aIsSuggested && bIsSuggested) return 1;
                  return 0;
                });
                
                // Save the order for future renders
                cuisineOrderRef.current = sorted.map(opt => opt.value);
                
                return sorted;
              }, [suggestedTags?.cuisine_region]);
              
              return sortedCuisines.map((option) => {
                const isSelected = recipe.cuisine_region === option.value;
                const isSuggested = cuisineSuggestions.includes(option.value);
                const isSuggestionConfirmed = confirmedSuggestions.has(`cuisine:${option.value}`);
                const showSuggestionButtons = isSuggested && !isSuggestionConfirmed;
                
                return (
                  <CategoryButton
                    key={option.value}
                    option={option}
                    isSelected={isSelected}
                    isSuggested={isSuggested}
                    category="cuisine"
                    onClick={() => {
                      // Only allow manual selection if not a suggested item (or if already confirmed)
                      if (!isSuggested || isSuggestionConfirmed) {
                        // Toggle: if already selected, deselect it; otherwise select it
                        if (isSelected) {
                          updateRecipeField('cuisine_region', undefined);
                        } else {
                          updateRecipeField('cuisine_region', option.value);
                        }
                      }
                    }}
                  />
                );
              });
            })()}
          </div>
        </div>

        {/* Diet & Lifestyle */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1 block">
            Diet & Lifestyle
          </label>
          <p className="text-[10px] sm:text-xs text-[#6B6B6B] mb-2">Select all that apply</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5">
            {(() => {
              const sortedDietLifestyle = useMemo(() => {
                // If order is locked (any item has been interacted with), preserve it
                if (dietLifestyleOrderRef.current) {
                  const orderMap = new Map(dietLifestyleOrderRef.current.map((val, idx) => [val, idx]));
                  return [...DIET_LIFESTYLE_OPTIONS].sort((a, b) => {
                    const aIdx = orderMap.get(a.value) ?? Infinity;
                    const bIdx = orderMap.get(b.value) ?? Infinity;
                    return aIdx - bIdx;
                  });
                }
                
                // Initial sort: put suggested items first
                const sorted = [...DIET_LIFESTYLE_OPTIONS].sort((a, b) => {
                  const aIsSuggested = suggestedTags?.diet_lifestyle?.includes(a.value);
                  const bIsSuggested = suggestedTags?.diet_lifestyle?.includes(b.value);
                  if (aIsSuggested && !bIsSuggested) return -1;
                  if (!aIsSuggested && bIsSuggested) return 1;
                  return 0;
                });
                
                // Save the order for future renders
                dietLifestyleOrderRef.current = sorted.map(opt => opt.value);
                
                return sorted;
              }, [suggestedTags?.diet_lifestyle]);
              
              return sortedDietLifestyle.map((option) => {
                const isSelected = (recipe.diet_lifestyle || []).includes(option.value as any);
                const isSuggested = suggestedTags?.diet_lifestyle?.includes(option.value);
                const showSuggestionButtons = isSuggested && !isSuggestionConfirmed('diet_lifestyle', option.value);
                
                return (
                <div key={option.value} className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => toggleDietLifestyle(option.value)}
                    className={`w-full p-2.5 rounded-[10px] border transition-all text-left relative hover:shadow-sm ${
                      isSelected
                        ? showSuggestionButtons
                          ? 'border-amber-400 bg-amber-50 text-amber-900'
                          : 'border-sage bg-sage/10 text-sage-dark'
                        : 'border-[#E3E3E3] hover:border-sage/40 bg-white hover:bg-sage/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{option.icon}</span>
                      <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                    </div>
                    {isSelected && !showSuggestionButtons && (
                      <div className="absolute top-1 right-1">
                        <div className="h-4 w-4 bg-sage text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </div>
                      </div>
                    )}
                  </button>
                  {isSuggested && (
                    <div className="flex items-center justify-end gap-1">
                      {showSuggestionButtons ? (
                        <>
                          <span className="text-[9px] text-[#6B6B6B] font-medium">AutoTag</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmSuggestion('diet_lifestyle', option.value);
                            }}
                            className="h-6 px-2 rounded-[6px] bg-sage/70 hover:bg-sage/80 text-white text-[10px] font-medium"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectSuggestion('diet_lifestyle', option.value);
                            }}
                            className="h-6 px-2 rounded-[6px] bg-gray-400 hover:bg-gray-500 text-white text-[10px] font-medium"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-[9px] text-[#6B6B6B] font-medium">AutoTag</span>
                          <div className="h-6 px-2 rounded-[6px] bg-gray-100 text-gray-600 text-[10px] font-medium flex items-center">
                            {isSelected ? 'Confirmed' : 'Rejected'}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                );
              });
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
