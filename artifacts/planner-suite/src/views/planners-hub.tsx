"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  DraftingCompass,
  Layers3,
  Box,
  ArrowRight,
  MousePointerClick,
  PencilRuler,
  Eye,
  FileDown,
  Ruler,
  LayoutGrid,
  Shapes,
  Map,
  Import,
  Clock,
  Sparkles,
  Plus,
} from "lucide-react";

const STEPS = [
  { number: "01", label: "Choose", desc: "Pick your tool", icon: MousePointerClick },
  { number: "02", label: "Design", desc: "Layout & arrange", icon: PencilRuler },
  { number: "03", label: "Review", desc: "Inspect in 3D", icon: Eye },
  { number: "04", label: "Export", desc: "PDF, BOQ & more", icon: FileDown },
];

const PLANNERS = [
  {
    title: "Live Planner",
    href: "/planner/studio",
    icon: DraftingCompass,
    tagline: "Drag, drop, and design your space in real-time with our most powerful tool.",
    cta: "Open Studio",
    gradient: "from-blue-500 to-cyan-500",
    lightGradient: "from-blue-500/10 to-cyan-500/5",
  },
  {
    title: "Blueprint Wizard",
    href: "/planner/blueprint",
    icon: Layers3,
    tagline: "Step-by-step guided room setup. Perfect for quick professional layouts.",
    cta: "Start Wizard",
    gradient: "from-violet-500 to-purple-500",
    lightGradient: "from-violet-500/10 to-purple-500/5",
  },
  {
    title: "2D Canvas",
    href: "/planner/canvas",
    icon: Box,
    tagline: "Classic precision drawing tools for detailed floor plans and measurements.",
    cta: "Open Canvas",
    gradient: "from-amber-500 to-orange-500",
    lightGradient: "from-amber-500/10 to-orange-500/5",
  },
];

const TOOLS = [
  { title: "CAD Drawing", href: "/tools/cad", icon: PencilRuler, desc: "Vector precision" },
  { title: "Floor Plans", href: "/tools/floor-plan", icon: LayoutGrid, desc: "Room layouts" },
  { title: "Custom Shapes", href: "/tools/shapes", icon: Shapes, desc: "25+ elements" },
  { title: "Site Plan", href: "/tools/site-plan", icon: Map, desc: "Outdoor planning" },
  { title: "Import & Scale", href: "/tools/import", icon: Import, desc: "Upload blueprints" },
];

const TEMPLATES = [
  {
    title: "Open-Plan Office",
    subtitle: "48 desks",
    roomW: 1200, roomD: 800,
    items: [
      { x: 60, y: 60, w: 120, h: 80, c: "#5488B6" },
      { x: 240, y: 60, w: 120, h: 80, c: "#5488B6" },
      { x: 420, y: 60, w: 120, h: 80, c: "#5488B6" },
      { x: 60, y: 220, w: 120, h: 80, c: "#5488B6" },
      { x: 240, y: 220, w: 120, h: 80, c: "#5488B6" },
      { x: 420, y: 220, w: 120, h: 80, c: "#5488B6" },
      { x: 700, y: 100, w: 200, h: 160, c: "#8B7355" },
      { x: 700, y: 400, w: 200, h: 160, c: "#8B7355" },
    ],
  },
  {
    title: "Meeting Room",
    subtitle: "12 seats",
    roomW: 600, roomD: 500,
    items: [
      { x: 150, y: 120, w: 300, h: 160, c: "#8B7355" },
      { x: 160, y: 80, w: 40, h: 30, c: "#5488B6" },
      { x: 240, y: 80, w: 40, h: 30, c: "#5488B6" },
      { x: 320, y: 80, w: 40, h: 30, c: "#5488B6" },
      { x: 400, y: 80, w: 40, h: 30, c: "#5488B6" },
      { x: 160, y: 290, w: 40, h: 30, c: "#5488B6" },
      { x: 240, y: 290, w: 40, h: 30, c: "#5488B6" },
      { x: 320, y: 290, w: 40, h: 30, c: "#5488B6" },
      { x: 400, y: 290, w: 40, h: 30, c: "#5488B6" },
    ],
  },
  {
    title: "Executive Suite",
    subtitle: "Private office",
    roomW: 500, roomD: 400,
    items: [
      { x: 150, y: 40, w: 200, h: 100, c: "#8B7355" },
      { x: 200, y: 160, w: 80, h: 60, c: "#5488B6" },
      { x: 40, y: 250, w: 140, h: 80, c: "#6B8E6B" },
      { x: 320, y: 250, w: 140, h: 80, c: "#6B8E6B" },
    ],
  },
  {
    title: "Co-working Space",
    subtitle: "Hot desks",
    roomW: 1000, roomD: 700,
    items: [
      { x: 60, y: 60, w: 100, h: 60, c: "#5488B6" },
      { x: 200, y: 60, w: 100, h: 60, c: "#5488B6" },
      { x: 340, y: 60, w: 100, h: 60, c: "#5488B6" },
      { x: 60, y: 180, w: 100, h: 60, c: "#5488B6" },
      { x: 200, y: 180, w: 100, h: 60, c: "#5488B6" },
      { x: 340, y: 180, w: 100, h: 60, c: "#5488B6" },
      { x: 600, y: 60, w: 280, h: 200, c: "#8B7355" },
      { x: 600, y: 360, w: 200, h: 140, c: "#6B8E6B" },
    ],
  },
];

