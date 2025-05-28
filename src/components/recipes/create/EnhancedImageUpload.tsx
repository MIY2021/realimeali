import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Camera, Sparkles, X, FileImage } from "lucide-react";

interface EnhancedImageUploadProps {
  imagePreview: string | null;
  isGeneratingImage: boolean;
  generationProgress: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateImage: () => void;
  recipeTitle: string;
}

export function EnhancedImageUpload({
  imagePreview,
  isGeneratingImage,
  generationProgress,
  onImageChange,
  onGenerateImage,
  recipeTitle
}: EnhancedImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        // Create a proper synthetic event by updating the file input
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;
          
          // Create a proper synthetic event
          const event = new Event('change', { bubbles: true });
          Object.defineProperty(event, 'target', {
            writable: false,
            value: fileInputRef.current
          });
          onImageChange(event as React.ChangeEvent<HTMLInputElement>);
        }
      }
    }
  };

  const handleRemoveImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      // Create a proper change event
      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        writable: false,
        value: fileInputRef.current
      });
      onImageChange(event as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Recipe Image</h3>
      
      {imagePreview ? (
        <div className="relative group">
          <img
            src={imagePreview}
            alt="Recipe preview"
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveImage}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Drag and drop an image here, or click to select
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Supports JPG, PNG, GIF up to 10MB
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="hidden"
            id="recipe-image-upload"
          />
          <label
            htmlFor="recipe-image-upload"
            className="w-full cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            {imagePreview ? 'Replace Image' : 'Upload Image'}
          </label>
        </div>

        <Button
          onClick={onGenerateImage}
          disabled={isGeneratingImage || !recipeTitle.trim()}
          variant="outline"
          className="w-full"
        >
          {isGeneratingImage ? (
            <>
              <Camera className="h-4 w-4 mr-2 animate-pulse" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </>
          )}
        </Button>
      </div>

      {isGeneratingImage && generationProgress && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 flex items-center">
            <Sparkles className="h-4 w-4 mr-2 animate-spin" />
            {generationProgress}
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        💡 Tip: High-quality images make your recipes more appealing and easier to follow.
      </p>
    </Card>
  );
}
