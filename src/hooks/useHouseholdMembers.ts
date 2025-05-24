
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface HouseholdMember {
  id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  profile?: {
    full_name: string;
    email: string;
  };
}

export const useHouseholdMembers = (householdId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<HouseholdMember[]>([]);

  const fetchMembers = async () => {
    if (!householdId) return;

    try {
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          id,
          user_id,
          role,
          joined_at
        `)
        .eq('household_id', householdId);

      if (error) throw error;

      // For each member, get their Google profile info from user metadata
      const membersWithProfiles = await Promise.all(
        (data || []).map(async (member) => {
          try {
            // Get user info from auth.users table using RPC or direct query
            const { data: userQuery } = await supabase
              .from('household_members')
              .select('user_id')
              .eq('user_id', member.user_id)
              .single();

            if (userQuery) {
              // Get user metadata from the auth system
              const { data: { user: authUser } } = await supabase.auth.getUser();
              
              if (authUser && authUser.id === member.user_id) {
                return {
                  ...member,
                  profile: {
                    full_name: authUser.user_metadata?.full_name || authUser.email || 'Unknown User',
                    email: authUser.email || 'No email'
                  }
                };
              }
            }

            // Fallback for other users - we can't access their metadata directly
            return {
              ...member,
              profile: {
                full_name: `User ${member.user_id.slice(0, 8)}`,
                email: 'Private'
              }
            };
          } catch (err) {
            console.error('Error fetching user data:', err);
            return {
              ...member,
              profile: {
                full_name: 'Unknown User',
                email: 'No email'
              }
            };
          }
        })
      );

      setMembers(membersWithProfiles);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "Failed to fetch household members.",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string, memberUserId: string) => {
    if (!householdId || memberUserId === user?.id) return;

    const confirmed = window.confirm("Are you sure you want to remove this member?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('id', memberId)
        .eq('household_id', householdId);

      if (error) throw error;

      setMembers(prev => prev.filter(m => m.id !== memberId));
      
      toast({
        title: "Member Removed",
        description: "Member has been removed from the household.",
      });
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [householdId]);

  return {
    members,
    fetchMembers,
    removeMember
  };
};
