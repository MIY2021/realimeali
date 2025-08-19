
import { useEffect } from 'react';
import { useRealiChef } from '@/contexts/RealiChefContext';

export const useRealiChefContext = (contextData?: any) => {
  const { updatePageContext } = useRealiChef();

  useEffect(() => {
    if (contextData) {
      console.log('🔄 useRealiChefContext: Updating context', { contextData });
      updatePageContext(contextData);
    }
  }, [contextData, updatePageContext]);

  return { updatePageContext };
};
