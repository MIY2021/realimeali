
import { Button } from "@/components/ui/button";

interface RecipeImageTabProps {
  isProcessing: boolean;
  onProcessImage: (file: File) => void;
}

export function RecipeImageTab({ isProcessing, onProcessImage }: RecipeImageTabProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Upload Recipe Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onProcessImage(file);
            }
          }}
          className="w-full p-3 sm:p-4 border rounded-lg text-sm sm:text-base"
        />
      </div>
      <Button 
        disabled={isProcessing}
        className="w-full h-11 sm:h-10"
      >
        {isProcessing ? "Extracting..." : "Choose Photo to Extract Recipe"}
      </Button>
    </div>
  );
}
