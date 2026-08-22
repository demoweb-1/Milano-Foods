import { Section } from '@/components/ui/Section';

export function PrivacyPolicyPage() {
  return (
    <Section className="bg-cream">
      <div className="container-x max-w-3xl">
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-ink-900 mb-6">Privacy Policy</h1>
        <div className="prose-milano">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <h2>Introduction</h2>
          <p>
            Milano Foods ("we", "our", "us") is committed to protecting your privacy. This policy explains how
            we collect, use and safeguard your personal information when you use our website and services.
          </p>
          <h2>Information We Collect</h2>
          <ul>
            <li>Contact details (name, email, phone number) when you submit forms or place orders</li>
            <li>Delivery addresses when you request delivery</li>
            <li>Order history and preferences</li>
            <li>Email address when you subscribe to our newsletter</li>
          </ul>
          <h2>How We Use Your Information</h2>
          <ul>
            <li>To process and fulfill your orders</li>
            <li>To respond to your inquiries and provide customer support</li>
            <li>To send you promotional emails (only if you subscribe)</li>
            <li>To improve our products and services</li>
          </ul>
          <h2>Data Security</h2>
          <p>
            We use Supabase with row-level security to protect your data. All sensitive information is
            encrypted and access is restricted to authorized personnel only.
          </p>
          <h2>Cookies</h2>
          <p>
            We use essential cookies to maintain your shopping cart and wishlist. We do not use tracking
            cookies without your consent.
          </p>
          <h2>Your Rights</h2>
          <ul>
            <li>Request access to your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Unsubscribe from our newsletter at any time</li>
          </ul>
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this privacy policy, please contact us through our contact page
            or visit any of our branches.
          </p>
        </div>
      </div>
    </Section>
  );
}
