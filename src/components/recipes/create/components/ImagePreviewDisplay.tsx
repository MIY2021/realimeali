
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ImagePreviewDisplayProps {
  currentImage: string;
  onChangeImage: () => void;
  onRemoveImage: () => void;
}

export function ImagePreviewDisplay({
  currentImage,
  onChangeImage,
  onRemoveImage
}: ImagePreviewDisplayProps) {
  return (
    <div className="relative group">
      <img
        src={currentImage}
        alt="Recipe preview"
        className="w-full h-64 object-cover rounded-lg shadow-md"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onChangeImage}
          >
            <Upload className="h-4 w-4 mr-1" />
            Change
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onRemoveImage}
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
