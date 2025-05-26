
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
  };

  const restoreScrollPosition = (key: string) => {
    const savedPosition = sessionStorage.getItem(`scroll_${key}`);
    if (savedPosition) {
      try {
        const position: ScrollPosition = JSON.parse(savedPosition);
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          window.scrollTo(position.x, position.y);
        }, 100);
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
    const handleBeforeUnload = () => {
      if (scrollKey.current) {
        saveScrollPosition(scrollKey.current);
      }
    };

    // Save scroll position when component unmounts or route changes
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
