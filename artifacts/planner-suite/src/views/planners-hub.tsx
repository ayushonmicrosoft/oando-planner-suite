"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DraftingCompass, Layers3, Box, ArrowRight, Sparkles } from "lucide-react";

const PLANNERS = [
  {
    title: "Live Planner",
    href: "/planner/studio",
    icon: DraftingCompass,
    badge: "Active",
    badgeColor: "bg-emerald-500/10 text-emerald-600",
    description: "Full workspace planner with tldraw canvas, furniture catalog, AI copilot, inspector panel, and export tools.",
    features: ["Drag & drop furniture", "AI layout advisor", "Export PNG/PDF", "Auto-save"],
  },
  {
    title: "Blueprint Wizard",
    href: "/planner/blueprint",
    icon: Layers3,
    badge: "Guided",
    badgeColor: "bg-navy/10 text-navy",
    description: "Step-by-step guided room setup with category-based furniture selection and bill of quantities.",
    features: ["4-step workflow", "BOQ generation", "Room presets", "PDF export"],
  },
  {
    title: "2D Canvas",
    href: "/planner/canvas",
    icon: Box,
    badge: "Classic",
    badgeColor: "bg-purple-500/10 text-purple-600",
    description: "Konva-powered interactive canvas with transform handles, undo/redo, and multi-select.",
    features: ["Snap to grid", "Undo/Redo", "AI advisor", "PNG export"],
  },
];

const TOOLS = [
  { title: "CAD Drawing", href: "/tools/cad", desc: "Vector drawing tools" },
  { title: "Floor Plan Creator", href: "/tools/floor-plan", desc: "Room-based layouts" },
  { title: "Custom Shapes", href: "/tools/shapes", desc: "Shape libraries" },
  { title: "Site Plan", href: "/tools/site-plan", desc: "Outdoor planning" },
  { title: "Import & Scale", href: "/tools/import", desc: "Blueprint import" },
];

export default function PlannersHub() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-surface to-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.header
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-navy/50 mb-3">
            Planner Hub
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-navy-text">
            All planners in one place.
          </h1>
          <p className="mt-3 text-lg text-navy-text/60 max-w-2xl">
            Open the live planner, the blueprint wizard, or the classic canvas.
            Pick the tool that fits your workflow.
          </p>
        </motion.header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 mb-16">
          {PLANNERS.map((planner, i) => {
            const Icon = planner.icon;
            return (
              <motion.button
                key={planner.href}
                onClick={() => router.push(planner.href)}
                className="group flex min-h-[280px] flex-col rounded-2xl border border-navy/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-navy/30 hover:shadow-lg text-left"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-navy/10 bg-navy/5 text-navy">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${planner.badgeColor}`}>
                    {planner.badge}
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-semibold tracking-tight text-navy-text transition-colors group-hover:text-navy">
                  {planner.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-navy-text/60">
                  {planner.description}
                </p>

                <ul className="mt-4 space-y-1.5">
                  {planner.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-navy-text/50">
                      <div className="w-1 h-1 rounded-full bg-navy/30" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-navy group-hover:gap-3 transition-all">
                  Launch <ArrowRight className="h-4 w-4" />
                </div>
              </motion.button>
            );
          })}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-navy-text mb-6">Drawing Tools</h2>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
            {TOOLS.map((tool) => (
              <button
                key={tool.href}
                onClick={() => router.push(tool.href)}
                className="flex flex-col items-start p-4 rounded-xl border border-navy/10 bg-white hover:border-navy/30 hover:shadow-sm transition-all text-left group"
              >
                <h3 className="text-sm font-semibold text-navy-text group-hover:text-navy transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-navy-text/50 mt-1">{tool.desc}</p>
              </button>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
