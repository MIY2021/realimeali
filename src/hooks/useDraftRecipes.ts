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

// Gmail-style auto-save: pure localStorage function with ZERO React dependencies
const autoSaveToLocalStorage = (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
  const hasContent = recipe.title.trim() || 
                    recipe.description.trim() || 
                    recipe.ingredients.length > 0 || 
                    recipe.instructions.length > 0 ||
                    recipe.image;

  if (hasContent) {
    const timestamp = Date.now();
    const draft: DraftRecipe = { recipe, timestamp };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }
};

export function useDraftRecipes() {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState<DraftInfo | null>(null);

  // Check for existing draft on mount only
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
    }
  }, []);

  // Pure auto-save function - NO state updates, NO re-renders
  const autoSave = useCallback((recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    autoSaveToLocalStorage(recipe);
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
    setDraftInfo(null);
  }, []);

  // Mark changes as saved (when recipe is successfully saved)
  const markSaved = useCallback(() => {
    clearDraft();
  }, [clearDraft]);

  return {
    hasDraft,
    autoSave, // Gmail-style invisible auto-save
    loadDraft,
    clearDraft,
    markSaved,
    draftInfo
  };
}