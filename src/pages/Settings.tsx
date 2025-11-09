
import { useState, useEffect } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings as SettingsIcon, User, Bell, Trash2, Upload, Shuffle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DeletedRecipesSection } from "@/components/settings/DeletedRecipesSection";

const FRUIT_OPTIONS = ['🍎', '🍊', '🍌', '🍇', '🍓', '🥝', '🍑', '🥭', '🍍', '🥥', '🍒', '🍈', '🥑', '🍐', '🥔'];

export default function Settings() {
  useDocumentTitle("Settings | RealiMeali");
  const { user } = useAuth();
  const { toast } = useToast();

  // Profile state
  const [profile, setProfile] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedFruit, setSelectedFruit] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch user profile
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfile(data);
        const fullName = data.full_name || '';
        const nameParts = fullName.split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        setEmail(data.email || user.email || '');
        setSelectedFruit(data.avatar_data || '🍎');
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user]);

  const handleRandomizeFruit = () => {
    const randomIndex = Math.floor(Math.random() * FRUIT_OPTIONS.length);
    setSelectedFruit(FRUIT_OPTIONS[randomIndex]);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsUpdatingProfile(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          email: email,
          avatar_type: 'fruit',
          avatar_data: selectedFruit,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      // Refresh profile data
      setProfile(prev => ({
        ...prev,
        full_name: fullName,
        email: email,
        avatar_data: selectedFruit
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <SettingsIcon className="h-8 w-8 text-terracotta" />
          <h1 className="text-3xl font-bold text-navy">Settings</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage your account preferences and application settings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and profile picture.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Selection */}
            <div className="space-y-4">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-2xl bg-terracotta/20">
                    {selectedFruit}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRandomizeFruit}
                    className="flex items-center gap-2"
                  >
                    <Shuffle className="h-4 w-4" />
                    Random
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Choose from available fruit avatars
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-8 gap-2 max-w-md">
                {FRUIT_OPTIONS.map((fruit) => (
                  <button
                    key={fruit}
                    type="button"
                    onClick={() => setSelectedFruit(fruit)}
                    className={`h-10 w-10 rounded-lg border-2 flex items-center justify-center text-lg transition-colors ${
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

            <Separator />

            {/* Name Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Your last name" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" 
              />
            </div>

            <Button 
              onClick={handleUpdateProfile}
              disabled={isUpdatingProfile}
              className="w-full sm:w-auto"
            >
              {isUpdatingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Choose what notifications you'd like to receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about meal plans and recipes
                </p>
              </div>
              <Switch id="emailNotifications" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mealReminders">Meal Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded about upcoming meals
                </p>
              </div>
              <Switch id="mealReminders" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="communityUpdates">Community Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about new community recipes
                </p>
              </div>
              <Switch id="communityUpdates" />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Manage your privacy settings and account security.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="profileVisibility">Public Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to find and view your profile
                </p>
              </div>
              <Switch id="profileVisibility" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="recipeSharing">Recipe Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow sharing of your recipes with the community
                </p>
              </div>
              <Switch id="recipeSharing" />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Change Password</Label>
              <div className="grid gap-2">
                <Input type="password" placeholder="Current password" />
                <Input type="password" placeholder="New password" />
                <Input type="password" placeholder="Confirm new password" />
              </div>
              <Button variant="outline" className="w-full sm:w-auto">
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deleted Recipes */}
        <DeletedRecipesSection />

        {/* Account Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Account Management
            </CardTitle>
            <CardDescription>
              Manage your account data and deletion options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="outline">Export My Data</Button>
              <Button variant="destructive">Delete Account</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Deleting your account will permanently remove all your data, including recipes, 
              meal plans, and shopping lists. This action cannot be undone.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
