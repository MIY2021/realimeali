import { User } from "lucide-react";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useAuth } from "@/contexts/AuthContext";
import { JoinHouseholdCard } from "@/components/household/JoinHouseholdCard";
import { HouseholdDetailsCard } from "@/components/household/HouseholdDetailsCard";
import { HouseholdMembersCard } from "@/components/household/HouseholdMembersCard";
import { JoinRequestsCard } from "@/components/household/JoinRequestsCard";
import { CreateHouseholdCard } from "@/components/household/CreateHouseholdCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Household() {
  useDocumentTitle("Household | RealiMeali");
  
  const { user } = useAuth();
  const { currentHousehold, setCurrentHousehold, householdMembers, isLoadingMembers, removeMember } = useHousehold();

  const isOwner = currentHousehold && user && currentHousehold.created_by === user.id;

  if (!user) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Please log in to manage households.</p>
      </div>
    );
  }

  if (!currentHousehold) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-6 w-6 text-terracotta flex-shrink-0" />
          <h1 className="text-2xl font-bold text-navy">Household Management</h1>
        </div>

        <div className="space-y-6">
          <CreateHouseholdCard />
          <JoinHouseholdCard />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-terracotta flex-shrink-0" />
        <h1 className="text-2xl font-bold text-navy">Household Management</h1>
      </div>

      <div className="space-y-6">
        <HouseholdDetailsCard
          household={currentHousehold}
          isOwner={!!isOwner}
          onHouseholdUpdate={setCurrentHousehold}
        />

        <JoinRequestsCard isOwner={!!isOwner} />

        <HouseholdMembersCard
          members={householdMembers}
          isOwner={!!isOwner}
          onRemoveMember={removeMember}
          isLoading={isLoadingMembers}
        />
      </div>
    </div>
  );
}
