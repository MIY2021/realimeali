
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface PageContext {
  page: string;
  data?: any;
}

interface RealiChefContextType {
  pageContext: PageContext;
  updatePageContext: (data: any) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const RealiChefContext = createContext<RealiChefContextType | undefined>(undefined);

export const useRealiChef = () => {
  const context = useContext(RealiChefContext);
  if (!context) {
    throw new Error('useRealiChef must be used within a RealiChefProvider');
  }
  return context;
};

interface RealiChefProviderProps {
  children: ReactNode;
}

export const RealiChefProvider = ({ children }: RealiChefProviderProps) => {
  const location = useLocation();
  const [pageContext, setPageContext] = useState<PageContext>({ page: 'home' });
  const [isOpen, setIsOpen] = useState(false);

  // Update page context based on current route
  useEffect(() => {
    const path = location.pathname;
    let page = 'home';
    
    if (path.includes('/my-recipes')) {
      page = path.includes('/my-recipes/') ? 'recipe-detail' : 'my-recipes';
    } else if (path.includes('/meal-planner')) {
      page = 'meal-planner';
    } else if (path.includes('/shopping-list')) {
      page = 'shopping-list';
    } else if (path.includes('/find-recipes')) {
      page = 'find-recipes';
    }

    setPageContext(prev => ({ ...prev, page }));
  }, [location.pathname]);

  const updatePageContext = (data: any) => {
    setPageContext(prev => ({ ...prev, data }));
  };

  return (
    <RealiChefContext.Provider value={{
      pageContext,
      updatePageContext,
      isOpen,
      setIsOpen
    }}>
      {children}
    </RealiChefContext.Provider>
  );
};
