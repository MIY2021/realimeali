
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Globe, ArrowRight } from "lucide-react";

interface StoredImage {
  originalUrl: string;
  storedUrl: string;
  filename: string;
}

interface WebsiteImageSelectionProps {
  websiteImages: string[];
  storedImages: StoredImage[];
  selectedImage: string;
  onImageSelect: (url: string) => void;
  onDownloadImages?: () => void;
  isDownloadingImages: boolean;
  compact?: boolean;
}

export function WebsiteImageSelection({
  websiteImages,
  storedImages,
  selectedImage,
  onImageSelect,
  onDownloadImages,
  isDownloadingImages,
  compact = false
}: WebsiteImageSelectionProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => new Set([...prev, imageUrl]));
  };

  const getStoredImage = (originalUrl: string) => {
    return storedImages.find(stored => stored.originalUrl === originalUrl);
  };

  const getDisplayUrl = (originalUrl: string) => {
    const stored = getStoredImage(originalUrl);
    return stored ? stored.storedUrl : originalUrl;
  };

  const isStored = (originalUrl: string) => {
    return storedImages.some(stored => stored.originalUrl === originalUrl);
  };

  const gridCols = compact ? "grid-cols-3" : "grid-cols-2";
  const imageHeight = compact ? "h-16" : "h-32";

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <span className="text-sm font-medium sm:pr-2">
          {compact ? `Available images from URL (${websiteImages.length}):` : "Select an image for this recipe:"}
        </span>
        {storedImages.length === 0 && onDownloadImages && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadImages}
            disabled={isDownloadingImages}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <ArrowRight className="h-4 w-4" />
            {isDownloadingImages ? 'Downloading...' : 'Download Images'}
          </Button>
        )}
      </div>

      <div className={`grid ${gridCols} gap-${compact ? '2' : '3'}`}>
        {websiteImages.map((imageUrl, index) => {
          const displayUrl = getDisplayUrl(imageUrl);
          const hasError = imageErrors.has(imageUrl);
          const imageIsStored = isStored(imageUrl);
          const isSelected = selectedImage === displayUrl;
          
          return (
            <div
              key={index}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                isSelected
                  ? 'border-terracotta shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onImageSelect(displayUrl)}
            >
              {!hasError ? (
                <img
                  src={displayUrl}
                  alt={`${compact ? 'Option' : 'Recipe option'} ${index + 1}`}
                  className={`w-full ${imageHeight} object-cover`}
                  onError={() => handleImageError(imageUrl)}
                />
              ) : (
                <div className={`w-full ${imageHeight} bg-gray-100 flex items-center justify-center`}>
                  <span className="text-xs text-gray-500">
                    {compact ? 'Error' : 'Image unavailable'}
                  </span>
                </div>
              )}

              {/* Status indicators */}
              <div className={`absolute ${compact ? 'top-1 right-1' : 'top-2 right-2'}`}>
                {imageIsStored ? (
                  <div className="bg-green-500 text-white rounded-full p-1" title="Stored locally">
                    <Check className={`${compact ? 'h-2 w-2' : 'h-3 w-3'}`} />
                  </div>
                ) : (
                  <div className="bg-blue-500 text-white rounded-full p-1" title="External link">
                    <Globe className={`${compact ? 'h-2 w-2' : 'h-3 w-3'}`} />
                  </div>
                )}
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute inset-0 bg-terracotta/20 flex items-center justify-center">
                  <div className="bg-terracotta text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    ✓
                  </div>
                </div>
              )}

              {/* Loading indicator for downloading */}
              {isDownloadingImages && !imageIsStored && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-xs">Saving...</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {storedImages.length > 0 && (
        <div className="text-xs text-green-600 flex items-center gap-1">
          <Check className="h-3 w-3" />
          {storedImages.length} image{storedImages.length !== 1 ? 's' : ''} saved locally
        </div>
      )}
    </div>
  );
}
