import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from './AuthContext';
import { Household, HouseholdMember, HouseholdJoinRequest } from '@/types';

interface HouseholdContextType {
  currentHousehold: Household | null;
  setCurrentHousehold: React.Dispatch<React.SetStateAction<Household | null>>;
  householdMembers: HouseholdMember[];
  setHouseholdMembers: React.Dispatch<React.SetStateAction<HouseholdMember[]>>;
  joinRequests: HouseholdJoinRequest[];
  setJoinRequests: React.Dispatch<React.SetStateAction<HouseholdJoinRequest[]>>;
  isLoadingHousehold: boolean;
  isLoadingMembers: boolean;
  createHousehold: (name: string) => Promise<Household | null>;
  updateHousehold: (id: string, updates: Partial<Household>) => Promise<Household | null>;
  joinHousehold: (householdId: string) => Promise<boolean>;
  leaveHousehold: (householdId: string) => Promise<boolean>;
  removeMember: (memberId: string, memberUserId: string) => Promise<boolean>;
  fetchJoinRequests: () => Promise<void>;
  approveJoinRequest: (requestId: string) => Promise<boolean>;
  rejectJoinRequest: (requestId: string) => Promise<boolean>;
}

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
  const { user } = useContext(AuthContext);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<HouseholdJoinRequest[]>([]);
  const [isLoadingHousehold, setIsLoadingHousehold] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const fetchJoinRequests = useCallback(async () => {
    if (!currentHousehold) return;

    try {
      const { data, error } = await supabase
        .from('household_join_requests')
        .select('*')
        .eq('household_id', currentHousehold.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJoinRequests(data || []);
    } catch (error) {
      console.error('Error fetching join requests:', error);
      setJoinRequests([]);
    }
  }, [currentHousehold]);

  const fetchHousehold = useCallback(async () => {
    if (!user) {
      setCurrentHousehold(null);
      return;
    }

    setIsLoadingHousehold(true);
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id)
        .single();

      if (memberError) {
        console.error('Error fetching household member data:', memberError);
        setCurrentHousehold(null);
        return;
      }

      if (!memberData) {
        setCurrentHousehold(null);
        return;
      }

      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('id', memberData.household_id)
        .single();

      if (householdError) {
        console.error('Error fetching household data:', householdError);
        setCurrentHousehold(null);
        return;
      }

      setCurrentHousehold(householdData);
    } catch (error) {
      console.error('Error fetching household:', error);
      setCurrentHousehold(null);
    } finally {
      setIsLoadingHousehold(false);
    }
  }, [user]);

  const fetchHouseholdMembers = useCallback(async () => {
    if (!currentHousehold) {
      setHouseholdMembers([]);
      return;
    }

    setIsLoadingMembers(true);
    try {
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          profiles (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('household_id', currentHousehold.id);

      if (error) throw error;

      const membersWithProfiles = data.map((member) => ({
        id: member.id,
        userId: member.user_id,
        role: member.role,
        joinedAt: member.joined_at,
        profile: member.profiles
          ? {
              fullName: member.profiles.full_name,
              email: member.profiles.email,
              avatarUrl: member.profiles.avatar_url,
            }
          : undefined,
      }));

      setHouseholdMembers(membersWithProfiles);
    } catch (error) {
      console.error('Error fetching household members:', error);
      setHouseholdMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [currentHousehold]);

  const createHousehold = async (name: string): Promise<Household | null> => {
    if (!user) return null;

    try {
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .insert([{ name, created_by: user.id }])
        .select('*')
        .single();

      if (householdError) throw householdError;

      const { data: memberData, error: memberError } = await supabase
        .from('household_members')
        .insert([
          {
            user_id: user.id,
            household_id: householdData.id,
            role: 'owner',
            joined_at: new Date().toISOString(),
          },
        ])
        .select('*')
        .single();

      if (memberError) throw memberError;

      await fetchHousehold();
      await fetchHouseholdMembers();
      return householdData;
    } catch (error) {
      console.error('Error creating household:', error);
      return null;
    }
  };

  const updateHousehold = async (
    id: string,
    updates: Partial<Household>
  ): Promise<Household | null> => {
    try {
      const { data, error } = await supabase
        .from('households')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      setCurrentHousehold(data);
      return data;
    } catch (error) {
      console.error('Error updating household:', error);
      return null;
    }
  };

  const joinHousehold = async (householdId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check if the user already has a pending join request for this household
      const { data: existingRequest, error: existingRequestError } = await supabase
        .from('household_join_requests')
        .select('*')
        .eq('household_id', householdId)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingRequestError) {
        console.error('Error checking existing join request:', existingRequestError);
        return false;
      }

      if (existingRequest) {
        console.log('Pending join request already exists for this household.');
        return false;
      }

      const { error } = await supabase
        .from('household_join_requests')
        .insert([
          {
            household_id: householdId,
            user_id: user.id,
            status: 'pending',
          },
        ]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error requesting to join household:', error);
      return false;
    }
  };

  const leaveHousehold = async (householdId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', householdId)
        .eq('user_id', user.id);

      if (error) throw error;

      setCurrentHousehold(null);
      setHouseholdMembers([]);
      return true;
    } catch (error) {
      console.error('Error leaving household:', error);
      return false;
    }
  };

  const removeMember = async (memberId: string, memberUserId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setHouseholdMembers((prevMembers) =>
        prevMembers.filter((member) => member.id !== memberId)
      );
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      return false;
    }
  };

  const approveJoinRequest = async (requestId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('household_join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (error) throw error;
      
      fetchJoinRequests();
      return true;
    } catch (error) {
      console.error('Error approving join request:', error);
      return false;
    }
  };

  const rejectJoinRequest = async (requestId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('household_join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      
      fetchJoinRequests();
      return true;
    } catch (error) {
      console.error('Error rejecting join request:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchHousehold();
  }, [user, fetchHousehold]);

  useEffect(() => {
    fetchHouseholdMembers();
    fetchJoinRequests();
  }, [currentHousehold, fetchHouseholdMembers, fetchJoinRequests]);

  const value = {
    currentHousehold,
    setCurrentHousehold,
    householdMembers,
    setHouseholdMembers,
    joinRequests,
    setJoinRequests,
    isLoadingHousehold,
    isLoadingMembers,
    createHousehold,
    updateHousehold,
    joinHousehold,
    leaveHousehold,
    removeMember,
    fetchJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
  };

  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
}
