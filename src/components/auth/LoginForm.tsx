
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function LoginForm() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

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
  
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome to RealiMeali</h1>
        <p className="text-muted-foreground">
          Sign in to access your account
        </p>
      </div>
      
      <div className="space-y-4">
        <GoogleLoginButton />
        
        <div className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
