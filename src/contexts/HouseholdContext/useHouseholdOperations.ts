
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Household } from '@/types';
import { transformHousehold } from './transformers';

export const useHouseholdOperations = (
  user: User | null,
  setCurrentHousehold: React.Dispatch<React.SetStateAction<Household | null>>,
  fetchHouseholdMembers: () => Promise<void>
) => {
  const createHousehold = useCallback(async (name: string): Promise<Household | null> => {
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

      const transformed = transformHousehold(householdData);
      setCurrentHousehold(transformed);
      await fetchHouseholdMembers();
      return transformed;
    } catch (error) {
      console.error('Error creating household:', error);
      return null;
    }
  }, [user, setCurrentHousehold, fetchHouseholdMembers]);

  const updateHousehold = useCallback(async (
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

      const transformed = transformHousehold(data);
      setCurrentHousehold(transformed);
      return transformed;
    } catch (error) {
      console.error('Error updating household:', error);
      return null;
    }
  }, [setCurrentHousehold]);

  const leaveHousehold = useCallback(async (householdId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', householdId)
        .eq('user_id', user.id);

      if (error) throw error;

      setCurrentHousehold(null);
      return true;
    } catch (error) {
      console.error('Error leaving household:', error);
      return false;
    }
  }, [user, setCurrentHousehold]);

  return {
    createHousehold,
    updateHousehold,
    leaveHousehold,
  };
};
