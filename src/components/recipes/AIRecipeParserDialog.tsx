
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed, Loader, Wand } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIRecipeParserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecipeParsed: (parsedRecipe: any) => void;
}

export function AIRecipeParserDialog({ open, onOpenChange, onRecipeParsed }: AIRecipeParserDialogProps) {
  const [recipeText, setRecipeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleParseRecipe = async () => {
    if (!recipeText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recipe to parse.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement AI recipe parsing
      toast({
        title: "Feature Coming Soon",
        description: "AI recipe parsing will be available soon.",
      });
    } catch (error) {
      console.error("Error parsing recipe:", error);
      toast({
        title: "Error",
        description: "Failed to parse the recipe. Please try again or enter the recipe manually.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-sage" />
            AI Recipe Parser
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="recipe-text" className="text-sm font-medium">
              Recipe Text
            </Label>
            <Textarea
              id="recipe-text"
              placeholder="Paste your recipe text here. Include ingredients, instructions, and any other details..."
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
              className="min-h-[200px] mt-2"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleParseRecipe} disabled={isLoading || !recipeText.trim()}>
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Wand className="h-4 w-4 mr-2" />
                  Parse Recipe
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
