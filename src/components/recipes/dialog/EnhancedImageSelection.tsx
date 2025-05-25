import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, CheckCircle } from "lucide-react";

interface StoredImage {
  originalUrl: string;
  storedUrl: string;
  filename: string;
}

interface EnhancedImageSelectionProps {
  images: string[];
  storedImages?: StoredImage[];
  selectedImage: string;
  onImageSelect: (url: string) => void;
  onDownloadImages?: () => void;
  isDownloading?: boolean;
}

export function EnhancedImageSelection({ 
  images, 
  storedImages = [], 
  selectedImage, 
  onImageSelect,
  onDownloadImages,
  isDownloading = false
}: EnhancedImageSelectionProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  if (images.length === 0) return null;

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Select an image for this recipe:</Label>
        {storedImages.length === 0 && images.length > 0 && onDownloadImages && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadImages}
            disabled={isDownloading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download Images'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((imageUrl, index) => {
          const stored = getStoredImage(imageUrl);
          const displayUrl = getDisplayUrl(imageUrl);
          const hasError = imageErrors.has(imageUrl);
          const imageIsStored = isStored(imageUrl);
          
          return (
            <div
              key={index}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === displayUrl
                  ? 'border-terracotta shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onImageSelect(displayUrl)}
            >
              {!hasError ? (
                <img
                  src={displayUrl}
                  alt={`Recipe option ${index + 1}`}
                  className="w-full h-24 object-cover"
                  onError={() => handleImageError(imageUrl)}
                />
              ) : (
                <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-500">Image unavailable</span>
                </div>
              )}

              {/* Status indicators */}
              <div className="absolute top-1 right-1 flex gap-1">
                {imageIsStored ? (
                  <div className="bg-green-500 text-white rounded-full p-1" title="Stored locally">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                ) : (
                  <div className="bg-blue-500 text-white rounded-full p-1" title="External link">
                    <ExternalLink className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* Selection indicator */}
              {selectedImage === displayUrl && (
                <div className="absolute inset-0 bg-terracotta/20 flex items-center justify-center">
                  <div className="bg-terracotta text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    ✓
                  </div>
                </div>
              )}

              {/* Loading indicator for downloading */}
              {isDownloading && !imageIsStored && (
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
          <CheckCircle className="h-3 w-3" />
          {storedImages.length} image{storedImages.length !== 1 ? 's' : ''} saved locally
        </div>
      )}
    </div>
  );
}
