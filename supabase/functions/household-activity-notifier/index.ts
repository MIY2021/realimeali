import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HouseholdActivityPayload {
  household_id: string;
  event_type: string;
  description?: string;
}

type PushLevel = "important" | "all";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload: HouseholdActivityPayload = await req.json();

    console.log("Received household activity event:", payload);

    const { data: members, error } = await supabase
      .from("household_members")
      .select("user_id")
      .eq("household_id", payload.household_id);

    if (error) {
      console.error("Error loading household members:", error);
      throw error;
    }

    if (!members || members.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, processed: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const userIds = members.map((m) => m.user_id);

    const { data: notifSettings, error: settingsError } = await supabase
      .from("notification_settings")
      .select(
        "user_id, household_activity_push_enabled, household_activity_email_enabled, household_activity_push_level, household_activity_email_frequency"
      )
      .in("user_id", userIds);

    if (settingsError) {
      console.error("Error loading notification settings for household:", settingsError);
      throw settingsError;
    }

    console.log(
      "Household activity notification candidates:",
      notifSettings?.length ?? 0
    );

    // In a full implementation, apply rate limiting and enqueue push/email notifications here,
    // taking into account:
    // - household_activity_push_enabled + household_activity_push_level (important vs all)
    // - household_activity_email_enabled + household_activity_email_frequency (daily vs weekly digests)

    return new Response(
      JSON.stringify({
        ok: true,
        processed: notifSettings?.length ?? 0,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in household-activity-notifier function:", error);
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