const RECENT_PLANS = [
  {
    name: "Floor 3 — West Wing",
    date: "2 hours ago",
    roomW: 800, roomD: 600,
    items: [
      { x: 40, y: 40, w: 140, h: 80, c: "#5488B6" },
      { x: 220, y: 40, w: 140, h: 80, c: "#5488B6" },
      { x: 40, y: 200, w: 300, h: 120, c: "#8B7355" },
      { x: 500, y: 80, w: 180, h: 160, c: "#6B8E6B" },
    ],
  },
  {
    name: "Reception Area",
    date: "Yesterday",
    roomW: 600, roomD: 500,
    items: [
      { x: 200, y: 30, w: 200, h: 100, c: "#8B7355" },
      { x: 60, y: 200, w: 120, h: 80, c: "#5488B6" },
      { x: 350, y: 250, w: 160, h: 100, c: "#5488B6" },
    ],
  },
  {
    name: "Boardroom Redesign",
    date: "3 days ago",
    roomW: 700, roomD: 500,
    items: [
      { x: 150, y: 100, w: 400, h: 200, c: "#8B7355" },
      { x: 180, y: 60, w: 50, h: 30, c: "#5488B6" },
      { x: 280, y: 60, w: 50, h: 30, c: "#5488B6" },
      { x: 380, y: 60, w: 50, h: 30, c: "#5488B6" },
      { x: 180, y: 310, w: 50, h: 30, c: "#5488B6" },
      { x: 280, y: 310, w: 50, h: 30, c: "#5488B6" },
      { x: 380, y: 310, w: 50, h: 30, c: "#5488B6" },
    ],
  },
];

function MiniFloorplan({ roomW, roomD, items, width = 260, height = 140 }: {
  roomW: number; roomD: number;
  items: { x: number; y: number; w: number; h: number; c: string }[];
  width?: number; height?: number;
}) {
  const pad = 16;
  const iW = width - pad * 2;
  const iH = height - pad * 2;
  const sc = Math.min(iW / roomW, iH / roomD);
  const rW = roomW * sc;
  const rH = roomD * sc;
  const oX = pad + (iW - rW) / 2;
  const oY = pad + (iH - rH) / 2;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <defs>
        <pattern id="grid-dots" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.5" fill="currentColor" opacity="0.08" />
        </pattern>
      </defs>
      <rect x={oX} y={oY} width={rW} height={rH} fill="url(#grid-dots)" stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} rx={4} className="text-foreground" />
      {items.map((it, i) => (
        <rect key={i} x={oX + it.x * sc} y={oY + it.y * sc} width={Math.max(it.w * sc, 2)} height={Math.max(it.h * sc, 2)} fill={it.c} rx={2} opacity={0.6} />
      ))}
    </svg>
  );
}

const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } } };

