import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "One&Only privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="max-w-3xl mx-auto px-6 py-16 text-white/80">
      <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
      <p className="text-sm text-white/40 mb-8">Last updated: April 2026</p>

      <section className="space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">1. Information We Collect</h2>
          <p>We collect information you provide when creating an account, using the planner, or contacting us. This includes your name, email address, and workspace data such as floor plans and furniture layouts.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">2. How We Use Your Information</h2>
          <p>Your information is used to provide and improve the Office Planner Suite, deliver support, send important updates about the service, and generate bills of quantities for your projects.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">3. Data Storage &amp; Security</h2>
          <p>Your data is stored securely using encrypted connections and industry-standard security practices. Workspace data including floor plans, layouts, and BOQ data is stored in our cloud infrastructure.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">4. Third-Party Services</h2>
          <p>We may use third-party services for hosting, analytics, and email delivery. These services are bound by their own privacy policies and process data on our behalf under strict agreements.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">5. Your Rights</h2>
          <p>Under India&apos;s Digital Personal Data Protection Act (DPDP Act, 2023), you have the right to access, correct, and delete your personal data. You may also withdraw consent for data processing at any time.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">6. Cookies</h2>
          <p>We use essential cookies for authentication and session management. No advertising or third-party tracking cookies are used.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">7. Contact</h2>
          <p>For privacy-related inquiries, please contact us at <a href="mailto:privacy@oando.co.in" className="text-[var(--color-ocean-boat-blue-400)] hover:underline">privacy@oando.co.in</a>.</p>
        </div>
      </section>

      <div className="mt-12 pt-8 border-t border-white/10 text-xs text-white/30">
        &copy; {new Date().getFullYear()} One&amp;Only Office Furniture Pvt. Ltd. All rights reserved.
      </div>
    </main>
  );
}
