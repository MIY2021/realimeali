
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-[12px] border border-[#E3E3E3] shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Upload className="h-10 w-10 text-sage" />
            <Sparkles className="h-7 w-7 text-yellow-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1A1A1A]">From Photo</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-md mx-auto">
            Take a photo of a recipe card or cookbook page to extract the recipe
          </p>
        </div>
      
        <div className="space-y-4">
          <Label className="text-base font-medium text-[#1A1A1A]">Upload Recipe Photo</Label>
          
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
              className="h-28 p-6 border-2 border-dashed border-[#E3E3E3] hover:border-sage hover:bg-[#CFE6D6]/20 transition-colors flex flex-col items-center justify-center gap-3 text-[#6B6B6B] hover:text-sage rounded-[12px]"
            >
              <Camera className="h-8 w-8" />
              <span className="font-medium text-base">Take Photo</span>
              <span className="text-sm text-muted-foreground">Use Camera</span>
            </Button>
            
            <Button
              type="button"
              onClick={handleChooseFromGallery}
              disabled={isProcessing}
              variant="outline"
              className="h-28 p-6 border-2 border-dashed border-[#E3E3E3] hover:border-sage hover:bg-[#CFE6D6]/20 transition-colors flex flex-col items-center justify-center gap-3 text-[#6B6B6B] hover:text-sage rounded-[12px]"
            >
              <FileText className="h-8 w-8" />
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
                  className="w-full h-auto max-h-64 object-contain rounded-[12px] border border-[#E3E3E3] bg-[#FAF9F6]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Progress display */}
        {isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B6B6B]">Processing image...</span>
              <span className="text-[#6B6B6B]">{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="w-full" />
            {importProgress && (
              <p className="text-sm text-sage font-medium">
                {importProgress}
              </p>
            )}
          </div>
        )}
        
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleProcess}
            disabled={!uploadedFile || isProcessing}
            className="bg-[#CFE6D6] hover:bg-[#B8D9C5] text-[#1A1A1A] rounded-[12px] min-h-[44px] shadow-[0_1px_0_rgba(0,0,0,0.04)] font-medium"
          >
            {isProcessing ? "Processing..." : "Import Recipe"}
          </Button>
        </div>
      </div>
    </div>
  );
}
