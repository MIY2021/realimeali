
import { useUserProfile } from "@/hooks/useUserProfile";

interface ShoppingListCreationInfoProps {
  lastGenerated: Date | null;
  createdByUserId?: string;
  totalItems: number;
  completedItems: number;
}

export default function ShoppingListCreationInfo({
  lastGenerated,
  createdByUserId,
  totalItems,
  completedItems
}: ShoppingListCreationInfoProps) {
  const { profile } = useUserProfile(createdByUserId || null);
  
  if (!lastGenerated) return null;

  const createdByText = profile?.full_name ? ` by ${profile.full_name}` : '';

  return (
    <div className="mb-3">
      <p className="text-xs text-muted-foreground">
        {completedItems} of {totalItems} items completed
      </p>
    </div>
  );
}
