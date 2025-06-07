
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, FileText, AlertTriangle } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone: string;
}

export default function Contact() {
  useDocumentTitle("Contact Us | RealiMeali");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting contact form with data:', formData);
      
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData,
      });

      console.log('Contact email response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        
        // Check if it's a configuration error
        if (error.message?.includes('Email service not configured') || 
            error.message?.includes('RESEND_API_KEY')) {
          toast.error("Email service is not properly configured. Please contact support directly.");
        } else {
          toast.error(`Failed to send message: ${error.message}`);
        }
        return;
      }

      toast.success("Your message has been sent successfully! We'll get back to you soon.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        phone: "",
      });
    } catch (error) {
      console.error('Error sending contact email:', error);
      toast.error("Failed to send your message. Please try again later or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Mail className="h-8 w-8 text-terracotta" />
          <h1 className="text-3xl font-bold text-navy">Contact Us</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Have a question, suggestion, or feedback? We'd love to hear from you! 
          Send us a message and we'll get back to you as soon as possible.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Send us a message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll respond within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What's this about?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us more about your question or feedback..."
                    rows={6}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  style={{ backgroundColor: '#81b29a' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-navy mb-2">Email Support</h4>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24 hours during business days.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Direct email: <span className="font-medium">benalexbeard@gmail.com</span>
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-navy mb-2">What can we help with?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Recipe suggestions</li>
                  <li>• Technical support</li>
                  <li>• Feature requests</li>
                  <li>• Bug reports</li>
                  <li>• General feedback</li>
                </ul>
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-sm font-medium text-amber-800">Having trouble with the form?</h5>
                    <p className="text-xs text-amber-700 mt-1">
                      If the contact form isn't working, please email us directly at the address above.
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
