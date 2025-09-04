import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Lightbulb, Users, RotateCcw, Clock, Info } from 'lucide-react';
import { fetchImportedRecipeById, ImportedRecipe, incrementRecipeViewCount } from '@/services/importedRecipeService';
import { addImportedRecipeToHousehold } from '@/services/householdRecipeService';
import { useHousehold } from '@/contexts/HouseholdContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useContext } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { RecipeHeroSection } from '@/components/recipes/RecipeHeroSection';
import { RecipeMetaInfo } from '@/components/recipes/RecipeMetaInfo';
import { RecipeTabContent } from '@/components/recipes/RecipeTabContent';
import { RecipeInfoDialog } from '@/components/recipes/RecipeInfoDialog';
import { RecipeClassificationSummary } from '@/components/recipes/RecipeClassificationSummary';
import { RecipeSourceInfo } from '@/components/recipes/RecipeSourceInfo';
import { RecipeImage } from '@/components/ui/recipe-image';
import { ServingsSelector } from '@/components/meal-planner/ServingsSelector';
import { RecipeScalingService } from '@/utils/recipeScaling';
import { Recipe } from '@/types';

export default function ImportedRecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const { currentHousehold } = useHousehold();
  
  const [recipe, setRecipe] = useState<ImportedRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [currentServings, setCurrentServings] = useState<number>(1);
  const [scaledIngredients, setScaledIngredients] = useState<string[]>([]);
  const [showRecipeInfo, setShowRecipeInfo] = useState(false);

  useDocumentTitle(recipe ? `${recipe.title} | Discover Recipes` : 'Discover Recipes');

  // Convert ImportedRecipe to Recipe format for compatibility with existing components
  const convertToRecipe = (importedRecipe: ImportedRecipe): Recipe => ({
    id: importedRecipe.id,
    title: importedRecipe.title,
    description: importedRecipe.description || '',
    ingredients: importedRecipe.ingredients,
    instructions: importedRecipe.instructions,
    prep_time: importedRecipe.prep_time,
    cook_time: importedRecipe.cook_time,
    servings: importedRecipe.servings,
    image: importedRecipe.image,
    meal_type: (importedRecipe.meal_types?.[0] || 'dinner') as any,
    cuisine_region: (importedRecipe.cuisine_region || 'international') as any,
    diet_lifestyle: (importedRecipe.diet_lifestyle || []) as any,
    source_url: importedRecipe.source_url,
    import_method: importedRecipe.import_method,
    top_tip: importedRecipe.top_tip,
    is_favorite: false,
    has_cooked: false,
    created_by: importedRecipe.imported_by,
    created_at: importedRecipe.created_at,
    updated_at: importedRecipe.updated_at,
    household_id: null
  });

  useEffect(() => {
    if (id) {
      loadRecipe(id);
    }
  }, [id]);

  // Initialize servings and scaled ingredients when recipe loads
  useEffect(() => {
    if (recipe) {
      setCurrentServings(recipe.servings);
      setScaledIngredients(recipe.ingredients);
    }
  }, [recipe]);

  const handleServingsChange = (newServings: number) => {
    if (!recipe) return;
    
    setCurrentServings(newServings);
    const scaled = RecipeScalingService.scaleIngredients(
      recipe.ingredients, 
      recipe.servings, 
      newServings
    );
    setScaledIngredients(scaled);
  };

  const handleServingsReset = () => {
    if (!recipe) return;
    
    setCurrentServings(recipe.servings);
    setScaledIngredients(recipe.ingredients);
  };

  const loadRecipe = async (recipeId: string) => {
    try {
      setIsLoading(true);
      const data = await fetchImportedRecipeById(recipeId);
      
      if (data) {
        setRecipe(data);
        // Increment view count
        incrementRecipeViewCount(recipeId);
      } else {
        toast({
          title: "Recipe not found",
          description: "The recipe you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate('/discover-recipes');
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
      toast({
        title: "Error loading recipe",
        description: "Failed to load recipe details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToMyRecipes = async () => {
    if (!recipe || !user || !currentHousehold) {
      toast({
        title: "Authentication required",
        description: "Please sign in and select a household to add recipes.",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      const result = await addImportedRecipeToHousehold(recipe, user.id, currentHousehold.id);
      
      if (result.success) {
        toast({
          title: "Recipe added!",
          description: "Recipe has been added to your household.",
        });
        
        // Show options dialog
        const shouldView = window.confirm("Recipe added successfully! Would you like to view it in your recipes?");
        if (shouldView && result.recipeId) {
          navigate(`/recipe/${result.recipeId}`);
        }
      } else {
        toast({
          title: "Failed to add recipe",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding recipe:', error);
      toast({
        title: "Error adding recipe",
        description: "Failed to add recipe to your household. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-1 sm:py-4 px-4 sm:px-6">
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container max-w-4xl py-1 sm:py-4 px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
          <p className="text-muted-foreground mb-6">The recipe you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/discover-recipes')}>
            Back to Discover Recipes
          </Button>
        </div>
      </div>
    );
  }

  const convertedRecipe = convertToRecipe(recipe);
  const isScaled = currentServings !== recipe.servings;

  return (
    <div className="container max-w-4xl py-1 sm:py-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Recipe Image */}
        <div className="relative h-64 sm:h-80 w-full rounded-lg overflow-hidden mb-4">
          <RecipeImage
            recipe={convertedRecipe}
            className="w-full h-full"
            iconSize="h-16 w-16"
          />
        </div>

        {/* Recipe Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {recipe.title}
        </h1>

        {/* Add to Meal Plan Button */}
        <Button 
          onClick={handleAddToMyRecipes}
          disabled={isAdding || !user || !currentHousehold}
          size="lg"
          className="w-full mb-6 bg-terracotta hover:bg-terracotta/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isAdding ? 'Adding to My Recipes...' : 'Add to My Recipes'}
        </Button>

        {/* Cooking Time and Recipe Info */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-terracotta" />
                <span className="text-navy font-medium text-sm">Prep: <span className="font-normal">{recipe.prep_time || 'N/A'} min</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-terracotta" />
                <span className="text-navy font-medium text-sm">Cook: <span className="font-normal">{recipe.cook_time || 'N/A'} min</span></span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRecipeInfo(true)}
              className="h-8 w-8 p-0 rounded-full"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {recipe.description && (
          <p className="text-gray-600 leading-relaxed mb-6">
            {recipe.description}
          </p>
        )}

        {/* Recipe Classification */}
        <RecipeClassificationSummary recipe={convertedRecipe} />

        {/* Top Tip */}
        {recipe.top_tip && recipe.top_tip !== "Enjoy cooking this delicious recipe!" && (
          <div className="mb-6">
            <div className="bg-sage/10 border border-sage/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Lightbulb className="h-5 w-5 text-sage" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sage-800 mb-2">Top Tip</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {recipe.top_tip}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Servings Controller */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-terracotta" />
            <span className="text-gray-700 font-medium">Servings:</span>
            <ServingsSelector
              currentServings={currentServings}
              onServingsChange={handleServingsChange}
              minServings={1}
              maxServings={20}
            />
            {isScaled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleServingsReset}
                className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 flex-shrink-0"
                title="Reset to original servings"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <RecipeTabContent
          recipe={convertedRecipe} 
          scaledIngredients={scaledIngredients}
          isScaled={isScaled}
        />

        {/* Recipe Info Dialog */}
        <RecipeInfoDialog
          open={showRecipeInfo}
          onOpenChange={setShowRecipeInfo}
          sourceUrl={recipe.source_url}
          importMethod="imported"
          createdBy={recipe.imported_by}
          createdAt={recipe.created_at}
          updatedAt={recipe.updated_at}
          lastUpdatedBy={recipe.imported_by}
        />
      </div>
    </div>
  );
}