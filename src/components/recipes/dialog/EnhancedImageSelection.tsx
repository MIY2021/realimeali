
import { Button } from "@/components/ui/button";

interface EnhancedImageSelectionProps {
  images: string[];
  storedImages: string[];
  selectedImage: string;
  onImageSelect: (url: string) => void;
  onDownloadImages: () => void;
  isDownloading: boolean;
}

export function EnhancedImageSelection({
  images,
  storedImages,
  selectedImage,
  onImageSelect,
  onDownloadImages,
  isDownloading,
}: EnhancedImageSelectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Recipe Image</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative cursor-pointer border-2 rounded-lg overflow-hidden ${
              selectedImage === image ? 'border-blue-500' : 'border-gray-200'
            }`}
            onClick={() => onImageSelect(image)}
          >
            <img
              src={image}
              alt={`Recipe option ${index + 1}`}
              className="w-full h-32 object-cover"
            />
          </div>
        ))}
      </div>
      {images.length > 0 && (
        <Button
          onClick={onDownloadImages}
          disabled={isDownloading}
          variant="outline"
        >
          {isDownloading ? "Downloading..." : "Download Images"}
        </Button>
      )}
    </div>
  );
}
