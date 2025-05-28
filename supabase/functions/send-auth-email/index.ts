
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  email: string;
  token: string;
  type: 'signup' | 'recovery' | 'invite' | 'magic_link';
  site_url?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, token, type, site_url }: AuthEmailRequest = await req.json();
    
    const confirmUrl = `${site_url}/auth/confirm?token=${token}&type=${type}&next=/`;
    
    let subject = "";
    let html = "";
    
    switch (type) {
      case 'signup':
        subject = "Welcome to RealiMeali - Confirm your email";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2c3e50; font-size: 28px; margin: 0;">Welcome to RealiMeali! 🍽️</h1>
              </div>
              
              <p style="color: #5a6c7d; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Thanks for joining RealiMeali! We're excited to help you plan delicious meals and create amazing recipes with your household.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmUrl}" style="background-color: #d4a574; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                  Confirm Your Email
                </a>
              </div>
              
              <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${confirmUrl}" style="color: #d4a574; word-break: break-all;">${confirmUrl}</a>
              </p>
              
              <div style="border-top: 1px solid #ecf0f1; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="color: #95a5a6; font-size: 12px; margin: 0;">
                  This email was sent by RealiMeali. If you didn't create an account, you can safely ignore this email.
                </p>
              </div>
            </div>
          </div>
        `;
        break;
        
      case 'magic_link':
        subject = "Your RealiMeali sign-in link";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2c3e50; font-size: 28px; margin: 0;">Sign in to RealiMeali 🔑</h1>
              </div>
              
              <p style="color: #5a6c7d; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Click the link below to securely sign in to your RealiMeali account. This link will expire in 1 hour for security.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmUrl}" style="background-color: #2c3e50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                  Sign In Now
                </a>
              </div>
              
              <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${confirmUrl}" style="color: #2c3e50; word-break: break-all;">${confirmUrl}</a>
              </p>
              
              <div style="border-top: 1px solid #ecf0f1; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="color: #95a5a6; font-size: 12px; margin: 0;">
                  This link was requested for ${email}. If you didn't request this, you can safely ignore this email.
                </p>
              </div>
            </div>
          </div>
        `;
        break;
        
      default:
        subject = "RealiMeali Authentication";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
            <h1 style="color: #2c3e50;">RealiMeali</h1>
            <p>Click the link below to continue:</p>
            <a href="${confirmUrl}" style="background-color: #d4a574; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px;">
              Continue
            </a>
          </div>
        `;
    }

    const emailResponse = await resend.emails.send({
      from: "RealiMeali <noreply@realimeali.com>",
      to: [email],
      subject,
      html,
    });

    console.log("Auth email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending auth email:", error);
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
