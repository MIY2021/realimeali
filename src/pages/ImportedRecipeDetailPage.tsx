import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, Users, Plus, Star } from 'lucide-react';
import { fetchImportedRecipeById, ImportedRecipe, incrementRecipeViewCount } from '@/services/importedRecipeService';
import { addImportedRecipeToHousehold } from '@/services/householdRecipeService';
import { useHouseholdContext } from '@/contexts/HouseholdContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useContext } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Skeleton } from '@/components/ui/skeleton';

export default function ImportedRecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const { selectedHousehold } = useHouseholdContext();
  
  const [recipe, setRecipe] = useState<ImportedRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useDocumentTitle(recipe ? `${recipe.title} | Discover Recipes` : 'Discover Recipes');

  useEffect(() => {
    if (id) {
      loadRecipe(id);
    }
  }, [id]);

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
    if (!recipe || !user || !selectedHousehold) {
      toast({
        title: "Authentication required",
        description: "Please sign in and select a household to add recipes.",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      const result = await addImportedRecipeToHousehold(recipe, user.id, selectedHousehold.id);
      
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
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-6 w-32" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
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

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Discover Recipes
        </Button>
        
        <Button 
          onClick={handleAddToMyRecipes}
          disabled={isAdding || !user || !selectedHousehold}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Adding...' : 'Add to My Recipes'}
        </Button>
      </div>

      {/* Recipe Title & Image */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-3xl font-bold text-navy">{recipe.title}</h1>
          {recipe.is_featured && (
            <Badge className="bg-primary text-primary-foreground">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        
        {recipe.description && (
          <p className="text-lg text-muted-foreground">{recipe.description}</p>
        )}

        {recipe.image && (
          <div className="relative">
            <img 
              src={recipe.image} 
              alt={recipe.title}
              className="w-full h-64 md:h-80 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Recipe Meta Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recipe.prep_time > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{recipe.prep_time}m</div>
                <div className="text-sm text-muted-foreground">Prep Time</div>
              </div>
            )}
            
            {recipe.cook_time > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{recipe.cook_time}m</div>
                <div className="text-sm text-muted-foreground">Cook Time</div>
              </div>
            )}
            
            {totalTime > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                  <Clock className="w-5 h-5" />
                  {totalTime}m
                </div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
            )}
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                <Users className="w-5 h-5" />
                {recipe.servings}
              </div>
              <div className="text-sm text-muted-foreground">Servings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {recipe.meal_types?.map((type) => (
          <Badge key={type} variant="secondary" className="capitalize">
            {type.replace('_', ' ')}
          </Badge>
        ))}
        
        {recipe.cuisine_region && (
          <Badge variant="outline" className="capitalize">
            {recipe.cuisine_region.replace('_', ' ')}
          </Badge>
        )}
        
        {recipe.diet_lifestyle?.map((diet) => (
          <Badge key={diet} variant="outline" className="capitalize">
            {diet.replace('_', ' ')}
          </Badge>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Ingredients */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Ingredients</h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Instructions</h3>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="pt-1">{instruction}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Tip */}
      {recipe.top_tip && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              💡 Chef's Tip
            </h3>
            <p className="text-muted-foreground italic">{recipe.top_tip}</p>
          </CardContent>
        </Card>
      )}

      {/* Nutrition Info */}
      {(recipe.fruit_veg_portions || recipe.fruit_veg_breakdown) && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Nutritional Information</h3>
            <div className="space-y-2">
              {recipe.fruit_veg_portions && (
                <div className="flex justify-between">
                  <span>5-a-day portions per serving:</span>
                  <Badge variant="secondary">{recipe.fruit_veg_portions}</Badge>
                </div>
              )}
              
              {recipe.fruit_veg_total_grams && (
                <div className="flex justify-between">
                  <span>Fruit & veg per serving:</span>
                  <Badge variant="secondary">{recipe.fruit_veg_total_grams}g</Badge>
                </div>
              )}
              
              {recipe.fruit_veg_breakdown && (
                <div className="pt-2">
                  <Separator className="mb-2" />
                  <p className="text-sm text-muted-foreground">{recipe.fruit_veg_breakdown}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Recipe CTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Love this recipe?</h3>
          <p className="text-muted-foreground mb-4">
            Add it to your household recipes to include it in meal planning and generate shopping lists.
          </p>
          <Button 
            size="lg"
            onClick={handleAddToMyRecipes}
            disabled={isAdding || !user || !selectedHousehold}
            className="w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAdding ? 'Adding to My Recipes...' : 'Add to My Recipes'}
          </Button>
          
          {(!user || !selectedHousehold) && (
            <p className="text-xs text-muted-foreground mt-2">
              Please sign in and select a household to add recipes
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}