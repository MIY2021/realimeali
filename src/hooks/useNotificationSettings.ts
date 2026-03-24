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
        const row = data as Record<string, unknown>;
        setSettings({
          ...DEFAULT_SETTINGS,
          daily_dinner_push_enabled: Boolean(row.daily_dinner_push_enabled),
          daily_dinner_email_enabled: Boolean(row.daily_dinner_email_enabled),
          daily_dinner_time: String(row.daily_dinner_time ?? DEFAULT_SETTINGS.daily_dinner_time),
          daily_dinner_days_of_week: Array.isArray(row.daily_dinner_days_of_week)
            ? (row.daily_dinner_days_of_week as number[])
            : DEFAULT_SETTINGS.daily_dinner_days_of_week,
          weekly_kickoff_push_enabled: Boolean(row.weekly_kickoff_push_enabled),
          weekly_kickoff_email_enabled: Boolean(row.weekly_kickoff_email_enabled),
          weekly_kickoff_day: Number(row.weekly_kickoff_day ?? DEFAULT_SETTINGS.weekly_kickoff_day),
          weekly_kickoff_time: String(row.weekly_kickoff_time ?? DEFAULT_SETTINGS.weekly_kickoff_time),
          household_activity_push_enabled: Boolean(row.household_activity_push_enabled),
          household_activity_email_enabled: Boolean(row.household_activity_email_enabled),
          household_activity_push_level:
            row.household_activity_push_level === "all" ? "all" : "important",
          household_activity_email_frequency:
            row.household_activity_email_frequency === "daily" ||
            row.household_activity_email_frequency === "weekly" ||
            row.household_activity_email_frequency === "none"
              ? (row.household_activity_email_frequency as NotificationSettings["household_activity_email_frequency"])
              : "none",
        });
      }

      setIsLoading(false);
    };

    load();
  }, [user]);

  const updateSettings = async (partial: Partial<NotificationSettings>) => {
    if (!user) return;
    const previous = settings ?? DEFAULT_SETTINGS;
    const next: NotificationSettings = {
      ...previous,
      ...partial,
    };
    setSettings(next);

    const payload = {
      user_id: user.id,
      daily_dinner_push_enabled: next.daily_dinner_push_enabled,
      daily_dinner_email_enabled: next.daily_dinner_email_enabled,
      daily_dinner_time: next.daily_dinner_time,
      daily_dinner_days_of_week: next.daily_dinner_days_of_week,
      weekly_kickoff_push_enabled: next.weekly_kickoff_push_enabled,
      weekly_kickoff_email_enabled: next.weekly_kickoff_email_enabled,
      weekly_kickoff_day: next.weekly_kickoff_day,
      weekly_kickoff_time: next.weekly_kickoff_time,
      household_activity_push_enabled: next.household_activity_push_enabled,
      household_activity_email_enabled: next.household_activity_email_enabled,
      household_activity_push_level: next.household_activity_push_level,
      household_activity_email_frequency: next.household_activity_email_frequency,
    };

    const { error } = await supabase
      .from("notification_settings")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      console.error("Error updating notification settings:", error);
      setError("Failed to save notification settings");
      setSettings(previous);
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

