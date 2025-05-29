
import { createContext, useContext, ReactNode, useState } from 'react';

interface Household {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface HouseholdContextType {
  currentHousehold: Household | null;
  setCurrentHousehold: (household: Household | null) => void;
  households: Household[];
  isLoading: boolean;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
};

export const HouseholdProvider = ({ children }: { children: ReactNode }) => {
  // Mock household for testing
  const mockHousehold: Household = {
    id: 'household1',
    name: 'My Family',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user1'
  };

  const [currentHousehold] = useState<Household>(mockHousehold);
  const [households] = useState<Household[]>([mockHousehold]);
  const [isLoading] = useState(false);

  const setCurrentHousehold = (household: Household | null) => {
    // Mock implementation
  };

  return (
    <HouseholdContext.Provider value={{ 
      currentHousehold, 
      setCurrentHousehold, 
      households, 
      isLoading 
    }}>
      {children}
    </HouseholdContext.Provider>
  );
};
