import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface NavigationType {
  type: 'forward' | 'back' | 'fresh' | 'external';
  shouldScrollToTop: boolean;
  shouldRestoreScroll: boolean;
}

export const useSmartNavigation = () => {
  const location = useLocation();
  const navigationHistoryRef = useRef<string[]>([]);
  const lastScrollPositionsRef = useRef<Map<string, number>>(new Map());

  const determineNavigationType = (): NavigationType => {
    const currentPath = location.pathname;
    const history = navigationHistoryRef.current;
    const previousPath = history[history.length - 1];
    
    // Check if this is a back navigation
    const isBackNavigation = history.length > 1 && 
      history[history.length - 2] === currentPath;
    
    // Check if this is a fresh page load or external navigation
    const isFreshNavigation = !previousPath || 
      sessionStorage.getItem('navigationContext') !== 'internal';
    
    if (isBackNavigation) {
      return {
        type: 'back',
        shouldScrollToTop: false,
        shouldRestoreScroll: true
      };
    }
    
    if (isFreshNavigation) {
      return {
        type: 'fresh',
        shouldScrollToTop: true,
        shouldRestoreScroll: false
      };
    }
    
    return {
      type: 'forward',
      shouldScrollToTop: true,
      shouldRestoreScroll: false
    };
  };

  const saveScrollPosition = (path: string = location.pathname) => {
    const scrollY = window.scrollY;
    lastScrollPositionsRef.current.set(path, scrollY);
    sessionStorage.setItem(`scroll_${path}`, scrollY.toString());
  };

  const restoreScrollPosition = (path: string = location.pathname): Promise<void> => {
    return new Promise((resolve) => {
      const savedScroll = sessionStorage.getItem(`scroll_${path}`) || 
        lastScrollPositionsRef.current.get(path)?.toString();
      
      if (savedScroll) {
        const scrollY = parseInt(savedScroll, 10);
        
        // Wait for content to be ready before restoring
        requestAnimationFrame(() => {
          setTimeout(() => {
            window.scrollTo({
              top: scrollY,
              behavior: 'instant'
            });
            resolve();
          }, 50);
        });
      } else {
        resolve();
      }
    });
  };

  const smoothScrollToTop = (): Promise<void> => {
    return new Promise((resolve) => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Wait for scroll to complete
      setTimeout(resolve, 300);
    });
  };

  useEffect(() => {
    const currentPath = location.pathname;
    const navigation = determineNavigationType();
    
    // Update navigation history
    const history = navigationHistoryRef.current;
    if (navigation.type === 'back') {
      // Remove the last entry to maintain correct back navigation tracking
      history.pop();
    } else {
      history.push(currentPath);
      // Keep history manageable
      if (history.length > 10) {
        history.shift();
      }
    }
    
    // Mark this as internal navigation
    sessionStorage.setItem('navigationContext', 'internal');
    
    // Handle scroll behavior based on navigation type
    if (navigation.shouldRestoreScroll) {
      restoreScrollPosition(currentPath);
    } else if (navigation.shouldScrollToTop) {
      // Small delay to allow content to start loading
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 10);
    }
    
    // Cleanup function to save scroll position when leaving
    return () => {
      saveScrollPosition(currentPath);
    };
  }, [location.pathname]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    smoothScrollToTop,
    determineNavigationType
  };
};
