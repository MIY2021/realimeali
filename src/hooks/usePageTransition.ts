import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionState {
  isTransitioning: boolean;
  isContentReady: boolean;
  shouldShowSkeleton: boolean;
  transitionPhase: 'entering' | 'content-loading' | 'ready' | 'exiting';
}

interface PageTransitionOptions {
  enableSkeleton?: boolean;
  skeletonDuration?: number;
  contentReadySelector?: string;
  transitionDuration?: number;
}

export const usePageTransition = (
  isLoading: boolean = false,
  options: PageTransitionOptions = {}
) => {
  const {
    enableSkeleton = true,
    skeletonDuration = 300,
    contentReadySelector = '[data-page-content]',
    transitionDuration = 200
  } = options;

  const location = useLocation();
  const [transitionState, setTransitionState] = useState<PageTransitionState>({
    isTransitioning: false,
    isContentReady: false,
    shouldShowSkeleton: false,
    transitionPhase: 'ready'
  });

  const markContentReady = useCallback(() => {
    setTransitionState(prev => ({
      ...prev,
      isContentReady: true,
      transitionPhase: 'ready'
    }));
  }, []);

  const startTransition = useCallback(() => {
    setTransitionState({
      isTransitioning: true,
      isContentReady: false,
      shouldShowSkeleton: enableSkeleton,
      transitionPhase: 'entering'
    });
  }, [enableSkeleton]);

  // Handle route changes
  useEffect(() => {
    startTransition();
    
    // Auto-detect when content is ready
    const checkContentReady = () => {
      const contentElement = document.querySelector(contentReadySelector);
      if (contentElement || !enableSkeleton) {
        setTimeout(() => {
          setTransitionState(prev => ({
            ...prev,
            transitionPhase: 'content-loading'
          }));
        }, transitionDuration);
      }
    };

    // Small delay to allow component mounting
    const timeoutId = setTimeout(checkContentReady, 50);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname, contentReadySelector, enableSkeleton, transitionDuration]);

  // Handle loading state changes
  useEffect(() => {
    if (!isLoading && transitionState.transitionPhase === 'content-loading') {
      // Content is ready, start fade-in
      setTimeout(() => {
        setTransitionState(prev => ({
          ...prev,
          isTransitioning: false,
          isContentReady: true,
          shouldShowSkeleton: false,
          transitionPhase: 'ready'
        }));
      }, 100);
    }
  }, [isLoading, transitionState.transitionPhase]);

  // Auto-hide skeleton after maximum duration
  useEffect(() => {
    if (transitionState.shouldShowSkeleton) {
      const timeoutId = setTimeout(() => {
        setTransitionState(prev => ({
          ...prev,
          shouldShowSkeleton: false,
          isTransitioning: false,
          transitionPhase: 'ready'
        }));
      }, skeletonDuration);
      
      return () => clearTimeout(timeoutId);
    }
  }, [transitionState.shouldShowSkeleton, skeletonDuration]);

  return {
    transitionState,
    markContentReady,
    startTransition,
    // Convenience properties
    isTransitioning: transitionState.isTransitioning,
    shouldShowSkeleton: transitionState.shouldShowSkeleton,
    isContentReady: transitionState.isContentReady
  };
};