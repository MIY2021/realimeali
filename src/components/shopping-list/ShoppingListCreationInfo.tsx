
import { useUserProfile } from "@/hooks/useUserProfile";

interface ShoppingListCreationInfoProps {
  lastGenerated: Date | null;
  createdByUserId?: string;
}

export default function ShoppingListCreationInfo({
  lastGenerated,
  createdByUserId
}: ShoppingListCreationInfoProps) {
  const { profile } = useUserProfile(createdByUserId || null);
  
  if (!lastGenerated) return null;

  const createdByText = profile?.full_name ? ` by ${profile.full_name}` : '';

  return (
    <div className="mb-3">
      <p className="text-xs text-muted-foreground">
        Shopping list created on {lastGenerated.toLocaleDateString()} at {lastGenerated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{createdByText}
      </p>
    </div>
  );
}
