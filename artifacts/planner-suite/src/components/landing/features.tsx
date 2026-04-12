"use client";

import { Grid3X3, Pencil, LayoutGrid, Shapes, ImagePlus, Map, FileSignature, Box } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Grid3X3,
    title: "2D Canvas Planner",
    desc: "Drag-and-drop furniture onto a precision canvas. Resize, rotate, and snap to grid with real-time dimensions.",
    gradient: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-500",
    border: "group-hover:border-blue-500/20",
  },
  {
    icon: FileSignature,
    title: "Blueprint Wizard",
    desc: "Step-by-step guided room setup. Choose dimensions, select furniture by category, auto-generate BOQ.",
    gradient: "from-indigo-500/20 to-indigo-600/5",
    iconColor: "text-indigo-500",
    border: "group-hover:border-indigo-500/20",
  },
  {
    icon: Pencil,
    title: "CAD Drawing",
    desc: "Vector drawing with lines, rectangles, ellipses, text and measurement tools. Professional-grade precision.",
    gradient: "from-violet-500/20 to-violet-600/5",
    iconColor: "text-violet-500",
    border: "group-hover:border-violet-500/20",
  },
  {
    icon: LayoutGrid,
    title: "Floor Plan Creator",
    desc: "Room-based layout builder with 12 presets, automatic area calculations, and color-coded zones.",
    gradient: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-500",
    border: "group-hover:border-emerald-500/20",
  },
  {
    icon: Shapes,
    title: "Custom Shapes",
    desc: "25+ categorized shapes for walls, furniture, electrical, plumbing and safety elements.",
    gradient: "from-purple-500/20 to-purple-600/5",
    iconColor: "text-purple-500",
    border: "group-hover:border-purple-500/20",
  },
  {
    icon: Map,
    title: "Site Plan Designer",
    desc: "Create outdoor site plans with buildings, parking, roads, landscaping, and utility elements.",
    gradient: "from-teal-500/20 to-teal-600/5",
    iconColor: "text-teal-500",
    border: "group-hover:border-teal-500/20",
  },
  {
    icon: ImagePlus,
    title: "Import & Scale",
    desc: "Upload existing blueprints, calibrate scale, and annotate with lines and measurements.",
    gradient: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-500",
    border: "group-hover:border-amber-500/20",
  },
  {
    icon: Box,
    title: "3D Walkthrough",
    desc: "Visualize any plan in interactive 3D. First-person walkthrough and orbit mode with real-time rendering.",
    gradient: "from-cyan-500/20 to-cyan-600/5",
    iconColor: "text-cyan-500",
    border: "group-hover:border-cyan-500/20",
  },
];

export default function Features() {
  return (
    <section className="py-24 lg:py-32 bg-[#070D12]" id="features" aria-label="Features">
      <div className="max-w-[1200px] mx-auto px-5">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#5488B6] mb-4">Powerful Tools</p>
          <h2 className="text-[32px] md:text-[48px] font-semibold text-white mb-5 tracking-[-0.02em]">
            Everything You Need to Design
            <br className="hidden md:block" />
            <span className="text-white/40"> Any Office Space</span>
          </h2>
          <p className="text-[17px] text-white/40 max-w-[560px] mx-auto leading-relaxed">
            8 professional-grade tools in one platform. From quick sketches to detailed blueprints and immersive 3D visualization.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className={`group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all duration-500 ${f.border}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5`}>
                <f.icon className={`w-5 h-5 ${f.iconColor}`} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-white text-[15px] mb-2 tracking-[-0.01em]">{f.title}</h3>
              <p className="text-[13px] text-white/40 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
