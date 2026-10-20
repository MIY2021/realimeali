import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

async function requireAdmin(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const serviceUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceUrl || !serviceKey) return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const client = createClient(serviceUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await client.auth.getUser(authHeader.slice(7));
  if (userError || !userData.user) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const { data: role, error: roleError } = await client.from("user_roles").select("user_id").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
  if (roleError || !role) return new Response(JSON.stringify({ error: "Administrator access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  return null;
}


const OPENAI_API_KEY=Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL=Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase=createClient(SUPABASE_URL,SERVICE_KEY);
const corsHeaders={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json"};
const DIRECTIONS=[
"45-degree dining perspective, classic centred hero composition",
"true overhead flat-lay, off-centre rule-of-thirds composition",
"near eye-level view, tight editorial crop showing texture and height",
"low three-quarter angle, asymmetric composition with negative space",
"30-degree elevated angle, wider contextual table composition",
"tight close-up at food level, cropped editorial composition",
"45-degree perspective, served in an appropriate pan, tray or cooking vessel",
"true overhead, ingredient-led composition with natural serving context",
"eye-level serving moment with a natural hand using cutlery",
"warm rustic home-dining scene, just-served presentation",
"directional side light, diagonal composition and visible texture",
"soft backlight, relaxed rustic homemade presentation"
];
function decodeBase64(b:string){const s=atob(b),o=new Uint8Array(s.length);for(let i=0;i<s.length;i++)o[i]=s.charCodeAt(i);return o;}
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const authFailure = await requireAdmin(req);
  if (authFailure) return authFailure;

try{
if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
const body=await req.json().catch(()=>({}));
const batchSize=Math.min(Math.max(Number(body.batchSize||3),1),5);
const cursor=body.cursor||null;
const {data:settings}=await supabase.from("app_settings").select("value").eq("id","image_generation_prompt").maybeSingle();
const basePrompt=settings?.value||"Create a high-quality editorial food photograph of the recipe. Keep the food authentic and appetising.";
let q=supabase.from("recipes").select("id,title,description,ingredients,instructions,servings,prep_time,cook_time,image").is("deleted_at",null).like("image","%recipe-generated-%").not("image","like","%recipe-generated-bulk-%").order("id",{ascending:true}).limit(batchSize);
if(cursor)q=q.gt("id",cursor);
const {data:recipes,error:queryError}=await q;if(queryError)throw queryError;
if(!recipes?.length)return new Response(JSON.stringify({done:true,processed:0,nextCursor:null}),{headers:corsHeaders});
const results:any[]=[];
for(let i=0;i<recipes.length;i++){
const r:any=recipes[i],direction=DIRECTIONS[(i+(body.batchNumber||0)*batchSize)%DIRECTIONS.length];
const ingredients=Array.isArray(r.ingredients)?r.ingredients.join("\n"):String(r.ingredients||"");
const instructions=Array.isArray(r.instructions)?r.instructions.join("\n"):String(r.instructions||"");
const prompt=`${basePrompt}

RECIPE:
Title: ${r.title}
Description: ${r.description||""}
Ingredients:
${ingredients}
Instructions:
${instructions}
Servings: ${r.servings||""}
Prep time: ${r.prep_time||""} minutes
Cook time: ${r.cook_time||""} minutes

CHOSEN PHOTOGRAPHIC DIRECTION FOR THIS IMAGE:
${direction}

Create one authentic, appetising food photograph. Follow the chosen photographic direction rather than reverting to a generic centred 45-degree plate shot. Match the dish naturally; do not invent ingredients. Keep the food recognisable, realistic and suitable for a UK recipe app. No text, labels, logos or watermarks.`;
const response=await fetch("https://api.openai.com/v1/images/generations",{method:"POST",headers:{"Authorization":`Bearer ${OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-image-2.5-flare",prompt,size:"1024x1024",output_format:"webp"}),signal:AbortSignal.timeout(90000)});
if(!response.ok)throw new Error(`OpenAI ${response.status}: ${await response.text()}`);
const data=await response.json(),b64=data.data?.[0]?.b64_json;if(!b64)throw new Error("No image returned");
const buffer=decodeBase64(b64),fileName=`recipe-generated-bulk-${Date.now()}-${r.id}.webp`;
const {error:uploadError}=await supabase.storage.from("recipe-images").upload(fileName,buffer,{contentType:"image/webp",cacheControl:"3600"});if(uploadError)throw uploadError;
const {data:urlData}=supabase.storage.from("recipe-images").getPublicUrl(fileName);
const {error:updateError}=await supabase.from("recipes").update({image:urlData.publicUrl}).eq("id",r.id);if(updateError)throw updateError;
results.push({id:r.id,title:r.title,status:"updated"});
}
return new Response(JSON.stringify({done:false,processed:results.length,results,nextCursor:recipes[recipes.length-1].id}),{headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});
}catch(e){return new Response(JSON.stringify({error:String(e)}),{status:500,headers:corsHeaders});}
});