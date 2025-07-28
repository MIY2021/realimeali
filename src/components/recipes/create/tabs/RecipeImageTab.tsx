
import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera, FileText, Upload, Sparkles } from "lucide-react";

interface RecipeImageTabProps {
  isProcessing: boolean;
  onProcessImage: (file: File) => void;
  importProgress?: string;
  progressValue?: number;
}

export function RecipeImageTab({ 
  isProcessing, 
  onProcessImage, 
  importProgress = "", 
  progressValue = 0 
}: RecipeImageTabProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleTakePhoto = () => {
    cameraInputRef.current?.click();
  };

  const handleChooseFromGallery = () => {
    galleryInputRef.current?.click();
  };

  const handleProcess = () => {
    if (uploadedFile) {
      onProcessImage(uploadedFile);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Upload className="h-8 w-8 text-sage" />
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-navy">From Photo</h2>
        <p className="text-muted-foreground">
          Take a photo of a recipe card or cookbook page to extract the recipe
        </p>
      </div>
      
      <div className="space-y-4">
        <Label className="text-base font-medium">Upload Recipe Photo</Label>
        
        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />
        
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />
        
        {/* Two separate buttons with more padding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            type="button"
            onClick={handleTakePhoto}
            disabled={isProcessing}
            variant="outline"
            className="h-24 p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-3 text-gray-600 hover:text-blue-600"
          >
            <Camera className="h-7 w-7" />
            <span className="font-medium text-base">Take Photo</span>
            <span className="text-sm text-muted-foreground">Use Camera</span>
          </Button>
          
          <Button
            type="button"
            onClick={handleChooseFromGallery}
            disabled={isProcessing}
            variant="outline"
            className="h-24 p-6 border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors flex flex-col items-center justify-center gap-3 text-gray-600 hover:text-green-600"
          >
            <FileText className="h-7 w-7" />
            <span className="font-medium text-base">Choose Photo</span>
            <span className="text-sm text-muted-foreground">From Gallery</span>
          </Button>
        </div>
        
        {uploadedFile && (
          <div className="space-y-3">
            <p className="text-sm text-green-600 font-medium">📷 Photo uploaded successfully!</p>
            <div className="w-full max-w-md mx-auto">
              <img 
                src={URL.createObjectURL(uploadedFile)} 
                alt="Uploaded recipe" 
                className="w-full h-auto max-h-64 object-contain rounded-lg border bg-gray-50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Progress display */}
      {isProcessing && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Processing image...</span>
            <span className="text-muted-foreground">{Math.round(progressValue)}%</span>
          </div>
          <Progress value={progressValue} className="w-full" />
          {importProgress && (
            <p className="text-sm text-blue-600 font-medium">
              {importProgress}
            </p>
          )}
        </div>
      )}
      
      <div className="flex justify-end">
        <Button
          onClick={handleProcess}
          disabled={!uploadedFile || isProcessing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? "Processing..." : "Import Recipe"}
        </Button>
      </div>
    </div>
  );
}
