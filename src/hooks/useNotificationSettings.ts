import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type NotificationSettings = {
  daily_dinner_push_enabled: boolean;
  daily_dinner_email_enabled: boolean;
  daily_dinner_time: string;
  daily_dinner_days_of_week: number[];
  weekly_kickoff_push_enabled: boolean;
  weekly_kickoff_email_enabled: boolean;
  weekly_kickoff_day: number;
  weekly_kickoff_time: string;
  household_activity_push_enabled: boolean;
  household_activity_email_enabled: boolean;
  household_activity_push_level: "important" | "all";
  household_activity_email_frequency: "none" | "daily" | "weekly";
};

const DEFAULT_SETTINGS: NotificationSettings = {
  daily_dinner_push_enabled: true,
  daily_dinner_email_enabled: false,
  daily_dinner_time: "17:00",
  daily_dinner_days_of_week: [1, 2, 3, 4, 5],
  weekly_kickoff_push_enabled: false,
  weekly_kickoff_email_enabled: true,
  weekly_kickoff_day: 0,
  weekly_kickoff_time: "15:00",
  household_activity_push_enabled: true,
  household_activity_email_enabled: false,
  household_activity_push_level: "important",
  household_activity_email_frequency: "none",
};

export function useNotificationSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading notification settings:", error);
        setError("Failed to load notification settings");
        setSettings(DEFAULT_SETTINGS);
      } else if (!data) {
        setSettings(DEFAULT_SETTINGS);
      } else {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data,
        });
      }

      setIsLoading(false);
    };

    load();
  }, [user]);

  const updateSettings = async (partial: Partial<NotificationSettings>) => {
    if (!user) return;
    const next = {
      ...(settings ?? DEFAULT_SETTINGS),
      ...partial,
    };
    setSettings(next);

    const payload = {
      user_id: user.id,
      ...next,
    };

    const { error } = await supabase
      .from("notification_settings")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      console.error("Error updating notification settings:", error);
      setError("Failed to save notification settings");
      setSettings(settings);
    } else {
      setError(null);
    }
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
  };
}

