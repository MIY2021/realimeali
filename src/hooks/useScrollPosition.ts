
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollPosition {
  x: number;
  y: number;
}

export const useScrollPosition = () => {
  const location = useLocation();
  const scrollKey = useRef<string>('');

  const saveScrollPosition = (key: string) => {
    const position: ScrollPosition = {
      x: window.scrollX,
      y: window.scrollY,
    };
    sessionStorage.setItem(`scroll_${key}`, JSON.stringify(position));
    console.log('Saved scroll position:', position, 'for key:', key);
  };

  const restoreScrollPosition = (key: string) => {
    const savedPosition = sessionStorage.getItem(`scroll_${key}`);
    if (savedPosition) {
      try {
        const position: ScrollPosition = JSON.parse(savedPosition);
        console.log('Restoring scroll position:', position, 'for key:', key);
        
        // Wait for DOM to be ready and content to load
        const attemptRestore = () => {
          // Check if page has content loaded
          const hasContent = document.querySelector('[data-testid="recipe-list"], .grid') || 
                           document.querySelectorAll('.recipe-card, [data-recipe-card]').length > 0;
          
          if (hasContent || document.readyState === 'complete') {
            console.log('Content ready, restoring scroll position');
            window.scrollTo(position.x, position.y);
          } else {
            // Try again after a short delay
            setTimeout(attemptRestore, 100);
          }
        };

        // Use multiple timing strategies for reliability
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(attemptRestore, 50);
          });
        });
      } catch (error) {
        console.error('Error restoring scroll position:', error);
      }
    }
  };

  const clearScrollPosition = (key: string) => {
    sessionStorage.removeItem(`scroll_${key}`);
  };

  // Save scroll position when navigating away from current route
  useEffect(() => {
    return () => {
      if (scrollKey.current) {
        saveScrollPosition(scrollKey.current);
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
