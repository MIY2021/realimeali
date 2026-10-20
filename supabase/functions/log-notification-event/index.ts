import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

async function authenticateUser(req: Request): Promise<{ user: { id: string } | null; response: Response | null }> {
 const authHeader=req.headers.get("Authorization");
 const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!authHeader||!authHeader.startsWith("Bearer ")||!url||!key)return {user:null,response:new Response(JSON.stringify({error:"Authentication required"}),{status:401,headers:{...corsHeaders,"Content-Type":"application/json"}})};
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.auth.getUser(authHeader.slice(7));
 if(error||!data.user)return {user:null,response:new Response(JSON.stringify({error:"Authentication required"}),{status:401,headers:{...corsHeaders,"Content-Type":"application/json"}})};
 const {data:allowed,error:rateError}=await client.rpc("consume_edge_function_rate_limit",{p_user_id:data.user.id,p_function_name:"log-notification-event",p_limit:60,p_window_seconds:60});
 if(rateError)return {user:null,response:new Response(JSON.stringify({error:"Temporarily unavailable"}),{status:503,headers:{...corsHeaders,"Content-Type":"application/json"}})};
 if(allowed!==true)return {user:null,response:new Response(JSON.stringify({error:"Rate limit exceeded"}),{status:429,headers:{...corsHeaders,"Content-Type":"application/json"}})};
 return {user:{id:data.user.id},response:null};
}


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LogPayload {
  user_id: string;
  type: string;
  channel: "push" | "email";
  action: "sent" | "opened" | "clicked";
  metadata?: Record<string, unknown>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

 const auth=await authenticateUser(req);if(auth.response)return auth.response;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload: LogPayload = await req.json();
 if (!auth.user || payload.user_id !== auth.user.id) return new Response(JSON.stringify({error:"Forbidden"}),{status:403,headers:{...corsHeaders,"Content-Type":"application/json"}});

    const { error } = await supabase.from("notification_events").insert({
      user_id: payload.user_id,
      type: payload.type,
      channel: payload.channel,
      action: payload.action,
      metadata: payload.metadata ?? null,
    });

    if (error) {
      console.error("Error logging notification event:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ ok: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in log-notification-event function:", error);
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

