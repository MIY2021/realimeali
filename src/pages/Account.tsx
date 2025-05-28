
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedAvatar } from "@/components/ui/enhanced-avatar";
import { User, Upload, Shuffle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const FRUIT_OPTIONS = ['🍎', '🍊', '🍌', '🍇', '🍓', '🥝', '🍑', '🥭', '🍍', '🥥', '🍒', '🍈', '🥑', '🍐', '🥔'];

export default function Account() {
  useDocumentTitle("Account | RealiMeali");
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(profile);
        setDisplayName(profile?.full_name || user.email || "");
      };
      
      fetchProfile();
    }
  }, [user]);

  const handleRandomizeFruit = async () => {
    if (!user || !profile || profile.auth_provider === 'google') return;

    const randomIndex = Math.floor(Math.random() * FRUIT_OPTIONS.length);
    const newFruit = FRUIT_OPTIONS[randomIndex];

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          avatar_type: 'fruit',
          avatar_data: newFruit 
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, avatar_type: 'fruit', avatar_data: newFruit });
      
      toast({
        title: "Avatar Updated",
        description: "Your fruit avatar has been randomized! 🎲",
      });
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update both the auth metadata and the profiles table
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          full_name: displayName 
        }
      });

      if (authError) throw authError;

      // Update the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: displayName })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Account Updated",
        description: "Your account details have been saved successfully.",
      });
    } catch (error) {
      console.error("Error updating account:", error);
      toast({
        title: "Error",
        description: "Failed to update account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container max-w-lg py-8">
        <p className="text-center text-muted-foreground">Please log in to manage your account.</p>
      </div>
    );
  }

  const isGoogleUser = profile?.auth_provider === 'google';

  return (
    <div className="container max-w-lg py-8">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-terracotta" />
        <h1 className="text-2xl font-bold text-navy">Manage Account</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your account details and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <EnhancedAvatar 
              src={isGoogleUser ? profile?.avatar_url : undefined}
              alt={displayName}
              fallbackText={displayName}
              avatarType={profile?.avatar_type}
              avatarData={profile?.avatar_data}
              size="lg"
            />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Profile Picture</p>
              {isGoogleUser ? (
                <p className="text-sm">Managed by your Google account</p>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRandomizeFruit}
                    className="flex items-center gap-1"
                  >
                    <Shuffle className="h-3 w-3" />
                    Randomize
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Click to get a new fruit avatar
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
            />
            <p className="text-sm text-muted-foreground">
              This name will be shown to other household members.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={user.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              {isGoogleUser 
                ? "Email address is managed by your Google account."
                : "Email address cannot be changed after registration."
              }
            </p>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="w-full bg-terracotta hover:bg-terracotta/90"
          >
            <User className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
