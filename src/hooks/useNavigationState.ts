
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface NavigationState {
  previousRoute: string | null;
  cameFromRecipes: boolean;
  shouldRestoreScroll: boolean;
}

export const useNavigationState = () => {
  const location = useLocation();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    previousRoute: null,
    cameFromRecipes: false,
    shouldRestoreScroll: false,
  });

  useEffect(() => {
    // Get the previous route from session storage
    const previousRoute = sessionStorage.getItem('previousRoute');
    const cameFromRecipes = previousRoute === '/recipes';
    const shouldRestoreScroll = location.state?.restoreScroll === true;
    
    setNavigationState({
      previousRoute,
      cameFromRecipes,
      shouldRestoreScroll,
    });

    // Save current route as previous route for next navigation
    sessionStorage.setItem('previousRoute', location.pathname);
  }, [location.pathname, location.state]);

  const markCameFromRecipes = () => {
    sessionStorage.setItem('previousRoute', '/recipes');
    setNavigationState(prev => ({
      ...prev,
      cameFromRecipes: true,
    }));
  };

  const clearNavigationState = () => {
    sessionStorage.removeItem('previousRoute');
    setNavigationState({
      previousRoute: null,
      cameFromRecipes: false,
      shouldRestoreScroll: false,
    });
  };

  return {
    navigationState,
    markCameFromRecipes,
    clearNavigationState,
  };
};
