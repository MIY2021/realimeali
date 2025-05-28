
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";

interface EmailLoginButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export function EmailLoginButton({ onSuccess, className }: EmailLoginButtonProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      setMessage("");
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }

      setMessage("Check your email for the magic link!");
      setShowForm(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error sending magic link:", error);
      setMessage("Error sending magic link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (message) {
    return (
      <div className="text-center space-y-3">
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
          {message}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setMessage("");
            setShowForm(true);
            setEmail("");
          }}
          className="text-xs text-muted-foreground"
        >
          Try different email
        </Button>
      </div>
    );
  }

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        className={`w-full flex items-center justify-center gap-2 sm:gap-3 bg-navy text-white hover:bg-navy/90 py-2 sm:py-3 px-4 text-sm sm:text-base font-medium ${className}`}
      >
        <Mail className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
        <span>Sign in with Email</span>
      </Button>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit} className="space-y-3">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
          autoFocus
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isLoading || !email}
          className="flex-1 bg-navy hover:bg-navy/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Magic Link"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowForm(false)}
          className="px-3"
        >
          Cancel
        </Button>
      </div>
      <p className="text-xs text-center text-muted-foreground">
        We'll send you a secure link to sign in instantly
      </p>
    </form>
  );
}
