
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HouseholdMember } from '@/types';

export const useMemberOperations = (
  setHouseholdMembers: React.Dispatch<React.SetStateAction<HouseholdMember[]>>
) => {
  const removeMember = useCallback(async (memberId: string, memberUserId: string): Promise<boolean> => {
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
  }, [setHouseholdMembers]);

  return {
    removeMember,
  };
};
