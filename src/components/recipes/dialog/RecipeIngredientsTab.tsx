
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RecipeIngredientsTabProps {
  cameraFile: File | null;
  setCameraFile: (file: File | null) => void;
}

export function RecipeIngredientsTab({ cameraFile, setCameraFile }: RecipeIngredientsTabProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md mb-3">
        <span>I'll automatically extract the title, ingredients, cooking steps, and even suggest helpful categories!</span>
      </div>
      <Label htmlFor="camera-file">Take Photo of Ingredients</Label>
      <Input
        id="camera-file"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => setCameraFile(e.target.files?.[0] || null)}
      />
      {cameraFile && (
        <div className="space-y-2">
          <p className="text-sm text-green-600">📷 Photo captured!</p>
          <img 
            src={URL.createObjectURL(cameraFile)} 
            alt="Captured ingredients" 
            className="w-full h-48 object-cover rounded border"
          />
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Take a photo of ingredients in your fridge, pantry, or counter and I'll suggest a recipe you can make with them! 📸🥘
      </p>
    </div>
  );
}
