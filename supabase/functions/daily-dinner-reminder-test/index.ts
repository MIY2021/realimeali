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

const createDinnerReminderTestTemplate = (fullName: string | null, appUrl: string) => {
  const mealPlannerUrl = `${appUrl.replace(/\/$/, "")}/meal-planner`;
  const greeting = fullName ? ` ${fullName}` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>Your RealiMeali dinner reminder</title></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:Arial,Helvetica,sans-serif;color:#243746;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">A little nudge to make tonight's dinner easier.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f3ef;"><tr><td align="center" style="padding:30px 14px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;">
<tr><td align="center" style="padding:30px 24px;background:#243746;color:#fff;"><div style="font-size:28px;">🍽️</div><div style="padding-top:8px;font-size:24px;font-weight:700;">RealiMeali</div><div style="padding-top:7px;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#f4b183;">Good food. Less faff.</div></td></tr>
<tr><td style="padding:34px 32px 28px;"><div style="display:inline-block;padding:6px 10px;border-radius:20px;background:#fff2e8;color:#a94d19;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Test reminder</div>
<h1 style="margin:18px 0 12px;font-size:29px;line-height:1.2;color:#243746;">Dinner plans, sorted?</h1>
<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#485563;">Hi${greeting},</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.75;color:#485563;">This is what your RealiMeali dinner reminder will look like: a friendly nudge at your chosen time, so you can decide what's for dinner without the 5pm fridge stare.</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.75;color:#485563;">Head to your meal planner to check the week, choose tonight's dinner or add something new if plans have changed.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 24px;"><tr><td align="center" bgcolor="#e8753d" style="border-radius:28px;"><a href="${mealPlannerUrl}" style="display:inline-block;padding:15px 30px;color:#fff;text-decoration:none;font-size:15px;font-weight:700;">Open meal planner&nbsp; →</a></td></tr></table>
<p style="margin:0;text-align:center;font-size:12px;line-height:1.6;color:#87919a;">Change your reminder time or days in <strong>Settings → Notifications</strong>.</p></td></tr>
<tr><td align="center" style="padding:22px 28px;background:#f8f7f4;border-top:1px solid #eeeae3;"><p style="margin:0 0 6px;font-size:12px;color:#697681;">Making mealtimes that bit easier.</p><p style="margin:0;font-size:11px;color:#9aa2a9;">You received this because you requested a test reminder in RealiMeali.</p><p style="margin:12px 0 0;font-size:11px;color:#9aa2a9;">© ${new Date().getFullYear()} RealiMeali</p></td></tr>
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

