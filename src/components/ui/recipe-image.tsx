
import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { Recipe } from "@/types";
import { cn } from "@/lib/utils";

interface RecipeImageProps {
  recipe?: Recipe;
  useThumbnail?: boolean;
  alt?: string;
  className?: string;
  iconSize?: string;
  onClick?: () => void;
  clickable?: boolean;
  width?: number;
  height?: number;
}

export function RecipeImage({ recipe, useThumbnail = false, alt, className, iconSize = "h-8 w-8", onClick, clickable, width = 80, height = 80 }: RecipeImageProps) {
  const [thumbnailError, setThumbnailError] = useState(false);
  const [fullImageError, setFullImageError] = useState(false);
  const [placeholderError, setPlaceholderError] = useState(false);

  const imageAlt = alt || recipe?.title || "Recipe image";
  
  // Determine which image to show with proper fallback chain
  let imageUrl: string | undefined;
  let isUsingThumbnail = false;
  
  if (useThumbnail && (recipe as any)?.image_thumbnail && !thumbnailError) {
    imageUrl = (recipe as any).image_thumbnail;
    isUsingThumbnail = true;
  } else if (recipe?.image && !fullImageError) {
    imageUrl = recipe.image;
    isUsingThumbnail = false;
  }

  // Try to render recipe image
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={imageAlt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={cn("object-cover", clickable && "cursor-pointer hover:brightness-95 transition-all", className)}
        onError={() => {
          if (isUsingThumbnail) {
            setThumbnailError(true);
          } else {
            setFullImageError(true);
          }
        }}
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
