
import { User } from "lucide-react";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHouseholdMembers } from "@/hooks/useHouseholdMembers";
import { JoinHouseholdCard } from "@/components/household/JoinHouseholdCard";
import { HouseholdDetailsCard } from "@/components/household/HouseholdDetailsCard";
import { HouseholdMembersCard } from "@/components/household/HouseholdMembersCard";
import { InviteMembersCard } from "@/components/household/InviteMembersCard";
import { CreateTestHouseholdCard } from "@/components/household/CreateTestHouseholdCard";

export default function Household() {
  const { user } = useAuth();
  const { currentHousehold, setCurrentHousehold } = useHousehold();
  const { members, removeMember } = useHouseholdMembers(currentHousehold?.id || null);

  const isOwner = currentHousehold && members.find(m => m.user_id === user?.id)?.role === 'owner';
  const householdCode = currentHousehold ? currentHousehold.id.slice(0, 6).toUpperCase() : "";

  if (!user) {
    return (
      <div className="container max-w-lg py-8">
        <p className="text-center text-muted-foreground">Please log in to manage households.</p>
      </div>
    );
  }

  if (!currentHousehold) {
    return (
      <div className="container max-w-lg py-8">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-6 w-6 text-terracotta" />
          <h1 className="text-2xl font-bold text-navy">Household Management</h1>
        </div>

        <div className="space-y-6">
          <JoinHouseholdCard />
          <CreateTestHouseholdCard />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-lg py-8">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-terracotta" />
        <h1 className="text-2xl font-bold text-navy">Household Management</h1>
      </div>

      <div className="space-y-6">
        <HouseholdDetailsCard
          household={currentHousehold}
          isOwner={!!isOwner}
          onHouseholdUpdate={setCurrentHousehold}
        />

        <HouseholdMembersCard
          members={members}
          isOwner={!!isOwner}
          onRemoveMember={removeMember}
        />

        {isOwner && (
          <InviteMembersCard
            household={currentHousehold}
            householdCode={householdCode}
          />
        )}
      </div>
    </div>
  );
}
