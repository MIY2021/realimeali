import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useEffect } from "react";

export default function PrivacyPolicy() {
  useDocumentTitle("Privacy Policy | RealiMeali");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-navy mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground mb-6">
          <strong>Last updated:</strong> January 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">1. Information We Collect</h2>
          <p className="text-muted-foreground mb-4">
            We collect information you provide directly to us, such as when you create an account, 
            use our services, or contact us for support.
          </p>
          
          <h3 className="text-xl font-medium text-navy mb-2">Personal Information</h3>
          <ul className="list-disc pl-6 text-muted-foreground mb-4">
            <li>Name and email address</li>
            <li>Profile information and preferences</li>
            <li>Recipes, meal plans, and shopping lists you create</li>
            <li>Communications with us</li>
          </ul>

          <h3 className="text-xl font-medium text-navy mb-2">Usage Information</h3>
          <ul className="list-disc pl-6 text-muted-foreground mb-4">
            <li>How you interact with our services</li>
            <li>Device information and IP address</li>
            <li>Browser type and operating system</li>
            <li>Pages visited and features used</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">2. How We Use Your Information</h2>
          <p className="text-muted-foreground mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground mb-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Create and manage your account</li>
            <li>Process your requests and transactions</li>
            <li>Send you updates and communications</li>
            <li>Ensure security and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">3. Information Sharing</h2>
          <p className="text-muted-foreground mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties, 
            except in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground mb-4">
            <li>With your explicit consent</li>
            <li>To comply with legal requirements</li>
            <li>To protect our rights and safety</li>
            <li>With service providers who assist us (under strict confidentiality)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">4. Data Security</h2>
          <p className="text-muted-foreground mb-4">
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. However, no method of 
            transmission over the Internet is 100% secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">5. Your Rights</h2>
          <p className="text-muted-foreground mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground mb-4">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and data</li>
            <li>Opt out of communications</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">6. Cookies</h2>
          <p className="text-muted-foreground mb-4">
            We use cookies and similar technologies to enhance your experience, analyze usage, 
            and provide personalized content. You can control cookie settings through your browser.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">7. Changes to This Policy</h2>
          <p className="text-muted-foreground mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any 
            significant changes by posting the new policy on this page and updating the 
            "Last updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-navy mb-4">8. Contact Us</h2>
          <p className="text-muted-foreground mb-4">
            If you have any questions about this Privacy Policy, please contact us through 
            our contact form or feedback system.
          </p>
        </section>
      </div>
    </div>
  );
}
