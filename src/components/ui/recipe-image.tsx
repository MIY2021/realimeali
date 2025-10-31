
import { useState, useEffect, useRef } from "react";
import { UtensilsCrossed } from "lucide-react";
import { Recipe } from "@/types";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";

interface RecipeImageProps {
  recipe?: Recipe;
  useThumbnail?: boolean;
  alt?: string;
  className?: string;
  imgClassName?: string;
  iconSize?: string;
  onClick?: () => void;
  clickable?: boolean;
  width?: number;
  height?: number;
}

export function RecipeImage({ recipe, useThumbnail = false, alt, className, imgClassName, iconSize = "h-8 w-8", onClick, clickable, width = 80, height = 80 }: RecipeImageProps) {
  const [thumbnailError, setThumbnailError] = useState(false);
  const [fullImageError, setFullImageError] = useState(false);
  const [placeholderError, setPlaceholderError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

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

  // Handle cached images - ensure fade-in is visible
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalHeight !== 0) {
      // Image is cached, add small delay to ensure fade-in is visible
      const timer = setTimeout(() => {
        setImageLoading(false);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [imageUrl]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    if (isUsingThumbnail) {
      setThumbnailError(true);
    } else {
      setFullImageError(true);
    }
  };

  const handlePlaceholderError = () => {
    setImageLoading(false);
    setPlaceholderError(true);
  };

  // Try to render recipe image
  if (imageUrl) {
    return (
      <AspectRatio ratio={4 / 3} className="relative overflow-hidden rounded-lg bg-muted">
        {imageLoading && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <img
          ref={imgRef}
          src={imageUrl}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          className={cn(
            "w-full h-full object-cover",
            "transition-opacity duration-300",
            imageLoading ? "opacity-0" : "opacity-100",
            clickable && "cursor-pointer hover:brightness-95",
            imgClassName
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onClick={onClick}
        />
      </AspectRatio>
    );
  }

  // If recipe image failed or doesn't exist, try the uploaded placeholder
  if (!placeholderError) {
    return (
      <AspectRatio ratio={4 / 3} className="relative overflow-hidden rounded-lg bg-muted">
        {imageLoading && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <img
          ref={imgRef}
          src="/lovable-uploads/ee0bb47d-e780-4d0c-bbcb-9406228849f4.png"
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          className={cn(
            "w-full h-full object-cover",
            "transition-opacity duration-300",
            imageLoading ? "opacity-0" : "opacity-100",
            imgClassName
          )}
          onLoad={handleImageLoad}
          onError={handlePlaceholderError}
        />
      </AspectRatio>
    );
  }

  // Final fallback: UtensilsCrossed icon
  return (
    <AspectRatio ratio={4 / 3} className="relative">
      <div className={cn("flex items-center justify-center bg-muted rounded-lg w-full h-full", className)}>
        <UtensilsCrossed className={cn("text-muted-foreground", iconSize)} />
      </div>
    </AspectRatio>
  );
}
