import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

export const ImageLightbox = ({ isOpen, onClose, imageUrl, alt }: ImageLightboxProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-transparent overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm z-50"
              onClick={onClose}
            >
              <X className="h-5 w-5 text-gray-800" />
            </Button>
          </DialogClose>

          {/* Image */}
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
