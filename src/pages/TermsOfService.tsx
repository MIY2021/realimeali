import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useEffect } from "react";

export default function TermsOfService() {
  useDocumentTitle("Terms of Service | RealiMeali");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-navy mb-8">Terms of Service</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground mb-6">
          <strong>Last updated:</strong> January 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground mb-4">
            By accessing or using RealiMeali ("the Service"), you agree to be bound by these 
            Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">2. Description of Service</h2>
          <p className="text-muted-foreground mb-4">
            RealiMeali is a web-based meal planning and recipe management platform that allows 
            users to create, organize, and share recipes, plan meals, and generate shopping lists.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">3. User Accounts</h2>
          <p className="text-muted-foreground mb-4">
            To use certain features of the Service, you must create an account. You are responsible for:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground mb-4">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and complete information</li>
            <li>Notifying us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">4. User Content</h2>
          <p className="text-muted-foreground mb-4">
            You retain ownership of any content you submit to the Service ("User Content"). 
            By submitting User Content, you grant us a license to use, modify, and distribute 
            your content in connection with the Service.
          </p>
          
          <h3 className="text-xl font-medium text-navy mb-2">Content Guidelines</h3>
          <p className="text-muted-foreground mb-4">User Content must not:</p>
          <ul className="list-disc pl-6 text-muted-foreground mb-4">
            <li>Violate any laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Contain harmful, offensive, or inappropriate material</li>
            <li>Include spam or commercial solicitations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">5. Prohibited Uses</h2>
          <p className="text-muted-foreground mb-4">You may not:</p>
          <ul className="list-disc pl-6 text-muted-foreground mb-4">
            <li>Use the Service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Use automated scripts or bots</li>
            <li>Reverse engineer or copy any features</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">6. Intellectual Property</h2>
          <p className="text-muted-foreground mb-4">
            The Service and its original content, features, and functionality are owned by 
            RealiMeali and are protected by copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">7. Privacy</h2>
          <p className="text-muted-foreground mb-4">
            Your privacy is important to us. Please review our Privacy Policy, which also 
            governs your use of the Service, to understand our practices.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">8. Disclaimers</h2>
          <p className="text-muted-foreground mb-4">
            The Service is provided "as is" without warranties of any kind. We do not guarantee 
            that the Service will be uninterrupted, secure, or error-free. Use of the Service 
            is at your own risk.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">9. Limitation of Liability</h2>
          <p className="text-muted-foreground mb-4">
            To the fullest extent permitted by law, RealiMeali shall not be liable for any 
            indirect, incidental, special, consequential, or punitive damages arising from 
            your use of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">10. Termination</h2>
          <p className="text-muted-foreground mb-4">
            We may terminate or suspend your account and access to the Service at our sole 
            discretion, without prior notice, for conduct that we believe violates these Terms 
            or is harmful to other users or us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">11. Changes to Terms</h2>
          <p className="text-muted-foreground mb-4">
            We reserve the right to modify these Terms at any time. We will notify users of 
            any material changes by posting the new Terms on this page and updating the 
            "Last updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">12. Contact Information</h2>
          <p className="text-muted-foreground mb-4">
            If you have any questions about these Terms, please contact us through our 
            contact form or feedback system.
          </p>
        </section>
      </div>
    </div>
  );
}
