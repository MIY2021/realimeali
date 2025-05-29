
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Household, HouseholdMember, HouseholdJoinRequest } from '@/types';
import { transformHousehold, transformHouseholdMember, transformJoinRequest } from './transformers';

export const useHouseholdData = (user: User | null, currentHousehold: Household | null) => {
  const [isLoadingHousehold, setIsLoadingHousehold] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const fetchHousehold = useCallback(async (): Promise<Household | null> => {
    if (!user) return null;

    setIsLoadingHousehold(true);
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id)
        .single();

      if (memberError) {
        console.error('Error fetching household member data:', memberError);
        return null;
      }

      if (!memberData) return null;

      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('id', memberData.household_id)
        .single();

      if (householdError) {
        console.error('Error fetching household data:', householdError);
        return null;
      }

      return transformHousehold(householdData);
    } catch (error) {
      console.error('Error fetching household:', error);
      return null;
    } finally {
      setIsLoadingHousehold(false);
    }
  }, [user]);

  const fetchHouseholdMembers = useCallback(async (): Promise<HouseholdMember[]> => {
    if (!currentHousehold) return [];

    setIsLoadingMembers(true);
    try {
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          id,
          user_id,
          household_id,
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

      return data.map(transformHouseholdMember);
    } catch (error) {
      console.error('Error fetching household members:', error);
      return [];
    } finally {
      setIsLoadingMembers(false);
    }
  }, [currentHousehold]);

  const fetchJoinRequests = useCallback(async (): Promise<HouseholdJoinRequest[]> => {
    if (!currentHousehold) return [];

    try {
      const { data, error } = await supabase
        .from('household_join_requests')
        .select('*')
        .eq('household_id', currentHousehold.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformJoinRequest);
    } catch (error) {
      console.error('Error fetching join requests:', error);
      return [];
    }
  }, [currentHousehold]);

  return {
    fetchHousehold,
    fetchHouseholdMembers,
    fetchJoinRequests,
    isLoadingHousehold,
    isLoadingMembers,
  };
};
