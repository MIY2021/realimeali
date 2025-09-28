import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Check, X, AlertCircle, Download, Clock } from 'lucide-react';
import { importRecipesFromCSV, fetchImportLogs, ImportResult } from '@/services/recipeImportService';
import { AuthContext } from '@/contexts/AuthContext';
import { useContext } from 'react';

interface ImportLog {
  id: string;
  filename: string;
  total_records: number;
  successful_imports: number;
  failed_imports: number;
  import_notes: string;
  created_at: string;
}

export function RecipeImportPanel() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importLogs, setImportLogs] = useState<ImportLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    handleImport(file);
  };

  const handleImport = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to import recipes.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await importRecipesFromCSV(file, user.id);
      
      clearInterval(progressInterval);
      setImportProgress(100);
      setImportResult(result);

      if (result.success) {
        toast({
          title: "Import successful!",
          description: `Successfully imported ${result.successfulImports} recipes.`,
        });
      } else {
        toast({
          title: "Import completed with errors",
          description: `${result.successfulImports} successful, ${result.failedImports} failed.`,
          variant: "destructive",
        });
      }

      // Refresh import logs
      loadImportLogs();
      
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        totalRecords: 0,
        successfulImports: 0,
        failedImports: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
      
      toast({
        title: "Import failed",
        description: "An error occurred during the import process.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const loadImportLogs = async () => {
    try {
      const logs = await fetchImportLogs();
      setImportLogs(logs);
    } catch (error) {
      console.error('Error loading import logs:', error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));
    
    if (csvFile) {
      handleFileSelect(csvFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please drop a CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const downloadSampleCSV = () => {
    const sampleData = `title,description,prep_time,cook_time,servings,meal_types,cuisine_region,diet_lifestyle,ingredients,instructions,image,source_url,import_method,top_tip
"Spaghetti Carbonara","Classic Italian pasta dish with eggs, cheese, and pancetta",15,20,4,"dinner","italian","","400g spaghetti; 200g pancetta; 4 large eggs; 100g Parmesan cheese; Black pepper; Salt","Cook pasta according to package directions; Fry pancetta until crispy; Whisk eggs with cheese; Combine hot pasta with pancetta; Add egg mixture off heat; Toss until creamy","","","admin_import","Use room temperature eggs for best results"
"Chicken Stir Fry","Quick and healthy chicken stir fry with vegetables",10,15,2,"lunch; dinner","chinese","high_protein","300g chicken breast; 200g mixed vegetables; 2 tbsp soy sauce; 1 tbsp oil; 1 tsp ginger","Cut chicken into strips; Heat oil in wok; Cook chicken until done; Add vegetables; Stir fry for 3-4 minutes; Add sauces","","","admin_import","Keep ingredients prepped before cooking"`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_recipe_import.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Sample downloaded",
      description: "Sample CSV file has been downloaded to help you format your data.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recipe Import</h2>
          <p className="text-muted-foreground">Import recipes from CSV files to the curated collection</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadSampleCSV}>
            <Download className="w-4 h-4 mr-2" />
            Download Sample CSV
          </Button>
          <Button variant="outline" onClick={() => { setShowLogs(!showLogs); if (!showLogs) loadImportLogs(); }}>
            <Clock className="w-4 h-4 mr-2" />
            {showLogs ? 'Hide' : 'Show'} Import History
          </Button>
        </div>
      </div>

      {/* Import Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import CSV File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isImporting && !importResult && (
            <>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {isDragOver ? 'Drop your CSV file here' : 'Drag and drop your CSV file here'}
                </p>
                <p className="text-muted-foreground mb-4">
                  or click to browse files (max 10MB)
                </p>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                >
                  Select CSV File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />
              </div>
              
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Make sure your CSV file follows the exact format from the sample. 
                  All recipes will be added to the curated collection and appear in Discover Recipes.
                </AlertDescription>
              </Alert>
            </>
          )}

          {isImporting && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Importing recipes...</span>
              </div>
              <Progress value={importProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                This may take a few moments depending on the file size.
              </p>
            </div>
          )}

          {importResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {importResult.success ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <X className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  {importResult.success ? 'Import Successful!' : 'Import Completed with Errors'}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{importResult.totalRecords}</div>
                  <div className="text-sm text-muted-foreground">Total Records</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{importResult.successfulImports}</div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{importResult.failedImports}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <X className="w-4 h-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Import Errors:</div>
                    <ul className="text-sm space-y-1">
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>• ... and {importResult.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={() => setImportResult(null)} className="w-full">
                Import Another File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import History */}
      {showLogs && (
        <Card>
          <CardHeader>
            <CardTitle>Import History</CardTitle>
          </CardHeader>
          <CardContent>
            {importLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No import history found.</p>
            ) : (
              <div className="space-y-4">
                {importLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{log.filename}</span>
                      <Badge variant={log.failed_imports === 0 ? "default" : "destructive"}>
                        {log.failed_imports === 0 ? "Success" : "Partial Success"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>Total: {log.total_records}</div>
                      <div className="text-green-600">Success: {log.successful_imports}</div>
                      <div className="text-red-600">Failed: {log.failed_imports}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                    {log.import_notes && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {log.import_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}