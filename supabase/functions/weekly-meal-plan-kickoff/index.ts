import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function requireServiceRole(req: Request): Response | null {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!key || req.headers.get("Authorization") !== `Bearer ${key}`) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  return null;
}

interface WeeklySettingsRow {
  user_id: string;
  weekly_kickoff_email_enabled: boolean;
  weekly_kickoff_day: number;
  weekly_kickoff_time: string;
  timezone: string | null;
}
interface ProfileRow { email: string | null; full_name: string | null; }

function getLocalSchedule(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
    weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const localDate = `${values.year}-${values.month}-${values.day}`;
  const utcDate = new Date(`${localDate}T12:00:00Z`);
  const daysSinceMonday = (utcDate.getUTCDay() + 6) % 7;
  utcDate.setUTCDate(utcDate.getUTCDate() - daysSinceMonday);
  return {
    date: localDate,
    time: `${values.hour}:${values.minute}`,
    day: dayMap[values.weekday],
    weekStart: utcDate.toISOString().slice(0, 10),
  };
}

function createWeeklyKickoffTemplate(fullName: string | null) {
  const firstName = fullName?.trim().split(/\s+/)[0] || "";
  const greeting = firstName ? ` ${firstName}` : "";
  const mealPlannerUrl = "https://realimeali.com/meal-planner";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>Plan your meals for the week</title></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:Arial,Helvetica,sans-serif;color:#243746;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">A little nudge to get the week’s meals sorted.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f3ef;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#fff;border-radius:14px;overflow:hidden;">
<tr><td align="center" style="padding:20px 24px;background:#243746;"><span style="display:block;font-size:34px;line-height:1.2;margin-bottom:8px;">🍽️</span><span style="display:block;color:#ffffff;font-size:23px;font-weight:700;line-height:1.2;">RealiMeali</span></td></tr>
<tr><td style="padding:28px 26px 24px;"><h1 style="margin:0 0 14px;font-size:25px;line-height:1.2;color:#243746;">Let’s get the week sorted</h1>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#485563;">Hi${greeting},</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#485563;">Take a few minutes to plan the meals ahead. Pick your favourites, try something new and get your shopping list ready — future you will be grateful.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 18px;"><tr><td align="center" bgcolor="#e8753d" style="border-radius:26px;"><a href="${mealPlannerUrl}" style="display:inline-block;padding:13px 26px;color:#fff;text-decoration:none;font-size:15px;font-weight:700;">Open meal planner&nbsp; →</a></td></tr></table>
<p style="margin:0;text-align:center;font-size:12px;line-height:1.5;color:#87919a;">Manage your weekly reminder in Settings → Notifications.</p></td></tr>
<tr><td align="center" style="padding:16px;background:#f8f7f4;border-top:1px solid #eeeae3;font-size:11px;color:#9aa2a9;">You’re receiving this because weekly meal plan emails are enabled in RealiMeali.<br>© ${new Date().getFullYear()} RealiMeali</td></tr>
</table></td></tr></table></body></html>`;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const serviceFailure = requireServiceRole(req);
  if (serviceFailure) return serviceFailure;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not configured");
    const supabase = createClient(supabaseUrl, serviceKey);
    const resend = new Resend(resendKey);
    const now = new Date();

    const { data: settings, error } = await supabase
      .from("notification_settings")
      .select("user_id, weekly_kickoff_email_enabled, weekly_kickoff_day, weekly_kickoff_time, timezone")
      .eq("weekly_kickoff_email_enabled", true);
    if (error) throw error;

    let matched = 0, sent = 0, skipped = 0, failed = 0;
    for (const row of (settings ?? []) as WeeklySettingsRow[]) {
      let local;
      try {
        local = getLocalSchedule(now, row.timezone || "Europe/London");
      } catch (timezoneError) {
        console.error("Invalid weekly reminder timezone; falling back to Europe/London", row.user_id, timezoneError);
        local = getLocalSchedule(now, "Europe/London");
      }
      if (row.weekly_kickoff_day !== local.day || row.weekly_kickoff_time !== local.time) {
        skipped++;
        continue;
      }
      matched++;

      const { error: claimError } = await supabase.from("weekly_meal_plan_reminder_sends").insert({
        user_id: row.user_id, week_start_date: local.weekStart, status: "pending",
        attempted_at: now.toISOString(), error_message: null,
      });
      let claimed = !claimError;
      if (claimError?.code === "23505") {
        const retryAfter = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
        const { data: retry, error: retryError } = await supabase
          .from("weekly_meal_plan_reminder_sends")
          .update({ status: "pending", attempted_at: now.toISOString(), error_message: null })
          .eq("user_id", row.user_id).eq("week_start_date", local.weekStart)
          .eq("status", "failed").lt("attempted_at", retryAfter)
          .select("user_id").maybeSingle();
        if (retryError) throw retryError;
        claimed = Boolean(retry);
      } else if (claimError) {
        console.error("Could not claim weekly reminder", row.user_id, claimError);
      }
      if (!claimed) { skipped++; continue; }

      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles").select("email, full_name").eq("id", row.user_id).maybeSingle();
        if (profileError) throw profileError;
        const { email, full_name } = (profile || {}) as ProfileRow;
        if (!email) throw new Error("No email address is available for this user");
        const displayDate = new Date(`${local.date}T12:00:00Z`).toLocaleDateString("en-GB", {
          day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
        });
        const result = await resend.emails.send({
          from: "RealiMeali <notifications@realimeali.com>",
          to: [email],
          subject: `📅 Plan your meals for the week – ${displayDate}`,
          html: createWeeklyKickoffTemplate(full_name),
        });
        if ((result as any)?.error) throw new Error((result as any).error.message || "Resend failed to send weekly reminder");
        await supabase.from("weekly_meal_plan_reminder_sends")
          .update({ status: "sent", sent_at: new Date().toISOString(), error_message: null })
          .eq("user_id", row.user_id).eq("week_start_date", local.weekStart);
        sent++;
      } catch (sendError) {
        failed++;
        const message = sendError instanceof Error ? sendError.message : String(sendError);
        await supabase.from("weekly_meal_plan_reminder_sends")
          .update({ status: "failed", error_message: message })
          .eq("user_id", row.user_id).eq("week_start_date", local.weekStart);
        console.error("Weekly meal plan email failed", row.user_id, sendError);
      }
    }
    console.log("Weekly meal plan reminder run", { checked: settings?.length ?? 0, matched, sent, skipped, failed });
    return new Response(JSON.stringify({ ok: true, checked: settings?.length ?? 0, matched, sent, skipped, failed }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in weekly-meal-plan-kickoff:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
