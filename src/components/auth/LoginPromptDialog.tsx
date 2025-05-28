
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { X, Heart, Calendar, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LoginPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: "timer" | "feature-click";
}

export function LoginPromptDialog({ isOpen, onClose, trigger = "timer" }: LoginPromptDialogProps) {
  const { user } = useAuth();

  // Don't show if user is already logged in
  if (user) return null;

  const handleDismiss = (type: "later" | "never") => {
    const timestamp = Date.now();
    if (type === "never") {
      localStorage.setItem("loginPrompt_dismissed", "never");
    } else {
      localStorage.setItem("loginPrompt_lastDismissed", timestamp.toString());
    }
    onClose();
  };

  const benefits = [
    {
      icon: <Heart className="h-5 w-5 text-terracotta" />,
      text: "Save your favorite recipes"
    },
    {
      icon: <Calendar className="h-5 w-5 text-sage" />,
      text: "Access meal plans anywhere"
    },
    {
      icon: <ShoppingBag className="h-5 w-5 text-navy" />,
      text: "Sync shopping lists across devices"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-xl border-0 shadow-2xl bg-white">
        <button
          onClick={() => handleDismiss("later")}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader className="text-center space-y-3 pt-2">
          <DialogTitle className="text-2xl font-bold text-navy">
            Welcome to RealiMeali!
          </DialogTitle>
          <p className="text-muted-foreground text-base">
            Sign in to unlock all features and save your preferences
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Benefits List */}
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                {benefit.icon}
                <span className="text-gray-700">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Google Login Button */}
          <div className="space-y-3">
            <GoogleLoginButton />
            
            <p className="text-xs text-center text-muted-foreground">
              By signing in, you agree to our Terms & Privacy Policy
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss("later")}
              className="flex-1 text-muted-foreground hover:text-foreground"
            >
              Maybe later
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss("never")}
              className="flex-1 text-muted-foreground hover:text-foreground"
            >
              Don't show again
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
