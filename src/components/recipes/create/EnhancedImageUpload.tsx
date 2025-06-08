
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Camera, Star } from "lucide-react";
import { ImagePreviewDisplay } from "./components/ImagePreviewDisplay";
import { WebsiteImageSelection } from "./components/WebsiteImageSelection";
import { ImageUploadInterface } from "./components/ImageUploadInterface";

interface StoredImage {
  originalUrl: string;
  storedUrl: string;
  filename: string;
}

interface EnhancedImageUploadProps {
  imagePreview: string | null;
  isGenerating: boolean;
  generationProgress: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateImage: () => void;
  recipeTitle: string;
  websiteImages?: string[];
  storedImages?: StoredImage[];
  selectedImage?: string;
  onImageSelect?: (url: string) => void;
  onDownloadImages?: () => void;
  isDownloadingImages?: boolean;
}

export function EnhancedImageUpload({
  imagePreview,
  isGenerating,
  generationProgress,
  onImageChange,
  onGenerateImage,
  recipeTitle,
  websiteImages = [],
  storedImages = [],
  selectedImage = "",
  onImageSelect,
  onDownloadImages,
  isDownloadingImages = false
}: EnhancedImageUploadProps) {
  const [showUploadMode, setShowUploadMode] = useState(false);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasWebsiteImages = websiteImages.length > 0;
  // IMPORTANT: Prioritize local preview first, then uploaded image preview, then selected image from website
  const currentImage = localImagePreview || imagePreview || selectedImage;

  console.log('EnhancedImageUpload Debug:', {
    localImagePreview: localImagePreview ? 'has local preview' : 'no local preview',
    imagePreview: imagePreview ? 'has preview' : 'no preview',
    selectedImage: selectedImage ? 'has selected' : 'no selected',
    currentImage: currentImage ? 'has current' : 'no current',
    showUploadMode
  });

  const createImagePreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('Created local image preview:', result ? 'success' : 'failed');
      setLocalImagePreview(result);
      setShowUploadMode(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', e.target.files);
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log('Processing file:', file.name);
      
      // Create immediate preview
      createImagePreview(file);
      
      // Clear website image selection when uploading manually
      if (onImageSelect) {
        onImageSelect('');
      }
    } else {
      // If no file, clear local preview
      setLocalImagePreview(null);
    }
    
    // Always call the parent handler to ensure the file is processed properly
    onImageChange(e);
  };

  const handleRemoveImage = () => {
    console.log('Removing image');
    setLocalImagePreview(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      // Create a proper React change event for clearing
      const syntheticEvent = {
        target: fileInputRef.current,
        currentTarget: fileInputRef.current,
        bubbles: true,
        cancelable: true,
        timeStamp: Date.now(),
        defaultPrevented: false,
        isTrusted: true,
        nativeEvent: new Event('change') as any,
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        persist: () => {},
        preventDefault: () => {},
        stopPropagation: () => {},
        type: 'change'
      } as React.ChangeEvent<HTMLInputElement>;
      
      onImageChange(syntheticEvent);
    }
    if (onImageSelect) {
      onImageSelect('');
    }
  };

  const handleUploadClick = () => {
    setShowUploadMode(true);
  };

  const handleWebsiteImageSelect = (imageUrl: string) => {
    if (onImageSelect) {
      onImageSelect(imageUrl);
      // Clear any uploaded image when selecting from website
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setLocalImagePreview(null);
    }
  };

  // Show current image if available (uploaded image takes priority)
  if (currentImage && !showUploadMode) {
    return (
      <div className="space-y-4">
        <ImagePreviewDisplay
          currentImage={currentImage}
          onChangeImage={handleUploadClick}
          onRemoveImage={handleRemoveImage}
        />

        {/* Show website images only if we don't have an uploaded image and there are website images */}
        {hasWebsiteImages && !localImagePreview && !imagePreview && (
          <div className="space-y-3">
            <WebsiteImageSelection
              websiteImages={websiteImages}
              storedImages={storedImages}
              selectedImage={selectedImage}
              onImageSelect={handleWebsiteImageSelect}
              onDownloadImages={onDownloadImages}
              isDownloadingImages={isDownloadingImages}
              compact={true}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={handleUploadClick}
            variant="outline"
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Different Image
          </Button>

          <Button
            onClick={onGenerateImage}
            disabled={isGenerating || !recipeTitle.trim()}
            variant="outline"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Star className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Generate with AI
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Show image selection from URL if available and no current image
  if (hasWebsiteImages && !currentImage && !showUploadMode) {
    return (
      <div className="space-y-4">
        <WebsiteImageSelection
          websiteImages={websiteImages}
          storedImages={storedImages}
          selectedImage={selectedImage}
          onImageSelect={handleWebsiteImageSelect}
          onDownloadImages={onDownloadImages}
          isDownloadingImages={isDownloadingImages}
        />

        <div className="border-t pt-4">
          <Button
            onClick={handleUploadClick}
            variant="outline"
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Your Own Image Instead
          </Button>
        </div>
      </div>
    );
  }

  // Show upload interface (default or when specifically requested)
  return (
    <ImageUploadInterface
      onFileChange={handleFileInputChange}
      onGenerateImage={onGenerateImage}
      isGenerating={isGenerating}
      generationProgress={generationProgress}
      recipeTitle={recipeTitle}
      hasWebsiteImages={hasWebsiteImages}
      onBackToImages={hasWebsiteImages ? () => setShowUploadMode(false) : undefined}
    />
  );
}
