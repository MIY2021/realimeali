
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { CreateHouseholdCard } from "@/components/household/CreateHouseholdCard";
import { HouseholdDetailsCard } from "@/components/household/HouseholdDetailsCard";
import { HouseholdMembersCard } from "@/components/household/HouseholdMembersCard";
import { InviteMembersCard } from "@/components/household/InviteMembersCard";
import { JoinHouseholdCard } from "@/components/household/JoinHouseholdCard";
import { JoinRequestsCard } from "@/components/household/JoinRequestsCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Household() {
  useDocumentTitle("Household Management | RealiMeali");
  
  const { user } = useAuth();
  const { 
    currentHousehold, 
    householdMembers, 
    isLoadingMembers, 
    removeMember 
  } = useHousehold();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (currentHousehold && user) {
      const ownerCheck = currentHousehold.created_by === user.id;
      setIsOwner(ownerCheck);
    }
  }, [currentHousehold, user]);

  const handleRemoveMember = async (memberId: string, memberUserId: string): Promise<boolean> => {
    try {
      await removeMember(memberId);
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      return false;
    }
  };

  if (!user) {
    return (
      <div className="container max-w-4xl py-8 px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy mb-4">Household Management</h1>
          <p className="text-muted-foreground">Please log in to manage your household.</p>
        </div>
      </div>
    );
  }

  if (!currentHousehold) {
    return (
      <div className="container max-w-4xl py-8 px-6 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-4">Household Management</h1>
          <p className="text-muted-foreground">Get started by creating or joining a household to begin meal planning together.</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          <CreateHouseholdCard />
          <JoinHouseholdCard />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 px-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-navy mb-4">Household Management</h1>
        <p className="text-muted-foreground">Manage your household settings and members.</p>
      </div>

      <div className="grid gap-8">
        <HouseholdDetailsCard 
          household={currentHousehold} 
          isOwner={isOwner}
          onHouseholdUpdate={() => {}}
        />
        
        <HouseholdMembersCard 
          members={householdMembers}
          isOwner={isOwner}
          isLoading={isLoadingMembers}
          onRemoveMember={handleRemoveMember}
        />
        
        {isOwner && (
          <>
            <InviteMembersCard 
              household={currentHousehold} 
              householdCode={currentHousehold.id}
            />
            <JoinRequestsCard 
              isOwner={isOwner}
            />
          </>
        )}
      </div>
    </div>
  );
}
