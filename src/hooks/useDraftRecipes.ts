import { useState, useEffect, useCallback } from "react";
import { Recipe } from "@/types";

const DRAFT_STORAGE_KEY = "recipe_draft";

interface DraftRecipe {
  recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
  timestamp: number;
}

export interface DraftInfo {
  timestamp: number;
  formattedTime: string;
}

export function useDraftRecipes() {
  const [hasDraft, setHasDraft] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [draftInfo, setDraftInfo] = useState<DraftInfo | null>(null);

  // Check for existing draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draft) {
      try {
        const parsed: DraftRecipe = JSON.parse(draft);
        const formattedTime = new Date(parsed.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        setDraftInfo({ timestamp: parsed.timestamp, formattedTime });
        setHasDraft(true);
      } catch {
        setHasDraft(false);
        setDraftInfo(null);
      }
    } else {
      setHasDraft(false);
      setDraftInfo(null);
    }
  }, []);

  // Save draft to localStorage silently (no state updates to prevent re-renders)
  const saveDraftSilently = useCallback((recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    // Only save if recipe has meaningful content
    const hasContent = recipe.title.trim() || 
                      recipe.description.trim() || 
                      recipe.ingredients.length > 0 || 
                      recipe.instructions.length > 0 ||
                      recipe.image;

    if (hasContent) {
      const timestamp = Date.now();
      const draft: DraftRecipe = {
        recipe,
        timestamp
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
  }, []);

  // Save draft to localStorage with UI updates
  const saveDraft = useCallback((recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    // Only save if recipe has meaningful content
    const hasContent = recipe.title.trim() || 
                      recipe.description.trim() || 
                      recipe.ingredients.length > 0 || 
                      recipe.instructions.length > 0 ||
                      recipe.image;

    if (hasContent) {
      const timestamp = Date.now();
      const formattedTime = new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const draft: DraftRecipe = {
        recipe,
        timestamp
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setDraftInfo({ timestamp, formattedTime });
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
    setDraftInfo(null);
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
    saveDraftSilently,
    loadDraft,
    clearDraft,
    markSaved,
    checkForUnsavedChanges,
    draftInfo
  };
}