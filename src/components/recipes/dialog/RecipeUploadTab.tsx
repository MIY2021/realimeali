
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RecipeUploadTabProps {
  uploadedImageFile: File | null;
  setUploadedImageFile: (file: File | null) => void;
}

export function RecipeUploadTab({ uploadedImageFile, setUploadedImageFile }: RecipeUploadTabProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md mb-3">
        <span>I'll automatically extract the title, ingredients, cooking steps, and even suggest helpful categories!</span>
      </div>
      <Label htmlFor="upload-file">Upload Recipe Image</Label>
      <Input
        id="upload-file"
        type="file"
        accept="image/*"
        onChange={(e) => setUploadedImageFile(e.target.files?.[0] || null)}
      />
      {uploadedImageFile && (
        <div className="space-y-2">
          <p className="text-sm text-green-600">📷 Image uploaded!</p>
          <img 
            src={URL.createObjectURL(uploadedImageFile)} 
            alt="Uploaded recipe" 
            className="w-full h-48 object-cover rounded border"
          />
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Upload an image of a recipe from a cookbook, magazine, or handwritten note and I'll extract all the details! 📸📖
      </p>
    </div>
  );
}
