
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useEffect } from "react";

export default function TermsOfService() {
  useDocumentTitle("Terms of Service | RealiMeali");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold text-navy mb-6">Terms of Service</h1>
        
        <div className="space-y-6">
          <section>
            <p className="text-sm text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-semibold text-navy mb-4">Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing and using RealiMeali, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>
            
            <h2 className="text-2xl font-semibold text-navy mb-4">Use License</h2>
            <p className="text-muted-foreground mb-4">
              Permission is granted to temporarily access RealiMeali for personal, 
              non-commercial transitory viewing only.
            </p>
            
            <h2 className="text-2xl font-semibold text-navy mb-4">User Account</h2>
            <p className="text-muted-foreground mb-4">
              You are responsible for safeguarding the password and for all activities 
              that occur under your account.
            </p>
            
            <h2 className="text-2xl font-semibold text-navy mb-4">Prohibited Uses</h2>
            <p className="text-muted-foreground mb-4">
              You may not use our service for any unlawful purpose or to solicit others 
              to perform unlawful acts.
            </p>
            
            <h2 className="text-2xl font-semibold text-navy mb-4">Contact Information</h2>
            <p className="text-muted-foreground">
              Questions about the Terms of Service should be sent to us through 
              our <a href="/contact" className="text-terracotta hover:underline">contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
