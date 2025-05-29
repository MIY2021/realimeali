
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface RecipeImageTabProps {
  isProcessing: boolean;
  onProcessImage: (file: File) => void;
}

export function RecipeImageTab({
  isProcessing,
  onProcessImage
}: RecipeImageTabProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onProcessImage(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Upload Recipe Image</h3>
        <p className="text-gray-600 mb-4">
          Upload an image of a recipe to extract the text
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isProcessing}
          className="hidden"
          id="recipe-image"
        />
        <Button asChild>
          <label htmlFor="recipe-image" className="cursor-pointer">
            {isProcessing ? "Processing..." : "Choose Image"}
          </label>
        </Button>
      </div>
    </div>
  );
}
