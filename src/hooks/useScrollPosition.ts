
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollPosition {
  x: number;
  y: number;
  layout?: string;
  timestamp: number;
}

export const useScrollPosition = () => {
  const location = useLocation();
  const scrollKey = useRef<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);

  const saveScrollPosition = (key: string, layout?: string) => {
    const position: ScrollPosition = {
      x: window.scrollX,
      y: window.scrollY,
      layout,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(`scroll_${key}`, JSON.stringify(position));
    console.log('Saved scroll position:', position, 'for key:', key);
  };

  const waitForContent = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const checkShoppingListContent = () => {
        const shoppingListContainer = document.querySelector('[data-shopping-list-container]');
        const shoppingListItems = document.querySelectorAll('[data-shopping-list-item]');
        const hasItems = shoppingListItems.length > 0;
        
        if (shoppingListContainer && hasItems) {
          console.log('Shopping list content ready - found container with items');
          return true;
        }
        return false;
      };

      const checkRecipeContent = () => {
        const recipeList = document.querySelector('[data-testid="recipe-list"]');
        const recipeCards = document.querySelectorAll('[data-recipe-card]');
        const hasCards = recipeCards.length > 0;
        
        const images = document.querySelectorAll('[data-recipe-card] img');
        const imagesReady = images.length === 0 || Array.from(images).some(img => 
          (img as HTMLImageElement).complete || (img as HTMLImageElement).naturalHeight > 0
        );

        if (recipeList && hasCards && imagesReady) {
          console.log('Recipe content ready - found recipe list with cards and images');
          return true;
        }
        return false;
      };

      const checkContent = () => {
        // Determine page type and use appropriate content checker
        const currentPath = window.location.pathname;
        if (currentPath.includes('/shopping-list')) {
          return checkShoppingListContent();
        } else if (currentPath.includes('/recipes')) {
          return checkRecipeContent();
        }
        
        // Fallback for other pages
        return document.readyState === 'complete';
      };

      // Try immediate check first
      if (checkContent()) {
        resolve(true);
        return;
      }

      // Set up intersection observer
      observerRef.current = new IntersectionObserver((entries) => {
        const visibleItems = entries.filter(entry => entry.isIntersecting);
        if (visibleItems.length > 0 && checkContent()) {
          resolve(true);
        }
      });

      // Set up mutation observer for DOM changes
      mutationObserverRef.current = new MutationObserver(() => {
        if (checkContent()) {
          resolve(true);
        }
      });

      // Start observing
      const targetElement = document.querySelector('main') || document.body;
      mutationObserverRef.current.observe(targetElement, {
        childList: true,
        subtree: true,
      });

      // Observe items when they appear
      const checkForItems = () => {
        const items = document.querySelectorAll('[data-shopping-list-item], [data-recipe-card]');
        items.forEach(item => {
          if (observerRef.current) {
            observerRef.current.observe(item);
          }
        });
      };

      checkForItems();
      
      // Reduced timeout for faster response
      setTimeout(() => {
        console.log('Content wait timeout, proceeding anyway');
        resolve(true);
      }, 1500);
    });
  };

  const restoreScrollPosition = async (key: string, currentLayout?: string) => {
    const savedPosition = sessionStorage.getItem(`scroll_${key}`);
    if (savedPosition) {
      try {
        const position: ScrollPosition = JSON.parse(savedPosition);
        console.log('Attempting to restore scroll position:', position, 'current layout:', currentLayout);
        
        // Check if layout has changed since saving
        if (position.layout && currentLayout && position.layout !== currentLayout) {
          console.log('Layout changed, clearing old scroll position');
          sessionStorage.removeItem(`scroll_${key}`);
          return;
        }

        // Check if position is too old (more than 1 hour)
        const isOld = Date.now() - position.timestamp > 3600000;
        if (isOld) {
          console.log('Scroll position is too old, clearing');
          sessionStorage.removeItem(`scroll_${key}`);
          return;
        }

        // Wait for content to be ready
        await waitForContent();

        // Additional small delay for layout stabilization
        await new Promise(resolve => setTimeout(resolve, 150));

        console.log('Content ready, restoring scroll position to:', position.y);
        
        // Restore scroll position immediately
        window.scrollTo({
          left: position.x,
          top: position.y,
          behavior: 'auto'
        });

        // Verify and retry if needed
        setTimeout(() => {
          const currentScroll = window.scrollY;
          const targetScroll = position.y;
          const threshold = 30;

          if (Math.abs(currentScroll - targetScroll) > threshold) {
            console.log('Scroll verification failed, retrying...', { current: currentScroll, target: targetScroll });
            window.scrollTo({
              left: position.x,
              top: position.y,
              behavior: 'auto'
            });
            
            // Final verification
            setTimeout(() => {
              const finalScroll = window.scrollY;
              if (Math.abs(finalScroll - targetScroll) > threshold) {
                console.log('Final scroll attempt...', { final: finalScroll, target: targetScroll });
                window.scrollTo(position.x, position.y);
              } else {
                console.log('Scroll position restored successfully');
              }
            }, 100);
          } else {
            console.log('Scroll position restored successfully');
          }
        }, 100);

      } catch (error) {
        console.error('Error restoring scroll position:', error);
      } finally {
        // Clean up observers
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
        if (mutationObserverRef.current) {
          mutationObserverRef.current.disconnect();
          mutationObserverRef.current = null;
        }
      }
    }
  };

  const clearScrollPosition = (key: string) => {
    sessionStorage.removeItem(`scroll_${key}`);
    console.log('Cleared scroll position for key:', key);
  };

  // Save scroll position when navigating away from current route
  useEffect(() => {
    return () => {
      if (scrollKey.current) {
        const currentLayout = localStorage.getItem('mobileRecipeLayout') || '1';
        saveScrollPosition(scrollKey.current, currentLayout);
      }
    };
  }, [location.pathname]);

  const setScrollKey = (key: string) => {
    scrollKey.current = key;
  };

  return {
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition,
    setScrollKey,
  };
};
