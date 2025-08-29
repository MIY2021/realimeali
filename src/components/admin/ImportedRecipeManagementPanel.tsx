import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Trash2, 
  Star, 
  Eye, 
  MoreHorizontal,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  fetchImportedRecipesWithTotal,
  deleteImportedRecipe,
  deleteAllImportedRecipes,
  toggleImportedRecipeFeatured,
  bulkDeleteImportedRecipes,
  bulkToggleFeatured,
  ImportedRecipe,
  ImportedRecipeFilters
} from '@/services/importedRecipeService';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function ImportedRecipeManagementPanel() {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<ImportedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Load recipes
  const loadRecipes = async () => {
    try {
      setLoading(true);
      const filters: ImportedRecipeFilters = {
        keyword: searchTerm || undefined,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize
      };

      const result = await fetchImportedRecipesWithTotal(filters);
      
      // Apply featured filter on frontend for simplicity
      let filteredRecipes = result.recipes;
      if (featuredFilter === 'featured') {
        filteredRecipes = result.recipes.filter(r => r.is_featured);
      } else if (featuredFilter === 'not-featured') {
        filteredRecipes = result.recipes.filter(r => !r.is_featured);
      }

      setRecipes(filteredRecipes);
      setTotal(result.total);
      setSelectedRecipes(new Set());
    } catch (error) {
      console.error('Error loading recipes:', error);
      toast({
        title: "Error loading recipes",
        description: "Failed to load imported recipes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [searchTerm, featuredFilter, currentPage]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
      loadRecipes();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDeleteRecipe = async (id: string) => {
    try {
      await deleteImportedRecipe(id);
      toast({
        title: "Recipe deleted",
        description: "The recipe has been successfully deleted.",
      });
      loadRecipes();
    } catch (error) {
      toast({
        title: "Error deleting recipe",
        description: "Failed to delete the recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const newStatus = await toggleImportedRecipeFeatured(id);
      toast({
        title: newStatus ? "Recipe featured" : "Recipe unfeatured",
        description: `The recipe has been ${newStatus ? 'added to' : 'removed from'} featured recipes.`,
      });
      loadRecipes();
    } catch (error) {
      toast({
        title: "Error updating recipe",
        description: "Failed to update the recipe status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllImportedRecipes();
      toast({
        title: "All recipes deleted",
        description: "All imported recipes have been successfully deleted.",
      });
      loadRecipes();
    } catch (error) {
      toast({
        title: "Error deleting recipes",
        description: "Failed to delete all recipes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRecipes.size === 0) return;
    
    try {
      await bulkDeleteImportedRecipes(Array.from(selectedRecipes));
      toast({
        title: "Recipes deleted",
        description: `Successfully deleted ${selectedRecipes.size} recipes.`,
      });
      loadRecipes();
    } catch (error) {
      toast({
        title: "Error deleting recipes",
        description: "Failed to delete selected recipes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkToggleFeatured = async (featured: boolean) => {
    if (selectedRecipes.size === 0) return;
    
    try {
      await bulkToggleFeatured(Array.from(selectedRecipes), featured);
      toast({
        title: `Recipes ${featured ? 'featured' : 'unfeatured'}`,
        description: `Successfully updated ${selectedRecipes.size} recipes.`,
      });
      loadRecipes();
    } catch (error) {
      toast({
        title: "Error updating recipes",
        description: "Failed to update selected recipes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleSelectRecipe = (id: string) => {
    const newSelected = new Set(selectedRecipes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecipes(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRecipes.size === recipes.length) {
      setSelectedRecipes(new Set());
    } else {
      setSelectedRecipes(new Set(recipes.map(r => r.id)));
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage Imported Recipes</h2>
          <p className="text-muted-foreground">View and manage all imported recipes ({total} total)</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete All Imported Recipes</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all {total} imported recipes. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground">
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipes by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recipes</SelectItem>
                <SelectItem value="featured">Featured Only</SelectItem>
                <SelectItem value="not-featured">Not Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedRecipes.size > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedRecipes.size} recipe{selectedRecipes.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" variant="outline" onClick={() => handleBulkToggleFeatured(true)}>
                  <Star className="w-4 h-4 mr-1" />
                  Feature
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkToggleFeatured(false)}>
                  <Star className="w-4 h-4 mr-1" />
                  Unfeature
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Recipes</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {selectedRecipes.size} selected recipes. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">
                        Delete Selected
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipes Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-2">Loading recipes...</span>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recipes found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRecipes.size === recipes.length && recipes.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipes.map((recipe) => (
                    <TableRow key={recipe.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRecipes.has(recipe.id)}
                          onCheckedChange={() => toggleSelectRecipe(recipe.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{recipe.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {recipe.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={recipe.is_featured ? "default" : "outline"}>
                          {recipe.is_featured ? "Featured" : "Standard"}
                        </Badge>
                      </TableCell>
                      <TableCell>{recipe.view_count}</TableCell>
                      <TableCell>{recipe.add_count}</TableCell>
                      <TableCell>{new Date(recipe.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(`/discover-recipe/${recipe.id}`, '_blank')}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Recipe
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleFeatured(recipe.id)}>
                              {recipe.is_featured ? (
                                <>
                                  <Star className="w-4 h-4 mr-2" />
                                  Remove from Featured
                                </>
                              ) : (
                                <>
                                  <Star className="w-4 h-4 mr-2" />
                                  Add to Featured
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteRecipe(recipe.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Recipe
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, total)} of {total} recipes
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}