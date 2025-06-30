import { Shield } from "lucide-react";

export const metadata = {
  title: 'Privacy Policy - Twino',
  description: 'Learn how we protect your privacy and handle your data',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="mb-12">
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            At Twino, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you use our service.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-blue-500" />
            Information We Collect
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may collect personal information that you voluntarily provide to us when you use our service, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Account information (if you choose to create an account)</li>
            <li>Conversation history and preferences</li>
            <li>Device and usage information</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may use the information we collect for various purposes, including to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Provide, maintain, and improve our services</li>
            <li>Personalize your experience</li>
            <li>Analyze how our service is used</li>
            <li>Develop new features and functionality</li>
            <li>Communicate with you about updates and support</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We implement appropriate technical and organizational measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
            over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
            the new Privacy Policy on this page and updating the "Last Updated" date at the top of this policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-700 dark:text-gray-300">
            If you have any questions about this Privacy Policy, please contact us at 
            <a href="mailto:privacy@twino.com" className="text-blue-500 hover:underline">privacy@twino.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
