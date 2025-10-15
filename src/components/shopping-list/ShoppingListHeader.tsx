import { ShoppingCart } from "lucide-react";
import { useHousehold } from "@/contexts/HouseholdContext";
import { PageHeader } from "@/components/layout/PageHeader";

interface ShoppingListHeaderProps {
  onShare: () => void;
  weekNumber: 1 | 2;
  onAddItem: (name: string) => Promise<void>;
  onInfoClick?: () => void;
}

export default function ShoppingListHeader({ 
  onShare, 
  weekNumber,
  onAddItem,
  onInfoClick
}: ShoppingListHeaderProps) {
  const { currentHousehold } = useHousehold();

  const getWelcomeText = () => {
    if (!currentHousehold) {
      return "Your household's go-to list for turning meal plans into delicious reality.";
    }
    return "Your household's go-to list for turning meal plans into delicious reality.";
  };

  return (
    <PageHeader
      icon={ShoppingCart}
      title="Shopping List"
      description={getWelcomeText()}
    />
  );
}
