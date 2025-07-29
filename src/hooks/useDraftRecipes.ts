import { useState, useEffect, useCallback } from "react";
import { Recipe } from "@/types";

const DRAFT_STORAGE_KEY = "recipe_draft";

interface DraftRecipe {
  recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
  timestamp: number;
}

export function useDraftRecipes() {
  const [hasDraft, setHasDraft] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check for existing draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
    setHasDraft(!!draft);
  }, []);

  // Save draft to localStorage
  const saveDraft = useCallback((recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    // Only save if recipe has meaningful content
    const hasContent = recipe.title.trim() || 
                      recipe.description.trim() || 
                      recipe.ingredients.length > 0 || 
                      recipe.instructions.length > 0 ||
                      recipe.image;

    if (hasContent) {
      const draft: DraftRecipe = {
        recipe,
        timestamp: Date.now()
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setHasDraft(true);
      setHasUnsavedChanges(true);
    }
  }, []);

  // Load draft from localStorage
  const loadDraft = useCallback((): Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'> | null => {
    try {
      const draftJson = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (draftJson) {
        const draft: DraftRecipe = JSON.parse(draftJson);
        return draft.recipe;
      }
    } catch (error) {
      console.error("Error loading draft:", error);
      clearDraft();
    }
    return null;
  }, []);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
    setHasUnsavedChanges(false);
  }, []);

  // Mark changes as saved (when recipe is successfully saved)
  const markSaved = useCallback(() => {
    setHasUnsavedChanges(false);
    clearDraft();
  }, [clearDraft]);

  // Check if current recipe differs from saved state
  const checkForUnsavedChanges = useCallback((currentRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    const hasContent = Boolean(currentRecipe.title.trim() || 
                              currentRecipe.description.trim() || 
                              currentRecipe.ingredients.length > 0 || 
                              currentRecipe.instructions.length > 0 ||
                              currentRecipe.image);
    
    setHasUnsavedChanges(hasContent);
    return hasContent;
  }, []);

  return {
    hasDraft,
    hasUnsavedChanges,
    saveDraft,
    loadDraft,
    clearDraft,
    markSaved,
    checkForUnsavedChanges
  };
}