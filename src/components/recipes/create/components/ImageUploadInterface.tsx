
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
            className="w-full h-10 cursor-pointer inline-flex items-center justify-center rounded-[10px] text-sm font-medium border border-[#E3E3E3] bg-white hover:bg-sage/5 hover:border-sage transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </label>
        </div>

        <Button
          onClick={onGenerateImage}
          disabled={isGenerating || !recipeTitle.trim()}
          className="w-full h-10 rounded-[10px] bg-[#CFE6D6] hover:bg-[#B8D9C5] text-[#1A1A1A]"
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

      <p className="text-[10px] sm:text-xs text-[#6B6B6B] leading-tight flex items-start gap-1.5">
        <span className="text-sm">💡</span>
        <span>High-quality images make your recipes more appealing and easier to follow.</span>
      </p>
    </div>
  );
}
