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
      let mutationObserver: MutationObserver | null = null;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (observer) observer.disconnect();
        if (mutationObserver) mutationObserver.disconnect();
      };

      // Check if content exists immediately
      const contentElement = document.querySelector(contentSelector);
      const hasContent = contentElement && (
        contentElement.children.length > 0 || 
        contentElement.getAttribute('data-testid') === 'recipe-list' ||
        contentElement.querySelector('[data-testid="recipe-list"]')
      );
      
      if (hasContent) {
        // Additional delay for mobile to ensure layout stability
        const delay = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 100 : 50;
        setTimeout(() => resolve(true), delay);
        return;
      }

      // Use MutationObserver to detect content changes
      const targetElement = document.querySelector(contentSelector) || document.body;
      
      mutationObserver = new MutationObserver((mutations) => {
        const hasNewContent = mutations.some(mutation => 
          mutation.addedNodes.length > 0 || 
          (mutation.target as Element).querySelector?.('[data-testid="recipe-list"]')
        );
        
        if (hasNewContent) {
          cleanup();
          // Extra delay for mobile content stability
          const delay = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 150 : 75;
          setTimeout(() => resolve(true), delay);
        }
      });

      mutationObserver.observe(targetElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-testid']
      });

      // Fallback with IntersectionObserver
      observer = new IntersectionObserver(
        (entries) => {
          const hasVisibleContent = entries.some(entry => entry.isIntersecting);
          if (hasVisibleContent) {
            cleanup();
            setTimeout(() => resolve(true), 100);
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(targetElement);

      // Fallback timeout - increased for mobile
      timeoutId = setTimeout(() => {
        cleanup();
        resolve(false);
      }, 3000);
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
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, restoreAttemptRef.current)));
          return attemptRestore();
        }

        // Restore scroll position with mobile-optimized timing
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // Use requestAnimationFrame for smoother mobile scrolling
          requestAnimationFrame(() => {
            window.scrollTo({
              top: position.y || 0,
              left: position.x || 0,
              behavior: 'instant'
            });
          });
        } else {
          window.scrollTo({
            top: position.y || 0,
            left: position.x || 0,
            behavior: 'instant'
          });
        }

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