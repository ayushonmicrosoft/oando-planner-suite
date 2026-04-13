import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact One&Only for office planning inquiries, support, and partnership opportunities.",
};

export default function ContactPage() {
  return (
    <main id="main-content" className="max-w-3xl mx-auto px-6 py-16 text-white/80">
      <h1 className="text-3xl font-bold text-white mb-8">Contact Us</h1>

      <section className="space-y-6 text-sm leading-relaxed">
        <p>We&apos;d love to hear from you. Whether you have questions about the Office Planner Suite, need support, or want to discuss a partnership — reach out to us.</p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
            <h2 className="text-base font-semibold text-white mb-3">General Inquiries</h2>
            <p className="text-white/60 mb-2">For questions about our products and services</p>
            <a href="mailto:info@oando.co.in" className="text-[var(--color-ocean-boat-blue-400)] hover:underline">info@oando.co.in</a>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
            <h2 className="text-base font-semibold text-white mb-3">Technical Support</h2>
            <p className="text-white/60 mb-2">For help with the Office Planner Suite</p>
            <a href="mailto:support@oando.co.in" className="text-[var(--color-ocean-boat-blue-400)] hover:underline">support@oando.co.in</a>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
            <h2 className="text-base font-semibold text-white mb-3">Sales &amp; Partnerships</h2>
            <p className="text-white/60 mb-2">For bulk orders and collaboration</p>
            <a href="mailto:sales@oando.co.in" className="text-[var(--color-ocean-boat-blue-400)] hover:underline">sales@oando.co.in</a>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
            <h2 className="text-base font-semibold text-white mb-3">Office</h2>
            <p className="text-white/60 mb-2">One&amp;Only Office Furniture Pvt. Ltd.</p>
            <p className="text-white/40">India</p>
          </div>
        </div>
      </section>

      <div className="mt-12 pt-8 border-t border-white/10 text-xs text-white/30">
        &copy; {new Date().getFullYear()} One&amp;Only Office Furniture Pvt. Ltd. All rights reserved.
      </div>
    </main>
  );
}
