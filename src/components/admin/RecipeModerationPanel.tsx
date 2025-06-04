
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, Eye, Link, Clock, Circle, Sparkles, Upload } from "lucide-react";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { Input } from "@/components/ui/input";

export function RecipeModerationPanel() {
  const [pendingRecipes, setPendingRecipes] = useState<CommunityRecipe[]>([]);
  const [approvedRecipes, setApprovedRecipes] = useState<CommunityRecipe[]>([]);
  const [rejectedRecipes, setRejectedRecipes] = useState<CommunityRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState<{ [key: string]: boolean }>({});

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      // Fetch pending recipes
      const { data: pending, error: pendingError } = await supabase
        .from('community_recipes')
        .select('*')
        .eq('moderation_status', 'pending')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      // Fetch approved recipes
      const { data: approved, error: approvedError } = await supabase
        .from('community_recipes')
        .select('*')
        .eq('moderation_status', 'approved')
        .eq('is_active', true)
        .order('approved_at', { ascending: false })
        .limit(20);

      if (approvedError) throw approvedError;

      // Fetch rejected recipes
      const { data: rejected, error: rejectedError } = await supabase
        .from('community_recipes')
        .select('*')
        .eq('moderation_status', 'rejected')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (rejectedError) throw rejectedError;

      // Cast the data to match our interface since database returns string for moderation_status
      setPendingRecipes((pending || []) as CommunityRecipe[]);
      setApprovedRecipes((approved || []) as CommunityRecipe[]);
      setRejectedRecipes((rejected || []) as CommunityRecipe[]);
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

  const generateAIDescription = async (recipe: CommunityRecipe) => {
    setGeneratingAI(prev => ({ ...prev, [`${recipe.id}-desc`]: true }));
    
    try {
      const response = await fetch(`https://bdjzefekuahfofwzxqxd.supabase.co/functions/v1/generate-community-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkanplZmVrdWFoZm9md3p4cXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MjE1ODQsImV4cCI6MjA2MjI5NzU4NH0.AyzVwsNDgyjeveMtz4-6mVnJGr7DaU8ZUJhr5Yk_us8`,
        },
        body: JSON.stringify({
          recipeTitle: recipe.title,
          originalDescription: recipe.description,
          sourceUrl: recipe.source_url,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate description');

      const data = await response.json();
      
      // Update the recipe in the database
      const { error } = await supabase
        .from('community_recipes')
        .update({ 
          ai_generated_description: data.description,
          moderation_status: 'in_review'
        })
        .eq('id', recipe.id);

      if (error) throw error;

      toast.success("AI description generated successfully");
      fetchRecipes();
    } catch (error) {
      console.error('Error generating AI description:', error);
      toast.error("Failed to generate AI description");
    } finally {
      setGeneratingAI(prev => ({ ...prev, [`${recipe.id}-desc`]: false }));
    }
  };

  const generateAIImage = async (recipe: CommunityRecipe) => {
    setGeneratingAI(prev => ({ ...prev, [`${recipe.id}-img`]: true }));
    
    try {
      const response = await fetch(`https://bdjzefekuahfofwzxqxd.supabase.co/functions/v1/generate-recipe-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkanplZmVrdWFoZm9md3p4cXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MjE1ODQsImV4cCI6MjA2MjI5NzU4NH0.AyzVwsNDgyjeveMtz4-6mVnJGr7DaU8ZUJhr5Yk_us8`,
        },
        body: JSON.stringify({
          prompt: recipe.title,
          isCommunityRecipe: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate image');

      const data = await response.json();
      
      // Update the recipe in the database
      const { error } = await supabase
        .from('community_recipes')
        .update({ 
          ai_generated_image_url: data.imageUrl,
          moderation_status: 'in_review'
        })
        .eq('id', recipe.id);

      if (error) throw error;

      toast.success("AI image generated successfully");
      fetchRecipes();
    } catch (error) {
      console.error('Error generating AI image:', error);
      toast.error("Failed to generate AI image");
    } finally {
      setGeneratingAI(prev => ({ ...prev, [`${recipe.id}-img`]: false }));
    }
  };

  const updateAIImageUrl = async (recipe: CommunityRecipe, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('community_recipes')
        .update({ 
          ai_generated_image_url: imageUrl,
          moderation_status: 'in_review'
        })
        .eq('id', recipe.id);

      if (error) throw error;

      toast.success("Image URL updated successfully");
      fetchRecipes();
    } catch (error) {
      console.error('Error updating image URL:', error);
      toast.error("Failed to update image URL");
    }
  };

  const approveRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from('community_recipes')
        .update({
          moderation_status: 'approved',
          is_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', recipeId);

      if (error) throw error;

      toast.success("Recipe approved successfully");
      fetchRecipes();
    } catch (error) {
      console.error('Error approving recipe:', error);
      toast.error("Failed to approve recipe");
    }
  };

  const rejectRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from('community_recipes')
        .update({
          moderation_status: 'rejected',
          is_active: false,
        })
        .eq('id', recipeId);

      if (error) throw error;

      toast.success("Recipe rejected");
      fetchRecipes();
    } catch (error) {
      console.error('Error rejecting recipe:', error);
      toast.error("Failed to reject recipe");
    }
  };

  const RecipeCard = ({ recipe, showActions = false }: { recipe: CommunityRecipe; showActions?: boolean }) => {
    const [imageUrl, setImageUrl] = useState(recipe.ai_generated_image_url || '');
    
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">{recipe.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>by {recipe.submitted_by_name || 'Anonymous'}</span>
                <span>•</span>
                <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
                <Badge variant="outline" className="ml-2">
                  {recipe.moderation_status}
                </Badge>
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
            {(recipe.ai_generated_image_url || recipe.image_url) && (
              <img 
                src={recipe.ai_generated_image_url || recipe.image_url} 
                alt={recipe.title}
                className="w-20 h-20 object-cover rounded-md ml-4"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Original content for moderator reference */}
          {showActions && recipe.description && (
            <div className="mb-4 p-3 bg-muted rounded-md">
              <h4 className="font-medium text-sm mb-2">Original Description (Moderator Reference Only):</h4>
              <p className="text-sm text-muted-foreground">{recipe.description}</p>
            </div>
          )}

          {/* AI-generated content */}
          {recipe.ai_generated_description && (
            <div className="mb-4 p-3 bg-green-50 rounded-md border border-green-200">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-green-600" />
                AI-Generated Description (Public Display):
              </h4>
              <p className="text-sm">{recipe.ai_generated_description}</p>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Clock className="h-4 w-4" />
            <span>Prep: {recipe.prep_time}min</span>
            <span>•</span>
            <span>Cook: {recipe.cook_time}min</span>
            <span>•</span>
            <span>Serves: {recipe.servings}</span>
          </div>

          {showActions && (
            <div className="space-y-4">
              {/* AI Content Generation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateAIDescription(recipe)}
                    disabled={generatingAI[`${recipe.id}-desc`]}
                    className="w-full"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    {generatingAI[`${recipe.id}-desc`] ? 'Generating...' : 'Generate AI Summary'}
                  </Button>
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateAIImage(recipe)}
                    disabled={generatingAI[`${recipe.id}-img`]}
                    className="w-full"
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    {generatingAI[`${recipe.id}-img`] ? 'Generating...' : 'Generate AI Image'}
                  </Button>
                </div>
              </div>

              {/* Manual image URL input */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Or paste image URL manually"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateAIImageUrl(recipe, imageUrl)}
                  disabled={!imageUrl || imageUrl === recipe.ai_generated_image_url}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Update
                </Button>
              </div>

              {/* Approval actions - only show if AI content exists */}
              {recipe.ai_generated_description && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(recipe.source_url, '_blank')}
                    >
                      <Link className="h-4 w-4 mr-1" />
                      View Source
                    </Button>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{recipe.view_count}</span>
                    </div>
                  </div>
                  
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
                </div>
              )}

              {!recipe.ai_generated_description && (
                <div className="text-center p-4 bg-amber-50 rounded-md border border-amber-200">
                  <p className="text-sm text-amber-800">
                    Generate AI content before approving this recipe for public display.
                  </p>
                </div>
              )}
            </div>
          )}

          {!showActions && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(recipe.source_url, '_blank')}
                >
                  <Link className="h-4 w-4 mr-1" />
                  View Source
                </Button>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{recipe.view_count}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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
          <Check className="h-4 w-4" />
          Approved ({approvedRecipes.length})
        </TabsTrigger>
        <TabsTrigger value="rejected" className="flex items-center gap-2">
          <Circle className="h-4 w-4" />
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
            <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
            <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
