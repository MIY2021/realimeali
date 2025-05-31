
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Recipe } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { usePublicRecipeSharing } from "@/hooks/usePublicRecipeSharing";
import { Copy, Share2 } from "lucide-react";

interface ShareRecipeDialogProps {
  recipe: Recipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareRecipeDialog({
  recipe,
  open,
  onOpenChange,
}: ShareRecipeDialogProps) {
  const [sharedByName, setSharedByName] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const { shareRecipePublicly } = usePublicRecipeSharing();
  const { toast } = useToast();

  const handleShare = async () => {
    if (!sharedByName.trim() || !householdName.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    try {
      const result = await shareRecipePublicly(
        recipe,
        sharedByName.trim(),
        householdName.trim()
      );

      if (result.success && result.data) {
        const url = `${window.location.origin}/share/${result.data.public_share_id}`;
        setShareUrl(url);
        toast({
          title: "Recipe shared successfully!",
          description: "Your recipe is now available via the share link",
        });
      } else {
        throw new Error("Failed to share recipe");
      }
    } catch (error) {
      console.error('Error sharing recipe:', error);
      toast({
        title: "Error",
        description: "Failed to share recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setShareUrl("");
    setSharedByName("");
    setHouseholdName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Recipe
          </DialogTitle>
          <DialogDescription>
            Create a public link that others can use to add this recipe to their RealiMeali recipe book.
          </DialogDescription>
        </DialogHeader>

        {!shareUrl ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sharedByName">Your Name</Label>
              <Input
                id="sharedByName"
                value={sharedByName}
                onChange={(e) => setSharedByName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="householdName">Household Name</Label>
              <Input
                id="householdName"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                placeholder="Enter your household name"
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly />
                <Button onClick={handleCopyUrl} size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {shareUrl ? "Done" : "Cancel"}
          </Button>
          {!shareUrl && (
            <Button onClick={handleShare} disabled={isSharing}>
              {isSharing ? "Sharing..." : "Create Share Link"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
