import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera, Image as ImageIcon } from "lucide-react";

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
    console.log('🖼️ RecipeImageTab: Import Recipe button clicked', { hasFile: !!uploadedFile });
    if (uploadedFile) {
      console.log('🖼️ RecipeImageTab: Calling onProcessImage with file:', uploadedFile.name);
      onProcessImage(uploadedFile);
    } else {
      console.error('🖼️ RecipeImageTab: No file uploaded!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-[12px] border border-[#E3E3E3] shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <Label className="text-base font-medium text-[#1A1A1A] block text-center">Upload Recipe Photo</Label>
          
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
          
          {/* Modern upload buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <button
              type="button"
              onClick={handleTakePhoto}
              disabled={isProcessing}
              className="group relative h-32 border-2 border-[#E3E3E3] rounded-[12px] hover:border-sage hover:bg-[#CFE6D6]/10 transition-all duration-200 flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 rounded-full bg-[#CFE6D6]/30 group-hover:bg-[#CFE6D6]/50 flex items-center justify-center transition-colors">
                <Camera className="h-6 w-6 text-sage" />
              </div>
              <span className="font-medium text-sm text-[#1A1A1A]">Take Photo</span>
            </button>
            
            <button
              type="button"
              onClick={handleChooseFromGallery}
              disabled={isProcessing}
              className="group relative h-32 border-2 border-[#E3E3E3] rounded-[12px] hover:border-sage hover:bg-[#CFE6D6]/10 transition-all duration-200 flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 rounded-full bg-[#CFE6D6]/30 group-hover:bg-[#CFE6D6]/50 flex items-center justify-center transition-colors">
                <ImageIcon className="h-6 w-6 text-sage" />
              </div>
              <span className="font-medium text-sm text-[#1A1A1A]">Choose Photo</span>
            </button>
          </div>
          
          {uploadedFile && (
            <div className="mt-4 p-4 bg-[#CFE6D6]/10 border border-sage/30 rounded-[12px]">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <img 
                    src={URL.createObjectURL(uploadedFile)} 
                    alt="Uploaded recipe" 
                    className="w-16 h-16 object-cover rounded-[8px] border border-[#E3E3E3]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-[#6B6B6B]">Ready to import</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress display */}
        {isProcessing && (
          <div className="space-y-2">
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
        
        <div className="flex justify-center pt-2">
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
