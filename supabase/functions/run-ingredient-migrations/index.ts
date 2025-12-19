import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
