
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function PrivacyPolicy() {
  useDocumentTitle("Privacy Policy | RealiMeali");

  return (
    <div className="container py-10 max-w-4xl">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <p className="text-gray-600 mb-8">
          <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to RealiMeali ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our meal planning and recipe management service.
          </p>
          <p>
            By using RealiMeali, you consent to the data practices described in this policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-medium text-gray-700 mb-3">2.1 Personal Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Name and email address when you create an account</li>
            <li>Profile information including avatar and preferences</li>
            <li>Authentication data from third-party providers (Google)</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-700 mb-3">2.2 Content Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Recipes you create, save, or share</li>
            <li>Meal plans and shopping lists</li>
            <li>Household information and member data</li>
            <li>Comments, feedback, and communications</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-700 mb-3">2.3 Usage Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Log data including IP address, browser type, and pages visited</li>
            <li>Device information and operating system</li>
            <li>Usage patterns and feature interactions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Third-Party Services and Data Sharing</h2>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <h3 className="text-xl font-medium text-yellow-800 mb-2">🤖 Important: AI Features and OpenAI</h3>
            <p className="text-yellow-700">
              <strong>When you use our AI-powered features (recipe generation, image creation, recipe parsing), your data is shared with OpenAI.</strong> This includes:
            </p>
            <ul className="list-disc pl-6 mt-2 text-yellow-700">
              <li>Recipe titles, descriptions, and ingredients you submit</li>
              <li>Text prompts for AI generation</li>
              <li>Images you upload for processing</li>
            </ul>
            <p className="mt-2 text-yellow-700">
              OpenAI may use this data to improve their services according to their own privacy policy. By using AI features, you consent to this data sharing.
            </p>
          </div>

          <h3 className="text-xl font-medium text-gray-700 mb-3">3.1 Service Providers</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Supabase:</strong> Database hosting and authentication services</li>
            <li><strong>OpenAI:</strong> AI-powered recipe generation and image processing</li>
            <li><strong>Google:</strong> Authentication services (if you sign in with Google)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. How We Use Your Information</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide and maintain our meal planning services</li>
            <li>Process and respond to your requests and communications</li>
            <li>Generate personalized meal plans and recipe recommendations</li>
            <li>Improve our services and develop new features</li>
            <li>Send important updates about your account or our services</li>
            <li>Ensure security and prevent fraud</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Data Security</h2>
          <p className="mb-4">
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Encrypted data transmission using HTTPS</li>
            <li>Secure authentication and authorization</li>
            <li>Regular security updates and monitoring</li>
            <li>Limited access to personal data on a need-to-know basis</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Your Rights and Choices</h2>
          <p className="mb-4">You have the following rights regarding your personal information:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data</li>
            <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
          </ul>
          <p>
            To exercise these rights, please contact us at the email address provided in the Contact section.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Cookies and Tracking</h2>
          <p className="mb-4">
            We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the effective date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Email:</strong> privacy@realimeali.com</p>
            <p><strong>Subject Line:</strong> Privacy Policy Inquiry</p>
          </div>
        </section>
      </div>
    </div>
  );
}
