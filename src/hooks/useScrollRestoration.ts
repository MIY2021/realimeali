import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollRestorationOptions {
  key?: string;
  waitForContent?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  contentSelector?: string;
}

interface ScrollRestorationReturn {
  isRestoring: boolean;
  savePosition: () => void;
  restorePosition: () => Promise<boolean>;
  clearPosition: () => void;
}

export const useScrollRestoration = (
  options: ScrollRestorationOptions = {}
): ScrollRestorationReturn => {
  const {
    key,
    waitForContent = true,
    retryAttempts = 3,
    retryDelay = 100,
    contentSelector = '[data-scroll-content]'
  } = options;
  
  const location = useLocation();
  const [isRestoring, setIsRestoring] = useState(false);
  const restoreAttemptRef = useRef(0);
  const scrollKey = key || location.pathname;

  const waitForContentReady = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!waitForContent) {
        resolve(true);
        return;
      }

      let timeoutId: NodeJS.Timeout;
      let observer: IntersectionObserver | null = null;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (observer) observer.disconnect();
      };

      // Check if content exists immediately
      const contentElement = document.querySelector(contentSelector) || document.body;
      if (contentElement && contentElement.children.length > 0) {
        resolve(true);
        return;
      }

      // Wait for content using IntersectionObserver
      observer = new IntersectionObserver(
        (entries) => {
          const hasVisibleContent = entries.some(entry => entry.isIntersecting);
          if (hasVisibleContent) {
            cleanup();
            // Small additional delay to ensure layout is stable
            setTimeout(() => resolve(true), 50);
          }
        },
        { threshold: 0.1 }
      );

      // Observe content area
      const targetElement = document.querySelector(contentSelector) || document.body;
      observer.observe(targetElement);

      // Fallback timeout
      timeoutId = setTimeout(() => {
        cleanup();
        resolve(false);
      }, 2000);
    });
  }, [contentSelector, waitForContent]);

  const savePosition = useCallback(() => {
    const position = {
      x: window.scrollX,
      y: window.scrollY,
      timestamp: Date.now(),
      layout: localStorage.getItem('mobileRecipeLayout') || '1'
    };
    
    sessionStorage.setItem(`scroll_${scrollKey}`, JSON.stringify(position));
    console.log('Saved scroll position:', position, 'for key:', scrollKey);
  }, [scrollKey]);

  const restorePosition = useCallback(async (): Promise<boolean> => {
    setIsRestoring(true);
    restoreAttemptRef.current = 0;
    
    const attemptRestore = async (): Promise<boolean> => {
      try {
        const savedData = sessionStorage.getItem(`scroll_${scrollKey}`);
        if (!savedData) {
          console.log('No saved scroll position for key:', scrollKey);
          return false;
        }

        const position = JSON.parse(savedData);
        const currentLayout = localStorage.getItem('mobileRecipeLayout') || '1';
        
        // Skip restoration if layout has changed significantly
        if (position.layout && position.layout !== currentLayout) {
          console.log('Layout changed, skipping scroll restoration');
          return false;
        }

        // Wait for content to be ready
        const contentReady = await waitForContentReady();
        if (!contentReady && restoreAttemptRef.current < retryAttempts) {
          restoreAttemptRef.current++;
          console.log(`Content not ready, retry attempt ${restoreAttemptRef.current}`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return attemptRestore();
        }

        // Restore scroll position
        window.scrollTo({
          top: position.y || 0,
          left: position.x || 0,
          behavior: 'instant'
        });

        console.log('Restored scroll position:', position, 'for key:', scrollKey);
        return true;
      } catch (error) {
        console.error('Error restoring scroll position:', error);
        return false;
      }
    };

    const success = await attemptRestore();
    setIsRestoring(false);
    return success;
  }, [scrollKey, waitForContentReady, retryAttempts, retryDelay]);

  const clearPosition = useCallback(() => {
    sessionStorage.removeItem(`scroll_${scrollKey}`);
    console.log('Cleared scroll position for key:', scrollKey);
  }, [scrollKey]);

  // Auto-save scroll position before navigation
  useEffect(() => {
    return () => {
      if (!isRestoring) {
        savePosition();
      }
    };
  }, [savePosition, isRestoring]);

  return {
    isRestoring,
    savePosition,
    restorePosition,
    clearPosition
  };
};