export default function PlannersHub() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-8 pb-20">

        <motion.section className="pt-4 pb-12" initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp}>
            <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground/60 mb-1">Workspace</p>
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">Planner Hub</h1>
            <p className="text-sm text-muted-foreground/60 mt-1">From blank room to finished plan. Four steps, one workspace.</p>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex items-center gap-0">
            {STEPS.map((step, i) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 border border-transparent hover:border-border/50 transition-all">
                  <div className="w-9 h-9 rounded-lg bg-primary/[0.08] flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground/40 font-medium uppercase tracking-wider">Step {step.number}</p>
                    <p className="text-sm font-medium">{step.label}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="mx-1 flex items-center">
                    <div className="w-6 h-px bg-border/50" />
                    <ArrowRight className="w-3 h-3 text-muted-foreground/20 -ml-0.5" />
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section className="grid gap-4 md:grid-cols-3 mb-12" initial="hidden" animate="visible" variants={stagger}>
          {PLANNERS.map((planner) => {
            const Icon = planner.icon;
            return (
              <motion.div key={planner.href} variants={fadeUp}>
                <Link
                  href={planner.href}
                  className="group flex flex-col rounded-2xl border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5 hover:border-primary/20 text-left h-full"
                >
                  <div className={`relative flex items-center justify-center aspect-[5/3] bg-gradient-to-br ${planner.lightGradient} overflow-hidden`}>
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 0.5px, transparent 0)`, backgroundSize: "20px 20px" }} />
                    <div className={`relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${planner.gradient} text-white shadow-lg`}>
                      <Icon className="w-6 h-6" strokeWidth={1.6} />
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 p-5">
                    <h2 className="text-base font-semibold tracking-[-0.01em]">{planner.title}</h2>
                    <p className="text-sm text-muted-foreground/60 mt-1.5 leading-relaxed flex-1">{planner.tagline}</p>
                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-sm font-semibold text-primary transition-all group-hover:gap-3">
                      {planner.cta} <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.section>

        <motion.section className="mb-12" initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-center gap-2.5 mb-4">
            <Ruler className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.8} />
            <h2 className="text-sm font-semibold tracking-[-0.01em]">Drawing Tools</h2>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex items-center gap-3 p-3.5 rounded-xl border bg-card hover:border-primary/20 hover:shadow-md hover:shadow-black/5 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-primary/[0.08] transition-colors">
                    <Icon className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-medium block">{tool.title}</span>
                    <span className="text-[11px] text-muted-foreground/40">{tool.desc}</span>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        </motion.section>

        <motion.section className="mb-12" initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-center gap-2.5 mb-4">
            <Sparkles className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.8} />
            <h2 className="text-sm font-semibold tracking-[-0.01em]">Start from Template</h2>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {TEMPLATES.map((tpl) => (
              <Link
                key={tpl.title}
                href="/planner/studio"
                className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:border-primary/20 hover:shadow-md hover:shadow-black/5 transition-all text-left"
              >
                <div className="p-3 bg-muted/20">
                  <MiniFloorplan roomW={tpl.roomW} roomD={tpl.roomD} items={tpl.items} width={300} height={130} />
                </div>
                <div className="p-3.5 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-medium">{tpl.title}</h3>
                    <p className="text-[11px] text-muted-foreground/40 mt-0.5">{tpl.subtitle}</p>
                  </div>
                  <Plus className="w-4 h-4 text-muted-foreground/20 group-hover:text-primary transition-colors shrink-0" />
                </div>
              </Link>
            ))}
          </motion.div>
        </motion.section>

        <motion.section initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-center gap-2.5 mb-4">
            <Clock className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.8} />
            <h2 className="text-sm font-semibold tracking-[-0.01em]">Recent Plans</h2>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {RECENT_PLANS.map((plan) => (
              <Link
                key={plan.name}
                href="/planner/studio"
                className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:border-primary/20 hover:shadow-md hover:shadow-black/5 transition-all text-left"
              >
                <div className="p-3 bg-muted/20">
                  <MiniFloorplan roomW={plan.roomW} roomD={plan.roomD} items={plan.items} width={320} height={130} />
                </div>
                <div className="p-3.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium truncate">{plan.name}</h3>
                    <p className="text-[11px] text-muted-foreground/40 mt-0.5">{plan.date}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-primary transition-colors shrink-0" />
                </div>
              </Link>
            ))}
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
