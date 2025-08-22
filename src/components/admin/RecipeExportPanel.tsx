import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileSpreadsheet, Users, Book } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { exportRecipesToCSV } from "@/services/recipeExportService";

interface ExportStats {
  totalRecipes: number;
  totalHouseholds: number;
  isLoading: boolean;
}

export const RecipeExportPanel = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState<ExportStats>({
    totalRecipes: 0,
    totalHouseholds: 0,
    isLoading: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchExportStats();
  }, []);

  const fetchExportStats = async () => {
    try {
      // Get total recipes accessible to admin (respects RLS)
      const { count: recipeCount } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true });

      // Get unique household count from accessible recipes
      const { data: recipes } = await supabase
        .from('recipes')
        .select('household_id');
      
      const uniqueHouseholds = Array.from(new Set(recipes?.map(r => r.household_id) || []));

      setStats({
        totalRecipes: recipeCount || 0,
        totalHouseholds: uniqueHouseholds.length,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching export stats:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const result = await exportRecipesToCSV();
      
      toast({
        title: "Export Successful",
        description: `Downloaded ${result.recordCount} recipes to ${result.filename}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export recipes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Book className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recipes</p>
                <p className="text-2xl font-bold">
                  {stats.isLoading ? '...' : stats.totalRecipes.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accessible Households</p>
                <p className="text-2xl font-bold">
                  {stats.isLoading ? '...' : stats.totalHouseholds.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Recipe Data Export
          </CardTitle>
          <CardDescription>
            Export all recipes from your accessible households to a CSV file. The export includes all recipe details, 
            ingredients, instructions, nutrition information, and metadata.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Export includes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Recipe details (title, description, prep/cook time, servings)</li>
              <li>• Complete ingredients and instructions</li>
              <li>• Categories, cuisine, diet preferences, and complexity</li>
              <li>• Nutrition and fruit/vegetable analysis</li>
              <li>• Usage statistics and cooking status</li>
              <li>• Creation and modification timestamps</li>
              <li>• Image URLs and source information</li>
            </ul>
          </div>

          <Button 
            onClick={handleExport}
            disabled={isExporting || stats.totalRecipes === 0}
            className="w-full md:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Generating Export...' : `Export ${stats.totalRecipes} Recipes`}
          </Button>

          {stats.totalRecipes === 0 && !stats.isLoading && (
            <p className="text-sm text-muted-foreground">
              No recipes available for export. You only have access to recipes from households you're a member of.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};