import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeeklySettingsRow {
  user_id: string;
  weekly_kickoff_push_enabled: boolean;
  weekly_kickoff_email_enabled: boolean;
  weekly_kickoff_day: number;
  weekly_kickoff_time: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date();
    const currentDay = now.getUTCDay();
    const currentTime = now.toISOString().slice(11, 16);

    const { data: settings, error } = await supabase
      .from("notification_settings")
      .select("user_id, weekly_kickoff_push_enabled, weekly_kickoff_email_enabled, weekly_kickoff_day, weekly_kickoff_time")
      .eq("weekly_kickoff_day", currentDay)
      .eq("weekly_kickoff_time", currentTime);

    if (error) {
      console.error("Error loading weekly notification settings:", error);
      throw error;
    }

    console.log(
      `Weekly kickoff eligible users on day ${currentDay} at ${currentTime}:`,
      settings?.length ?? 0
    );

    // In a full implementation, filter for users whose upcoming week is not fully planned
    // and enqueue push/email notifications here.

    return new Response(
      JSON.stringify({
        ok: true,
        processed: (settings as WeeklySettingsRow[] | null)?.length ?? 0,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in weekly-meal-plan-kickoff function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

