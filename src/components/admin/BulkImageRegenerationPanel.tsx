import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Image, Loader, Play, CheckCircle2 } from "lucide-react";

type Result = {
  id: string;
  title: string;
  status: string;
};

export function BulkImageRegenerationPanel() {
  const [total, setTotal] = useState<number | null>(null);
  const [processed, setProcessed] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [lastResults, setLastResults] = useState<Result[]>([]);
  const { toast } = useToast();

  const loadCount = async () => {
    const { count, error } = await supabase
      .from("recipes")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .like("image", "%recipe-generated-%");

    if (!error) setTotal(count ?? 0);
  };

  useEffect(() => {
    loadCount();
  }, []);

  const run = async () => {
    setRunning(true);
    setDone(false);
    setProcessed(0);
    setLastResults([]);

    let cursor: string | null = null;
    let batchNumber = 0;
    let totalProcessed = 0;

    try {
      while (true) {
        const { data, error } = await supabase.functions.invoke("bulk-regenerate-recipe-images", {
          body: { batchSize: 3, cursor, batchNumber },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        const batchResults: Result[] = data?.results ?? [];
        totalProcessed += batchResults.length;
        setProcessed(totalProcessed);
        setLastResults(batchResults);

        if (data?.done || !data?.nextCursor || batchResults.length === 0) {
          setDone(true);
          break;
        }

        cursor = data.nextCursor;
        batchNumber += 1;
      }

      await loadCount();
      toast({
        title: "Image regeneration complete",
        description: `${totalProcessed} recipe images have been regenerated.`,
      });
    } catch (error) {
      console.error("Bulk image regeneration failed:", error);
      toast({
        title: "Regeneration stopped",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  const percent = total ? Math.min(100, Math.round((processed / total) * 100)) : 0;

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5 text-terracotta" />
          <CardTitle>Regenerate Existing AI Images</CardTitle>
        </div>
        <CardDescription>
          Regenerate the existing AI-generated recipe images using the new varied food-photography system.
          Images are processed in small batches and only replaced after a new image succeeds. If the request fails, the error is shown here.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>{running ? `Regenerating images… ${processed} / ${total ?? "?"}` : done ? `Complete — ${processed} regenerated` : `${total ?? "…"} AI-generated images available`}</span>
            {done && <CheckCircle2 className="h-5 w-5 text-green-600" />}
          </div>
          <Progress value={percent} />
        </div>

        <Button onClick={run} disabled={running || total === 0} className="gap-2">
          {running ? <Loader className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {running ? "Regenerating…" : "Regenerate All AI Images"}
        </Button>

        {lastResults.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Last batch: {lastResults.map((result) => result.title).join(" · ")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
