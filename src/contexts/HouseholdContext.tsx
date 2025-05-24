
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

export interface HouseholdInvitation {
  id: string;
  household_id: string;
  invited_by: string;
  email: string;
  invitation_code: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  created_at: string;
  updated_at: string;
}

interface HouseholdContextType {
  households: Household[];
  currentHousehold: Household | null;
  householdMembers: HouseholdMember[];
  isLoading: boolean;
  error: string | null;
  createHousehold: (name: string) => Promise<Household | null>;
  setCurrentHousehold: (household: Household | null) => void;
  fetchHouseholds: () => Promise<void>;
  fetchHouseholdMembers: (householdId: string) => Promise<void>;
  inviteToHousehold: (email: string) => Promise<string | null>;
  joinHousehold: (invitationCode: string) => Promise<boolean>;
  leaveHousehold: (householdId: string) => Promise<boolean>;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export const HouseholdProvider = ({ children }: { children: ReactNode }) => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchHouseholds = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        setHouseholds([]);
        setCurrentHousehold(null);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('households')
        .select(`
          *,
          household_members!inner(role)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const transformedHouseholds: Household[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        created_by: item.created_by,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setHouseholds(transformedHouseholds);
      
      // Set first household as current if none selected
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

      const { data, error } = await supabase.rpc('create_household_with_owner', {
        household_name: name
      });

      if (error) {
        throw error;
      }

      // Fetch the created household
      const { data: householdData, error: fetchError } = await supabase
        .from('households')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) {
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
        variant: "destructive",
      });
      return null;
    }
  };

  const inviteToHousehold = async (email: string): Promise<string | null> => {
    try {
      if (!user || !currentHousehold) {
        toast({
          title: "Error",
          description: "You must be logged in and have a current household to send invitations.",
          variant: "destructive",
        });
        return null;
      }

      const invitationCode = await supabase.rpc('generate_invitation_code');
      
      const { error } = await supabase
        .from('household_invitations')
        .insert([{
          household_id: currentHousehold.id,
          invited_by: user.id,
          email: email,
          invitation_code: invitationCode.data
        }]);

      if (error) {
        throw error;
      }

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${email}. Share this code: ${invitationCode.data}`,
      });

      return invitationCode.data;
    } catch (err) {
      console.error("Error sending invitation:", err);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const joinHousehold = async (invitationCode: string): Promise<boolean> => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to join a household.",
          variant: "destructive",
        });
        return false;
      }

      // Find the invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('household_invitations')
        .select('*, households(*)')
        .eq('invitation_code', invitationCode)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (inviteError || !invitation) {
        toast({
          title: "Invalid Invitation",
          description: "The invitation code is invalid or has expired.",
          variant: "destructive",
        });
        return false;
      }

      // Add user to household
      const { error: memberError } = await supabase
        .from('household_members')
        .insert([{
          household_id: invitation.household_id,
          user_id: user.id,
          role: 'member'
        }]);

      if (memberError) {
        throw memberError;
      }

      // Update invitation status
      await supabase
        .from('household_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      await fetchHouseholds();
      
      toast({
        title: "Joined Household",
        description: `You've successfully joined ${invitation.households.name}!`,
      });

      return true;
    } catch (err) {
      console.error("Error joining household:", err);
      toast({
        title: "Error",
        description: "Failed to join household. Please try again.",
        variant: "destructive",
      });
      return false;
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
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, [user]);

  useEffect(() => {
    if (currentHousehold) {
      fetchHouseholdMembers(currentHousehold.id);
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
      isLoading,
      error,
      createHousehold,
      setCurrentHousehold,
      fetchHouseholds,
      fetchHouseholdMembers,
      inviteToHousehold,
      joinHousehold,
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
