
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
        
        <div className="space-y-8">
          <div className="bg-blue-50 p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm text-blue-800">
              At RealiMeali, we take your privacy seriously. This policy explains how we collect, 
              use, and protect your personal information.
            </p>
          </div>
          
          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-navy mb-3">Account Information</h3>
            <p className="text-muted-foreground mb-4">
              When you create an account, we collect your email address, name, and authentication details. 
              If you sign up through Google, we receive your basic profile information as permitted by your Google account settings.
            </p>
            
            <h3 className="text-xl font-medium text-navy mb-3">Recipe and Meal Data</h3>
            <p className="text-muted-foreground mb-4">
              We store the recipes you create or save, your meal plans, shopping lists, and household information. 
              This data is essential for providing our meal planning and recipe management services.
            </p>
            
            <h3 className="text-xl font-medium text-navy mb-3">Usage Information</h3>
            <p className="text-muted-foreground mb-4">
              We collect information about how you use our service, including features accessed, 
              recipes viewed, and interactions with our AI assistant. This helps us improve the platform.
            </p>
            
            <h3 className="text-xl font-medium text-navy mb-3">Communications</h3>
            <p className="text-muted-foreground">
              When you contact us or provide feedback, we store your communications to provide support 
              and improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">How We Use Your Information</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span><strong>Service Provision:</strong> To provide meal planning, recipe management, and household coordination features</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span><strong>Personalization:</strong> To customize recipe recommendations and meal suggestions based on your preferences</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span><strong>Communication:</strong> To send important updates, respond to support requests, and provide customer service</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span><strong>Improvement:</strong> To analyze usage patterns and improve our features and user experience</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span><strong>Security:</strong> To protect against fraud, abuse, and unauthorized access to our services</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Information Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell your personal information. We only share your information in these limited circumstances:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span><strong>Household Members:</strong> Recipe and meal plan data is shared with members of your household as part of our collaborative features</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span><strong>Service Providers:</strong> With trusted third-party services that help us operate the platform (like authentication and hosting)</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span><strong>Legal Requirements:</strong> When required by law or to protect our rights and the safety of our users</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>Encrypted data transmission and storage</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>Regular security audits and updates</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>Limited access to personal data on a need-to-know basis</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>Secure authentication and authorization systems</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Your Privacy Rights</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>Access and download your personal data</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>Correct inaccurate or incomplete information</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>Delete your account and associated data</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>Opt out of non-essential communications</span>
              </li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, please contact us through our 
              <a href="/contact" className="text-terracotta hover:underline ml-1">contact page</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of any material 
              changes by posting the new policy on this page and updating the "Last updated" date. 
              Your continued use of our services after any changes constitutes acceptance of the new policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy or our data practices, please 
              contact us through our <a href="/contact" className="text-terracotta hover:underline">contact page</a> 
              or send us <a href="/feedback" className="text-terracotta hover:underline">feedback</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
