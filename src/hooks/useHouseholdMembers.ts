
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
      console.log("No household ID provided");
      setMembers([]);
      return;
    }

    if (!user) {
      console.log("No user authenticated");
      setMembers([]);
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching members for household:", householdId);
      console.log("Current user:", user.id);
      
      // First, get household members
      const { data: memberData, error: memberError } = await supabase
        .from('household_members')
        .select('id, user_id, role, joined_at')
        .eq('household_id', householdId);

      if (memberError) {
        console.error("Error fetching household members:", memberError);
        throw memberError;
      }

      console.log("Raw member data:", memberData);

      if (!memberData || memberData.length === 0) {
        console.log("No members found for household");
        setMembers([]);
        return;
      }

      // Then, get profiles for each member
      const userIds = memberData.map(member => member.user_id);
      console.log("Fetching profiles for user IDs:", userIds);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds);

      if (profileError) {
        console.error("Error fetching profiles:", profileError);
        // Don't throw here, continue with member data but no profiles
      }

      console.log("Profile data:", profileData);

      // Combine member data with profiles
      const membersWithProfiles: HouseholdMember[] = memberData.map((member: any) => {
        const profile = profileData?.find(p => p.id === member.user_id);
        
        return {
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          joined_at: member.joined_at,
          profile: profile ? {
            full_name: profile.full_name || 'Unknown User',
            email: profile.email || 'No email available',
            avatar_url: profile.avatar_url
          } : {
            full_name: 'Unknown User',
            email: 'No email available',
            avatar_url: undefined
          }
        };
      });

      console.log("Final members with profiles:", membersWithProfiles);
      setMembers(membersWithProfiles);
    } catch (error) {
      console.error("Error in fetchMembers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch household members. Please try refreshing the page.",
        variant: "destructive",
      });
      setMembers([]);
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
  }, [householdId, user?.id]);

  return {
    members,
    fetchMembers,
    removeMember,
    isLoading
  };
};
