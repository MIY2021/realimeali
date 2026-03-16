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

const createWeeklyKickoffTemplate = (fullName: string | null, appUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plan meals for the week ahead</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f8f9fa;">
  <div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
    <div style="background:linear-gradient(135deg,#c7d2fe 0%,#818cf8 100%);padding:28px 20px;text-align:center;">
      <div style="display:inline-flex;align-items:center;gap:10px;color:#111827;font-size:22px;font-weight:700;">
        <span>📅</span>
        <span>RealiMeali</span>
      </div>
      <p style="color:#111827;margin:8px 0 0 0;font-size:14px;">A quick nudge to set up your week</p>
    </div>
    <div style="padding:28px 20px 24px;">
      <p style="color:#111827;font-size:16px;line-height:1.6;margin:0 0 14px 0;">
        Hi${fullName ? ` ${fullName}` : ""},
      </p>
      <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
        Take a minute to sketch out dinners for the week ahead so evenings feel a little easier.
      </p>
      <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 18px 0;">
        Open RealiMeali to add or adjust meals for this week and keep your shopping list in sync.
      </p>
      <div style="text-align:center;margin:26px 0 8px;">
        <a href="${appUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;font-size:15px;box-shadow:0 4px 10px rgba(79,70,229,0.35);">
          Review this week&apos;s meals
        </a>
      </div>
    </div>
    <div style="background-color:#f9fafb;padding:18px 20px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} RealiMeali.</p>
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
      throw new Error("userId is required");
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
      throw error;
    }

    const { email, full_name } = (profile || {}) as ProfileRow;

    if (!email) {
      throw new Error("No email for user");
    }

    const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:3000";
    const html = createWeeklyKickoffTemplate(full_name, appUrl);

    await resend.emails.send({
      from: "RealiMeali <notifications@reali-meali.app>",
      to: [email],
      subject: "Test: plan meals for the week ahead",
      html,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("weekly-meal-plan-kickoff-test error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

