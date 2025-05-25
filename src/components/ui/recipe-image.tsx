
import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { Recipe } from "@/types";
import { cn } from "@/lib/utils";

interface RecipeImageProps {
  recipe?: Recipe;
  alt?: string;
  className?: string;
  iconSize?: string;
}

export function RecipeImage({ recipe, alt, className, iconSize = "h-8 w-8" }: RecipeImageProps) {
  const [imgError, setImgError] = useState(false);
  const [placeholderError, setPlaceholderError] = useState(false);

  const imageAlt = alt || recipe?.title || "Recipe image";

  // If we have a recipe image and no error, show it
  if (recipe?.image && !imgError) {
    return (
      <img
        src={recipe.image}
        alt={imageAlt}
        className={cn("object-cover", className)}
        onError={() => setImgError(true)}
      />
    );
  }

  // If recipe image failed, try placeholder.svg
  if (!placeholderError) {
    return (
      <img
        src="/placeholder.svg"
        alt={imageAlt}
        className={cn("object-cover", className)}
        onError={() => setPlaceholderError(true)}
      />
    );
  }

  // Final fallback: UtensilsCrossed icon
  return (
    <div className={cn("flex items-center justify-center bg-muted", className)}>
      <UtensilsCrossed className={cn("text-muted-foreground", iconSize)} />
    </div>
  );
}
