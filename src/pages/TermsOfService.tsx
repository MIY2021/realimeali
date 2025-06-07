
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function TermsOfService() {
  useDocumentTitle("Terms of Service | RealiMeali");

  return (
    <div className="container py-10 max-w-4xl">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <p className="text-gray-600 mb-8">
          <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using RealiMeali ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Description of Service</h2>
          <p className="mb-4">
            RealiMeali is a digital meal planning and recipe management platform that provides:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Recipe creation, storage, and sharing capabilities</li>
            <li>AI-powered recipe generation and parsing</li>
            <li>Meal planning and scheduling tools</li>
            <li>Shopping list generation</li>
            <li>Household management features</li>
            <li>Community recipe sharing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Accounts and Registration</h2>
          <h3 className="text-xl font-medium text-gray-700 mb-3">3.1 Account Creation</h3>
          <p className="mb-4">
            To access certain features, you must create an account by providing accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials.
          </p>
          
          <h3 className="text-xl font-medium text-gray-700 mb-3">3.2 Account Security</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>You are responsible for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use</li>
            <li>We are not liable for losses due to unauthorized account access</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. User Content and Conduct</h2>
          
          <h3 className="text-xl font-medium text-gray-700 mb-3">4.1 Content Ownership</h3>
          <p className="mb-4">
            You retain ownership of recipes, meal plans, and other content you create. By using our Service, you grant us a license to use, display, and distribute your content as necessary to provide the Service.
          </p>

          <h3 className="text-xl font-medium text-gray-700 mb-3">4.2 Prohibited Conduct</h3>
          <p className="mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Upload harmful, offensive, or illegal content</li>
            <li>Violate any intellectual property rights</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use the Service for commercial purposes without permission</li>
            <li>Share false or misleading information</li>
            <li>Spam or harass other users</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-700 mb-3">4.3 Content Moderation</h3>
          <p className="mb-4">
            We reserve the right to review, modify, or remove content that violates these terms or our community guidelines.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. AI Features and Third-Party Services</h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <h3 className="text-xl font-medium text-blue-800 mb-2">🤖 AI-Powered Features</h3>
            <p className="text-blue-700 mb-2">
              Our AI features are powered by OpenAI and other third-party services. By using these features, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-blue-700">
              <li>AI-generated content may not always be accurate or suitable</li>
              <li>You should review and verify all AI-generated recipes and meal plans</li>
              <li>We are not responsible for the accuracy of AI-generated content</li>
              <li>Your data may be processed by third-party AI services</li>
            </ul>
          </div>

          <p className="mb-4">
            Third-party services have their own terms and privacy policies. Your use of these features is also subject to their terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Privacy and Data Protection</h2>
          <p className="mb-4">
            Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Service Availability and Modifications</h2>
          <h3 className="text-xl font-medium text-gray-700 mb-3">7.1 Service Availability</h3>
          <p className="mb-4">
            We strive to maintain service availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable for maintenance, updates, or technical issues.
          </p>

          <h3 className="text-xl font-medium text-gray-700 mb-3">7.2 Service Modifications</h3>
          <p className="mb-4">
            We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Intellectual Property</h2>
          <p className="mb-4">
            The Service and its original content, features, and functionality are owned by RealiMeali and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Disclaimer of Warranties</h2>
          <p className="mb-4">
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-800">
              <strong>Health and Safety Notice:</strong> RealiMeali provides recipe and meal planning suggestions for informational purposes only. Always verify ingredient safety, check for allergies, and consult healthcare professionals for dietary advice. We are not responsible for any health issues resulting from recipes or meal plans.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Limitation of Liability</h2>
          <p className="mb-4">
            IN NO EVENT SHALL REALIMEALI BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Indemnification</h2>
          <p className="mb-4">
            You agree to indemnify and hold RealiMeali harmless from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibent text-gray-800 mb-4">12. Termination</h2>
          <h3 className="text-xl font-medium text-gray-700 mb-3">12.1 Termination by You</h3>
          <p className="mb-4">
            You may terminate your account at any time by contacting us or using account deletion features in the Service.
          </p>

          <h3 className="text-xl font-medium text-gray-700 mb-3">12.2 Termination by Us</h3>
          <p className="mb-4">
            We may terminate or suspend your account if you violate these Terms or engage in prohibited conduct.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">13. Governing Law</h2>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">14. Changes to Terms</h2>
          <p className="mb-4">
            We may update these Terms from time to time. We will notify you of material changes by posting the new Terms on this page and updating the effective date. Continued use of the Service constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">15. Contact Information</h2>
          <p className="mb-4">
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Email:</strong> legal@realimeali.com</p>
            <p><strong>Subject Line:</strong> Terms of Service Inquiry</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">16. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
          </p>
        </section>
      </div>
    </div>
  );
}
