
import { Dispatch, SetStateAction } from "react";
import { Label } from "@/components/ui/label";

interface ImageSelectionProps {
  images: string[];
  selectedImage: string;
  onImageSelect: Dispatch<SetStateAction<string>>;
}

export function ImageSelection({ images, selectedImage, onImageSelect }: ImageSelectionProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Select an image for this recipe:</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === imageUrl
                ? 'border-terracotta shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onImageSelect(imageUrl)}
          >
            <img
              src={imageUrl}
              alt={`Recipe option ${index + 1}`}
              className="w-full h-24 object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            {selectedImage === imageUrl && (
              <div className="absolute inset-0 bg-terracotta/20 flex items-center justify-center">
                <div className="bg-terracotta text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  ✓
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
