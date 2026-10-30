
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { EnhancedAvatar } from "@/components/ui/enhanced-avatar";
import {
  User,
  Bell,
  Upload,
  Shuffle,
  Shield,
  Database,
  ImagePlus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DeletedRecipesSection } from "@/components/settings/DeletedRecipesSection";
import { cn } from "@/lib/utils";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { sessionProfileQueryKey, useSessionProfile } from "@/hooks/useSessionProfile";
import { uploadUserAvatar } from "@/services/avatarUploadService";
import {
  avatarTypeUiFromProfile,
  oauthProfilePhotoFromMetadata,
  profilePhotoSourceLabel,
  resolveProfilePhotoUrl,
} from "@/utils/resolveProfilePhotoUrl";
import {
  PRESET_AVATAR_MODAL_CHOICES,
  PRESET_FOOD_AVATARS,
} from "@/constants/presetFoodAvatars";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Settings() {
  useDocumentTitle("Settings | RealiMeali");
  const { user } = useAuth();
  const { fetchHouseholdMembers } = useHousehold();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profileData, isLoading: isProfileLoading } = useSessionProfile();
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const [sendingTest, setSendingTest] = useState<null | "daily" | "weekly" | "household">(null);

  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedFruit, setSelectedFruit] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [isRestoringGooglePhoto, setIsRestoringGooglePhoto] = useState(false);
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);
  const [profilePicDialogOpen, setProfilePicDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const {
    settings: notificationSettings,
    isLoading: isLoadingNotificationSettings,
    error: notificationSettingsError,
    updateSettings: updateNotificationSettings,
  } = useNotificationSettings();

  type SettingsSectionId = "profile" | "notifications" | "privacySecurity" | "recipesData";

  interface SettingsSection {
    id: SettingsSectionId;
    label: string;
    description: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }

  const [activeSection, setActiveSection] = useState<SettingsSectionId>("profile");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!profileData || !user) return;
    const fullName = profileData.full_name || "";
    const nameParts = fullName.split(" ");
    setFirstName(nameParts[0] || "");
    setLastName(nameParts.slice(1).join(" ") || "");
    setEmail(profileData.email || user.email || "");
    setSelectedFruit(profileData.avatar_data || "🍎");
  }, [profileData, user]);

  const applyPresetAvatar = async (emoji: string): Promise<boolean> => {
    if (!user) return false;
    setIsApplyingPreset(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: null,
          avatar_type: "fruit",
          avatar_data: emoji,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
      setSelectedFruit(emoji);
      queryClient.setQueryData(sessionProfileQueryKey(user.id), (prev) => {
        if (!prev || typeof prev !== "object") return prev;
        return {
          ...prev,
          avatar_url: null,
          avatar_type: "fruit",
          avatar_data: emoji,
          updated_at: new Date().toISOString(),
        };
      });
      await queryClient.invalidateQueries({ queryKey: sessionProfileQueryKey(user.id) });
      void fetchHouseholdMembers();
      toast({
        title: "Avatar updated",
        description: "Your preset avatar has been saved.",
      });
      return true;
    } catch (err) {
      console.error("Preset avatar failed:", err);
      toast({
        title: "Error",
        description: "Could not update your avatar. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsApplyingPreset(false);
    }
  };

  const handleRandomizePreset = async (closeModalAfter = false) => {
    const randomIndex = Math.floor(Math.random() * PRESET_FOOD_AVATARS.length);
    const ok = await applyPresetAvatar(PRESET_FOOD_AVATARS[randomIndex]);
    if (ok && closeModalAfter) setProfilePicDialogOpen(false);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsUpdatingProfile(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const updates: Record<string, string> = {
        full_name: fullName,
        email,
        updated_at: new Date().toISOString(),
      };
      const photoUrl = resolveProfilePhotoUrl(profileData, user);
      if (!photoUrl) {
        updates.avatar_type = "fruit";
        updates.avatar_data = selectedFruit || PRESET_FOOD_AVATARS[0];
      }

      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: sessionProfileQueryKey(user.id) });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Your new password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please check both password fields and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Could not update password",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please choose an image file.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum size is 5 MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const url = await uploadUserAvatar(file, user.id);
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: url,
          avatar_type: "uploaded",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: sessionProfileQueryKey(user.id) });
      void fetchHouseholdMembers();
      setProfilePicDialogOpen(false);
      toast({
        title: "Photo updated",
        description: "Your profile picture has been saved.",
      });
    } catch (err) {
      console.error("Avatar upload failed:", err);
      toast({
        title: "Upload failed",
        description: "Could not save your photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    const fruit = selectedFruit || profileData?.avatar_data || PRESET_FOOD_AVATARS[0];
    setIsRemovingAvatar(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: null,
          avatar_type: "fruit",
          avatar_data: fruit,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
      setSelectedFruit(fruit);
      await queryClient.invalidateQueries({ queryKey: sessionProfileQueryKey(user.id) });
      void fetchHouseholdMembers();
      setProfilePicDialogOpen(false);
      toast({
        title: "Photo removed",
        description: "Open Update profile picture anytime to set a new one.",
      });
    } catch (err) {
      console.error("Remove avatar failed:", err);
      toast({
        title: "Error",
        description: "Could not remove your photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  const handleRestoreGooglePhoto = async () => {
    if (!user) return;
    const oauthPic = oauthProfilePhotoFromMetadata(user);
    if (!oauthPic) {
      toast({
        title: "No Google photo found",
        description: "Sign in with Google to use your Google profile picture.",
        variant: "destructive",
      });
      return;
    }
    setIsRestoringGooglePhoto(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: null,
          avatar_type: "google",
          avatar_data: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
      setSelectedFruit("");
      await queryClient.invalidateQueries({ queryKey: sessionProfileQueryKey(user.id) });
      void fetchHouseholdMembers();
      setProfilePicDialogOpen(false);
      toast({
        title: "Google photo restored",
        description: "Your profile picture now matches your Google account.",
      });
    } catch (err) {
      console.error("Restore Google photo failed:", err);
      toast({
        title: "Error",
        description: "Could not switch to your Google photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRestoringGooglePhoto(false);
    }
  };

  const SECTIONS: SettingsSection[] = [
    {
      id: "profile",
      label: "Profile",
      description: "Update your personal information and avatar.",
      icon: User,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Control when and how we contact you.",
      icon: Bell,
    },
    {
      id: "privacySecurity",
      label: "Privacy & Security",
      description: "Manage your privacy and account security.",
      icon: Shield,
    },
    {
      id: "recipesData",
      label: "Recipes & Data",
      description: "Restore recently deleted recipes.",
      icon: Database,
    },
  ];

  const sendNotificationTest = async (functionName: string, type: "daily" | "weekly" | "household") => {
    if (!user) return;

    try {
      setSendingTest(type);

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { userId: user.id },
      });

      if (error) {
        const body = data as { error?: string } | null;
        const message = body?.error ?? error.message;
        throw new Error(message);
      }

      const body = data as { error?: string } | null;
      if (body?.error) {
        throw new Error(body.error);
      }

      toast({
        title: "Test email sent",
        description: "Check your inbox to see how this notification looks.",
      });
    } catch (error: unknown) {
      console.error("Error sending notification test:", error);
      const message = error instanceof Error ? error.message : "Something went wrong sending the test notification.";
      toast({
        title: "Unable to send test",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSendingTest(null);
    }
  };

  const renderSectionContent = (sectionId: SettingsSectionId) => {
    switch (sectionId) {
      case "profile": {
        const displayUrl = resolveProfilePhotoUrl(profileData, user);
        const photoLabel = displayUrl ? profilePhotoSourceLabel(profileData) : "";
        /* Must follow profiles.avatar_type — NOT displayUrl. Stale cache can still
           resolve a Google URL for a moment after switching to fruit; inferring type
           from displayUrl made EnhancedAvatar use "google" and skip the emoji fallback. */
        const avatarTypeUi = avatarTypeUiFromProfile(profileData);
        const googleOAuthPicture = user ? oauthProfilePhotoFromMetadata(user) : null;
        const signedInWithGoogle =
          !!user?.identities?.some((id) => id.provider === "google");
        const usingGoogleFromAccount =
          profileData?.avatar_type === "google" &&
          !profileData?.avatar_url?.trim();
        const canUseGoogleProfilePhoto = Boolean(
          googleOAuthPicture && profileData && !usingGoogleFromAccount
        );
        const showGoogleInDialog = signedInWithGoogle && !!googleOAuthPicture;
        const avatarActionsBusy =
          isApplyingPreset ||
          isUploadingAvatar ||
          isRemovingAvatar ||
          isRestoringGooglePhoto;

        return (
          <Card className="overflow-hidden rounded-2xl border border-[#EAE5DE] bg-white shadow-[0_8px_28px_rgba(35,45,63,0.045)]">
            <CardHeader className="border-b border-[#F0ECE6] px-5 py-5 sm:px-7 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight text-[#232D3F] sm:text-[22px]">
                <User className="h-4 w-4 text-[#B96C56]" />
                Profile Settings
              </CardTitle>
              <CardDescription className="mt-1 text-sm leading-6 text-[#77766F]">
                Update your personal information and profile picture.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-7 p-5 sm:p-7">
              {isProfileLoading && !profileData ? (
                <p className="text-sm text-muted-foreground">Loading profile…</p>
              ) : null}

              <div className="max-w-xl space-y-4">
                <Label>Profile picture</Label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                  {/* self-start: column flex defaults to stretch — without this, rounded-full becomes a full-width pill */}
                  <div
                    className="shrink-0 self-start rounded-full bg-[#F7F1E9] p-1 ring-1 ring-[#EAE2D8]"
                    aria-hidden
                  >
                    <EnhancedAvatar
                      size="lg"
                      className="h-20 w-20 ring-2 ring-white"
                      src={displayUrl ?? undefined}
                      avatarType={avatarTypeUi}
                      avatarData={selectedFruit}
                      fallbackText={firstName || user?.email || "U"}
                      alt=""
                    />
                  </div>
                  <div className="min-w-0 space-y-3">
                    {photoLabel ? (
                      <p className="text-sm text-muted-foreground">{photoLabel}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {signedInWithGoogle
                          ? "Tap below to upload, use your Google photo, or pick an avatar."
                          : "Tap below to upload or pick an avatar."}
                      </p>
                    )}
                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleAvatarFileChange}
                    />
                    <Dialog
                      open={profilePicDialogOpen}
                      onOpenChange={setProfilePicDialogOpen}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border-[#E5DFD7] bg-white font-medium text-[#343944] hover:bg-[#FAF8F5] sm:w-auto"
                        disabled={!user || isProfileLoading}
                        onClick={() => setProfilePicDialogOpen(true)}
                      >
                        <ImagePlus className="h-4 w-4 text-terracotta" />
                        Update profile picture
                      </Button>
                      <DialogContent className="max-h-[min(90vh,640px)] max-w-[min(100vw-2rem,24rem)] gap-0 overflow-y-auto overflow-x-hidden rounded-[16px] border-border/60 p-0 shadow-xl sm:max-w-md">
                        <DialogHeader className="border-b border-border/60 bg-gradient-to-br from-[#FAF9F6] to-white px-5 py-4 text-left">
                          <DialogTitle className="font-semibold text-navy">
                            Profile picture
                          </DialogTitle>
                          <DialogDescription className="text-left text-muted-foreground">
                            Choose an option below — everything saves automatically.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 px-5 py-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-11 w-full justify-center gap-2 rounded-[12px]"
                            disabled={isUploadingAvatar || !user}
                            onClick={() => avatarFileInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4 shrink-0" />
                            {isUploadingAvatar ? "Uploading…" : "Upload a photo"}
                          </Button>

                          {showGoogleInDialog ? (
                            <div className="space-y-1.5">
                              {canUseGoogleProfilePhoto ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-11 w-full justify-center rounded-[12px]"
                                  disabled={avatarActionsBusy || !user}
                                  onClick={() => void handleRestoreGooglePhoto()}
                                >
                                  {isRestoringGooglePhoto
                                    ? "Applying…"
                                    : "Use Google account photo"}
                                </Button>
                              ) : (
                                <p className="rounded-[12px] border border-dashed border-border/70 bg-muted/20 px-3 py-2.5 text-center text-xs text-muted-foreground">
                                  You&apos;re already using your Google profile picture.
                                </p>
                              )}
                            </div>
                          ) : null}

                          <div className="relative py-1">
                            <Separator />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                              Avatars
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            {PRESET_AVATAR_MODAL_CHOICES.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                disabled={avatarActionsBusy || !user}
                                title={emoji}
                                onClick={async () => {
                                  const ok = await applyPresetAvatar(emoji);
                                  if (ok) setProfilePicDialogOpen(false);
                                }}
                                className={cn(
                                  "flex aspect-square items-center justify-center rounded-[12px] border-2 text-2xl transition-all",
                                  selectedFruit === emoji
                                    ? "border-terracotta bg-terracotta/10 shadow-sm ring-1 ring-terracotta/20"
                                    : "border-border/80 bg-white hover:border-terracotta/40 hover:bg-[#FAF9F6]"
                                )}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>

                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={avatarActionsBusy || !user}
                            className="w-full gap-2 rounded-[12px]"
                            onClick={() => void handleRandomizePreset(true)}
                          >
                            <Shuffle className="h-4 w-4" />
                            Surprise me
                          </Button>
                        </div>

                        {displayUrl ? (
                          <div className="border-t border-border/60 bg-muted/15 px-5 py-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="w-full text-muted-foreground hover:text-destructive"
                              disabled={isRemovingAvatar || isUploadingAvatar}
                              onClick={() => void handleRemovePhoto()}
                            >
                              {isRemovingAvatar ? "Removing…" : "Remove current photo"}
                            </Button>
                          </div>
                        ) : null}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    className="h-11 rounded-xl border-[#E5DFD7] bg-[#FCFBF9] px-3.5 focus-visible:bg-white"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    className="h-11 rounded-xl border-[#E5DFD7] bg-[#FCFBF9] px-3.5 focus-visible:bg-white"
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
                  className="h-11 rounded-xl border-[#E5DFD7] bg-[#FCFBF9] px-3.5 focus-visible:bg-white"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                />
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={isUpdatingProfile || (isProfileLoading && !profileData)}
                className="w-full rounded-xl px-5 shadow-sm sm:w-auto"
              >
                {isUpdatingProfile ? "Saving..." : "Save changes"}
              </Button>
            </CardContent>
          </Card>
        );
      }
      case "notifications":
        return (
          <Card className="overflow-hidden rounded-2xl border border-[#EAE5DE] bg-white shadow-[0_8px_28px_rgba(35,45,63,0.045)]">
            <CardHeader className="border-b border-[#F0ECE6] px-5 py-5 sm:px-7 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight text-[#232D3F] sm:text-[22px]">
                <Bell className="h-4 w-4 text-[#B96C56]" />
                Notifications
              </CardTitle>
              <CardDescription className="mt-1 text-sm leading-6 text-[#77766F]">
                Choose what notifications you'd like to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-5 sm:p-7">
              {notificationSettingsError ? (
                <p className="text-sm text-destructive" role="alert">
                  {notificationSettingsError}
                </p>
              ) : null}

              <div className="space-y-8">
                {/* Daily dinner reminder */}
                <div className="grid gap-4 rounded-xl border border-[#EEE9E2] bg-[#FCFBF9] p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.95fr)] md:items-center">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Daily dinner reminder</Label>
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Daily
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Gentle nudge to decide what&apos;s for dinner around your chosen time.
                    </p>
                  </div>

                  <div className="flex flex-col items-stretch gap-3 md:items-end">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 md:justify-end">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Push</span>
                        <Switch
                          disabled={isLoadingNotificationSettings || !notificationSettings}
                          checked={!!notificationSettings?.daily_dinner_push_enabled}
                          onCheckedChange={(checked) =>
                            updateNotificationSettings({
                              daily_dinner_push_enabled: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Email</span>
                        <Switch
                          disabled={isLoadingNotificationSettings || !notificationSettings}
                          checked={!!notificationSettings?.daily_dinner_email_enabled}
                          onCheckedChange={(checked) =>
                            updateNotificationSettings({
                              daily_dinner_email_enabled: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#77766F] md:justify-end">
                      <div className="flex items-center gap-2">
                        <span>Time</span>
                        <Input
                          type="time"
                          className="h-10 w-32 rounded-lg border-[#E5DFD7] bg-white text-sm"
                          disabled={isLoadingNotificationSettings || !notificationSettings}
                          value={notificationSettings?.daily_dinner_time ?? "17:00"}
                          onChange={(e) =>
                            updateNotificationSettings({
                              daily_dinner_time: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={
                          !user ||
                          isLoadingNotificationSettings ||
                          !notificationSettings?.daily_dinner_email_enabled ||
                          sendingTest === "daily"
                        }
                        onClick={() => sendNotificationTest("daily-dinner-reminder-test", "daily")}
                      >
                        {sendingTest === "daily" ? "Sending..." : "Send test"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Weekly meal plan kick-off */}
                <div className="grid gap-4 rounded-xl border border-[#EEE9E2] bg-[#FCFBF9] p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.95fr)] md:items-center">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Weekly meal plan kick-off</Label>
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Weekly
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reminder to plan your meals for the week ahead.
                    </p>
                  </div>

                  <div className="flex flex-col items-stretch gap-3 md:items-end">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 md:justify-end">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Push</span>
                        <Switch
                          disabled={isLoadingNotificationSettings || !notificationSettings}
                          checked={!!notificationSettings?.weekly_kickoff_push_enabled}
                          onCheckedChange={(checked) =>
                            updateNotificationSettings({
                              weekly_kickoff_push_enabled: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Email</span>
                        <Switch
                          disabled={isLoadingNotificationSettings || !notificationSettings}
                          checked={!!notificationSettings?.weekly_kickoff_email_enabled}
                          onCheckedChange={(checked) =>
                            updateNotificationSettings({
                              weekly_kickoff_email_enabled: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#77766F] md:justify-end">
                      <div className="flex items-center gap-2">
                        <span>Day</span>
                        <select
                          className="h-10 rounded-lg border border-[#E5DFD7] bg-white px-3 text-sm text-[#373B45]"
                          disabled={isLoadingNotificationSettings || !notificationSettings}
                          value={notificationSettings?.weekly_kickoff_day ?? 0}
                          onChange={(e) =>
                            updateNotificationSettings({
                              weekly_kickoff_day: Number(e.target.value),
                            })
                          }
                        >
                          <option value={0}>Sunday</option>
                          <option value={1}>Monday</option>
                          <option value={2}>Tuesday</option>
                          <option value={3}>Wednesday</option>
                          <option value={4}>Thursday</option>
                          <option value={5}>Friday</option>
                          <option value={6}>Saturday</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Time</span>
                        <Input
                          type="time"
                          className="h-10 w-32 rounded-lg border-[#E5DFD7] bg-white text-sm"
                          disabled={isLoadingNotificationSettings || !notificationSettings}
                          value={notificationSettings?.weekly_kickoff_time ?? "15:00"}
                          onChange={(e) =>
                            updateNotificationSettings({
                              weekly_kickoff_time: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={
                          !user ||
                          isLoadingNotificationSettings ||
                          !notificationSettings?.weekly_kickoff_email_enabled ||
                          sendingTest === "weekly"
                        }
                        onClick={() =>
                          sendNotificationTest("weekly-meal-plan-kickoff-test", "weekly")
                        }
                      >
                        {sendingTest === "weekly" ? "Sending..." : "Send test"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Household activity */}
                <div className="grid gap-4 rounded-xl border border-[#EEE9E2] bg-[#FCFBF9] p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.95fr)] md:items-center">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Household activity</Label>
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Activity
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Updates when your household adds recipes or changes the plan.
                    </p>
                  </div>

                  <div className="flex flex-col items-stretch gap-3 md:items-end">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 md:justify-end">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Push</span>
                        <Switch
                          disabled={isLoadingNotificationSettings || !notificationSettings}
                          checked={!!notificationSettings?.household_activity_push_enabled}
                          onCheckedChange={(checked) =>
                            updateNotificationSettings({
                              household_activity_push_enabled: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#77766F] md:justify-end">
                      <div className="flex items-center gap-2">
                        <span>Push level</span>
                        <select
                          className="h-10 rounded-lg border border-[#E5DFD7] bg-white px-3 text-sm text-[#373B45]"
                          disabled={
                            isLoadingNotificationSettings ||
                            !notificationSettings ||
                            !notificationSettings.household_activity_push_enabled
                          }
                          value={notificationSettings?.household_activity_push_level ?? "important"}
                          onChange={(e) =>
                            updateNotificationSettings({
                              household_activity_push_level: e.target.value as
                                | "important"
                                | "all",
                            })
                          }
                        >
                          <option value="important">Important updates only</option>
                          <option value="all">Every update</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Email digest</span>
                        <select
                          className="h-10 rounded-lg border border-[#E5DFD7] bg-white px-3 text-sm text-[#373B45]"
                          disabled={isLoadingNotificationSettings || !notificationSettings}
                          value={notificationSettings?.household_activity_email_frequency ?? "none"}
                          onChange={(e) =>
                            updateNotificationSettings({
                              household_activity_email_frequency: e.target.value as
                                | "none"
                                | "daily"
                                | "weekly",
                              household_activity_email_enabled:
                                e.target.value === "none" ? false : true,
                            })
                          }
                        >
                          <option value="none">Off</option>
                          <option value="daily">Daily roundup</option>
                          <option value="weekly">Weekly roundup</option>
                        </select>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={
                          !user ||
                          isLoadingNotificationSettings ||
                          (!notificationSettings?.household_activity_push_enabled &&
                            !notificationSettings?.household_activity_email_enabled) ||
                          sendingTest === "household"
                        }
                        onClick={() =>
                          sendNotificationTest("household-activity-notifier-test", "household")
                        }
                      >
                        {sendingTest === "household" ? "Sending..." : "Send test"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "privacySecurity":
        return (
          <Card className="overflow-hidden rounded-2xl border border-[#EAE5DE] bg-white shadow-[0_8px_28px_rgba(35,45,63,0.045)]">
            <CardHeader className="border-b border-[#F0ECE6] px-5 py-5 sm:px-7 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight text-[#232D3F] sm:text-[22px]">
                <Shield className="h-4 w-4 text-[#B96C56]" />
                Privacy & Security
              </CardTitle>
              <CardDescription className="mt-1 text-sm leading-6 text-[#77766F]">
                Change your account password.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-w-xl space-y-5 p-5 sm:p-7">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  className="h-11 rounded-xl border-[#E5DFD7] bg-[#FCFBF9] px-3.5 focus-visible:bg-white"
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  className="h-11 rounded-xl border-[#E5DFD7] bg-[#FCFBF9] px-3.5 focus-visible:bg-white"
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Enter your new password again"
                />
              </div>
              <Button
                type="button"
                variant="default"
                className="rounded-xl px-5"
                onClick={handleUpdatePassword}
                disabled={isUpdatingPassword || !newPassword || !confirmPassword}
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        );
      case "recipesData":
        return (
          <div className="space-y-5">
            <div className="px-1">
              <h2 className="text-xl font-semibold tracking-tight text-[#232D3F]">Recipes &amp; Data</h2>
              <p className="mt-1 text-sm leading-6 text-[#77766F]">
                Restore a recipe within 30 days of deleting it.
              </p>
            </div>
            <DeletedRecipesSection />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-7 sm:mb-9">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B96C56]">
          Your account
        </p>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-[30px] font-semibold tracking-tight text-[#232D3F] sm:text-[34px]">
            Settings
          </h1>
          <p className="text-sm text-[#77766F]">
            Manage your profile and preferences.
          </p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[216px_minmax(0,1fr)] lg:gap-8">
        <aside aria-label="Settings sections" className="lg:sticky lg:top-24 lg:h-fit">
          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-col lg:gap-1.5">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === activeSection;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex min-h-12 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9856D] focus-visible:ring-offset-2 lg:border-transparent lg:px-3.5",
                    isActive
                      ? "border-[#F0D7CE] bg-[#F9EAE5] text-[#854C3D] lg:border-[#F0D7CE]"
                      : "border-transparent bg-white/65 text-[#686A70] hover:border-[#EEE8E0] hover:bg-white"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#B96C56]" : "text-[#92918C]")} />
                  <span className="leading-tight">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">
          {renderSectionContent(activeSection)}
        </main>
      </div>
    </div>
  );
}
