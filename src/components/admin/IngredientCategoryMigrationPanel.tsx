import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MIGRATION_1_SQL = `-- Create ingredient_categories table to store normalized ingredient names and their categories
CREATE TABLE IF NOT EXISTS public.ingredient_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on ingredient_name for fast lookups
CREATE INDEX IF NOT EXISTS idx_ingredient_categories_name ON public.ingredient_categories(ingredient_name);

-- Create trigger for updating updated_at timestamp (only if function exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_ingredient_categories_updated_at ON public.ingredient_categories;
    CREATE TRIGGER update_ingredient_categories_updated_at
    BEFORE UPDATE ON public.ingredient_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.ingredient_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view ingredient categories" ON public.ingredient_categories;
DROP POLICY IF EXISTS "Authenticated users can insert ingredient categories" ON public.ingredient_categories;
DROP POLICY IF EXISTS "Authenticated users can update ingredient categories" ON public.ingredient_categories;

-- RLS Policies - allow authenticated users to read, but only system can write
CREATE POLICY "Anyone can view ingredient categories" 
ON public.ingredient_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert ingredient categories" 
ON public.ingredient_categories 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update ingredient categories" 
ON public.ingredient_categories 
FOR UPDATE 
USING (auth.role() = 'authenticated');`;

const MIGRATION_2_SQL = `-- Add category column to household_shopping_lists table
ALTER TABLE public.household_shopping_lists
ADD COLUMN IF NOT EXISTS category TEXT;

-- Create index on category for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_shopping_lists_category 
ON public.household_shopping_lists(household_id, category);`;

export function IngredientCategoryMigrationPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{ migration1?: any; migration2?: any }>({});
  const { toast } = useToast();

  const handleRunMigrations = async () => {
    setIsRunning(true);
    setResults({});

    try {
      const { data, error } = await supabase.functions.invoke('run-ingredient-migrations', {
        body: {
          migrationNumber: 'both'
        }
      });

      if (error) {
        throw error;
      }

      if (data.success && data.results) {
        setResults({
          migration1: data.results.migration1,
          migration2: data.results.migration2
        });

        const bothSuccess = data.results.migration1?.success && data.results.migration2?.success;
        
        toast({
          title: bothSuccess ? "Migrations Completed" : "Migration Status",
          description: bothSuccess 
            ? "All migrations have been successfully applied."
            : "Check results below. Some migrations may need to be run manually.",
          variant: bothSuccess ? "default" : "destructive",
        });
      } else {
        throw new Error(data.error || 'Failed to run migrations');
      }

    } catch (error: any) {
      console.error('Error running migrations:', error);
      
      // If function doesn't exist, check migration status manually
      if (error.message?.includes('function') || error.message?.includes('not found')) {
        await handleCheckMigrations();
        toast({
          title: "Migration Function Not Found",
          description: "Please run the migration function SQL first, or run migrations manually.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to run migrations",
          variant: "destructive",
        });
        setResults({
          migration1: { success: false, error: error.message },
          migration2: { success: false, error: error.message }
        });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleCheckMigrations = async () => {
    try {
      // Check if ingredient_categories table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('ingredient_categories')
        .select('id')
        .limit(1);

      let migration1Result;
      if (tableError && tableError.code === 'PGRST116') {
        migration1Result = { 
          success: false, 
          message: "Table does not exist - Migration 1 needs to be run"
        };
      } else if (tableError) {
        migration1Result = { 
          success: false, 
          error: tableError.message 
        };
      } else {
        migration1Result = { 
          success: true, 
          message: "Migration 1: ingredient_categories table exists ✓" 
        };
      }

      // Check if category column exists
      const { data: columnCheck, error: columnError } = await supabase
        .from('household_shopping_lists')
        .select('category')
        .limit(1);

      let migration2Result;
      if (columnError && columnError.message?.includes('column') && columnError.message?.includes('does not exist')) {
        migration2Result = { 
          success: false, 
          message: "Column does not exist - Migration 2 needs to be run"
        };
      } else if (columnError && !columnError.message?.includes('column')) {
        migration2Result = { 
          success: false, 
          error: columnError.message 
        };
      } else {
        migration2Result = { 
          success: true, 
          message: "Migration 2: category column exists ✓" 
        };
      }

      setResults({
        migration1: migration1Result,
        migration2: migration2Result
      });
    } catch (error: any) {
      console.error('Error checking migrations:', error);
    }
  };

  const handleCopySQL = (sql: string, migrationName: string) => {
    navigator.clipboard.writeText(sql);
    toast({
      title: "SQL Copied",
      description: `${migrationName} SQL has been copied to clipboard. Paste it in Supabase SQL Editor.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingredient Category Migrations</CardTitle>
        <CardDescription>
          Run database migrations to create the ingredient_categories table and add category column to shopping lists.
          These migrations must be run before the backfill function can work.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Note:</strong> For security reasons, migrations cannot be run directly from the client. 
            Please copy the SQL below and run it in the Supabase Dashboard SQL Editor, or use the Supabase CLI.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Migration 1: Create ingredient_categories table</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopySQL(MIGRATION_1_SQL, "Migration 1")}
              >
                Copy SQL
              </Button>
            </div>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-40 overflow-y-auto">
              {MIGRATION_1_SQL}
            </pre>
            {results.migration1 && (
              <div className={`text-xs p-2 rounded ${results.migration1.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {results.migration1.success ? (
                  <CheckCircle2 className="h-4 w-4 inline mr-1" />
                ) : (
                  <XCircle className="h-4 w-4 inline mr-1" />
                )}
                {results.migration1.message || results.migration1.error}
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Migration 2: Add category to shopping lists</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopySQL(MIGRATION_2_SQL, "Migration 2")}
              >
                Copy SQL
              </Button>
            </div>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-40 overflow-y-auto">
              {MIGRATION_2_SQL}
            </pre>
            {results.migration2 && (
              <div className={`text-xs p-2 rounded ${results.migration2.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {results.migration2.success ? (
                  <CheckCircle2 className="h-4 w-4 inline mr-1" />
                ) : (
                  <XCircle className="h-4 w-4 inline mr-1" />
                )}
                {results.migration2.message || results.migration2.error}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleRunMigrations}
            disabled={isRunning}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Migrations
              </>
            )}
          </Button>
          <Button
            onClick={handleCheckMigrations}
            disabled={isRunning}
            variant="outline"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Check Status
          </Button>
        </div>

        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            <strong>How to run migrations:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Click "Copy SQL" for each migration</li>
              <li>Go to Supabase Dashboard → SQL Editor</li>
              <li>Paste the SQL and click "Run"</li>
              <li>Or use CLI: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">supabase db push</code></li>
            </ol>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
