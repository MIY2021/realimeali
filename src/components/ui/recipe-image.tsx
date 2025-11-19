
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
  fixedSize?: boolean; // Skip AspectRatio wrapper for consistent heights in lists
}

export function RecipeImage({ recipe, useThumbnail = false, alt, className, imgClassName, iconSize = "h-8 w-8", onClick, clickable, width = 80, height = 80, fixedSize = false }: RecipeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [placeholderError, setPlaceholderError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  const imageAlt = alt || recipe?.title || "Recipe image";
  
  // Debug logging
  if (recipe?.title?.includes('Jerk Chicken') || recipe?.title?.includes('Stifado')) {
    console.log('🖼️ RecipeImage Debug:', {
      title: recipe.title,
      useThumbnail,
      image: recipe?.image,
      image_thumbnail: (recipe as any)?.image_thumbnail,
      placeholderPath: '/lovable-uploads/ee0bb47d-e780-4d0c-bbcb-9406228849f4.png'
    });
  }
  
  // Use thumbnail for list views, full image for detail views
  // FALLBACK: If thumbnail is missing, use full image
  const imageUrl = useThumbnail 
    ? ((recipe as any)?.image_thumbnail || recipe?.image)
    : recipe?.image;
    
  // Additional debug
  if (recipe?.title?.includes('Jerk Chicken') || recipe?.title?.includes('Stifado')) {
    console.log('🖼️ Final imageUrl:', imageUrl);
  }

  // Handle cached images - ensure fade-in is visible
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalHeight !== 0) {
      // Image is cached, add delay to ensure fade-in is visible
      const timer = setTimeout(() => {
        setImageLoading(false);
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [imageUrl]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handlePlaceholderError = () => {
    setImageLoading(false);
    setPlaceholderError(true);
  };

  // Render recipe image if available and not errored
  if (imageUrl && !imageError) {
    // For fixed size mode (meal planner lists), skip AspectRatio wrapper
    if (fixedSize) {
      return (
        <div className={cn("relative overflow-hidden rounded-lg bg-muted w-full h-full", className)}>
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
        </div>
      );
    }
    
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
    if (fixedSize) {
      return (
        <div className={cn("relative overflow-hidden rounded-lg bg-muted w-full h-full", className)}>
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
        </div>
      );
    }
    
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
  if (fixedSize) {
    return (
      <div className={cn("flex items-center justify-center bg-muted rounded-lg w-full h-full", className)}>
        <UtensilsCrossed className={cn("text-muted-foreground", iconSize)} />
      </div>
    );
  }
  
  return (
    <AspectRatio ratio={4 / 3} className="relative">
      <div className={cn("flex items-center justify-center bg-muted rounded-lg w-full h-full", className)}>
        <UtensilsCrossed className={cn("text-muted-foreground", iconSize)} />
      </div>
    </AspectRatio>
  );
}
