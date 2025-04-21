import { UtensilsCrossed, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { mockRecipes } from "@/data/recipes";
import { RecipeCategory } from "@/types";

const Footer = () => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  // Bulk Import handler matches RecipesPage
  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        try {
          const rows = results.data as string[][];
          const [headers, ...dataRows] = rows;
          const headerMap: Record<string, number> = {};
          headers.forEach((h, idx) => {
            headerMap[h.trim()] = idx;
          });
          const newRecipes = dataRows
            .filter(r => r.length > 1 && !!r[headerMap.title])
            .map((r, i) => {
              let categories: RecipeCategory[] = [];
              if (headerMap.categories !== undefined && r[headerMap.categories]) {
                categories = r[headerMap.categories].split(",").map((c) => c.trim()) as RecipeCategory[];
              }
              return {
                id: `imported-${Date.now()}-${i}`,
                title: r[headerMap.title] || "Untitled",
                description: r[headerMap.description] || "",
                ingredients: (r[headerMap.ingredients] || "").split("|").map(s => s.trim()).filter(Boolean),
                instructions: (r[headerMap.instructions] || "").split("|").map(s => s.trim()).filter(Boolean),
                categories: categories.filter((c): c is RecipeCategory => !!c && [
                  "Bulk",
                  "Easy",
                  "Cheap",
                  "Healthy",
                  "Vegetarian",
                  "Fish",
                  "Super Tasty",
                  "Pasta",
                  "Tapas",
                  "Winter",
                  "BBQ",
                  "Faffy",
                  "Pricey!",
                  "Not Yet Made"
                ].includes(c)),
                prepTime: parseInt(r[headerMap.prepTime] || "0", 10),
                cookTime: parseInt(r[headerMap.cookTime] || "0", 10),
                servings: parseInt(r[headerMap.servings] || "1", 10),
                image: r[headerMap.image],
                createdBy: "user-1",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isFavorite: r[headerMap.isFavorite]?.toLowerCase() === "true",
              };
            });
          toast({
            title: "Recipes Imported",
            description: `${newRecipes.length} recipes have been imported from CSV.`,
          });
        } catch (error) {
          toast({
            title: "Import Error",
            description: "Failed to parse or import CSV. Please check your file.",
            variant: "destructive",
          });
        }
      },
      error: () => {
        toast({
          title: "Import Error",
          description: "An error occurred while reading the file.",
          variant: "destructive",
        });
      },
      skipEmptyLines: true,
    });
  };

  return (
    <footer className="bg-cream border-t py-8">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <UtensilsCrossed className="h-5 w-5 text-terracotta" />
            <span className="text-lg font-bold text-navy">Family Food Feed</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4 md:mb-0">
            <Link to="/recipes" className="text-navy hover:text-terracotta transition-colors">
              Recipes
            </Link>
            <Link to="/meal-planner" className="text-navy hover:text-terracotta transition-colors">
              Meal Planner
            </Link>
            <Link to="/login" className="text-navy hover:text-terracotta transition-colors">
              Login
            </Link>
          </nav>
          
          <div className="text-sm text-navy/60">
            © {new Date().getFullYear()} Family Food Feed
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center"
            onClick={() => {
              setIsImportDialogOpen(true);
              if (inputRef.current) {
                inputRef.current.value = "";
              }
            }}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Bulk Import Recipes
          </Button>
        </div>
      </div>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Recipes from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground mb-2">
              Upload a CSV file with your recipes. The file should have the following columns:
              title, description, ingredients, instructions, categories, prepTime, cookTime, servings, imageUrl
            </div>
            <div className="flex items-center justify-center border-2 border-dashed rounded-md p-6">
              <label className="flex flex-col items-center gap-2 cursor-pointer">
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                <span className="text-sm font-medium">Upload CSV File</span>
                <span className="text-xs text-muted-foreground">Click to browse</span>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleBulkImport}
                />
              </label>
            </div>
            <div className="text-xs text-muted-foreground">
              Maximum file size: 5MB. Supported format: CSV
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
};

export default Footer;
