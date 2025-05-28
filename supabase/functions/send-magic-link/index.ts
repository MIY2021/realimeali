
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MagicLinkRequest {
  email: string;
  redirectTo?: string;
}

const createMagicLinkEmailTemplate = (magicLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to RealiMeali</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #fdc8a4 0%, #f4a775 100%); padding: 40px 20px; text-align: center;">
      <div style="display: inline-flex; align-items: center; gap: 12px; color: #1e3a8a; font-size: 28px; font-weight: bold;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m16 2-3 3-3-3"></path>
          <path d="m18 6 3 3-3 3"></path>
          <path d="m6 6-3 3 3 3"></path>
          <path d="m16 16 3 3-3 3"></path>
          <path d="m8 16-3 3 3 3"></path>
          <path d="m2 12h20"></path>
        </svg>
        RealiMeali
      </div>
      <p style="color: #1e3a8a; margin: 8px 0 0 0; font-size: 16px;">Your all-in-one meal planning companion</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 20px;">
      <h1 style="color: #1e3a8a; font-size: 28px; font-weight: bold; margin: 0 0 20px 0; text-align: center;">
        Welcome to RealiMeali! 🍽️
      </h1>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        We're excited to have you join our community of meal planning enthusiasts! Click the button below to sign in and start planning delicious meals for you and your household.
      </p>

      <!-- Sign In Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${magicLink}" 
           style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);">
          Sign In to RealiMeali
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 24px 0 0 0; text-align: center;">
        This link will expire in 15 minutes for your security. If you didn't request this email, you can safely ignore it.
      </p>

      <!-- Features Preview -->
      <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
        <h3 style="color: #1e3a8a; font-size: 18px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">
          What you can do with RealiMeali:
        </h3>
        
        <div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; margin-top: 20px;">
          <div style="text-align: center; flex: 1; min-width: 150px;">
            <div style="color: #d97706; font-size: 24px; margin-bottom: 8px;">📖</div>
            <p style="color: #4b5563; font-size: 14px; margin: 0;">Save & organize your favorite recipes</p>
          </div>
          <div style="text-align: center; flex: 1; min-width: 150px;">
            <div style="color: #059669; font-size: 24px; margin-bottom: 8px;">📅</div>
            <p style="color: #4b5563; font-size: 14px; margin: 0;">Plan meals for the whole week</p>
          </div>
          <div style="text-align: center; flex: 1; min-width: 150px;">
            <div style="color: #1e3a8a; font-size: 24px; margin-bottom: 8px;">🛒</div>
            <p style="color: #4b5563; font-size: 14px; margin: 0;">Generate smart shopping lists</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        © 2024 RealiMeali. Making meal planning simple and delicious.
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
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, redirectTo }: MagicLinkRequest = await req.json();

    console.log(`Sending magic link to: ${email}`);

    // Generate magic link using Supabase
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo || `${req.headers.get('origin') || 'http://localhost:3000'}/`,
      },
    });

    if (error) {
      console.error('Supabase magic link error:', error);
      throw error;
    }

    // For now, we'll send a confirmation email that the magic link was sent
    // In a production setup, you'd configure Supabase to use this edge function for auth emails
    const emailResponse = await resend.emails.send({
      from: "RealiMeali <onboarding@resend.dev>",
      to: [email],
      subject: "Your magic link to RealiMeali is ready! ✨",
      html: createMagicLinkEmailTemplate("#"), // Placeholder - in production this would be the actual magic link
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Magic link sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-magic-link function:", error);
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
