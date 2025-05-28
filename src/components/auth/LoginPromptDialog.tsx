
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
      icon: <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-terracotta flex-shrink-0" />,
      text: "Save your favorite recipes"
    },
    {
      icon: <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-sage flex-shrink-0" />,
      text: "Access meal plans anywhere"
    },
    {
      icon: <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-navy flex-shrink-0" />,
      text: "Sync shopping lists across devices"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4 sm:mx-auto rounded-xl border-0 shadow-2xl bg-white max-w-[85vw] w-full fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <button
          onClick={() => handleDismiss("later")}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10 p-1"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader className="text-center space-y-2 sm:space-y-3 pt-2 px-2 sm:px-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-navy leading-tight">
            Welcome to RealiMeali!
          </DialogTitle>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Sign in to unlock all features and save your preferences
          </p>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4 px-2 sm:px-0">
          {/* Benefits List */}
          <div className="space-y-2 sm:space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                {benefit.icon}
                <span className="text-gray-700 leading-tight">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Google Login Button */}
          <div className="space-y-3 sm:space-y-4">
            <GoogleLoginButton />
            
            <p className="text-xs text-center text-muted-foreground px-2 leading-relaxed">
              By signing in, you agree to our Terms & Privacy Policy
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 text-xs sm:text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss("later")}
              className="flex-1 text-muted-foreground hover:text-foreground py-2 px-3"
            >
              Maybe later
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss("never")}
              className="flex-1 text-muted-foreground hover:text-foreground py-2 px-3"
            >
              Don't show again
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
