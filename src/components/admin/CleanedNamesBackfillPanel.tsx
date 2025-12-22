import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, CheckCircle2, XCircle, AlertCircle, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CleanedNamesBackfillPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [batchSize, setBatchSize] = useState(10);
  const [dryRun, setDryRun] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('backfill-cleaned-names', {
        body: {
          batchSize: batchSize,
          dryRun: dryRun
        }
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(error.message || `Failed to invoke Edge Function: ${error.name || 'Unknown error'}`);
      }

      if (!data) {
        throw new Error('No response from Edge Function');
      }

      setResult(data);
      
      if (data.error) {
        toast({
          title: "Backfill failed",
          description: data.error,
          variant: "destructive",
        });
      } else if (data.message) {
        toast({
          title: dryRun ? "Dry run completed" : "Backfill completed",
          description: `Processed ${data.processed || 0} ingredients. ${data.updated || 0} updated, ${data.errors || 0} errors.`,
        });
      }
    } catch (error: any) {
      console.error('Error running cleaned names backfill:', error);
      const errorMessage = error.message || "Failed to run backfill. Make sure the Edge Function is deployed.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setResult({ error: errorMessage });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Ingredient Name Cleaning Backfill
        </CardTitle>
        <CardDescription>
          Generate clean, shopping list-ready names for existing ingredients. 
          This uses AI to remove parenthetical notes, fix capitalization, and format ingredient names properly.
          Ingredients that already have cleaned names will be skipped.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="batchSize">Batch Size</Label>
          <Input
            id="batchSize"
            type="number"
            min="1"
            max="50"
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value) || 10)}
            disabled={isRunning}
          />
          <p className="text-xs text-muted-foreground">
            Number of ingredients to process per batch. Smaller batches (5-10) are recommended to avoid rate limits. Default: 10
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="dryRun"
            checked={dryRun}
            onCheckedChange={setDryRun}
            disabled={isRunning}
          />
          <Label htmlFor="dryRun">Dry Run (test without saving)</Label>
        </div>

        <Button
          onClick={handleRun}
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              {dryRun ? "Test Backfill" : "Run Backfill"}
            </>
          )}
        </Button>

        {result && (
          <div className="mt-4 p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              {result.error ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              <h4 className="font-semibold">
                {result.error ? "Error" : result.dryRun ? "Dry Run Results" : "Backfill Results"}
              </h4>
            </div>
            
            {result.error ? (
              <p className="text-sm text-red-500">{result.error}</p>
            ) : (
              <div className="space-y-1 text-sm">
                <p><strong>Message:</strong> {result.message}</p>
                <p><strong>Total Found:</strong> {result.total || 0}</p>
                <p><strong>Processed:</strong> {result.processed || 0}</p>
                <p><strong>Updated:</strong> {result.updated || 0}</p>
                <p><strong>Errors:</strong> {result.errors || 0}</p>
                {result.dryRun && (
                  <p className="text-xs text-muted-foreground mt-2">
                    This was a dry run. No changes were saved to the database.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>How it works:</strong> This tool finds all ingredients in the database that need cleaned names 
            (either missing or set to the fallback value). It uses AI to generate properly formatted names by:
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Removing parenthetical notes like "(add more/less depending on how spicy you like it)"</li>
              <li>Removing descriptive text after commas</li>
              <li>Fixing capitalization (Title Case)</li>
              <li>Preserving quantities and measurements</li>
            </ul>
            <strong className="mt-2 block">Note:</strong> You may need to run this multiple times if you have many ingredients. 
            The function processes up to 1000 ingredients per run in batches.
            <strong className="mt-2 block">Deployment:</strong> If you see "Failed to send a request to the Edge Function", 
            make sure the <code className="text-xs bg-muted px-1 rounded">backfill-cleaned-names</code> Edge Function is deployed in Supabase.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

