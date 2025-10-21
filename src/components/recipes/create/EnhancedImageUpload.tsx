
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Camera, Star, X } from "lucide-react";
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
  onImageSelect?: (url: string) => void;
  recipeTitle: string;
  websiteImages?: string[];
  storedImages?: StoredImage[];
  selectedImage?: string;
  onDownloadImages?: () => void;
  isDownloadingImages?: boolean;
}

export function EnhancedImageUpload({
  imagePreview,
  isGenerating,
  generationProgress,
  onImageChange,
  onGenerateImage,
  onImageSelect,
  recipeTitle,
  websiteImages = [],
  storedImages = [],
  selectedImage = "",
  onDownloadImages,
  isDownloadingImages = false
}: EnhancedImageUploadProps) {
  const [showUploadMode, setShowUploadMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasWebsiteImages = websiteImages.length > 0;
  const hasCurrentImage = Boolean(imagePreview);

  console.log('EnhancedImageUpload Debug:', {
    hasCurrentImage,
    imagePreview: imagePreview ? 'has preview' : 'no preview',
    showUploadMode,
    hasWebsiteImages
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File input changed in EnhancedImageUpload');
    
    // Clear website image selection when uploading manually
    if (e.target.files && e.target.files.length > 0 && onImageSelect) {
      console.log('📁 Clearing website image selection due to file upload');
      onImageSelect('');
    }
    
    // Call the parent handler
    onImageChange(e);
    setShowUploadMode(false);
  };

  const handleRemoveImage = () => {
    console.log('🗑️ Removing image in EnhancedImageUpload');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      // Create a synthetic event for clearing
      const syntheticEvent = {
        target: fileInputRef.current,
        currentTarget: fileInputRef.current,
      } as React.ChangeEvent<HTMLInputElement>;
      
      onImageChange(syntheticEvent);
    }
    
    if (onImageSelect) {
      onImageSelect('');
    }
  };

  const handleWebsiteImageSelect = (imageUrl: string) => {
    console.log('🌐 Website image selected in EnhancedImageUpload:', imageUrl);
    if (onImageSelect) {
      onImageSelect(imageUrl);
      // Clear any uploaded file when selecting from website
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Show current image if available
  if (hasCurrentImage && !showUploadMode) {
    return (
      <div className="space-y-4">
        <div className="relative group">
          <img
            src={imagePreview}
            alt="Recipe preview"
            className="w-full h-48 object-cover rounded-[12px] border border-[#E3E3E3] group-hover:border-sage/40 transition-colors"
          />
          <Button
            onClick={handleRemoveImage}
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Show website images only if available and not from upload */}
        {hasWebsiteImages && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Or choose from imported images:</h4>
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
            onClick={() => setShowUploadMode(true)}
            variant="outline"
            className="w-full h-10 rounded-[10px] border-[#E3E3E3] hover:border-sage hover:bg-sage/5"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Different Image
          </Button>

          <Button
            onClick={onGenerateImage}
            disabled={isGenerating || !recipeTitle.trim()}
            className="w-full h-10 rounded-[10px] bg-[#CFE6D6] hover:bg-[#B8D9C5] text-[#1A1A1A]"
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

  // Show website images if available and no current image
  if (hasWebsiteImages && !hasCurrentImage && !showUploadMode) {
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
            onClick={() => setShowUploadMode(true)}
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

  // Show upload interface
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
