
import { UtensilsCrossed, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real app, you would process the CSV file here
    // For this demo, we'll just show a success toast
    toast({
      title: "Import Successful",
      description: `${file.name} has been imported successfully`,
    });
    
    setIsImportDialogOpen(false);
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
            onClick={() => setIsImportDialogOpen(true)}
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
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
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
