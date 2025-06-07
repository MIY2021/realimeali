import { useEffect } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, User, Bell, Shield, Trash2 } from "lucide-react";

export default function Settings() {
  useDocumentTitle("Settings | RealiMeali");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              Update your personal information and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Your first name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Your last name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
            <Button className="w-full sm:w-auto">Save Changes</Button>
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
              <Shield className="h-5 w-5" />
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
