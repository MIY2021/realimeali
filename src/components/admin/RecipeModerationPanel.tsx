
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, Eye, ExternalLink, Clock, CheckCircle, XCircle } from "lucide-react";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";

export function RecipeModerationPanel() {
  const [pendingRecipes, setPendingRecipes] = useState<CommunityRecipe[]>([]);
  const [approvedRecipes, setApprovedRecipes] = useState<CommunityRecipe[]>([]);
  const [rejectedRecipes, setRejectedRecipes] = useState<CommunityRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      // Fetch pending recipes
      const { data: pending, error: pendingError } = await supabase
        .from('community_recipes')
        .select('*')
        .eq('is_approved', false)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      // Fetch approved recipes
      const { data: approved, error: approvedError } = await supabase
        .from('community_recipes')
        .select('*')
        .eq('is_approved', true)
        .eq('is_active', true)
        .order('approved_at', { ascending: false })
        .limit(20);

      if (approvedError) throw approvedError;

      // Fetch rejected recipes
      const { data: rejected, error: rejectedError } = await supabase
        .from('community_recipes')
        .select('*')
        .eq('is_active', false)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (rejectedError) throw rejectedError;

      setPendingRecipes(pending || []);
      setApprovedRecipes(approved || []);
      setRejectedRecipes(rejected || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error("Failed to load recipes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const approveRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase.rpc('approve_community_recipe', {
        recipe_id: recipeId
      });

      if (error) throw error;

      toast.success("Recipe approved successfully");
      fetchRecipes(); // Refresh the list
    } catch (error) {
      console.error('Error approving recipe:', error);
      toast.error("Failed to approve recipe");
    }
  };

  const rejectRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase.rpc('reject_community_recipe', {
        recipe_id: recipeId
      });

      if (error) throw error;

      toast.success("Recipe rejected");
      fetchRecipes(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting recipe:', error);
      toast.error("Failed to reject recipe");
    }
  };

  const RecipeCard = ({ recipe, showActions = false }: { recipe: CommunityRecipe; showActions?: boolean }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{recipe.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>by {recipe.submitted_by_name || 'Anonymous'}</span>
              <span>•</span>
              <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              {recipe.category && (
                <Badge variant="secondary">{recipe.category}</Badge>
              )}
              {recipe.cuisine && (
                <Badge variant="outline">{recipe.cuisine}</Badge>
              )}
              {recipe.difficulty_level && (
                <Badge variant="outline">{recipe.difficulty_level}</Badge>
              )}
            </div>
          </div>
          {recipe.image_url && (
            <img 
              src={recipe.image_url} 
              alt={recipe.title}
              className="w-20 h-20 object-cover rounded-md ml-4"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {recipe.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {recipe.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Clock className="h-4 w-4" />
          <span>Prep: {recipe.prep_time}min</span>
          <span>•</span>
          <span>Cook: {recipe.cook_time}min</span>
          <span>•</span>
          <span>Serves: {recipe.servings}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(recipe.source_url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View Source
            </Button>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{recipe.view_count}</span>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => approveRecipe(recipe.id)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => rejectRecipe(recipe.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Pending ({pendingRecipes.length})
        </TabsTrigger>
        <TabsTrigger value="approved" className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Approved ({approvedRecipes.length})
        </TabsTrigger>
        <TabsTrigger value="rejected" className="flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          Rejected ({rejectedRecipes.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-6">
        {pendingRecipes.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No pending recipes to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} showActions={true} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="approved" className="mt-6">
        {approvedRecipes.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No approved recipes yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="rejected" className="mt-6">
        {rejectedRecipes.length === 0 ? (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No rejected recipes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rejectedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
