
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { Household, HouseholdMember, HouseholdJoinRequest } from '@/types';
import { HouseholdContextType } from './HouseholdContext/types';
import { useHouseholdData } from './HouseholdContext/useHouseholdData';
import { useHouseholdOperations } from './HouseholdContext/useHouseholdOperations';
import { useJoinRequests } from './HouseholdContext/useJoinRequests';
import { useMemberOperations } from './HouseholdContext/useMemberOperations';

const HouseholdContext = createContext<HouseholdContextType | undefined>(
  undefined
);

export function useHousehold(): HouseholdContextType {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
}

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<HouseholdJoinRequest[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);

  // Use our custom hooks
  const {
    fetchHousehold,
    fetchHouseholdMembers: fetchMembersData,
    fetchJoinRequests: fetchRequestsData,
    isLoadingHousehold,
    isLoadingMembers,
  } = useHouseholdData(user, currentHousehold);

  const fetchHouseholdMembers = useCallback(async () => {
    const members = await fetchMembersData();
    setHouseholdMembers(members);
  }, [fetchMembersData]);

  const fetchJoinRequestsCallback = useCallback(async () => {
    const requests = await fetchRequestsData();
    setJoinRequests(requests);
  }, [fetchRequestsData]);

  const {
    createHousehold,
    updateHousehold,
    leaveHousehold,
  } = useHouseholdOperations(user, setCurrentHousehold, fetchHouseholdMembers);

  const {
    requestToJoinHousehold,
    joinHousehold,
    approveJoinRequest,
    rejectJoinRequest,
  } = useJoinRequests(user, fetchJoinRequestsCallback);

  const { removeMember } = useMemberOperations(setHouseholdMembers);

  // Fetch household on user change
  useEffect(() => {
    const loadHousehold = async () => {
      const household = await fetchHousehold();
      setCurrentHousehold(household);
    };

    if (user) {
      loadHousehold();
    } else {
      setCurrentHousehold(null);
    }
  }, [user, fetchHousehold]);

  // Fetch members and join requests when household changes
  useEffect(() => {
    if (currentHousehold) {
      fetchHouseholdMembers();
      fetchJoinRequestsCallback();
    } else {
      setHouseholdMembers([]);
      setJoinRequests([]);
    }
  }, [currentHousehold, fetchHouseholdMembers, fetchJoinRequestsCallback]);

  const value: HouseholdContextType = {
    currentHousehold,
    setCurrentHousehold,
    householdMembers,
    setHouseholdMembers,
    joinRequests,
    setJoinRequests,
    households,
    isLoadingHousehold,
    isLoadingMembers,
    createHousehold,
    updateHousehold,
    joinHousehold,
    requestToJoinHousehold,
    leaveHousehold,
    removeMember,
    fetchJoinRequests: fetchJoinRequestsCallback,
    approveJoinRequest,
    rejectJoinRequest,
  };

  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
}
