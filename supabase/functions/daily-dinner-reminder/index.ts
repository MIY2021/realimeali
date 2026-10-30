import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

function requireServiceRole(req: Request): Response | null {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!key || req.headers.get("Authorization") !== `Bearer ${key}`) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  return null;
}

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
  timezone: string;
}

interface ProfileRow {
  email: string | null;
  full_name: string | null;
}

const createDinnerReminderTemplate = (fullName: string | null, appUrl: string) => {
  const mealPlannerUrl = `${appUrl.replace(/\/$/, "")}/meal-planner`;
  const greeting = fullName ? ` ${fullName}` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>What's for dinner tonight?</title></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:Arial,Helvetica,sans-serif;color:#243746;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">A little nudge to make tonight's dinner easier.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f3ef;"><tr><td align="center" style="padding:30px 14px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;">
<tr><td align="center" style="padding:30px 24px;background:#243746;color:#fff;"><div style="font-size:28px;">🍽️</div><div style="padding-top:8px;font-size:24px;font-weight:700;">RealiMeali</div><div style="padding-top:7px;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#f4b183;">Good food. Less faff.</div></td></tr>
<tr><td style="padding:34px 32px 28px;"><h1 style="margin:0 0 14px;font-size:29px;line-height:1.2;color:#243746;">What's cooking tonight?</h1>
<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#485563;">Hi${greeting},</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.75;color:#485563;">It's a good time to get tonight's dinner sorted. Take a quick look at your meal plan and see what's on the menu.</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.75;color:#485563;">Fancy a change? Pick another favourite, find a new recipe or update your plan. However tonight looks, RealiMeali can help keep things simple.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 24px;"><tr><td align="center" bgcolor="#e8753d" style="border-radius:28px;"><a href="${mealPlannerUrl}" style="display:inline-block;padding:15px 30px;color:#fff;text-decoration:none;font-size:15px;font-weight:700;">Open meal planner&nbsp; →</a></td></tr></table>
<p style="margin:0;text-align:center;font-size:12px;line-height:1.6;color:#87919a;">Change your reminder time or days in <strong>Settings → Notifications</strong>.</p></td></tr>
<tr><td align="center" style="padding:22px 28px;background:#f8f7f4;border-top:1px solid #eeeae3;"><p style="margin:0 0 6px;font-size:12px;color:#697681;">Making mealtimes that bit easier.</p><p style="margin:0;font-size:11px;color:#9aa2a9;">You're receiving this because dinner reminders are enabled in your RealiMeali settings.</p><p style="margin:12px 0 0;font-size:11px;color:#9aa2a9;">© ${new Date().getFullYear()} RealiMeali</p></td></tr>
</table></td></tr></table></body></html>`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const serviceFailure = requireServiceRole(req);
  if (serviceFailure) return serviceFailure;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date();

    const { data: settings, error } = await supabase
      .from("notification_settings")
      .select("user_id, daily_dinner_email_enabled, daily_dinner_time, daily_dinner_days_of_week, timezone")
      .eq("daily_dinner_email_enabled", true);

    if (error) {
      console.error("Error loading notification settings:", error);
      throw error;
    }

    const rows = (settings as NotificationSettingsRow[] | null) ?? [];
    const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:3000";
    let processed = 0;
    let sent = 0;
    let skipped = 0;

    const getLocalSchedule = (date: Date, timezone: string) => {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone || "Europe/London",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).formatToParts(date);
      const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
      const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return {
        date: `${values.year}-${values.month}-${values.day}`,
        time: `${values.hour}:${values.minute}`,
        day: dayMap[values.weekday],
      };
    };

    for (const row of rows) {
      const timezone = row.timezone || "Europe/London";
      let local;
      try {
        local = getLocalSchedule(now, timezone);
      } catch (timezoneError) {
        console.error("Invalid timezone for reminder user; falling back to Europe/London", row.user_id, timezone, timezoneError);
        local = getLocalSchedule(now, "Europe/London");
      }

      if (row.daily_dinner_time !== local.time || !(row.daily_dinner_days_of_week || []).includes(local.day)) {
        skipped++;
        continue;
      }

      processed++;
      const claim = {
        user_id: row.user_id,
        local_date: local.date,
        status: "pending",
        attempted_at: now.toISOString(),
        error_message: null,
      };

      let claimed = false;
      const { error: claimError } = await supabase
        .from("daily_dinner_reminder_sends")
        .insert(claim);

      if (!claimError) {
        claimed = true;
      } else if (claimError.code === "23505") {
        const retryAfter = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
        const { data: retry, error: retryError } = await supabase
          .from("daily_dinner_reminder_sends")
          .update({ status: "pending", attempted_at: now.toISOString(), error_message: null })
          .eq("user_id", row.user_id)
          .eq("local_date", local.date)
          .eq("status", "failed")
          .lt("attempted_at", retryAfter)
          .select("user_id")
          .maybeSingle();
        if (retryError) throw retryError;
        claimed = Boolean(retry);
      } else {
        console.error("Could not claim daily reminder send", row.user_id, claimError);
      }

      if (!claimed) {
        skipped++;
        continue;
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", row.user_id)
          .maybeSingle();
        if (profileError) throw profileError;

        const { email, full_name } = (profile || {}) as ProfileRow;
        if (!email) throw new Error("No email address is available for this user");

        const html = createDinnerReminderTemplate(full_name, appUrl);
        const emailResponse = await resend.emails.send({
          from: "RealiMeali <notifications@realimeali.com>",
          to: [email],
          subject: "What’s for dinner tonight?",
          html,
        });
        if ((emailResponse as any)?.error) {
          throw new Error((emailResponse as any).error.message || "Resend failed to send the reminder");
        }

        await supabase
          .from("daily_dinner_reminder_sends")
          .update({ status: "sent", sent_at: new Date().toISOString(), error_message: null })
          .eq("user_id", row.user_id)
          .eq("local_date", local.date);
        sent++;
        console.log("Daily dinner reminder sent", { user_id: row.user_id, local_date: local.date, responseId: (emailResponse as any)?.id ?? null });
      } catch (sendError) {
        const message = sendError instanceof Error ? sendError.message : String(sendError);
        await supabase
          .from("daily_dinner_reminder_sends")
          .update({ status: "failed", error_message: message })
          .eq("user_id", row.user_id)
          .eq("local_date", local.date);
        console.error("Error sending daily dinner reminder for user", row.user_id, sendError);
      }
    }

    console.log("Daily dinner reminder run", { checked: rows.length, matched: processed, sent, skipped });

    return new Response(
      JSON.stringify({
        ok: true,
        checked: rows.length,
        matched: processed,
        sent,
        skipped,
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

