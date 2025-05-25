
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RecipeUploadTabProps {
  uploadedImageFile: File | null;
  setUploadedImageFile: (file: File | null) => void;
}

export function RecipeUploadTab({ uploadedImageFile, setUploadedImageFile }: RecipeUploadTabProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg mb-4">
        <span>📷 I'll read the recipe from your photo and organize all the details automatically!</span>
      </div>
      <Label htmlFor="upload-file" className="text-base font-medium">Upload Recipe Photo</Label>
      <Input
        id="upload-file"
        type="file"
        accept="image/*"
        onChange={(e) => setUploadedImageFile(e.target.files?.[0] || null)}
        className="text-base p-4 h-12"
      />
      {uploadedImageFile && (
        <div className="space-y-3">
          <p className="text-sm text-green-600 font-medium">📷 Photo uploaded successfully!</p>
          <img 
            src={URL.createObjectURL(uploadedImageFile)} 
            alt="Uploaded recipe" 
            className="w-full h-48 object-cover rounded-lg border"
          />
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        Upload a photo of a recipe from a cookbook, magazine, or handwritten note and I'll read all the details! 📸📖
      </p>
    </div>
  );
}
