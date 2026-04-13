import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About One&Only — India's office furniture planning and workspace design platform.",
};

export default function AboutPage() {
  return (
    <main id="main-content" className="max-w-3xl mx-auto px-6 py-16 text-white/80">
      <h1 className="text-3xl font-bold text-white mb-8">About One&amp;Only</h1>

      <section className="space-y-6 text-sm leading-relaxed">
        <p>One&amp;Only Office Furniture Pvt. Ltd. is India&apos;s leading office planning and workspace design platform. Our mission is to make professional office space planning accessible, efficient, and collaborative for businesses of every size.</p>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">What We Do</h2>
          <p>The One&amp;Only Office Planner Suite provides a comprehensive set of tools for designing, visualizing, and delivering office layouts. From 2D canvas planning and CAD drawing to blueprint workflows and 3D visualization — everything you need to plan a workspace is in one platform.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">AFC India Catalog</h2>
          <p>Our platform features an integrated catalog of over 80 products from AFC India, spanning workstations, executive desks, conference tables, storage units, seating, and reception furniture. Every piece is available across Economy, Medium, and Premium tiers.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Built for Teams</h2>
          <p>Whether you&apos;re an interior designer, facility manager, or office administrator, our tools are designed for collaboration. Generate shareable client presentations, detailed bills of quantities, and professional delivery packages — all from a single workspace.</p>
        </div>
      </section>

      <div className="mt-12 pt-8 border-t border-white/10 text-xs text-white/30">
        &copy; {new Date().getFullYear()} One&amp;Only Office Furniture Pvt. Ltd. All rights reserved.
      </div>
    </main>
  );
}
