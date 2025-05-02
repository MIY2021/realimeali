
import { useState } from "react";
import { Link } from "react-router-dom";
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowDownAZ, ArrowUpAZ } from "lucide-react";

interface RecipeListProps {
  recipes: Recipe[];
  onAddToMealPlan?: (recipe: Recipe) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, onAddToMealPlan }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();
    return sortOrder === "asc" ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            {sortOrder === "asc" ? (
              <ArrowDownAZ className="mr-2 h-4 w-4" />
            ) : (
              <ArrowUpAZ className="mr-2 h-4 w-4" />
            )}
            Sort
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedRecipes.map((recipe) => (
          <Link to={`/recipes/${recipe.id}`} key={recipe.id}>
            <Card className="bg-white shadow-md rounded-md">
              <CardHeader>
                <CardTitle>{recipe.title}</CardTitle>
                <CardDescription>
                  {recipe.categories.map((category) => (
                    <Badge key={category} variant="secondary" className="mr-1">
                      {category}
                    </Badge>
                  ))}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-w-16 aspect-h-9 mb-3">
                  {recipe.image ? (
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="object-cover rounded-md w-full h-full"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <div className="bg-gray-100 rounded-md w-full h-full flex items-center justify-center">
                      No Image
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">{recipe.description}</p>
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                {recipe.prepTime + recipe.cookTime} min
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecipeList;
