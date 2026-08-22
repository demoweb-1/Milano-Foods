import { Section } from '@/components/ui/Section';

export function TermsPage() {
  return (
    <Section className="bg-cream">
      <div className="container-x max-w-3xl">
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-ink-900 mb-6">Terms of Service</h1>
        <div className="prose-milano">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using the Milano Foods website, you accept and agree to be bound by these terms
            and conditions. If you do not agree, please do not use our website.
          </p>
          <h2>Orders & Pricing</h2>
          <ul>
            <li>All prices are listed in Sri Lankan Rupees (LKR) unless otherwise stated</li>
            <li>We reserve the right to change prices without prior notice</li>
            <li>Orders are confirmed only after phone verification by our staff</li>
            <li>Custom cake orders require advance notice and a confirmed quote</li>
          </ul>
          <h2>Delivery & Pickup</h2>
          <ul>
            <li>Delivery is available within Akurana and surrounding areas</li>
            <li>Delivery charges are calculated at checkout</li>
            <li>Free delivery is offered on orders above Rs. 3,000 within Akurana</li>
            <li>Pickup orders must be collected within the agreed timeframe</li>
          </ul>
          <h2>Cancellation & Refunds</h2>
          <ul>
            <li>Orders can be cancelled before preparation begins</li>
            <li>Custom cake orders require 48 hours notice for cancellation</li>
            <li>Refunds are processed at the discretion of management</li>
            <li>If a product is unsatisfactory, please contact us within 24 hours</li>
          </ul>
          <h2>Custom Cakes</h2>
          <p>
            Custom cake designs are subject to availability of ingredients and our bakers' assessment of
            feasibility. Final designs may vary slightly from reference images.
          </p>
          <h2>Allergen Notice</h2>
          <p>
            Our products may contain or come into contact with wheat, eggs, dairy, nuts and other allergens.
            Please inform us of any allergies when placing your order.
          </p>
          <h2>Intellectual Property</h2>
          <p>
            All content on this website, including images, text and branding, is the property of Milano Foods
            and may not be reproduced without permission.
          </p>
          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to update these terms at any time. Continued use of the website after
            changes constitutes acceptance of the new terms.
          </p>
        </div>
      </div>
    </Section>
  );
}
