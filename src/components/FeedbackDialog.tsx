
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    subject: "",
    message: "",
    type: "suggestion" as const,
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedImage(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `feedback-${Date.now()}.${fileExt}`;
      
      // For now, we'll create a simple data URL since there's no storage bucket configured
      // In a production app, you'd upload to Supabase Storage
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          // Image upload failed, but we can still submit without it
          toast({
            title: "Image Upload Failed",
            description: "Submitting feedback without image.",
          });
        }
      }

      const { error } = await supabase
        .from('feedback_suggestions')
        .insert({
          user_id: user?.id || null,
          email: formData.email || null,
          subject: formData.subject,
          message: formData.message,
          type: formData.type,
          image_url: imageUrl,
        });

      if (error) throw error;

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it soon.",
      });

      setFormData({
        email: user?.email || "",
        subject: "",
        message: "",
        type: "suggestion",
      });
      setSelectedImage(null);
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'sm:max-w-[95vw] h-[90vh] overflow-y-auto' : 'sm:max-w-md'}`}>
        <DialogHeader>
          <DialogTitle className={`${isMobile ? 'text-lg' : ''}`}>Send Feedback</DialogTitle>
          <DialogDescription className={`${isMobile ? 'text-sm' : ''}`}>
            Help us improve RealiMeali by sharing your suggestions, reporting bugs, or requesting features.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '3' : '4'}`}>
          <div className="space-y-2">
            <Label htmlFor="type" className={`${isMobile ? 'text-sm' : ''}`}>Type</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger className={`${isMobile ? 'text-sm' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="suggestion">Suggestion</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="email" className={`${isMobile ? 'text-sm' : ''}`}>Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
                className={`${isMobile ? 'text-sm' : ''}`}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject" className={`${isMobile ? 'text-sm' : ''}`}>Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief description of your feedback"
              required
              className={`${isMobile ? 'text-sm' : ''}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className={`${isMobile ? 'text-sm' : ''}`}>Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Detailed description of your feedback..."
              className={`min-h-[100px] ${isMobile ? 'text-sm' : ''}`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className={`${isMobile ? 'text-sm' : ''}`}>Attachment (optional)</Label>
            {!selectedImage ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className={`text-gray-600 text-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Click to upload an image
                    <br />
                    <span className="text-xs text-gray-500">Max size: 5MB</span>
                  </span>
                </label>
              </div>
            ) : (
              <div className="relative border rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-gray-500" />
                  <span className={`flex-1 truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {selectedImage.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeImage}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {selectedImage && (
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="mt-2 max-h-32 w-auto rounded border"
                  />
                )}
              </div>
            )}
          </div>

          <DialogFooter className={`${isMobile ? 'flex-col gap-2' : ''}`}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className={`${isMobile ? 'w-full' : ''}`}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploadingImage} 
              className={`bg-terracotta hover:bg-terracotta/90 ${isMobile ? 'w-full' : ''}`}
            >
              {isSubmitting ? "Submitting..." : isUploadingImage ? "Uploading..." : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
