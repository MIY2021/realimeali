
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Recipe, MealType } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SimpleMealSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onAddFreetypeMeal: (mealName: string) => void;
  mealType: MealType;
}

export const SimpleMealSelectionDialog = ({
  isOpen,
  onClose,
  recipes,
  onSelectRecipe,
  onAddFreetypeMeal,
  mealType,
}: SimpleMealSelectionDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [freetypeMealName, setFreetypeMealName] = useState("");
  const [isAddingFreetype, setIsAddingFreetype] = useState(false);

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFreetypeMeal = async () => {
    if (!freetypeMealName.trim()) return;
    
    setIsAddingFreetype(true);
    try {
      await onAddFreetypeMeal(freetypeMealName.trim());
      setFreetypeMealName("");
      onClose();
    } catch (error) {
      console.error("Error adding freetyped meal:", error);
    } finally {
      setIsAddingFreetype(false);
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setFreetypeMealName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Meal to {mealType}</DialogTitle>
          <DialogDescription>
            Choose a recipe from your collection or add a custom meal.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="recipes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recipes">From Recipes</TabsTrigger>
            <TabsTrigger value="custom">Custom Meal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recipes" className="space-y-4">
            <div className="space-y-4">
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {filteredRecipes.length > 0 ? (
                  filteredRecipes.map((recipe) => (
                    <Card
                      key={recipe.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        onSelectRecipe(recipe);
                        handleClose();
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{recipe.title}</h3>
                            {recipe.description && (
                              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                {recipe.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{recipe.servings} servings</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {recipe.meal_type && (
                              <Badge variant="secondary" className="text-xs">
                                {recipe.meal_type}
                              </Badge>
                            )}
                            {recipe.complexity_level && (
                              <Badge variant="outline" className="text-xs">
                                {recipe.complexity_level.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No recipes found matching your search." : "No recipes available."}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Add a custom meal like "Tesco Ready Meal", "Pizza Delivery", or "Leftover Pasta".
              </div>
              
              <div className="space-y-3">
                <Input
                  placeholder="Enter meal name..."
                  value={freetypeMealName}
                  onChange={(e) => setFreetypeMealName(e.target.value)}
                  maxLength={100}
                  className="w-full"
                />
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddFreetypeMeal}
                    disabled={!freetypeMealName.trim() || isAddingFreetype}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {isAddingFreetype ? "Adding..." : "Add Custom Meal"}
                  </Button>
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
