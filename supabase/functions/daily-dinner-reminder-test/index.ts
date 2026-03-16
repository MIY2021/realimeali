import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ProfileRow {
  email: string | null;
  full_name: string | null;
}

const createDinnerReminderTestTemplate = (fullName: string | null, appUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test: What's for dinner tonight?</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #fdc8a4 0%, #f4a775 100%); padding: 32px 20px; text-align: center;">
      <div style="display: inline-flex; align-items: center; gap: 10px; color: #1e3a8a; font-size: 24px; font-weight: 700;">
        <span>🍽️</span>
        <span>RealiMeali</span>
      </div>
      <p style="color: #1e3a8a; margin: 8px 0 0 0; font-size: 15px;">Test daily dinner reminder</p>
    </div>

    <div style="padding: 32px 20px 28px;">
      <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
        Hi${fullName ? ` ${fullName}` : ""},
      </p>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 18px 0;">
        This is a <strong>test email</strong> for your daily dinner reminder in RealiMeali.
      </p>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 18px 0;">
        In a real reminder, we&apos;d simply nudge you around your chosen time to decide what you&apos;d like for <strong>dinner tonight</strong> and review your plan for the evening.
      </p>

      <div style="text-align: center; margin: 28px 0 8px;">
        <a href="${appUrl}"
           style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 10px rgba(217, 119, 6, 0.35);">
          Open RealiMeali
        </a>
      </div>

      <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 18px 0 0 0; text-align: center;">
        You received this because you triggered a test from Settings → Notifications.
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

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("daily-dinner-reminder-test: error loading profile", error);
      return new Response(JSON.stringify({ error: "Failed to load profile" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { email, full_name } = (profile || {}) as ProfileRow;

    if (!email) {
      return new Response(JSON.stringify({ error: "No email for user" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:3000";
    const html = createDinnerReminderTestTemplate(full_name, appUrl);

    await resend.emails.send({
      from: "RealiMeali <notifications@reali-meali.app>",
      to: [email],
      subject: "Test: what’s for dinner tonight?",
      html,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("daily-dinner-reminder-test error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

