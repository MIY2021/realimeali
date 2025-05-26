import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Users, CalendarDays, cloud } from "lucide-react";
import { RecipeImage } from "@/components/ui/recipe-image";
import { usePublicRecipeSharing, PublicRecipeShare } from "@/hooks/usePublicRecipeSharing";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function PublicRecipeView() {
  const { publicShareId } = useParams();
  const { user } = useAuth();
  const { getPublicShare, trackView, saveToMyRecipes, isSavingRecipe } = usePublicRecipeSharing();
  const [publicShare, setPublicShare] = useState<PublicRecipeShare | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useDocumentTitle(publicShare ? `${publicShare.title} | Shared Recipe` : "Shared Recipe");

  useEffect(() => {
    const fetchPublicShare = async () => {
      if (!publicShareId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      const share = await getPublicShare(publicShareId);
      if (share) {
        setPublicShare(share);
        // Track view separately after fetching data
        trackView(publicShareId);
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    };

    fetchPublicShare();
  }, [publicShareId, getPublicShare, trackView]);

  const handleSaveRecipe = async () => {
    if (!publicShare) return;
    
    const success = await saveToMyRecipes(publicShare);
    if (success) {
      // Optionally redirect to recipes page or show success message
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="lg:w-1/2">
              <Skeleton className="aspect-video w-full rounded-lg" />
            </div>
            <div className="lg:w-1/2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-10 w-full sm:w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !publicShare) {
    return (
      <div className="container max-w-4xl py-8 px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
          <p className="text-gray-600 mb-6">This shared recipe doesn't exist or may have expired.</p>
          <Button asChild variant="outline">
            <a href="/">Go to Homepage</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-terracotta/10 to-sage/10 rounded-lg p-4 border border-terracotta/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-terracotta/20 rounded-full">
                <Users className="h-5 w-5 text-terracotta" />
              </div>
              <div>
                <p className="font-medium text-navy">Shared Recipe</p>
                <p className="text-sm text-muted-foreground">
                  From {publicShare.shared_by_name || 'Unknown user'} 
                  {publicShare.shared_by_household_name && ` (${publicShare.shared_by_household_name})`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-sage rounded-full"></span>
                <span>{publicShare.view_count} views</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>Shared {format(new Date(publicShare.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-1/2">
            <div className="aspect-video overflow-hidden rounded-lg">
              <RecipeImage 
                recipe={{
                  id: publicShare.id,
                  title: publicShare.title,
                  image: publicShare.image,
                  // Add other required Recipe properties with fallbacks
                  description: publicShare.description || '',
                  ingredients: publicShare.ingredients,
                  instructions: publicShare.instructions,
                  categories: publicShare.categories as any[],
                  prepTime: publicShare.prep_time,
                  cookTime: publicShare.cook_time,
                  servings: publicShare.servings,
                  createdBy: publicShare.shared_by_user_id,
                  createdAt: publicShare.created_at,
                  updatedAt: publicShare.created_at,
                  isFavorite: false,
                  householdId: publicShare.original_household_id,
                }} 
                className="h-full w-full" 
                iconSize="h-16 w-16" 
              />
            </div>
          </div>
          
          <div className="lg:w-1/2 space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">{publicShare.title}</h1>
            <div className="flex flex-wrap gap-2">
              {publicShare.categories.map((category) => (
                <span 
                  key={category} 
                  className="inline-flex items-center rounded-full bg-sage/20 px-2.5 py-1 text-xs font-medium text-sage"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              ))}
            </div>
            {publicShare.description && (
              <p className="text-muted-foreground">{publicShare.description}</p>
            )}
            
            {/* Recipe Stats */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-terracotta" />
                <span>Prep: {publicShare.prep_time} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-terracotta" />
                <span>Cook: {publicShare.cook_time} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-terracotta" />
                <span>Total: {publicShare.prep_time + publicShare.cook_time} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-terracotta" />
                <span>Serves: {publicShare.servings}</span>
              </div>
            </div>

            {/* Save Button */}
            {user && (
              <div className="pt-4">
                <Button 
                  onClick={handleSaveRecipe}
                  disabled={isSavingRecipe}
                  className="w-full sm:w-auto"
                  style={{ backgroundColor: '#e38165' }}
                >
                  <cloud className="h-4 w-4 mr-2" />
                  {isSavingRecipe ? 'Saving...' : '📖 Add To My Recipes'}
                </Button>
              </div>
            )}
            
            {!user && (
              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Sign in to add this recipe to your collection
                </p>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a href="/login">📖 Add To My Recipes</a>
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-navy">Ingredients</h2>
            <ul className="space-y-2">
              {publicShare.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 block h-2 w-2 rounded-full bg-terracotta flex-shrink-0" />
                  <span className="text-sm sm:text-base">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-navy">Instructions</h2>
            <ol className="space-y-4">
              {publicShare.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-white text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm sm:text-base">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
