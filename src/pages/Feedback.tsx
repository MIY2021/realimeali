import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Camera, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

type FeedbackType = "suggestion" | "bug" | "feature_request" | "other";

export default function Feedback() {
  useDocumentTitle("Feedback | RealiMeali");

  useEffect(() => {
    window.scrollTo(0, 0);  
  }, []);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    subject: "",
    message: "",
    type: "suggestion" as FeedbackType,
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
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
    console.log('Form submitted with data:', formData);
    
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
      
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          toast({
            title: "Image Upload Failed",
            description: "Submitting feedback without image.",
          });
        }
      }

      console.log('Attempting to insert feedback into database...');
      
      // Prepare the insert data with proper status value
      const insertData = {
        user_id: user?.id || null,
        email: formData.email || null,
        subject: formData.subject,
        message: formData.message,
        type: formData.type,
        image_url: imageUrl,
        status: 'pending' // Use 'pending' instead of 'new' to match the constraint
      };
      
      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('feedback_suggestions')
        .insert(insertData)
        .select();

      console.log('Database response:', { data, error });

      if (error) {
        console.error('Database error:', error);
        
        // Provide more specific error messages
        if (error.message.includes('check constraint')) {
          throw new Error('Invalid feedback data format. Please try again.');
        } else if (error.message.includes('violates')) {
          throw new Error('Unable to save feedback due to data validation. Please check your input.');
        } else {
          throw error;
        }
      }

      console.log('Feedback submitted successfully');
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it soon.",
      });

      // Reset form
      setFormData({
        email: user?.email || "",
        subject: "",
        message: "",
        type: "suggestion",
      });
      setSelectedImage(null);
      
      // Stay on page after successful submission
    } catch (error) {
      console.error("Error submitting feedback:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to submit feedback. Please try again.";
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
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
    <div className="container max-w-4xl py-8 px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Mail className="h-8 w-8 text-terracotta" />
          <h1 className="text-3xl font-bold text-navy">Send Feedback</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Help us improve RealiMeali by sharing your suggestions, reporting bugs, or requesting features.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Share your feedback
              </CardTitle>
              <CardDescription>
                Your input helps us make RealiMeali better for everyone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: FeedbackType) => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
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
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@example.com"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your feedback"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Detailed description of your feedback..."
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attachment (optional)</Label>
                  {!selectedImage ? (
                    <div className="border-2 border-dashed border-border-default rounded-lg p-6">
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
                        <Upload className="h-8 w-8 text-content-tertiary mb-2" />
                        <span className="text-content-secondary text-center text-sm">
                          Click to upload an image
                          <br />
                          <span className="text-xs text-content-tertiary">Max size: 5MB</span>
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Camera className="h-4 w-4 text-content-tertiary" />
                        <span className="flex-1 truncate text-sm">
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
                          className="max-h-48 w-auto rounded border mx-auto"
                        />
                      )}
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-terracotta hover:bg-terracotta/90" 
                  disabled={isSubmitting || isUploadingImage}
                >
                  {isSubmitting ? "Submitting..." : isUploadingImage ? "Uploading..." : "Submit Feedback"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-navy mb-2">What to include</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Clear description of the issue or suggestion</li>
                  <li>• Steps to reproduce (for bugs)</li>
                  <li>• Expected vs actual behavior</li>
                  <li>• Screenshots if helpful</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-navy mb-2">Feedback types</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Suggestion:</strong> Ideas for improvement</li>
                  <li>• <strong>Bug Report:</strong> Something isn't working</li>
                  <li>• <strong>Feature Request:</strong> New functionality</li>
                  <li>• <strong>Other:</strong> General feedback</li>
                </ul>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-sm font-medium text-blue-800">Thank you!</h5>
                    <p className="text-xs text-blue-700 mt-1">
                      Your feedback helps us make RealiMeali better for everyone.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
