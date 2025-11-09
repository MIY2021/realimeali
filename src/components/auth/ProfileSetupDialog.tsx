
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Shuffle } from "lucide-react";

interface ProfileSetupDialogProps {
  isOpen: boolean;
  onComplete: () => void;
}

const FRUIT_OPTIONS = ['🍎', '🍊', '🍌', '🍇', '🍓', '🥝', '🍑', '🥭', '🍍', '🥥', '🍒', '🍈', '🥑', '🍐', '🥔'];

export function ProfileSetupDialog({ isOpen, onComplete }: ProfileSetupDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [selectedFruit, setSelectedFruit] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getRandomFruit = () => {
    if (!user) return FRUIT_OPTIONS[0];
    // Generate consistent random fruit based on user ID
    const userHash = user.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return FRUIT_OPTIONS[userHash % FRUIT_OPTIONS.length];
  };

  const handleRandomize = () => {
    const randomIndex = Math.floor(Math.random() * FRUIT_OPTIONS.length);
    setSelectedFruit(FRUIT_OPTIONS[randomIndex]);
  };

  const handleComplete = async () => {
    if (!user || !displayName.trim()) {
      toast({
        title: "Please enter your display name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const fruitToUse = selectedFruit || getRandomFruit();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: displayName.trim(),
          avatar_type: 'fruit',
          avatar_data: fruitToUse,
          profile_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile setup complete!",
        description: "Welcome to RealiMeali! 🎉",
      });

      onComplete();
    } catch (error) {
      console.error("Error setting up profile:", error);
      toast({
        title: "Error",
        description: "Failed to set up profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize fruit selection when dialog opens
  if (isOpen && !selectedFruit) {
    setSelectedFruit(getRandomFruit());
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Welcome to RealiMeali! 🍽️</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Let's set up your profile to get started with meal planning and recipe sharing.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Choose Your Avatar</Label>
              <div className="flex items-center justify-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-2xl bg-terracotta/20">
                    {selectedFruit}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRandomize}
                  className="flex items-center gap-2"
                >
                  <Shuffle className="h-4 w-4" />
                  Random
                </Button>
              </div>

              <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
                {FRUIT_OPTIONS.slice(0, 10).map((fruit) => (
                  <button
                    key={fruit}
                    type="button"
                    onClick={() => setSelectedFruit(fruit)}
                    className={`h-12 w-12 rounded-lg border-2 flex items-center justify-center text-xl transition-colors ${
                      selectedFruit === fruit
                        ? 'border-terracotta bg-terracotta/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {fruit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleComplete}
            disabled={isLoading || !displayName.trim()}
            className="w-full bg-terracotta hover:bg-terracotta/90"
          >
            {isLoading ? "Setting up..." : "Complete Setup"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
