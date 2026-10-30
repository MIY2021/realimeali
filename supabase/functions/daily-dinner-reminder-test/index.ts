import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

async function requireAdmin(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const serviceUrl = Deno.env.get("SUPABASE_URL"); const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceUrl || !serviceKey) return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const client = createClient(serviceUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await client.auth.getUser(authHeader.slice(7));
  if (userError || !userData.user) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const { data: role, error: roleError } = await client.from("user_roles").select("user_id").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
  if (roleError || !role) return new Response(JSON.stringify({ error: "Administrator access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  return null;
}

import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface ProfileRow {
  email: string | null;
  full_name: string | null;
}

const createDinnerReminderTestTemplate = (fullName: string | null, _appUrl: string) => {
  const mealPlannerUrl = "https://realimeali.com/meal-planner";
  const greeting = fullName ? ` ${fullName}` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>Your RealiMeali dinner reminder</title></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:Arial,Helvetica,sans-serif;color:#243746;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">A quick nudge to get tonight's dinner sorted.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f3ef;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#fff;border-radius:14px;overflow:hidden;">
<tr><td align="center" style="padding:23px;background:#243746;color:#fff;"><div style="font-size:25px;">🍽️</div><div style="padding-top:6px;font-size:22px;font-weight:700;">RealiMeali</div></td></tr>
<tr><td style="padding:28px 26px 24px;"><h1 style="margin:0 0 14px;font-size:25px;line-height:1.2;color:#243746;">Dinner plans, sorted?</h1>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#485563;">Hi${greeting},</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#485563;">This is your RealiMeali reminder: a friendly nudge to check your meal plan and decide what's for dinner. No more 5pm fridge stare!</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 18px;"><tr><td align="center" bgcolor="#e8753d" style="border-radius:26px;"><a href="${mealPlannerUrl}" style="display:inline-block;padding:13px 26px;color:#fff;text-decoration:none;font-size:15px;font-weight:700;">Open meal planner&nbsp; →</a></td></tr></table>
<p style="margin:0;text-align:center;font-size:12px;line-height:1.5;color:#87919a;">Test email · Manage reminders in Settings → Notifications.</p></td></tr>
<tr><td align="center" style="padding:16px;background:#f8f7f4;border-top:1px solid #eeeae3;font-size:11px;color:#9aa2a9;">© ${new Date().getFullYear()} RealiMeali</td></tr>
</table></td></tr></table></body></html>`;
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const authFailure = await requireAdmin(req);
  if (authFailure) return authFailure;

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

    if (!resend) {
      console.error("daily-dinner-reminder-test: RESEND_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Email service is not configured (missing RESEND_API_KEY)." }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: sendData, error: sendError } = await resend.emails.send({
      from: "RealiMeali <notifications@realimeali.com>",
      to: [email],
      subject: "Test: what’s for dinner tonight?",
      html,
    });

    if (sendError || !sendData?.id) {
      console.error("daily-dinner-reminder-test: Resend rejected email", sendError);
      return new Response(JSON.stringify({
        error: sendError?.message ?? "Email provider did not confirm acceptance.",
      }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("daily-dinner-reminder-test: email accepted by Resend", sendData.id);
    return new Response(JSON.stringify({ ok: true, emailId: sendData.id }), {
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

