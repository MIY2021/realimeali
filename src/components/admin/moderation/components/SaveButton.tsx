
import { Button } from "@/components/ui/button";
import { Loader, Save } from "lucide-react";

interface SaveButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSaving: boolean;
}

export function SaveButton({ onClick, disabled, isSaving }: SaveButtonProps) {
  return (
    <div className="pt-4">
      <Button
        onClick={onClick}
        disabled={disabled}
        className="w-full"
        size="lg"
      >
        {isSaving ? (
          <>
            <Loader className="h-4 w-4 mr-2 animate-spin" />
            Saving Changes...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  );
}
