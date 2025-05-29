
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Household, HouseholdMember, JoinRequest, User } from '@/types';

interface HouseholdContextType {
  currentHousehold: Household | null;
  households: Household[];
  householdMembers: HouseholdMember[];
  joinRequests: JoinRequest[];
  isLoading: boolean;
  isLoadingMembers: boolean;
  setCurrentHousehold: (household: Household | null) => void;
  createHousehold: (name: string) => Promise<Household | null>;
  requestToJoinHousehold: (householdId: string) => Promise<void>;
  approveJoinRequest: (requestId: string) => Promise<void>;
  rejectJoinRequest: (requestId: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  fetchHouseholds: () => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Mock household for development
  useEffect(() => {
    setTimeout(() => {
      const mockHousehold: Household = {
        id: 'mock-household-1',
        name: 'Mock Family',
        createdBy: 'mock-user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentHousehold(mockHousehold);
      setHouseholds([mockHousehold]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const createHousehold = async (name: string): Promise<Household | null> => {
    const newHousehold: Household = {
      id: `mock-household-${Date.now()}`,
      name,
      createdBy: 'mock-user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setHouseholds(prev => [...prev, newHousehold]);
    return newHousehold;
  };

  const requestToJoinHousehold = async (householdId: string): Promise<void> => {
    // Mock implementation
    console.log('Requesting to join household:', householdId);
  };

  const approveJoinRequest = async (requestId: string): Promise<void> => {
    // Mock implementation
    console.log('Approving join request:', requestId);
  };

  const rejectJoinRequest = async (requestId: string): Promise<void> => {
    // Mock implementation
    console.log('Rejecting join request:', requestId);
  };

  const removeMember = async (memberId: string): Promise<void> => {
    // Mock implementation
    console.log('Removing member:', memberId);
  };

  const fetchHouseholds = async (): Promise<void> => {
    // Mock implementation
    console.log('Fetching households');
  };

  return (
    <HouseholdContext.Provider value={{
      currentHousehold,
      households,
      householdMembers,
      joinRequests,
      isLoading,
      isLoadingMembers,
      setCurrentHousehold,
      createHousehold,
      requestToJoinHousehold,
      approveJoinRequest,
      rejectJoinRequest,
      removeMember,
      fetchHouseholds,
    }}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const context = useContext(HouseholdContext);
  if (context === undefined) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
}
