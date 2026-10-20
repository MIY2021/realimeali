import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const allowedOrigins = new Set([
  "https://realimeali.com",
  "https://www.realimeali.com",
  "https://realimeali.netlify.app",
  "http://localhost:8080",
  "http://localhost:5173",
]);
function headersFor(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://realimeali.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    "Vary": "Origin",
    "Cache-Control": "no-store",
  };
}
function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: headersFor(req) });
}
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] as string);
}
async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function rateLimit(req: Request, identifier: string, limit: number) {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return { ok: false, unavailable: true };
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.rpc("consume_edge_public_rate_limit", {
    p_function_name: "send-contact-email",
    p_identifier_hash: await sha256(identifier),
    p_limit: limit,
    p_window_seconds: 3600,
  });
  if (error) {
    console.error("Contact rate-limit check failed", { code: error.code });
    return { ok: false, unavailable: true };
  }
  return { ok: data === true, unavailable: false };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: headersFor(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);
  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > 12000) return json(req, { error: "Request too large" }, 413);

  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const subject = typeof body?.subject === "string" ? body.subject.trim().replace(/[\r\n]+/g, " ") : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

    if (!name || !email || !subject || !message) return json(req, { error: "Missing required fields" }, 400);
    if (name.length > 100 || email.length > 254 || subject.length > 200 || message.length > 5000 || phone.length > 40) {
      return json(req, { error: "One or more fields are too long" }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(req, { error: "Invalid email address" }, 400);

    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipLimit = await rateLimit(req, "ip:" + ip, 5);
    if (ipLimit.unavailable) return json(req, { error: "Temporarily unavailable" }, 503);
    if (!ipLimit.ok) return json(req, { error: "Too many requests. Please try again later." }, 429);
    const emailLimit = await rateLimit(req, "email:" + email, 3);
    if (emailLimit.unavailable) return json(req, { error: "Temporarily unavailable" }, 503);
    if (!emailLimit.ok) return json(req, { error: "Too many requests. Please try again later." }, 429);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) return json(req, { error: "Email service not configured" }, 503);
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p><strong>Message:</strong></p>
      <div style="white-space:pre-wrap;background:#f5f5f5;padding:15px;border-radius:5px;">${escapeHtml(message)}</div>
    `;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "RealiMeali Contact <noreply@realimeali.com>",
        to: ["benalexbeard@gmail.com"],
        reply_to: email,
        subject: `Contact Form: ${subject}`,
        html: emailHtml,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      console.error("Contact email delivery failed", { status: response.status });
      return json(req, { error: "Failed to send email" }, 502);
    }
    return json(req, { message: "Email sent successfully" }, 200);
  } catch {
    return json(req, { error: "Invalid request" }, 400);
  }
});
