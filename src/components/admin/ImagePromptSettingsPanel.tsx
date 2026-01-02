import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader, Save, RotateCcw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const DEFAULT_PROMPT = `A high-quality editorial food photograph of {title}.

Composition: Randomly choose one of the following two compositions:
• Top-down (overhead) shot with the dish perfectly centred in the frame
• Side-on (45–90° angle) shot with the dish centred and clearly framed

In all cases, the food must be the absolute centre of attention, positioned in the middle of the image with no cropping of the main dish - and more or less fill the image.

Modern cookbook photography style. Realistic textures, natural colours, appetising but not over-styled. Professional food photography suitable for a premium meal planning app. Ensure you read and understand the full recipe before generating image:

{description}

{ingredients}

{instructions}

The image must accurately represent the finished dish based on the recipe details above. The dish should appear exactly as it would when prepared according to the instructions provided. Include visible ingredients from the recipe where appropriate, and ensure the styling, presentation, and appearance match how the dish would look when following the recipe instructions.`;

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
