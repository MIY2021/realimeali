import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Household {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
}

export interface HouseholdJoinRequest {
  id: string;
  household_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface HouseholdContextType {
  households: Household[];
  currentHousehold: Household | null;
  householdMembers: HouseholdMember[];
  joinRequests: HouseholdJoinRequest[];
  isLoading: boolean;
  error: string | null;
  createHousehold: (name: string) => Promise<Household | null>;
  setCurrentHousehold: (household: Household | null) => void;
  fetchHouseholds: () => Promise<void>;
  fetchHouseholdMembers: (householdId: string) => Promise<void>;
  requestToJoinHousehold: (householdCode: string) => Promise<boolean>;
  fetchJoinRequests: (householdId: string) => Promise<void>;
  approveJoinRequest: (requestId: string) => Promise<boolean>;
  rejectJoinRequest: (requestId: string) => Promise<boolean>;
  leaveHousehold: (householdId: string) => Promise<boolean>;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export const HouseholdProvider = ({ children }: { children: ReactNode }) => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<HouseholdJoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchHouseholds = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        console.log("No user, clearing households");
        setHouseholds([]);
        setCurrentHousehold(null);
        setIsLoading(false);
        return;
      }

      console.log("Fetching households for user:", user.id);

      // First get all household memberships for this user
      const { data: membershipData, error: membershipError } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id);

      if (membershipError) {
        console.error("Error fetching memberships:", membershipError);
        throw membershipError;
      }

      console.log("User memberships:", membershipData);

      if (!membershipData || membershipData.length === 0) {
        console.log("User is not a member of any households");
        setHouseholds([]);
        setCurrentHousehold(null);
        setIsLoading(false);
        return;
      }

      // Get household details for all households user is a member of
      const householdIds = membershipData.map(m => m.household_id);
      
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .in('id', householdIds)
        .order('created_at', { ascending: false });

      if (householdError) {
        console.error("Error fetching households:", householdError);
        throw householdError;
      }

      console.log("Fetched households:", householdData);

      const transformedHouseholds: Household[] = (householdData || []).map(item => ({
        id: item.id,
        name: item.name,
        created_by: item.created_by,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setHouseholds(transformedHouseholds);
      
      // Set first household as current if none selected
      if (transformedHouseholds.length > 0 && !currentHousehold) {
        console.log("Setting current household to first available:", transformedHouseholds[0]);
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
  };

  const fetchHouseholdMembers = async (householdId: string) => {
    try {
      const { data, error } = await supabase
        .from('household_members')
        .select('*')
        .eq('household_id', householdId);

      if (error) {
        throw error;
      }

      setHouseholdMembers(data || []);
    } catch (err) {
      console.error("Error fetching household members:", err);
      toast({
        title: "Error",
        description: "Failed to fetch household members.",
        variant: "destructive",
      });
    }
  };

  const fetchJoinRequests = async (householdId: string) => {
    try {
      console.log("Fetching join requests for household:", householdId);
      console.log("Current user:", user?.id);
      
      // First, let's check if the current user is the owner of this household
      const { data: membershipData, error: membershipError } = await supabase
        .from('household_members')
        .select('role')
        .eq('household_id', householdId)
        .eq('user_id', user?.id)
        .single();

      if (membershipError) {
        console.error("Error checking membership:", membershipError);
      } else {
        console.log("User membership role:", membershipData?.role);
      }
      
      const { data, error } = await supabase
        .from('household_join_requests')
        .select('*')
        .eq('household_id', householdId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching join requests:", error);
        throw error;
      }

      console.log("Raw join requests data:", data);

      // Type the data properly by casting the status field
      const typedRequests: HouseholdJoinRequest[] = (data || []).map(request => ({
        ...request,
        status: request.status as 'pending' | 'approved' | 'rejected'
      }));

      console.log("Typed join requests:", typedRequests);
      setJoinRequests(typedRequests);
    } catch (err) {
      console.error("Error fetching join requests:", err);
      toast({
        title: "Error",
        description: "Failed to fetch join requests.",
        variant: "destructive",
      });
    }
  };

  const requestToJoinHousehold = async (householdCode: string): Promise<boolean> => {
    try {
      if (!user) {
        console.error("DEBUG: No authenticated user");
        toast({
          title: "Authentication Required",
          description: "Please log in to join a household.",
          variant: "destructive",
        });
        return false;
      }

      console.log("DEBUG: Starting join request process");
      console.log("DEBUG: Household code:", householdCode);
      console.log("DEBUG: Current user ID:", user.id);
      
      // Get all households and filter by code in JavaScript
      const { data: households, error: householdError } = await supabase
        .from('households')
        .select('*');

      if (householdError) {
        console.error("DEBUG: Household lookup error:", householdError);
        toast({
          title: "Database Error",
          description: "Failed to search for household. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      console.log("DEBUG: Found households:", households?.length || 0);

      // Find household where the first 6 characters of the ID match the code
      const matchingHousehold = households?.find(h => 
        h.id.slice(0, 6).toUpperCase() === householdCode.trim().toUpperCase()
      );

      if (!matchingHousehold) {
        console.log("DEBUG: No matching household found for code:", householdCode);
        toast({
          title: "Invalid Code",
          description: "The household code is invalid. Please check and try again.",
          variant: "destructive",
        });
        return false;
      }

      console.log("DEBUG: Found matching household:", matchingHousehold.name, "ID:", matchingHousehold.id);

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('household_members')
        .select('id')
        .eq('household_id', matchingHousehold.id)
        .eq('user_id', user.id);

      if (memberCheckError) {
        console.error("DEBUG: Member check error:", memberCheckError);
        toast({
          title: "Database Error",
          description: "Failed to check membership status. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      if (existingMember && existingMember.length > 0) {
        console.log("DEBUG: User is already a member");
        toast({
          title: "Already a Member",
          description: "You are already a member of this household.",
          variant: "destructive",
        });
        return false;
      }

      // Check for any existing request (including rejected ones)
      console.log("DEBUG: Checking for existing requests...");
      const { data: existingRequest, error: requestCheckError } = await supabase
        .from('household_join_requests')
        .select('*')
        .eq('household_id', matchingHousehold.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (requestCheckError) {
        console.error("DEBUG: Request check error:", requestCheckError);
        toast({
          title: "Database Error",
          description: "Failed to check existing requests. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      console.log("DEBUG: Existing request data:", existingRequest);

      if (existingRequest && existingRequest.length > 0) {
        const request = existingRequest[0];
        console.log("DEBUG: Found existing request with status:", request.status);
        console.log("DEBUG: Request ID:", request.id);
        
        if (request.status === 'pending') {
          console.log("DEBUG: Request is already pending");
          toast({
            title: "Request Already Sent",
            description: "You already have a pending request for this household.",
            variant: "destructive",
          });
          return false;
        } else if (request.status === 'approved') {
          console.log("DEBUG: Request was already approved");
          toast({
            title: "Request Already Approved",
            description: "Your request was already approved. You should be a member of this household.",
            variant: "destructive",
          });
          return false;
        } else if (request.status === 'rejected') {
          console.log("DEBUG: Updating rejected request to pending");
          console.log("DEBUG: Attempting to update request ID:", request.id);
          
          // Update the existing rejected request to pending instead of creating a new one
          const { data: updateData, error: updateError } = await supabase
            .from('household_join_requests')
            .update({ 
              status: 'pending',
              updated_at: new Date().toISOString()
            })
            .eq('id', request.id)
            .select('*');

          console.log("DEBUG: Update response data:", updateData);
          console.log("DEBUG: Update error:", updateError);

          if (updateError) {
            console.error("DEBUG: Request update error:", updateError);
            toast({
              title: "Failed to Send Request",
              description: "Could not update join request. Please try again.",
              variant: "destructive",
            });
            return false;
          }

          if (!updateData || updateData.length === 0) {
            console.error("DEBUG: No data returned from update");
            toast({
              title: "Failed to Send Request",
              description: "Could not update join request. Please try again.",
              variant: "destructive",
            });
            return false;
          }

          console.log("DEBUG: Successfully updated request to pending:", updateData);
          
          // Verify the update worked by fetching the request again
          const { data: verifyData, error: verifyError } = await supabase
            .from('household_join_requests')
            .select('*')
            .eq('id', request.id)
            .single();

          console.log("DEBUG: Verification data:", verifyData);
          console.log("DEBUG: Verification error:", verifyError);

          toast({
            title: "Request Sent Successfully!",
            description: `Your join request for "${matchingHousehold.name}" has been sent. The household owner will review your request.`,
          });

          return true;
        }
      }

      // Create new join request (only if no existing request found)
      console.log("DEBUG: Creating new join request");
      
      const { data: insertData, error: requestError } = await supabase
        .from('household_join_requests')
        .insert([{
          household_id: matchingHousehold.id,
          user_id: user.id,
          status: 'pending'
        }])
        .select('*');

      console.log("DEBUG: Insert response data:", insertData);
      console.log("DEBUG: Insert error:", requestError);

      if (requestError) {
        console.error("DEBUG: Request insert error:", requestError);
        
        // Handle the specific duplicate key error
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

      console.log("DEBUG: Successfully created join request:", insertData);
      toast({
        title: "Request Sent Successfully!",
        description: `Your join request for "${matchingHousehold.name}" has been sent. The household owner will review your request.`,
      });

      return true;
    } catch (error) {
      console.error("DEBUG: Unexpected error requesting to join household:", error);
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
      // Get the request details
      const { data: request, error: fetchError } = await supabase
        .from('household_join_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !request) {
        throw fetchError || new Error("Request not found");
      }

      // Add user to household
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

      // Update request status
      const { error: updateError } = await supabase
        .from('household_join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) {
        throw updateError;
      }

      // Refresh data
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

      // Refresh join requests
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
        toast({
          title: "Authentication Required",
          description: "You must be logged in to create a household.",
          variant: "destructive",
        });
        return null;
      }

      console.log("Creating household with name:", name);

      const { data, error } = await supabase.rpc('create_household_with_owner', {
        household_name: name
      });

      if (error) {
        console.error("Error creating household:", error);
        throw error;
      }

      console.log("Household created with ID:", data);

      // Fetch the created household
      const { data: householdData, error: fetchError } = await supabase
        .from('households')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) {
        console.error("Error fetching created household:", fetchError);
        throw fetchError;
      }

      const newHousehold: Household = {
        id: householdData.id,
        name: householdData.name,
        created_by: householdData.created_by,
        created_at: householdData.created_at,
        updated_at: householdData.updated_at
      };

      setHouseholds(prev => [newHousehold, ...prev]);
      setCurrentHousehold(newHousehold);
      
      toast({
        title: "Household Created",
        description: `${name} has been created successfully.`,
      });

      return newHousehold;
    } catch (err) {
      console.error("Error creating household:", err);
      toast({
        title: "Error",
        description: "Failed to create household. Please try again.",
      });
      return null;
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
  }, [user]);

  useEffect(() => {
    if (currentHousehold) {
      console.log("Current household changed, fetching members and join requests for:", currentHousehold.id);
      fetchHouseholdMembers(currentHousehold.id);
      fetchJoinRequests(currentHousehold.id);
    } else {
      console.log("No current household, clearing join requests");
      setJoinRequests([]);
    }
  }, [currentHousehold]);

  // Set up real-time subscription for household changes
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
          console.log("Household change detected, refetching...");
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
          console.log("Household member change detected, refetching...");
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
          console.log("Join request change detected, refetching...");
          if (currentHousehold) {
            fetchJoinRequests(currentHousehold.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentHousehold]);

  return (
    <HouseholdContext.Provider value={{
      households,
      currentHousehold,
      householdMembers,
      joinRequests,
      isLoading,
      error,
      createHousehold,
      setCurrentHousehold,
      fetchHouseholds,
      fetchHouseholdMembers,
      requestToJoinHousehold,
      fetchJoinRequests,
      approveJoinRequest,
      rejectJoinRequest,
      leaveHousehold
    }}>
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
