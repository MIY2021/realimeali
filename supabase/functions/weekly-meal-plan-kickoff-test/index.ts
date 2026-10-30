import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function requireAdmin(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const serviceUrl = Deno.env.get("SUPABASE_URL"), serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceUrl || !serviceKey) return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const client = createClient(serviceUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(authHeader.slice(7));
  if (error || !data.user) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const { data: role } = await client.from("user_roles").select("user_id").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
  if (!role) return new Response(JSON.stringify({ error: "Administrator access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  return null;
}

function createTemplate(fullName: string | null) {
  const firstName = fullName?.trim().split(/\s+/)[0] || "";
  const greeting = firstName ? ` ${firstName}` : "";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>Plan your meals for the week</title></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:Arial,Helvetica,sans-serif;color:#243746;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f3ef;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#fff;border-radius:14px;overflow:hidden;">
<tr><td align="center" style="padding:20px 24px;background:#243746;"><span style="display:block;font-size:34px;line-height:1.2;margin-bottom:8px;">🍽️</span><span style="display:block;color:#ffffff;font-size:23px;font-weight:700;line-height:1.2;">RealiMeali</span></td></tr>
<tr><td style="padding:28px 26px 24px;"><h1 style="margin:0 0 14px;font-size:25px;line-height:1.2;color:#243746;">Let’s get the week sorted</h1><p style="font-size:15px;line-height:1.6;color:#485563;">Hi${greeting},</p><p style="font-size:15px;line-height:1.65;color:#485563;">Take a few minutes to plan the meals ahead. Pick your favourites, try something new and get your shopping list ready — future you will be grateful.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:24px auto 18px;"><tr><td align="center" bgcolor="#e8753d" style="border-radius:26px;"><a href="https://realimeali.com/meal-planner" style="display:inline-block;padding:13px 26px;color:#fff;text-decoration:none;font-size:15px;font-weight:700;">Open meal planner&nbsp; →</a></td></tr></table><p style="text-align:center;font-size:12px;color:#87919a;">Test email · Manage reminders in Settings → Notifications.</p></td></tr>
<tr><td align="center" style="padding:16px;background:#f8f7f4;border-top:1px solid #eeeae3;font-size:11px;color:#9aa2a9;">© ${new Date().getFullYear()} RealiMeali</td></tr></table></td></tr></table></body></html>`;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const authFailure = await requireAdmin(req);
  if (authFailure) return authFailure;
  try {
    const { userId } = await req.json();
    if (!userId) return new Response(JSON.stringify({ error: "userId is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { data: profile, error } = await supabase.from("profiles").select("email, full_name").eq("id", userId).maybeSingle();
    if (error) throw error;
    const { email, full_name } = (profile || {}) as { email: string | null; full_name: string | null };
    if (!email) throw new Error("No email for user");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not configured");
    const resend = new Resend(resendKey);
    const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Europe/London", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const result = await resend.emails.send({
      from: "RealiMeali <notifications@realimeali.com>",
      to: [email],
      subject: `🧪 RealiMeali weekly email test – ${timestamp}`,
      html: createTemplate(full_name),
    });
    if ((result as any)?.error) throw new Error((result as any).error.message || "Resend failed to send test email");
    return new Response(JSON.stringify({ ok: true, id: (result as any)?.id ?? null }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("weekly-meal-plan-kickoff-test error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
