import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader, Play, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function IngredientCategoryBackfillPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [batchSize, setBatchSize] = useState(50);
  const [dryRun, setDryRun] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('backfill-ingredient-categories', {
        body: {
          batchSize: batchSize,
          dryRun: dryRun
        }
      });

      if (error) {
        throw error;
      }

      setResult(data);
      
      if (data.success) {
        toast({
          title: "Backfill completed",
          description: `Processed ${data.processed} ingredients. ${data.saved} saved, ${data.failed} failed. ${data.remaining} remaining.`,
        });
      } else {
        toast({
          title: "Backfill failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error running backfill:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to run backfill",
        variant: "destructive",
      });
      setResult({ success: false, error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingredient Category Backfill</CardTitle>
        <CardDescription>
          Retrospectively categorize ingredients from all recipes in the database. 
          This will process ingredients in batches and save categories to the ingredient_categories table.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="batchSize">Batch Size</Label>
          <Input
            id="batchSize"
            type="number"
            min="1"
            max="100"
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value) || 50)}
            disabled={isRunning}
          />
          <p className="text-xs text-muted-foreground">
            Number of ingredients to process per run. Default: 50
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
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Backfill
            </>
          )}
        </Button>

        {result && (
          <div className="mt-4 p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <h4 className="font-semibold">
                {result.success ? "Success" : "Error"}
              </h4>
            </div>
            
            {result.success ? (
              <div className="space-y-1 text-sm">
                <p><strong>Message:</strong> {result.message}</p>
                <p><strong>Processed:</strong> {result.processed}</p>
                <p><strong>Saved:</strong> {result.saved}</p>
                <p><strong>Skipped:</strong> {result.skipped}</p>
                <p><strong>Failed:</strong> {result.failed}</p>
                <p><strong>Remaining:</strong> {result.remaining}</p>
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2">
                    <p><strong>Errors:</strong></p>
                    <ul className="list-disc list-inside text-xs text-muted-foreground">
                      {result.errors.slice(0, 5).map((error: string, idx: number) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-red-500">{result.error}</p>
            )}
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Note:</strong> Run this multiple times until "Remaining" is 0 to process all ingredients. 
            The function automatically skips ingredients that are already categorized.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
