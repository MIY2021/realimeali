
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, Clock, Circle } from "lucide-react";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { RecipeCard } from "./moderation/RecipeCard";
import { useRecipeModerationOperations } from "./moderation/useRecipeModerationOperations";

export function RecipeModerationPanel() {
  const [pendingRecipes, setPendingRecipes] = useState<CommunityRecipe[]>([]);
  const [approvedRecipes, setApprovedRecipes] = useState<CommunityRecipe[]>([]);
  const [rejectedRecipes, setRejectedRecipes] = useState<CommunityRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("🔍 Fetching recipes for moderation...");
      
      // Fetch pending recipes - include both 'pending' and null moderation_status
      const { data: pending, error: pendingError } = await supabase
        .from('community_recipes')
        .select('*')
        .or('moderation_status.eq.pending,moderation_status.is.null')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (pendingError) {
        console.error("❌ Error fetching pending recipes:", pendingError);
        throw pendingError;
      }

      console.log("📝 Found pending recipes:", pending?.length || 0);

      // Fetch approved recipes
      const { data: approved, error: approvedError } = await supabase
        .from('community_recipes')
        .select('*')
        .eq('moderation_status', 'approved')
        .eq('is_active', true)
        .order('approved_at', { ascending: false })
        .limit(20);

      if (approvedError) {
        console.error("❌ Error fetching approved recipes:", approvedError);
        throw approvedError;
      }

      console.log("✅ Found approved recipes:", approved?.length || 0);

      // Fetch rejected recipes
      const { data: rejected, error: rejectedError } = await supabase
        .from('community_recipes')
        .select('*')
        .eq('moderation_status', 'rejected')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (rejectedError) {
        console.error("❌ Error fetching rejected recipes:", rejectedError);
        throw rejectedError;
      }

      console.log("❌ Found rejected recipes:", rejected?.length || 0);

      // Cast the data to match our interface since database returns string for moderation_status
      setPendingRecipes((pending || []) as CommunityRecipe[]);
      setApprovedRecipes((approved || []) as CommunityRecipe[]);
      setRejectedRecipes((rejected || []) as CommunityRecipe[]);
      
      console.log("📊 Recipe counts - Pending:", pending?.length, "Approved:", approved?.length, "Rejected:", rejected?.length);
    } catch (error) {
      console.error('❌ Error fetching recipes:', error);
      toast.error("Failed to load recipes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { 
    generateAIDescription,
    updateAIImageUrl,
    approveRecipe,
    rejectRecipe,
    generatingAI
  } = useRecipeModerationOperations(fetchRecipes);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

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
            <p className="text-xs text-muted-foreground mt-2">
              Check console logs for debugging information
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRecipes.map((recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                showActions={true}
                onGenerateAIDescription={generateAIDescription}
                onUpdateImageUrl={updateAIImageUrl}
                onApprove={approveRecipe}
                onReject={rejectRecipe}
                generatingAI={generatingAI}
              />
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
