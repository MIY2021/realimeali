import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, Check, X, Loader, AlertCircle } from "lucide-react";

interface ThumbnailResult {
  recipeId: string;
  title: string;
  success: boolean;
  error?: string;
}

interface BatchResult {
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  results: ThumbnailResult[];
}

export function ThumbnailGenerationPanel() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [totalSuccessful, setTotalSuccessful] = useState(0);
  const [totalFailed, setTotalFailed] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingCount, setRemainingCount] = useState<number | null>(null);

  // Check how many recipes need thumbnails
  const checkRemainingCount = async () => {
    try {
      const { count, error } = await supabase
        .from('recipes')
        .select('id', { count: 'exact', head: true })
        .not('image', 'is', null)
        .is('image_thumbnail', null)
        .eq('is_deleted', false);

      if (error) throw error;
      setRemainingCount(count || 0);
    } catch (err) {
      console.error('Error checking remaining count:', err);
    }
  };

  useEffect(() => {
    checkRemainingCount();
  }, []);

  const processBatch = async (): Promise<BatchResult | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-missing-thumbnails', {
        body: {},
      });

      if (error) throw error;
      return data as BatchResult;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to process batch');
    }
  };

  const handleGenerateAllThumbnails = async () => {
    setIsProcessing(true);
    setIsComplete(false);
    setError(null);
    setTotalProcessed(0);
    setTotalSuccessful(0);
    setTotalFailed(0);
    setCurrentBatch(0);

    try {
      let batchNumber = 0;
      let hasMore = true;

      while (hasMore) {
        batchNumber++;
        setCurrentBatch(batchNumber);

        const result = await processBatch();

        if (!result) {
          hasMore = false;
          break;
        }

        setTotalProcessed(prev => prev + result.summary.total);
        setTotalSuccessful(prev => prev + result.summary.successful);
        setTotalFailed(prev => prev + result.summary.failed);

        // If we processed fewer than 50, we're done
        if (result.summary.total < 50) {
          hasMore = false;
        }

        // Small delay between batches to avoid rate limiting
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setIsComplete(true);
      await checkRemainingCount();
      
      toast({
        title: "Thumbnail Generation Complete",
        description: `Processed ${totalProcessed} recipes. ${totalSuccessful} successful, ${totalFailed} failed.`,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while generating thumbnails';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const progress = totalProcessed > 0 
    ? ((totalSuccessful + totalFailed) / totalProcessed) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Generate Missing Thumbnails
        </CardTitle>
        <CardDescription>
          Generate thumbnails for all recipes that have images but no thumbnails. This will improve loading times in recipe lists.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {remainingCount !== null && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {remainingCount === 0 
                ? "All recipes have thumbnails! ✅"
                : `${remainingCount} recipe${remainingCount !== 1 ? 's' : ''} need${remainingCount === 1 ? 's' : ''} thumbnails.`
              }
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing batch {currentBatch}...</span>
              <span>{totalProcessed} total processed</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-500" />
                {totalSuccessful} successful
              </span>
              <span className="flex items-center gap-1">
                <X className="h-4 w-4 text-red-500" />
                {totalFailed} failed
              </span>
            </div>
          </div>
        )}

        {isComplete && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              Processing complete! {totalSuccessful} thumbnails generated successfully.
              {totalFailed > 0 && ` ${totalFailed} failed.`}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleGenerateAllThumbnails}
          disabled={isProcessing || (remainingCount !== null && remainingCount === 0)}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Generate All Missing Thumbnails
            </>
          )}
        </Button>

        {remainingCount !== null && remainingCount > 0 && !isProcessing && (
          <p className="text-sm text-muted-foreground text-center">
            This will process recipes in batches of 50 until all are complete.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

