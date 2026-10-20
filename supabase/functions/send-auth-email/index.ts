const corsHeaders = {
  "Access-Control-Allow-Origin": "https://realimeali.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

Deno.serve((req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  return new Response(JSON.stringify({ error: "This legacy endpoint is disabled. Use Supabase Auth directly." }), {
    status: 410,
    headers: { ...corsHeaders, "Cache-Control": "no-store" },
  });
});
