
import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { Recipe } from "@/types";
import { cn } from "@/lib/utils";

interface RecipeImageProps {
  recipe?: Recipe;
  alt?: string;
  className?: string;
  iconSize?: string;
  onClick?: () => void;
  clickable?: boolean;
  width?: number;
  height?: number;
}

export function RecipeImage({ recipe, alt, className, iconSize = "h-8 w-8", onClick, clickable, width = 80, height = 80 }: RecipeImageProps) {
  const [imgError, setImgError] = useState(false);
  const [placeholderError, setPlaceholderError] = useState(false);

  const imageAlt = alt || recipe?.title || "Recipe image";

  // If we have a recipe image and no error, show it
  if (recipe?.image && !imgError) {
    return (
      <img
        src={recipe.image}
        alt={imageAlt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={cn("object-cover", clickable && "cursor-pointer hover:brightness-95 transition-all", className)}
        onError={() => setImgError(true)}
        onClick={onClick}
      />
    );
  }

  // If recipe image failed or doesn't exist, try the uploaded placeholder
  if (!placeholderError) {
    return (
      <img
        src="/lovable-uploads/ee0bb47d-e780-4d0c-bbcb-9406228849f4.png"
        alt={imageAlt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={cn("object-cover bg-muted", className)}
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
