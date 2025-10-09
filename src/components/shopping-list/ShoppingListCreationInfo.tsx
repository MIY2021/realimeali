
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

  return (
    <div className="mb-4">
      <p className="text-sm" style={{ color: 'hsl(var(--shopping-grey))' }}>
        {completedItems} of {totalItems} items completed
      </p>
    </div>
  );
}
