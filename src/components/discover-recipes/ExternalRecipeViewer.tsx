import { useCallback, useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, Plus, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EdamamHit } from "@/types/edamam";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ExternalRecipeViewerProps {
  hits: EdamamHit[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function ExternalRecipeViewer({ hits, index, onClose, onIndexChange }: ExternalRecipeViewerProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isImporting, setIsImporting] = useState(false);
  const current = hits[index];

  const hasPrev = index > 0;
  const hasNext = index < hits.length - 1;

  const url = current?.recipe.url || "";

  const handlePrev = useCallback(() => {
    if (hasPrev) onIndexChange(index - 1);
  }, [hasPrev, index, onIndexChange]);

  const handleNext = useCallback(() => {
    if (hasNext) onIndexChange(index + 1);
  }, [hasNext, index, onIndexChange]);

  const encodedDomain = useMemo(() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "external site";
    }
  }, [url]);

  const handleAddToMyRecipes = useCallback(async () => {
    if (!url) return;
    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { websiteUrl: url, extractImages: true },
      });
      if (error) throw error;
      const parsed = data?.parsedRecipe;
      if (!parsed) throw new Error('Could not extract recipe from this page.');

      // Build query params for CreateRecipePage to prefill
      const params = new URLSearchParams();
      params.set('tab', 'manual');
      params.set('import_method', 'url');
      if (parsed.title) params.set('title', parsed.title);
      if (parsed.description) params.set('description', parsed.description);
      if (parsed.ingredients) params.set('ingredients', JSON.stringify(parsed.ingredients));
      if (parsed.instructions) params.set('instructions', JSON.stringify(parsed.instructions));
      if (parsed.servings) params.set('servings', String(parsed.servings));
      if (parsed.prepTime != null) params.set('prep_time', String(parsed.prepTime));
      if (parsed.cookTime != null) params.set('cook_time', String(parsed.cookTime));
      if (parsed.mealType) params.set('meal_types', JSON.stringify(parsed.mealType));
      if (parsed.cuisineRegion) params.set('cuisine_region', parsed.cuisineRegion);
      if (parsed.complexityLevel) params.set('complexity_level', parsed.complexityLevel);
      if (parsed.dietLifestyle) params.set('diet_lifestyle', JSON.stringify(parsed.dietLifestyle));

      toast({
        title: 'Recipe imported! ✨',
        description: `Loaded "${parsed.title || 'Recipe'}" from ${encodedDomain}`,
      });

      navigate(`/add-recipe?${params.toString()}`);
    } catch (e: any) {
      console.error('Import error', e);
      toast({
        title: 'Import failed',
        description: e?.message || 'Please try again or use Paste Text instead.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  }, [encodedDomain, navigate, toast, url]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-background/90 border-b">
        <div className="flex items-center gap-3 min-w-0">
          <img src={current.recipe.image} alt={current.recipe.label} className="h-8 w-8 rounded object-cover" />
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-navy truncate">{current.recipe.label}</h2>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <Globe className="h-3 w-3" /> {encodedDomain}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close viewer">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-background">
        <iframe
          src={url}
          title={current.recipe.label}
          className="w-full h-full"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Bottom bar */}
      <div className="border-t bg-background/95 p-3 sm:p-4 flex items-center justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={!hasPrev}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
        <Button onClick={handleAddToMyRecipes} disabled={isImporting}>
          <Plus className="h-4 w-4 mr-2" /> {isImporting ? 'Adding...' : 'Add to My Recipes'}
        </Button>
        <Button variant="outline" onClick={handleNext} disabled={!hasNext}>
          Next <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
