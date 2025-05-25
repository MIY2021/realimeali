
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
    avatar_url?: string;
  };
}

export const useHouseholdMembers = (householdId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMembers = async () => {
    if (!householdId) {
      setMembers([]);
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching members for household:", householdId);
      
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          profiles(
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('household_id', householdId);

      if (error) {
        console.error("Error fetching members:", error);
        throw error;
      }

      console.log("Raw member data:", data);

      // Transform the data to match our interface with better fallbacks
      const membersWithProfiles: HouseholdMember[] = (data || []).map((member: any) => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        profile: {
          full_name: member.profiles?.full_name || 'Unknown User',
          email: member.profiles?.email || 'No email available',
          avatar_url: member.profiles?.avatar_url
        }
      }));

      console.log("Transformed members:", membersWithProfiles);
      setMembers(membersWithProfiles);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "Failed to fetch household members.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
    removeMember,
    isLoading
  };
};
