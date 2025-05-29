import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Household, HouseholdMember, HouseholdJoinRequest } from "@/types";

interface HouseholdContextType {
  households: Household[];
  currentHousehold: Household | null;
  householdMembers: HouseholdMember[];
  joinRequests: HouseholdJoinRequest[];
  isLoading: boolean;
  isLoadingMembers: boolean;
  error: string | null;
  createHousehold: (name: string) => Promise<Household | null>;
  setCurrentHousehold: (household: Household | null) => void;
  fetchHouseholds: () => Promise<void>;
  requestToJoinHousehold: (householdCode: string) => Promise<boolean>;
  approveJoinRequest: (requestId: string) => Promise<boolean>;
  rejectJoinRequest: (requestId: string) => Promise<boolean>;
  leaveHousehold: (householdId: string) => Promise<boolean>;
  removeMember: (memberId: string, memberUserId: string) => Promise<boolean>;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export const HouseholdProvider = ({ children }: { children: ReactNode }) => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<HouseholdJoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchHouseholds = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        setHouseholds([]);
        setCurrentHousehold(null);
        setIsLoading(false);
        return;
      }

      const { data: membershipData, error: membershipError } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id);

      if (membershipError) {
        throw membershipError;
      }

      if (!membershipData || membershipData.length === 0) {
        setHouseholds([]);
        setCurrentHousehold(null);
        setIsLoading(false);
        return;
      }

      const householdIds = membershipData.map(m => m.household_id);
      
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .in('id', householdIds)
        .order('created_at', { ascending: false });

      if (householdError) {
        throw householdError;
      }

      const transformedHouseholds: Household[] = (householdData || []).map(item => ({
        id: item.id,
        name: item.name,
        createdBy: item.created_by,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      setHouseholds(transformedHouseholds);
      
      if (transformedHouseholds.length > 0 && !currentHousehold) {
        setCurrentHousehold(transformedHouseholds[0]);
      }
    } catch (err) {
      console.error("Error fetching households:", err);
      setError("Failed to fetch households. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to fetch households. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, currentHousehold]);

  const fetchHouseholdMembers = useCallback(async (householdId: string) => {
    if (!householdId || !user) {
      setHouseholdMembers([]);
      return;
    }

    try {
      setIsLoadingMembers(true);
      
      const { data: memberData, error: memberError } = await supabase
        .from('household_members')
        .select('id, user_id, role, joined_at')
        .eq('household_id', householdId);

      if (memberError) {
        throw memberError;
      }

      if (!memberData || memberData.length === 0) {
        setHouseholdMembers([]);
        return;
      }

      const userIds = memberData.map(member => member.user_id);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds);

      if (profileError) {
        console.error("Error fetching profiles:", profileError);
      }

      const membersWithProfiles: HouseholdMember[] = memberData.map((member: any) => {
        const profile = profileData?.find(p => p.id === member.user_id);
        
        return {
          id: member.id,
          userId: member.user_id,
          role: member.role,
          joinedAt: member.joined_at,
          householdId: householdId,
          createdAt: member.joined_at,
          updatedAt: member.joined_at,
          profile: profile ? {
            fullName: profile.full_name || 'Unknown User',
            email: profile.email || 'No email available',
            avatarUrl: profile.avatar_url
          } : {
            fullName: 'Unknown User',
            email: 'No email available',
            avatarUrl: undefined
          }
        };
      });

      setHouseholdMembers(membersWithProfiles);
    } catch (error) {
      console.error("Error fetching household members:", error);
      toast({
        title: "Error",
        description: "Failed to fetch household members.",
        variant: "destructive",
      });
      setHouseholdMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [user, toast]);

  const removeMember = useCallback(async (memberId: string, memberUserId: string): Promise<boolean> => {
    console.log("Attempting to remove member:", { memberId, memberUserId, currentHousehold: currentHousehold?.id, currentUserId: user?.id });
    
    if (!currentHousehold || !user) {
      console.error("Missing household or user");
      toast({
        title: "Error",
        description: "Missing household or user information.",
        variant: "destructive",
      });
      return false;
    }

    if (memberUserId === user.id) {
      console.error("Cannot remove self");
      toast({
        title: "Error",
        description: "You cannot remove yourself from the household.",
        variant: "destructive",
      });
      return false;
    }

    // Check if current user is the owner
    const isOwner = currentHousehold.createdBy === user.id;
    console.log("Is owner check:", { isOwner, householdCreatedBy: currentHousehold.createdBy, userId: user.id });
    
    if (!isOwner) {
      console.error("User is not owner");
      toast({
        title: "Permission Denied",
        description: "Only household owners can remove members.",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log("Executing delete query...");
      const { error, data } = await supabase
        .from('household_members')
        .delete()
        .eq('id', memberId)
        .eq('household_id', currentHousehold.id)
        .select();

      console.log("Delete result:", { error, data });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      // Check if any rows were actually deleted
      if (!data || data.length === 0) {
        console.error("No rows were deleted");
        toast({
          title: "Error",
          description: "Failed to remove member - member not found or already removed.",
          variant: "destructive",
        });
        return false;
      }

      setHouseholdMembers(prev => prev.filter(m => m.id !== memberId));
      
      toast({
        title: "Member Removed",
        description: "Member has been removed from the household.",
      });

      console.log("Member successfully removed");
      return true;
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: `Failed to remove member: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      return false;
    }
  }, [currentHousehold, user?.id, toast]);

  const requestToJoinHousehold = async (householdCode: string): Promise<boolean> => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to join a household.",
          variant: "destructive",
        });
        return false;
      }

      const { data: households, error: householdError } = await supabase
        .from('households')
        .select('*');

      if (householdError) {
        toast({
          title: "Database Error",
          description: "Failed to search for household. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      const matchingHousehold = households?.find(h => 
        h.id.slice(0, 6).toUpperCase() === householdCode.trim().toUpperCase()
      );

      if (!matchingHousehold) {
        toast({
          title: "Invalid Code",
          description: "The household code is invalid. Please check and try again.",
          variant: "destructive",
        });
        return false;
      }

      const { data: existingMember, error: memberCheckError } = await supabase
        .from('household_members')
        .select('id')
        .eq('household_id', matchingHousehold.id)
        .eq('user_id', user.id);

      if (memberCheckError) {
        toast({
          title: "Database Error",
          description: "Failed to check membership status. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      if (existingMember && existingMember.length > 0) {
        toast({
          title: "Already a Member",
          description: "You are already a member of this household.",
          variant: "destructive",
        });
        return false;
      }

      const { data: existingRequest, error: requestCheckError } = await supabase
        .from('household_join_requests')
        .select('*')
        .eq('household_id', matchingHousehold.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (requestCheckError) {
        toast({
          title: "Database Error",
          description: "Failed to check existing requests. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      if (existingRequest && existingRequest.length > 0) {
        const request = existingRequest[0];
        
        if (request.status === 'pending') {
          toast({
            title: "Request Already Sent",
            description: "You already have a pending request for this household.",
            variant: "destructive",
          });
          return false;
        } else if (request.status === 'approved') {
          toast({
            title: "Request Already Approved",
            description: "Your request was already approved. You should be a member of this household.",
            variant: "destructive",
          });
          return false;
        } else if (request.status === 'rejected') {
          const { error: deleteError } = await supabase
            .from('household_join_requests')
            .delete()
            .eq('id', request.id);

          if (deleteError) {
            toast({
              title: "Failed to Send Request",
              description: "Could not remove old request. Please try again.",
              variant: "destructive",
            });
            return false;
          }
        }
      }

      const { data: insertData, error: requestError } = await supabase
        .from('household_join_requests')
        .insert([{
          household_id: matchingHousehold.id,
          user_id: user.id,
          status: 'pending'
        }])
        .select('*');

      if (requestError) {
        if (requestError.code === '23505') {
          toast({
            title: "Request Already Exists",
            description: "You already have a request for this household. Please check with the household owner.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Failed to Send Request",
            description: "Could not create join request. Please try again.",
            variant: "destructive",
          });
        }
        return false;
      }

      toast({
        title: "Request Sent Successfully!",
        description: `Your join request for "${matchingHousehold.name}" has been sent. The household owner will review your request.`,
      });

      return true;
    } catch (error) {
      console.error("Error requesting to join household:", error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      return false;
    }
  };

  const approveJoinRequest = async (requestId: string): Promise<boolean> => {
    try {
      const { data: request, error: fetchError } = await supabase
        .from('household_join_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !request) {
        throw fetchError || new Error("Request not found");
      }

      const { error: memberError } = await supabase
        .from('household_members')
        .insert([{
          household_id: request.household_id,
          user_id: request.user_id,
          role: 'member'
        }]);

      if (memberError) {
        throw memberError;
      }

      const { error: updateError } = await supabase
        .from('household_join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) {
        throw updateError;
      }

      if (currentHousehold) {
        await fetchHouseholdMembers(currentHousehold.id);
        await fetchJoinRequests(currentHousehold.id);
      }

      toast({
        title: "Request Approved",
        description: "The join request has been approved.",
      });

      return true;
    } catch (error) {
      console.error("Error approving join request:", error);
      toast({
        title: "Error",
        description: "Failed to approve join request. Please try again.",
      });
      return false;
    }
  };

  const rejectJoinRequest = async (requestId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('household_join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      if (currentHousehold) {
        await fetchJoinRequests(currentHousehold.id);
      }

      toast({
        title: "Request Rejected",
        description: "The join request has been rejected.",
      });

      return true;
    } catch (error) {
      console.error("Error rejecting join request:", error);
      toast({
        title: "Error",
        description: "Failed to reject join request. Please try again.",
      });
      return false;
    }
  };

  const createHousehold = async (name: string): Promise<Household | null> => {
    try {
      if (!user) {
        const errorMsg = "You must be logged in to create a household. Please sign in and try again.";
        throw new Error(errorMsg);
      }

      if (!name.trim()) {
        throw new Error("Household name cannot be empty.");
      }

      if (name.trim().length < 2) {
        throw new Error("Household name must be at least 2 characters long.");
      }

      if (name.trim().length > 50) {
        throw new Error("Household name cannot be longer than 50 characters.");
      }

      const { data, error } = await supabase.rpc('create_household_with_owner', {
        household_name: name.trim()
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error("A household with this name already exists for your account. Please choose a different name.");
        } else if (error.code === '42501') {
          throw new Error("You don't have permission to create households. Please contact support.");
        } else if (error.code === '23503') {
          throw new Error("There was an issue with your user account. Please try logging out and back in.");
        } else if (error.message?.includes('network')) {
          throw new Error("Network error. Please check your internet connection and try again.");
        } else {
          throw new Error(`Failed to create household: ${error.message || 'Unknown database error'}`);
        }
      }

      if (!data) {
        throw new Error("Failed to create household. No data returned from server.");
      }

      const { data: householdData, error: fetchError } = await supabase
        .from('households')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) {
        throw new Error(`Household created but failed to retrieve details: ${fetchError.message}`);
      }

      const newHousehold: Household = {
        id: householdData.id,
        name: householdData.name,
        createdBy: householdData.created_by,
        createdAt: householdData.created_at,
        updatedAt: householdData.updated_at
      };

      setHouseholds(prev => [newHousehold, ...prev]);
      setCurrentHousehold(newHousehold);
      
      toast({
        title: "Household Created",
        description: `${name} has been created successfully.`,
      });

      return newHousehold;
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      } else {
        throw new Error("An unexpected error occurred while creating the household. Please try again.");
      }
    }
  };

  const leaveHousehold = async (householdId: string): Promise<boolean> => {
    try {
      if (!user) return false;

      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', householdId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      await fetchHouseholds();
      
      if (currentHousehold?.id === householdId) {
        setCurrentHousehold(households.length > 1 ? households[0] : null);
      }

      toast({
        title: "Left Household",
        description: "You've successfully left the household.",
      });

      return true;
    } catch (err) {
      console.error("Error leaving household:", err);
      toast({
        title: "Error",
        description: "Failed to leave household. Please try again.",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, [user?.id]);

  useEffect(() => {
    if (currentHousehold && user) {
      fetchHouseholdMembers(currentHousehold.id);
      fetchJoinRequests(currentHousehold.id);
    } else {
      setHouseholdMembers([]);
      setJoinRequests([]);
    }
  }, [currentHousehold?.id, user?.id]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('household-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'households'
        },
        () => {
          fetchHouseholds();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'household_members'
        },
        () => {
          fetchHouseholds();
          if (currentHousehold) {
            fetchHouseholdMembers(currentHousehold.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'household_join_requests'
        },
        () => {
          if (currentHousehold) {
            fetchJoinRequests(currentHousehold.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, currentHousehold?.id]);

  const contextValue = useMemo(() => ({
    households,
    currentHousehold,
    householdMembers,
    joinRequests,
    isLoading,
    isLoadingMembers,
    error,
    createHousehold: async (name: string) => null as Household | null, // Mock
    setCurrentHousehold,
    fetchHouseholds: async () => {}, // Mock
    requestToJoinHousehold,
    approveJoinRequest: async (requestId: string) => true, // Mock
    rejectJoinRequest: async (requestId: string) => true, // Mock
    leaveHousehold: async (householdId: string) => true, // Mock
    removeMember
  }), [
    households,
    currentHousehold,
    householdMembers,
    joinRequests,
    isLoading,
    isLoadingMembers,
    error,
    requestToJoinHousehold,
    removeMember
  ]);

  return (
    <HouseholdContext.Provider value={contextValue}>
      {children}
    </HouseholdContext.Provider>
  );
};

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (context === undefined) {
    throw new Error("useHousehold must be used within a HouseholdProvider");
  }
  return context;
};
