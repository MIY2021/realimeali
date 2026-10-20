import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
 const {data:allowed,error:rateError}=await client.rpc("consume_edge_function_rate_limit",{p_user_id:data.user.id,p_function_name:"run-ingredient-migrations",p_limit:5,p_window_seconds:60});
 if(rateError)return new Response(JSON.stringify({error:"Temporarily unavailable"}),{status:503,headers:{...corsHeaders,"Content-Type":"application/json"}});
 if(allowed!==true)return new Response(JSON.stringify({error:"Rate limit exceeded"}),{status:429,headers:{...corsHeaders,"Content-Type":"application/json"}});
 return null;
}


const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
 if(req.method==="OPTIONS")return new Response(null,{headers:corsHeaders});
 const authFailure=await requireAdmin(req);if(authFailure)return authFailure;

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for optional parameters
    const body = await req.json().catch(() => ({}));
    const migrationNumber = body.migrationNumber || 'both'; // '1', '2', or 'both'

    console.log(`Running ingredient category migrations (migration: ${migrationNumber})`);

    // Call the database function to run migrations
    const { data, error } = await supabase.rpc('run_ingredient_category_migrations', {
      migration_number: migrationNumber
    });

    if (error) {
      // If function doesn't exist, guide user to run migration SQL manually
      if (error.message?.includes('function') && error.message?.includes('does not exist')) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Migration function not found. Please run the migration SQL file (20251219170003_create_migration_runner_function.sql) first in Supabase Dashboard SQL Editor.',
          note: 'After running that migration, this function will be available.'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw error;
    }

    console.log('Migration results:', data);

    return new Response(JSON.stringify({
      success: true,
      message: 'Migrations completed',
      results: data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in migration function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
