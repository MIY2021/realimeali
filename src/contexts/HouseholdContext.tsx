
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Use our custom hooks
  const {
    fetchHousehold,
    fetchHouseholdMembers: fetchMembersData,
    fetchJoinRequests: fetchRequestsData,
    isLoadingHousehold,
    isLoadingMembers,
  } = useHouseholdData(user, currentHousehold);

  const fetchHouseholdMembers = useCallback(async () => {
    if (!currentHousehold) return;
    const members = await fetchMembersData();
    setHouseholdMembers(members);
  }, [fetchMembersData, currentHousehold]);

  const fetchJoinRequestsCallback = useCallback(async () => {
    if (!currentHousehold) return;
    const requests = await fetchRequestsData();
    setJoinRequests(requests);
  }, [fetchRequestsData, currentHousehold]);

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

  // Memoize the stable user ID to prevent unnecessary re-fetches
  const stableUserId = useMemo(() => user?.id, [user?.id]);

  // Fetch household on user change - only when user actually changes
  useEffect(() => {
    const loadHousehold = async () => {
      if (!stableUserId) {
        // Only clear data if we were previously initialized
        if (isInitialized) {
          console.log('User logged out, clearing household data');
          setCurrentHousehold(null);
          setHouseholdMembers([]);
          setJoinRequests([]);
        }
        return;
      }

      console.log('Loading household for user:', stableUserId);
      const household = await fetchHousehold();
      setCurrentHousehold(household);
      setIsInitialized(true);
    };

    loadHousehold();
  }, [stableUserId, fetchHousehold, isInitialized]);

  // Fetch members and join requests when household changes - with proper guards
  useEffect(() => {
    if (!isInitialized) return;
    
    if (currentHousehold) {
      console.log('Fetching household data for:', currentHousehold.id);
      fetchHouseholdMembers();
      fetchJoinRequestsCallback();
    } else {
      // Only clear if we had data before
      if (householdMembers.length > 0 || joinRequests.length > 0) {
        console.log('Clearing household members and requests');
        setHouseholdMembers([]);
        setJoinRequests([]);
      }
    }
  }, [currentHousehold, fetchHouseholdMembers, fetchJoinRequestsCallback, isInitialized, householdMembers.length, joinRequests.length]);

  // Memoize the context value to prevent unnecessary re-renders
  const value: HouseholdContextType = useMemo(() => ({
    currentHousehold,
    setCurrentHousehold,
    householdMembers,
    setHouseholdMembers,
    joinRequests,
    setJoinRequests,
    households,
    isLoadingHousehold: isLoadingHousehold || !isInitialized,
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
  }), [
    currentHousehold,
    householdMembers,
    joinRequests,
    households,
    isLoadingHousehold,
    isLoadingMembers,
    isInitialized,
    createHousehold,
    updateHousehold,
    joinHousehold,
    requestToJoinHousehold,
    leaveHousehold,
    removeMember,
    fetchJoinRequestsCallback,
    approveJoinRequest,
    rejectJoinRequest,
  ]);

  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
}
