
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
        
        <div className="space-y-8">
          <div className="bg-blue-50 p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm text-blue-800">
              By using RealiMeali, you agree to these terms. Please read them carefully.
            </p>
          </div>
          
          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing and using RealiMeali, you accept and agree to be bound by the terms 
              and provisions of this agreement. These terms apply to all users of the service, 
              including casual browsers, registered users, and household members.
            </p>
            <p className="text-muted-foreground">
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Description of Service</h2>
            <p className="text-muted-foreground mb-4">
              RealiMeali is a household meal planning and recipe management platform that provides:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-4">
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>Recipe storage and organization</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>Collaborative meal planning for households</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>Automated shopping list generation</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>AI-powered cooking assistance</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>Recipe discovery and community features</span>
              </li>
            </ul>
            <p className="text-muted-foreground">
              We reserve the right to modify or discontinue the service at any time with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">User Accounts and Registration</h2>
            <p className="text-muted-foreground mb-4">
              To access certain features of RealiMeali, you must register for an account. When you register:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-4">
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>You must provide accurate and complete information</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>You are responsible for maintaining the security of your account</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>You must notify us immediately of any unauthorized use</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>You are responsible for all activities under your account</span>
              </li>
            </ul>
            <p className="text-muted-foreground">
              We reserve the right to refuse service or terminate accounts at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">
              You agree to use RealiMeali only for lawful purposes and in accordance with these terms. 
              You agree NOT to use the service:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>To violate any applicable laws or regulations</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>To upload harmful, offensive, or inappropriate content</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>To infringe on intellectual property rights of others</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>To spam, harass, or abuse other users</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>To attempt to gain unauthorized access to our systems</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>To interfere with the proper working of the service</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Content and Intellectual Property</h2>
            <h3 className="text-xl font-medium text-navy mb-3">Your Content</h3>
            <p className="text-muted-foreground mb-4">
              You retain ownership of the recipes and content you create. By using our service, 
              you grant us a license to use, store, and display your content as necessary to provide our services.
            </p>
            
            <h3 className="text-xl font-medium text-navy mb-3">Our Content</h3>
            <p className="text-muted-foreground mb-4">
              The RealiMeali platform, including its design, features, and original content, 
              is protected by copyright and other intellectual property laws.
            </p>
            
            <h3 className="text-xl font-medium text-navy mb-3">Community Content</h3>
            <p className="text-muted-foreground">
              When you share recipes with the community, you represent that you have the right to do so 
              and that the content does not infringe on others' rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Privacy</h2>
            <p className="text-muted-foreground">
              Your privacy is important to us. Please review our 
              <a href="/privacy-policy" className="text-terracotta hover:underline ml-1">Privacy Policy</a>, 
              which explains how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              RealiMeali is provided "as is" without warranties of any kind. We are not liable for:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>Any damages resulting from your use of the service</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>Loss of data or service interruptions</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>Actions taken based on recipes or cooking advice</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span>Third-party content or links</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Termination</h2>
            <p className="text-muted-foreground">
              Either party may terminate this agreement at any time. Upon termination, your right to 
              use the service ceases immediately. We may retain certain information as required by law 
              or for legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify users of material 
              changes by posting the updated terms on this page. Your continued use of the service 
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Contact Information</h2>
            <p className="text-muted-foreground">
              Questions about these Terms of Service should be sent to us through our 
              <a href="/contact" className="text-terracotta hover:underline ml-1">contact page</a> 
              or via our <a href="/feedback" className="text-terracotta hover:underline">feedback form</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
