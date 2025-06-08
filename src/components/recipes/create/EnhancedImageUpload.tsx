import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Camera, Star, X, ArrowRight, Globe, Check } from "lucide-react";

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
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
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
        handleFileSelection(file);
      }
    }
  };

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

  const handleFileSelection = (file: File) => {
    console.log('File selected:', file.name, file.type);
    
    // Create immediate preview
    createImagePreview(file);
    
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      
      // Create a proper React change event
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
      
      // Clear website image selection when uploading manually
      if (onImageSelect) {
        onImageSelect('');
      }
    }
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
    
    // Always call the parent handler
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

  const handleUploadClick = () => {
    setShowUploadMode(true);
  };

  const handleClickToUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
        <div className="relative group">
          <img
            src={currentImage}
            alt="Recipe preview"
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUploadClick}
              >
                <Upload className="h-4 w-4 mr-1" />
                Change
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </div>

        {/* Show website images only if we don't have an uploaded image and there are website images */}
        {hasWebsiteImages && !localImagePreview && !imagePreview && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <span className="text-sm font-medium sm:pr-2">Available images from URL:</span>
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

            <div className="grid grid-cols-3 gap-2">
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
                    onClick={() => handleWebsiteImageSelect(displayUrl)}
                  >
                    {!hasError ? (
                      <img
                        src={displayUrl}
                        alt={`Option ${index + 1}`}
                        className="w-full h-16 object-cover"
                        onError={() => handleImageError(imageUrl)}
                      />
                    ) : (
                      <div className="w-full h-16 bg-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-500">Error</span>
                      </div>
                    )}

                    {/* Status indicators */}
                    <div className="absolute top-1 right-1">
                      {imageIsStored ? (
                        <div className="bg-green-500 text-white rounded-full p-1" title="Stored locally">
                          <Check className="h-2 w-2" />
                        </div>
                      ) : (
                        <div className="bg-blue-500 text-white rounded-full p-1" title="External link">
                          <Globe className="h-2 w-2" />
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
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <span className="text-sm font-medium sm:pr-2">Select an image for this recipe:</span>
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

          <div className="grid grid-cols-2 gap-3">
            {websiteImages.map((imageUrl, index) => {
              const displayUrl = getDisplayUrl(imageUrl);
              const hasError = imageErrors.has(imageUrl);
              const imageIsStored = isStored(imageUrl);
              
              return (
                <div
                  key={index}
                  className="relative cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-all"
                  onClick={() => handleWebsiteImageSelect(displayUrl)}
                >
                  {!hasError ? (
                    <img
                      src={displayUrl}
                      alt={`Recipe option ${index + 1}`}
                      className="w-full h-32 object-cover"
                      onError={() => handleImageError(imageUrl)}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-500">Image unavailable</span>
                    </div>
                  )}

                  {/* Status indicators */}
                  <div className="absolute top-2 right-2">
                    {imageIsStored ? (
                      <div className="bg-green-500 text-white rounded-full p-1" title="Stored locally">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="bg-blue-500 text-white rounded-full p-1" title="External link">
                        <Globe className="h-3 w-3" />
                      </div>
                    )}
                  </div>

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
    <div className="space-y-4">
      {hasWebsiteImages && (
        <div className="flex items-center justify-between mb-3">
          <Button
            onClick={() => setShowUploadMode(false)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to imported images
          </Button>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickToUpload}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">
          Drag and drop an image here, or click to select
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Supports JPG, PNG, GIF up to 10MB
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
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
