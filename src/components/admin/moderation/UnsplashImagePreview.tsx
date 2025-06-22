import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface UnsplashPhoto {
  id: string;
  urls: {
    thumb: string;
    small: string;
    regular: string;
    full: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
  };
  alt_description?: string;
}

interface UnsplashImagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  photo: UnsplashPhoto | null;
  onConfirm: () => void;
  recipeName: string;
}

export function UnsplashImagePreview({ 
  isOpen, 
  onClose, 
  photo, 
  onConfirm, 
  recipeName 
}: UnsplashImagePreviewProps) {
  if (!photo) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Preview Image for "{recipeName}"
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden">
            <img
              src={photo.urls.regular}
              alt={photo.alt_description || 'Preview image'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Image Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Unsplash</Badge>
                <Badge variant="secondary">Free to Use</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(photo.links.html, '_blank')}
                className="flex items-center gap-1"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on Unsplash
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm">
                <span className="font-medium">Photo by:</span>{' '}
                <a 
                  href={photo.user.links.html} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {photo.user.name}
                </a>
                {' '}on{' '}
                <a 
                  href="https://unsplash.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Unsplash
                </a>
              </p>
              {photo.alt_description && (
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium">Description:</span> {photo.alt_description}
                </p>
              )}
            </div>

            <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded">
              <p><strong>✓ License:</strong> Free to use under Unsplash License</p>
              <p><strong>✓ Attribution:</strong> Will be automatically included</p>
              <p><strong>✓ Quality:</strong> High-resolution image optimized for web</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Use This Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
