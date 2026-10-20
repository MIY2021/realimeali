import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

async function requireAdmin(req: Request): Promise<Response | null> {
 const authHeader=req.headers.get("Authorization");
 if(!authHeader||!authHeader.startsWith("Bearer "))return new Response(JSON.stringify({error:"Authentication required"}),{status:401,headers:{...corsHeaders,"Content-Type":"application/json"}});
 const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!key)return new Response(JSON.stringify({error:"Server configuration error"}),{status:500,headers:{...corsHeaders,"Content-Type":"application/json"}});
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.auth.getUser(authHeader.slice(7));
 if(error||!data.user)return new Response(JSON.stringify({error:"Authentication required"}),{status:401,headers:{...corsHeaders,"Content-Type":"application/json"}});
 const {data:role,error:roleError}=await client.from("user_roles").select("user_id").eq("user_id",data.user.id).eq("role","admin").maybeSingle();
 if(roleError||!role)return new Response(JSON.stringify({error:"Administrator access required"}),{status:403,headers:{...corsHeaders,"Content-Type":"application/json"}});
 const {data:allowed,error:rateError}=await client.rpc("consume_edge_function_rate_limit",{p_user_id:data.user.id,p_function_name:"cleanup-deleted-recipes",p_limit:5,p_window_seconds:60});
 if(rateError)return new Response(JSON.stringify({error:"Temporarily unavailable"}),{status:503,headers:{...corsHeaders,"Content-Type":"application/json"}});
 if(allowed!==true)return new Response(JSON.stringify({error:"Rate limit exceeded"}),{status:429,headers:{...corsHeaders,"Content-Type":"application/json"}});
 return null;
}


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
 if(req.method==="OPTIONS")return new Response(null,{headers:corsHeaders});
 const authFailure=await requireAdmin(req);if(authFailure)return authFailure;

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting cleanup of deleted recipes older than 30 days...');

    // Call the cleanup function
    const { error } = await supabaseClient.rpc('cleanup_old_deleted_recipes');

    if (error) {
      console.error('Error running cleanup:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to cleanup old deleted recipes' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Cleanup completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Old deleted recipes cleanup completed successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});