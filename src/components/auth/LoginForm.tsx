import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSecureAuth } from "@/hooks/useSecureAuth";

export function LoginForm() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { validatePassword } = useSecureAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Redirect if the user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md space-y-6 flex items-center justify-center py-10">
        <p>Loading...</p>
      </div>
    );
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast.error("Please agree to the terms of use and privacy policy");
      return;
    }
    
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.error || "Invalid password");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsCreatingAccount(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error("An account with this email already exists. Please sign in instead.");
        } else if (error.message.includes('password')) {
          toast.error("Password does not meet security requirements");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success("Account created successfully! Please check your email to verify your account.");
        navigate("/");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsCreatingAccount(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <img src="/realimeali-logo.svg" alt="RealiMeali" className="h-20 w-20 object-contain" />
          <span className="mt-3 text-4xl font-bold text-navy">RealiMeali</span>
        </div>

        {/* Card */}
        <div className="bg-background rounded-lg border-2 border-gray-300 shadow-lg p-8 space-y-6">
          {/* Heading */}
          <h1 className="text-2xl font-bold text-foreground">Create an account</h1>
          
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <GoogleLoginButton />
            <Button
              type="button"
              className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-background text-black hover:bg-gray-50 border border-gray-400 py-2 sm:py-3 px-4 text-sm sm:text-base font-medium rounded-sm"
            >
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span>Log in with Email</span>
            </Button>
          </div>
          
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">OR CONTINUE WITH</span>
            </div>
          </div>
          
          {/* Form Fields */}
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isCreatingAccount}
                className="bg-gray-50 border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isCreatingAccount}
                className="bg-gray-50 border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="************"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isCreatingAccount}
                className="bg-gray-50 border-gray-300"
              />
            </div>
            
            {/* Terms Checkbox */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm text-foreground leading-relaxed cursor-pointer">
                By signing up you agree to the{" "}
                <Link to="/terms-of-service" className="underline font-semibold hover:text-terracotta">
                  terms of use
                </Link>
                {" "}and{" "}
                <Link to="/privacy-policy" className="underline font-semibold hover:text-terracotta">
                  privacy policy
                </Link>
                .
              </Label>
            </div>
            
            {/* Create Account Button */}
            <Button
              type="submit"
              className="w-full bg-sage hover:bg-sage/90 text-white py-3 text-base font-medium rounded-sm"
              disabled={isCreatingAccount || !agreedToTerms}
            >
              {isCreatingAccount ? "Creating account..." : "Create account"}
            </Button>
          </form>
          
          {/* Sign In Link */}
          <div className="text-center text-sm text-foreground">
            Already have an account?{" "}
            <Link to="/login" className="underline hover:text-terracotta">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
