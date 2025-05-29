
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";

export const FindRecipesContent = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  if (!user) {
    return (
      <div className="py-10 text-center px-4">
        <p className="text-muted-foreground mb-4">Please log in to access recipes.</p>
      </div>
    );
  }

  if (!currentHousehold) {
    return (
      <div className="py-10 text-center px-4">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-navy mb-2">No Household Selected</h2>
          <p className="text-muted-foreground mb-6">
            You need to create or join a household to access recipes.
          </p>
          <Button asChild className="bg-terracotta hover:bg-terracotta/90">
            <Link to="/household">
              Manage Household
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-navy mb-4">Discover Your Recipes</h2>
        <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
          Create and organize your own recipe collection. Start by adding your first recipe!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild className="bg-terracotta hover:bg-terracotta/90">
            <Link to="/create-recipe">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Recipe
            </Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link to="/my-recipes">
              <Search className="h-4 w-4 mr-2" />
              Browse My Recipes
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Create recipes manually or import from websites</li>
          <li>• Organize recipes by meal type, cuisine, and dietary preferences</li>
          <li>• Add recipes to your meal planner</li>
          <li>• Generate shopping lists from your meal plans</li>
          <li>• Share recipes with your household members</li>
        </ul>
      </div>
    </div>
  );
};
