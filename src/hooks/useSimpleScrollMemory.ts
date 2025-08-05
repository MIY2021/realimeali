import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useSimpleScrollMemory = () => {
  const location = useLocation();

  useEffect(() => {
    // Restore scroll position if we came back from somewhere
    const shouldRestore = location.state?.restoreScroll === true;
    
    if (shouldRestore) {
      const savedScroll = sessionStorage.getItem(`scroll_${location.pathname}`);
      if (savedScroll) {
        const scrollY = parseInt(savedScroll, 10);
        // Small delay to let content render
        setTimeout(() => {
          window.scrollTo({ top: scrollY, behavior: 'instant' });
        }, 50);
      }
    }

    // Save scroll position when leaving
    const saveScrollPosition = () => {
      sessionStorage.setItem(`scroll_${location.pathname}`, window.scrollY.toString());
    };

    window.addEventListener('beforeunload', saveScrollPosition);

    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
      saveScrollPosition(); // Save when component unmounts
    };
  }, [location.pathname, location.state]);
};