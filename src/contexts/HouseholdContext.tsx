
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
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

  // Use refs to track states without triggering re-renders
  const hasDataRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);
  const currentHouseholdIdRef = useRef<string | null>(null);

  // Use our custom hooks
  const {
    fetchHousehold,
    fetchHouseholdMembers: fetchMembersData,
    fetchJoinRequests: fetchRequestsData,
    isLoadingHousehold,
    isLoadingMembers,
  } = useHouseholdData(user, currentHousehold);

  // Create stable callback functions without unstable dependencies
  const fetchHouseholdMembers = useCallback(async () => {
    if (!currentHousehold) return;
    console.log('DEBUG: Fetching household members for:', currentHousehold.id);
    const members = await fetchMembersData();
    setHouseholdMembers(members);
  }, [fetchMembersData, currentHousehold?.id]);

  const fetchJoinRequestsCallback = useCallback(async () => {
    if (!currentHousehold) return;
    console.log('DEBUG: Fetching join requests for:', currentHousehold.id);
    const requests = await fetchRequestsData();
    setJoinRequests(requests);
  }, [fetchRequestsData, currentHousehold?.id]);

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

  // Stable user ID reference
  const stableUserId = useMemo(() => user?.id, [user?.id]);

  // Primary effect: Load household when user changes
  useEffect(() => {
    const loadHousehold = async () => {
      const userId = stableUserId;
      
      // Only proceed if user ID actually changed
      if (currentUserIdRef.current === userId) {
        return;
      }
      
      currentUserIdRef.current = userId;
      
      if (!userId) {
        console.log('DEBUG: User logged out, clearing household data');
        setCurrentHousehold(null);
        setHouseholdMembers([]);
        setJoinRequests([]);
        hasDataRef.current = false;
        setIsInitialized(true);
        return;
      }

      console.log('DEBUG: Loading household for user:', userId);
      const household = await fetchHousehold();
      setCurrentHousehold(household);
      currentHouseholdIdRef.current = household?.id || null;
      setIsInitialized(true);
    };

    loadHousehold();
  }, [stableUserId, fetchHousehold]);

  // Secondary effect: Load household data when household changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const householdId = currentHousehold?.id;
    
    // Only proceed if household ID actually changed
    if (currentHouseholdIdRef.current === householdId) {
      return;
    }
    
    currentHouseholdIdRef.current = householdId || null;
    
    if (householdId) {
      console.log('DEBUG: Loading data for household:', householdId);
      fetchHouseholdMembers();
      fetchJoinRequestsCallback();
      hasDataRef.current = true;
    } else {
      // Only clear if we had data before
      if (hasDataRef.current) {
        console.log('DEBUG: Clearing household data');
        setHouseholdMembers([]);
        setJoinRequests([]);
        hasDataRef.current = false;
      }
    }
  }, [currentHousehold?.id, fetchHouseholdMembers, fetchJoinRequestsCallback, isInitialized]);

  // Memoize the context value with stable functions only
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
