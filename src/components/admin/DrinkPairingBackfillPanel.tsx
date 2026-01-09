import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader, Play, CheckCircle, XCircle, AlertCircle, Wine } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DrinkPairingBackfillPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [batchSize, setBatchSize] = useState(10);
  const [dryRun, setDryRun] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('backfill-drink-pairings', {
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
        const successMessage = dryRun 
          ? `Dry run completed: Would process ${data.updated || 0} recipes`
          : `Backfill completed: ${data.updated || 0} recipes updated successfully`;
        
        toast({
          title: dryRun ? "Dry run completed" : "Backfill completed",
          description: successMessage,
          variant: data.failed > 0 ? "default" : "default",
        });
      }
    } catch (error: any) {
      console.error('Error running drink pairing backfill:', error);
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
          <Wine className="h-5 w-5" />
          Drink Pairing Backfill
        </CardTitle>
        <CardDescription>
          Generate AI-powered drink pairings (alcoholic and non-alcoholic) for recipes that are missing them.
          This will add Perfect Pairing suggestions to recipes that don't have them yet.
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
            Number of recipes to process per batch. Smaller batches (5-10) are recommended to avoid rate limits. Default: 10
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
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              <h4 className="font-semibold">
                {result.error ? "Error" : result.dryRun ? "Dry Run Results" : "Backfill Results"}
              </h4>
            </div>
            
            {result.error ? (
              <div className="space-y-2">
                <p className="text-sm text-red-500">{result.error}</p>
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                {result.message && <p><strong>Message:</strong> {result.message}</p>}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-muted-foreground">Updated:</p>
                    <p className="font-semibold text-green-600">{result.updated || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Failed:</p>
                    <p className={`font-semibold ${result.failed > 0 ? 'text-red-600' : ''}`}>{result.failed || 0}</p>
                  </div>
                  {result.remaining !== undefined && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Remaining:</p>
                      <p className="font-semibold">{result.remaining || 0}</p>
                    </div>
                  )}
                </div>
                {result.remaining > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ⚠️ {result.remaining} recipes still need pairings. Run again to process remaining items.
                  </p>
                )}
                {result.dryRun && (
                  <p className="text-xs text-muted-foreground mt-2">
                    This was a dry run. No changes were saved to the database.
                  </p>
                )}
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                    <p className="font-semibold mb-1 text-red-800">Errors:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-red-700">
                      {result.errors.slice(0, 5).map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                      {result.errors.length > 5 && (
                        <li>... and {result.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>How it works:</strong> This tool finds all recipes in the database that are missing drink pairings 
            (alcoholic_pairing or non_alcoholic_pairing is null). It uses AI to generate specific pairing suggestions based on:
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Recipe title and cuisine type</li>
              <li>Main ingredients and flavor profile</li>
              <li>Meal type and cooking method</li>
            </ul>
            <strong className="mt-2 block">Note:</strong> You may need to run this multiple times if you have many recipes. 
            The function processes recipes in batches to avoid rate limiting.
            <strong className="mt-2 block">Deployment:</strong> If you see "Failed to send a request to the Edge Function", 
            make sure the <code className="text-xs bg-muted px-1 rounded">backfill-drink-pairings</code> Edge Function is deployed in Supabase.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

