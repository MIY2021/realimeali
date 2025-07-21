
import { useEffect } from 'react';
import { useRealiChef } from '@/contexts/RealiChefContext';

export const useRealiChefContext = (contextData?: any) => {
  const { updatePageContext, generateContextualWelcome, setIsOpen } = useRealiChef();

  useEffect(() => {
    if (contextData) {
      updatePageContext(contextData);
    }
  }, [contextData, updatePageContext]);

  return { updatePageContext, generateContextualWelcome, setIsOpen };
};
