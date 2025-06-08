
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Camera, Star } from "lucide-react";
import { DragDropZone } from "./DragDropZone";

interface ImageUploadInterfaceProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateImage: () => void;
  isGenerating: boolean;
  generationProgress: string;
  recipeTitle: string;
  hasWebsiteImages: boolean;
  onBackToImages?: () => void;
}

export function ImageUploadInterface({
  onFileChange,
  onGenerateImage,
  isGenerating,
  generationProgress,
  recipeTitle,
  hasWebsiteImages,
  onBackToImages
}: ImageUploadInterfaceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClickToUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {hasWebsiteImages && onBackToImages && (
        <div className="flex items-center justify-between mb-3">
          <Button
            onClick={onBackToImages}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to imported images
          </Button>
        </div>
      )}

      <DragDropZone onFileSelect={(file) => {
        // Handle file selection through drag and drop
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;
          
          // Create a synthetic event
          const syntheticEvent = {
            target: fileInputRef.current,
            currentTarget: fileInputRef.current,
          } as React.ChangeEvent<HTMLInputElement>;
          
          onFileChange(syntheticEvent);
        }
      }} onClick={handleClickToUpload} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
            id="recipe-image-upload"
          />
          <label
            htmlFor="recipe-image-upload"
            className="w-full cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </label>
        </div>

        <Button
          onClick={onGenerateImage}
          disabled={isGenerating || !recipeTitle.trim()}
          variant="outline"
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Star className="h-4 w-4 mr-2 animate-spin" />
              {generationProgress || "Generating..."}
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Generate with AI
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        💡 Tip: High-quality images make your recipes more appealing and easier to follow.
      </p>
    </div>
  );
}
