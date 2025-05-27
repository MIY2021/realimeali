
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HouseholdDetailsCardProps {
  household: {
    id: string;
    name: string;
  };
  isOwner: boolean;
  onHouseholdUpdate: (updatedHousehold: any) => void;
}

export const HouseholdDetailsCard = ({ household, isOwner, onHouseholdUpdate }: HouseholdDetailsCardProps) => {
  const { toast } = useToast();
  const [householdName, setHouseholdName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [householdCode, setHouseholdCode] = useState("");

  useEffect(() => {
    if (household) {
      setHouseholdName(household.name);
      generateHouseholdCode();
    }
  }, [household]);

  const generateHouseholdCode = () => {
    if (household) {
      // Generate a simple 6-character code based on household ID
      const code = household.id.slice(0, 6).toUpperCase();
      setHouseholdCode(code);
    }
  };

  const handleUpdateHouseholdName = async () => {
    if (!household || !householdName.trim()) return;

    setIsUpdatingName(true);
    try {
      const { error } = await supabase
        .from('households')
        .update({ name: householdName.trim() })
        .eq('id', household.id);

      if (error) throw error;

      onHouseholdUpdate({ ...household, name: householdName.trim() });
      
      toast({
        title: "Household Updated",
        description: "Household name has been updated.",
      });
    } catch (error) {
      console.error("Error updating household:", error);
      toast({
        title: "Error",
        description: "Failed to update household name.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingName(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Household Details</CardTitle>
        <CardDescription>
          Manage your household information and settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="householdName">Household Name</Label>
          <div className="flex gap-2 flex-col sm:flex-row">
            <Input
              id="householdName"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              disabled={!isOwner}
              className="flex-1"
            />
            {isOwner && (
              <Button 
                onClick={handleUpdateHouseholdName}
                disabled={isUpdatingName || householdName.trim() === household.name}
                size="sm"
                className="w-full sm:w-auto"
              >
                {isUpdatingName ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
          {!isOwner && (
            <p className="text-sm text-muted-foreground">
              Only the household owner can change the name.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Household Code</Label>
          <div className="flex gap-2 flex-col sm:flex-row">
            <Input value={householdCode} readOnly className="flex-1" />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(householdCode);
                toast({ title: "Code copied to clipboard!" });
              }}
              className="w-full sm:w-auto"
            >
              <Copy className="h-4 w-4 mr-2 sm:mr-0" />
              <span className="sm:hidden">Copy Code</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this code with others to invite them to your household.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
