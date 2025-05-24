
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ImageSelectionProps {
  websiteImages: string[];
  selectedImage: string;
  onImageSelect: (image: string) => void;
  showImageSelection: boolean;
  onImageUpload: (file: File) => void;
  isGeneratingImage: boolean;
}

export function ImageSelection({
  websiteImages,
  selectedImage,
  onImageSelect,
  showImageSelection,
  onImageUpload,
  isGeneratingImage
}: ImageSelectionProps) {
  return (
    <>
      {/* Website Images Selection */}
      {websiteImages.length > 0 && (
        <div className="space-y-2">
          <Label>Choose an image from the website:</Label>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {websiteImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Website image ${index + 1}`}
                className="w-full h-20 object-cover rounded cursor-pointer border-2 hover:border-terracotta"
                onClick={() => onImageSelect(img)}
              />
            ))}
          </div>
          {selectedImage && (
            <p className="text-sm text-green-600">✓ Image selected</p>
          )}
        </div>
      )}

      {/* Image Upload for Text Input and Upload */}
      {showImageSelection && (
        <div className="space-y-2">
          <Label htmlFor="recipe-image">Add an image to your recipe (optional)</Label>
          <Input
            id="recipe-image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageUpload(file);
            }}
          />
          {selectedImage && (
            <div className="flex items-center gap-2">
              <img src={selectedImage} alt="Recipe" className="w-16 h-16 object-cover rounded" />
              <p className="text-sm text-green-600">✓ Image added</p>
            </div>
          )}
        </div>
      )}

      {/* AI Generated Image Placeholder */}
      {isGeneratingImage && (
        <div className="space-y-2">
          <div className="w-full h-48 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 mx-auto mb-2 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
              <p className="text-sm text-gray-600">🎨 Generating beautiful image...</p>
              <p className="text-xs text-gray-500">This may take a moment</p>
            </div>
          </div>
        </div>
      )}

      {selectedImage && !isGeneratingImage && (
        <div className="space-y-2">
          <Label>Recipe Image</Label>
          <img src={selectedImage} alt="Recipe" className="w-full h-48 object-cover rounded border" />
        </div>
      )}
    </>
  );
}
