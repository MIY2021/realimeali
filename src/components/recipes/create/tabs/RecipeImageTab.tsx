
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RecipeImageTabProps {
  isProcessing: boolean;
  onProcessImage: (file: File) => void;
}

export function RecipeImageTab({ isProcessing, onProcessImage }: RecipeImageTabProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleProcess = () => {
    if (uploadedFile) {
      onProcessImage(uploadedFile);
    }
  };

  return (
    <div className="space-y-4">
      {/* Helper text - left aligned, reduced padding */}
      <div className="text-sm text-muted-foreground">
        <div className="hidden sm:block bg-blue-50 p-3 rounded-lg">
          📷 Upload a photo of a recipe from a cookbook, magazine, or handwritten note and I'll read all the details and organize them automatically!
        </div>
        <div className="sm:hidden">
          📷 Upload a photo of a recipe from a cookbook, magazine, or handwritten note and I'll read all the details and organize them automatically!
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="upload-file" className="text-base font-medium">Upload Recipe Photo</Label>
        <Input
          id="upload-file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-base p-4 h-12"
        />
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
      
      <div className="flex justify-end">
        <Button
          onClick={handleProcess}
          disabled={!uploadedFile || isProcessing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? "Processing..." : "Process Image"}
        </Button>
      </div>
    </div>
  );
}
