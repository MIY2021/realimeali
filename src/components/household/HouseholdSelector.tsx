
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useHousehold } from "@/contexts/HouseholdContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ChevronDown, User, Plus } from "lucide-react";
import { CreateHouseholdDialog } from "./CreateHouseholdDialog";
import { HouseholdManagementDialog } from "./HouseholdManagementDialog";

export const HouseholdSelector = () => {
  const { households, currentHousehold, setCurrentHousehold } = useHousehold();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showManagementDialog, setShowManagementDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">
              {currentHousehold ? currentHousehold.name : "No Household"}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {households.map((household) => (
            <DropdownMenuItem
              key={household.id}
              onClick={() => setCurrentHousehold(household)}
              className={currentHousehold?.id === household.id ? "bg-accent" : ""}
            >
              <User className="h-4 w-4 mr-2" />
              {household.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Household
          </DropdownMenuItem>
          {currentHousehold && (
            <DropdownMenuItem onClick={() => setShowManagementDialog(true)}>
              <User className="h-4 w-4 mr-2" />
              Manage Household
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateHouseholdDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {currentHousehold && (
        <HouseholdManagementDialog
          open={showManagementDialog}
          onOpenChange={setShowManagementDialog}
          household={currentHousehold}
        />
      )}
    </>
  );
};
