
import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleProcess = () => {
    if (uploadedFile) {
      onProcessImage(uploadedFile);
    }
  };

  return (
    <div className="space-y-4">
      {/* Helper text */}
      <div className="text-sm text-muted-foreground">
        <div className="hidden sm:block bg-blue-50 p-3 rounded-lg">
          📷 Upload a photo of a recipe from a cookbook, magazine, or handwritten note and I'll read all the details and organize them automatically!
        </div>
        <div className="sm:hidden">
          📷 Upload a photo of a recipe from a cookbook, magazine, or handwritten note and I'll read all the details and organize them automatically!
        </div>
      </div>
      
      <div className="space-y-4">
        <Label className="text-base font-medium">Upload Recipe Photo</Label>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />
        
        {/* Custom styled button */}
        <Button
          type="button"
          onClick={handleChooseFile}
          disabled={isProcessing}
          variant="outline"
          className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <Camera className="h-6 w-6" />
          <span className="font-medium">Choose Photo</span>
          <span className="text-xs text-muted-foreground">Camera or Gallery</span>
        </Button>
        
        {uploadedFile && (
          <div className="space-y-3">
            <p className="text-sm text-green-600 font-medium">📷 Photo uploaded successfully!</p>
            <img 
              src={URL.createObjectURL(uploadedFile)} 
              alt="Uploaded recipe" 
              className="w-full h-48 object-cover rounded-lg border"
            />
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
          {isProcessing ? "Importing..." : "Import Recipe"}
        </Button>
      </div>
    </div>
  );
}
