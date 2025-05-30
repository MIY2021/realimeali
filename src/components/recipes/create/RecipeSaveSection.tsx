
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Save, X, Share, Info, CheckCheck, SparkleIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RecipeSaveSectionProps {
  wasGenerated?: boolean;
  shareWithCommunity: boolean;
  setShareWithCommunity: (share: boolean) => void;
  isComplete: boolean;
  isProcessing: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function RecipeSaveSection({
  wasGenerated,
  shareWithCommunity,
  setShareWithCommunity,
  isComplete,
  isProcessing,
  onSave,
  onCancel,
}: RecipeSaveSectionProps) {
  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="share-community" 
              checked={shareWithCommunity}
              onCheckedChange={(checked) => setShareWithCommunity(checked === true)} 
            />
            <Label 
              htmlFor="share-community" 
              className="text-sm font-medium leading-none cursor-pointer flex items-center"
            >
              <span className="mr-1">🎉</span> Share with RealiMeali Community
            </Label>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  When checked, this recipe will be submitted for review to be added to the community recipes collection. 
                  Your name will be credited as the contributor!
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={onCancel}
            className="flex items-center gap-1.5"
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>

          <Button
            onClick={onSave}
            disabled={!isComplete || isProcessing}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 ml-2"
          >
            {isComplete ? 
              <CheckCheck className="h-4 w-4" /> : 
              <Save className="h-4 w-4" />
            }
            {isProcessing ? "Saving..." : "Save Recipe"}
          </Button>
        </div>
      </div>
      
      {wasGenerated && (
        <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground pt-2 border-t">
          <SparkleIcon className="h-3 w-3 text-amber-500 flex-shrink-0 mt-0.5" />
          <p>
            This recipe was created with AI assistance. Feel free to edit it to ensure it meets your expectations!
          </p>
        </div>
      )}
      
      {!isComplete && (
        <div className="mt-3 flex items-start gap-2 text-xs text-orange-600 pt-2 border-t">
          <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <p>
            Please complete the required fields: title, at least one ingredient, and at least one instruction step.
          </p>
        </div>
      )}
    </Card>
  );
}
