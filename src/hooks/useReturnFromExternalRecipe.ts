import { useState, useEffect } from "react";

interface PendingRecipe {
  url: string;
  title: string;
  image?: string;
  timestamp: number;
}

export function useReturnFromExternalRecipe() {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [pendingRecipe, setPendingRecipe] = useState<PendingRecipe | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const pending = sessionStorage.getItem('pendingRecipeImport');
        if (pending) {
          try {
            const data = JSON.parse(pending);
            // Only show if less than 5 minutes old
            if (Date.now() - data.timestamp < 5 * 60 * 1000) {
              setShowImportDialog(true);
              setPendingRecipe(data);
            }
          } catch (error) {
            console.error('Failed to parse pending recipe:', error);
          }
          sessionStorage.removeItem('pendingRecipeImport');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check immediately on mount in case user returned via back button
    const pending = sessionStorage.getItem('pendingRecipeImport');
    if (pending) {
      try {
        const data = JSON.parse(pending);
        if (Date.now() - data.timestamp < 5 * 60 * 1000) {
          setShowImportDialog(true);
          setPendingRecipe(data);
        }
      } catch (error) {
        console.error('Failed to parse pending recipe:', error);
      }
      sessionStorage.removeItem('pendingRecipeImport');
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const closeDialog = () => {
    setShowImportDialog(false);
    setPendingRecipe(null);
  };

  return {
    showImportDialog,
    pendingRecipe,
    closeDialog,
  };
}
