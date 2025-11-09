import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Eye, Plus, Check } from "lucide-react";
import { EdamamRecipe } from "@/types/edamam";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalSiteDialog } from "./ExternalSiteDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExternalRecipeCardProps {
  recipe: EdamamRecipe;
  mobileLayout?: string;
  addedRecipeUrls: Set<string>;
  onRecipeAdded: (url: string) => void;
}

export function ExternalRecipeCard({ recipe, mobileLayout = "1", addedRecipeUrls, onRecipeAdded }: ExternalRecipeCardProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const isAdded = addedRecipeUrls.has(recipe.url);

  const handleViewRecipe = () => {
    setShowConfirmDialog(true);
  };

  const handleOpenExternal = () => {
    sessionStorage.setItem('pendingRecipeImport', JSON.stringify({
      url: recipe.url,
      title: recipe.label,
      image: recipe.image,
      timestamp: Date.now()
    }));
    window.open(recipe.url, '_blank');
    setShowConfirmDialog(false);
  };

  const handleAddRecipe = () => {
    navigate(`/my-recipes/new?url=${encodeURIComponent(recipe.url)}&tab=url`);
    onRecipeAdded(recipe.url);
  };

  // Format cooking time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Determine if we should use compact layout (mobile two-column layout)
  const isCompactLayout = isMobile && mobileLayout === '2';
  
  // Get intro text from ingredient lines (first few ingredients as description)
  const introText = recipe.ingredientLines?.slice(0, 3).join(', ');

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden h-full flex flex-col">
          {/* Image Container - Use aspect-[4/3] for one-column mobile, aspect-[4/3] for two-column */}
          <div 
            className={`relative cursor-pointer overflow-hidden ${
              isMobile && mobileLayout === '1' ? 'aspect-[4/3]' : 'aspect-[4/3]'
            }`}
        onClick={handleViewRecipe}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleViewRecipe(); } }}
      >
        <img
          src={recipe.image}
          alt={recipe.label}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          onLoad={() => setImageLoading(false)}
        />
        {/* External badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-surface/90 text-content-primary text-xs font-medium">
            External
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 
          className="font-semibold text-lg mb-2 line-clamp-2 cursor-pointer hover:underline"
          onClick={handleViewRecipe}
        >
          {recipe.label}
        </h3>
        
        {/* Description/Intro text with dynamic truncation */}
        {introText && (
          <p 
            className="text-sm text-muted-foreground mb-3 flex-1"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: isCompactLayout ? 1 : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: '1.4em',
              maxHeight: isCompactLayout ? '1.4em' : '2.8em'
            }}
          >
            {introText}
          </p>
        )}
        
        {/* Recipe Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {recipe.totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(recipe.totalTime)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.yield}</span>
          </div>
        </div>
        
        {/* Source */}
        <div className="mt-auto">
          <p className="text-xs text-muted-foreground mb-2">
            Source: {recipe.source}
          </p>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleViewRecipe}
              variant="outline"
              className="flex-1 h-9 text-sm"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            <Button 
              onClick={handleAddRecipe}
              disabled={isAdded}
              className="flex-1 h-9 text-sm"
              style={{ backgroundColor: isAdded ? '#E8E8E8' : '#81b29a' }}
            >
              {isAdded ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  In My Recipes
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>View Recipe on External Site</AlertDialogTitle>
          <AlertDialogDescription>
            You're about to view this recipe on an external website. When you return, we'll ask if you'd like to add it to your collection.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleOpenExternal} className="bg-[#48A97D]">
              Continue to Recipe
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* External Site Dialog */}
      <ExternalSiteDialog
        recipe={recipe}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
}
