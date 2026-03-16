import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface NotificationSettingsRow {
  user_id: string;
  daily_dinner_push_enabled: boolean;
  daily_dinner_email_enabled: boolean;
  daily_dinner_time: string;
  daily_dinner_days_of_week: number[];
}

interface ProfileRow {
  email: string | null;
  full_name: string | null;
}

const createDinnerReminderTemplate = (fullName: string | null, appUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>What&apos;s for dinner tonight?</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #fdc8a4 0%, #f4a775 100%); padding: 32px 20px; text-align: center;">
      <div style="display: inline-flex; align-items: center; gap: 10px; color: #1e3a8a; font-size: 24px; font-weight: 700;">
        <span>🍽️</span>
        <span>RealiMeali</span>
      </div>
      <p style="color: #1e3a8a; margin: 8px 0 0 0; font-size: 15px;">A gentle nudge for tonight&apos;s dinner</p>
    </div>

    <div style="padding: 32px 20px 28px;">
      <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
        Hi${fullName ? ` ${fullName}` : ""},
      </p>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 18px 0;">
        It&apos;s a good time to decide what you&apos;d like for <strong>dinner tonight</strong>.
      </p>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 18px 0;">
        Open RealiMeali to look over your meals for this week, choose what you fancy for tonight, or add something last‑minute if plans have changed.
      </p>

      <div style="text-align: center; margin: 28px 0 8px;">
        <a href="${appUrl}"
           style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 10px rgba(217, 119, 6, 0.35);">
          Decide tonight&apos;s dinner
        </a>
      </div>

      <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 18px 0 0 0; text-align: center;">
        You can change when we remind you in <strong>Settings → Notifications</strong>.
      </p>
    </div>

    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} RealiMeali.
      </p>
    </div>
  </div>
</body>
</html>
`;

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
      .select(
        "user_id, daily_dinner_push_enabled, daily_dinner_email_enabled, daily_dinner_time, daily_dinner_days_of_week"
      )
      .eq("daily_dinner_time", currentTime)
      .eq("daily_dinner_email_enabled", true)
      .filter("daily_dinner_days_of_week", "cs", `{${currentDay}}`);

    if (error) {
      console.error("Error loading notification settings:", error);
      throw error;
    }

    console.log(`Daily dinner reminder eligible users at ${currentTime}:`, settings?.length ?? 0);

    const rows = (settings as NotificationSettingsRow[] | null) ?? [];

    const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:3000";

    for (const row of rows) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", row.user_id)
          .maybeSingle();

        if (profileError) {
          console.error("Error loading profile for user", row.user_id, profileError);
          continue;
        }

        const { email, full_name } = (profile || {}) as ProfileRow;

        if (!email) {
          console.warn("Skipping daily dinner reminder; no email for user", row.user_id);
          continue;
        }

        const html = createDinnerReminderTemplate(full_name, appUrl);

        const emailResponse = await resend.emails.send({
          from: "RealiMeali <notifications@reali-meali.app>",
          to: [email],
          subject: "What’s for dinner tonight?",
          html,
        });

        console.log("Daily dinner reminder sent", {
          user_id: row.user_id,
          email,
          responseId: (emailResponse as any)?.id ?? null,
        });
      } catch (sendError) {
        console.error("Error sending daily dinner reminder for user", row.user_id, sendError);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        processed: rows.length,
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
    console.error("Error in daily-dinner-reminder function:", error);
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

