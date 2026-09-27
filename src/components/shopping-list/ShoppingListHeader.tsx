import { ShoppingBasketIcon } from "@/components/icons/RealiMealiIcons";
import { useHousehold } from "@/contexts/HouseholdContext";
import { PageHeader } from "@/components/layout/PageHeader";

interface ShoppingListHeaderProps {
  onShare: () => void;
  onAddItem?: (name: string) => Promise<void>;
  onInfoClick?: () => void;
}

export default function ShoppingListHeader({ 
  onShare, 
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
      icon={
        <ShoppingBasketIcon 
          className="h-6 w-6 sm:h-7 sm:w-7" 
          style={{ color: '#F5B82E', stroke: '#F5B82E' }}
          aria-hidden="true"
        />
      }
      title="Shopping List"
      description={getWelcomeText()}
    />
  );
}
