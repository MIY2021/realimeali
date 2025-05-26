
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
      const checkContent = () => {
        // Check for recipe list container
        const recipeList = document.querySelector('[data-testid="recipe-list"]');
        const recipeCards = document.querySelectorAll('[data-recipe-card]');
        const hasCards = recipeCards.length > 0;
        
        // Check if images are loaded or loading
        const images = document.querySelectorAll('[data-recipe-card] img');
        const imagesReady = images.length === 0 || Array.from(images).some(img => 
          (img as HTMLImageElement).complete || (img as HTMLImageElement).naturalHeight > 0
        );

        if (recipeList && hasCards && imagesReady) {
          console.log('Content ready - found recipe list with cards and images');
          resolve(true);
          return true;
        }
        return false;
      };

      // Try immediate check first
      if (checkContent()) return;

      // Set up intersection observer for recipe cards
      observerRef.current = new IntersectionObserver((entries) => {
        const visibleCards = entries.filter(entry => entry.isIntersecting);
        if (visibleCards.length > 0 && checkContent()) {
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

      // Observe recipe cards when they appear
      const checkForCards = () => {
        const cards = document.querySelectorAll('[data-recipe-card]');
        cards.forEach(card => {
          if (observerRef.current) {
            observerRef.current.observe(card);
          }
        });
      };

      checkForCards();
      
      // Fallback timeout
      setTimeout(() => {
        console.log('Content wait timeout, proceeding anyway');
        resolve(true);
      }, 2000);
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
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('Content ready, restoring scroll position');
        
        // Restore scroll position with smooth behavior
        window.scrollTo({
          left: position.x,
          top: position.y,
          behavior: 'auto'
        });

        // Verify scroll was successful after a brief delay
        setTimeout(() => {
          const currentScroll = window.scrollY;
          const targetScroll = position.y;
          const threshold = 50; // Allow for some variation

          if (Math.abs(currentScroll - targetScroll) > threshold) {
            console.log('Scroll verification failed, retrying...', { current: currentScroll, target: targetScroll });
            window.scrollTo({
              left: position.x,
              top: position.y,
              behavior: 'auto'
            });
          } else {
            console.log('Scroll position restored successfully');
          }
        }, 200);

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
