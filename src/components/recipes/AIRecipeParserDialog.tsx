
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChefHat } from "lucide-react";

interface AIRecipeParserDialogProps {
  open: boolean;
  onClose: () => void;
  onParse: (recipeText: string) => void;
}

export function AIRecipeParserDialog({ open, onClose, onParse }: AIRecipeParserDialogProps) {
  const [recipeText, setRecipeText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleParse = () => {
    setIsParsing(true);
    onParse(recipeText);
    setIsParsing(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-sage" />
            AI Recipe Parser
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recipeText" className="text-right">
              Recipe Text
            </Label>
            <Textarea
              id="recipeText"
              className="col-span-3"
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
              placeholder="Paste recipe text here..."
              ref={textareaRef}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" onClick={handleParse} disabled={isParsing}>
            {isParsing ? "Parsing..." : "Parse Recipe"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
