import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader, Save, RotateCcw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const DEFAULT_PROMPT = "A high-quality editorial food photograph of {title}.\n\nCreate a believable, appetising photograph of the finished dish, using the full recipe context below. The food should look like something a great cookbook or food magazine would actually photograph: natural, tactile, delicious and appropriately styled for the cuisine.\n\nImportant visual rule: do NOT fall back to a generic centred 45-degree food shot. Each generated image should have its own photographic identity. Vary the camera viewpoint, framing, presentation, setting and lighting while keeping the food itself accurate to the recipe.\n\nThe visual direction supplied with this prompt is intentional. Follow it closely, but adapt it naturally to the dish. Props, garnishes and backgrounds must support the food rather than overpower it. Only show ingredients and elements that make sense for the recipe.\n\nModern cookbook photography with realistic textures, natural colour and believable food styling. No text, labels, borders, collage layouts or artificial-looking food. One coherent photograph.\n\nRecipe context:\n\n{description}\n\n{ingredients}\n\n{instructions}\n\nThe image must accurately represent the finished dish based on the recipe details above. The dish should appear as it would when prepared according to the instructions, including its likely texture, colour, shape, portion and serving vessel. Do not invent major ingredients or change the dish into a different cuisine.";

export function ImagePromptSettingsPanel() {
  const [prompt, setPrompt] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("id", "image_generation_prompt")
        .single();

      if (error) {
        console.error("Error fetching prompt:", error);
        setPrompt(DEFAULT_PROMPT);
        setOriginalPrompt(DEFAULT_PROMPT);
      } else {
        setPrompt(data.value);
        setOriginalPrompt(data.value);
      }
    } catch (error) {
      console.error("Error:", error);
      setPrompt(DEFAULT_PROMPT);
      setOriginalPrompt(DEFAULT_PROMPT);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("app_settings")
        .update({ 
          value: prompt,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq("id", "image_generation_prompt");

      if (error) throw error;

      setOriginalPrompt(prompt);
      toast({
        title: "Prompt saved",
        description: "The image generation prompt has been updated.",
      });
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast({
        title: "Error",
        description: "Failed to save the prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPrompt(DEFAULT_PROMPT);
  };

  const hasChanges = prompt !== originalPrompt;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className={isMobile ? "px-4 py-4" : ""}>
        <CardTitle className={isMobile ? "text-lg" : ""}>Image Generation Prompt</CardTitle>
        <CardDescription className={isMobile ? "text-xs" : ""}>
          Configure the AI prompt used to generate recipe images. Available placeholders: <code className="bg-muted px-1 rounded">{"{title}"}</code>, <code className="bg-muted px-1 rounded">{"{description}"}</code>, <code className="bg-muted px-1 rounded">{"{ingredients}"}</code>, and <code className="bg-muted px-1 rounded">{"{instructions}"}</code>. The AI will automatically include the full recipe context when generating images.
        </CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? "px-4 pb-4" : ""}>
        <div className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter the image generation prompt..."
            className="min-h-[200px] font-mono text-sm"
          />
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="gap-2"
            >
              {isSaving ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={prompt === DEFAULT_PROMPT}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
          </div>

          {hasChanges && (
            <p className="text-sm text-amber-600">
              You have unsaved changes.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
