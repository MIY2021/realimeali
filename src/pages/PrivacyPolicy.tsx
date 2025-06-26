
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useEffect } from "react";

export default function PrivacyPolicy() {
  useDocumentTitle("Privacy Policy | RealiMeali");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold text-navy mb-6">Privacy Policy</h1>
        
        <div className="space-y-6">
          <section>
            <p className="text-sm text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-semibold text-navy mb-4">Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              add recipes, or contact us for support.
            </p>
            
            <h2 className="text-2xl font-semibold text-navy mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to provide, maintain, and improve our services, 
              including meal planning features and recipe management.
            </p>
            
            <h2 className="text-2xl font-semibold text-navy mb-4">Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
            
            <h2 className="text-2xl font-semibold text-navy mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us through 
              our <a href="/contact" className="text-terracotta hover:underline">contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
