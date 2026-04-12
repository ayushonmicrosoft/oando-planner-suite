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
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    label: "Choose",
    icon: MousePointerClick,
    color: "var(--color-ocean-boat-blue-500)",
    bg: "var(--color-ocean-boat-blue-50)",
  },
  {
    number: "02",
    label: "Design",
    icon: PencilRuler,
    color: "var(--color-primary)",
    bg: "var(--surface-accent-wash)",
  },
  {
    number: "03",
    label: "Review",
    icon: Eye,
    color: "var(--color-sustain-500)",
    bg: "var(--surface-sustain-soft)",
  },
  {
    number: "04",
    label: "Export",
    icon: FileDown,
    color: "var(--color-bronze-500)",
    bg: "var(--surface-soft)",
  },
];

const PLANNERS = [
  {
    title: "Live Planner",
    href: "/planner/studio",
    icon: DraftingCompass,
    accent: "var(--color-ocean-boat-blue-500)",
    accentBg: "var(--color-ocean-boat-blue-50)",
    tagline: "Drag, drop, design",
    cta: "Open Studio",
  },
  {
    title: "Blueprint Wizard",
    href: "/planner/blueprint",
    icon: Layers3,
    accent: "var(--color-primary)",
    accentBg: "var(--surface-accent-wash)",
    tagline: "Guided step-by-step",
    cta: "Start Wizard",
  },
  {
    title: "2D Canvas",
    href: "/planner/canvas",
    icon: Box,
    accent: "var(--color-bronze-500)",
    accentBg: "var(--surface-soft)",
    tagline: "Classic precision tools",
    cta: "Open Canvas",
  },
];

const TOOLS = [
  { title: "CAD Drawing", href: "/tools/cad", icon: PencilRuler },
  { title: "Floor Plans", href: "/tools/floor-plan", icon: LayoutGrid },
  { title: "Custom Shapes", href: "/tools/shapes", icon: Shapes },
  { title: "Site Plan", href: "/tools/site-plan", icon: Map },
  { title: "Import & Scale", href: "/tools/import", icon: Import },
];

const TEMPLATES = [
  {
    title: "Open-Plan Office",
    subtitle: "48 desks",
    roomW: 1200,
    roomD: 800,
    items: [
      { x: 60, y: 60, w: 120, h: 80, c: "var(--color-ocean-boat-blue-300)" },
      { x: 240, y: 60, w: 120, h: 80, c: "var(--color-ocean-boat-blue-300)" },
      { x: 420, y: 60, w: 120, h: 80, c: "var(--color-ocean-boat-blue-300)" },
      { x: 60, y: 220, w: 120, h: 80, c: "var(--color-ocean-boat-blue-300)" },
      { x: 240, y: 220, w: 120, h: 80, c: "var(--color-ocean-boat-blue-300)" },
      { x: 420, y: 220, w: 120, h: 80, c: "var(--color-ocean-boat-blue-300)" },
      { x: 700, y: 100, w: 200, h: 160, c: "var(--color-bronze-300)" },
      { x: 700, y: 400, w: 200, h: 160, c: "var(--color-bronze-300)" },
    ],
  },
  {
    title: "Meeting Room",
    subtitle: "12 seats",
    roomW: 600,
    roomD: 500,
    items: [
      { x: 150, y: 120, w: 300, h: 160, c: "var(--color-bronze-400)" },
      { x: 160, y: 80, w: 40, h: 30, c: "var(--color-ocean-boat-blue-400)" },
      { x: 240, y: 80, w: 40, h: 30, c: "var(--color-ocean-boat-blue-400)" },
      { x: 320, y: 80, w: 40, h: 30, c: "var(--color-ocean-boat-blue-400)" },
      { x: 400, y: 80, w: 40, h: 30, c: "var(--color-ocean-boat-blue-400)" },
      { x: 160, y: 290, w: 40, h: 30, c: "var(--color-ocean-boat-blue-400)" },
      { x: 240, y: 290, w: 40, h: 30, c: "var(--color-ocean-boat-blue-400)" },
      { x: 320, y: 290, w: 40, h: 30, c: "var(--color-ocean-boat-blue-400)" },
      { x: 400, y: 290, w: 40, h: 30, c: "var(--color-ocean-boat-blue-400)" },
    ],
  },
  {
    title: "Executive Suite",
    subtitle: "Private office",
    roomW: 500,
    roomD: 400,
    items: [
      { x: 150, y: 40, w: 200, h: 100, c: "var(--color-bronze-500)" },
      { x: 200, y: 160, w: 80, h: 60, c: "var(--color-ocean-boat-blue-400)" },
      { x: 40, y: 250, w: 140, h: 80, c: "var(--color-sustain-400)" },
      { x: 320, y: 250, w: 140, h: 80, c: "var(--color-sustain-400)" },
    ],
  },
  {
    title: "Co-working Space",
    subtitle: "Hot desks",
    roomW: 1000,
    roomD: 700,
    items: [
      { x: 60, y: 60, w: 100, h: 60, c: "var(--color-ocean-boat-blue-300)" },
      { x: 200, y: 60, w: 100, h: 60, c: "var(--color-ocean-boat-blue-300)" },
      { x: 340, y: 60, w: 100, h: 60, c: "var(--color-ocean-boat-blue-300)" },
      { x: 60, y: 180, w: 100, h: 60, c: "var(--color-ocean-boat-blue-300)" },
      { x: 200, y: 180, w: 100, h: 60, c: "var(--color-ocean-boat-blue-300)" },
      { x: 340, y: 180, w: 100, h: 60, c: "var(--color-ocean-boat-blue-300)" },
      { x: 600, y: 60, w: 280, h: 200, c: "var(--color-bronze-300)" },
      { x: 600, y: 360, w: 200, h: 140, c: "var(--color-sustain-300)" },
    ],
  },
];

const RECENT_PLANS = [
  {
    name: "Floor 3 — West Wing",
    date: "2 hours ago",
    roomW: 800,
    roomD: 600,
    items: [
      { x: 40, y: 40, w: 140, h: 80, c: "var(--color-ocean-boat-blue-500)" },
      { x: 220, y: 40, w: 140, h: 80, c: "var(--color-ocean-boat-blue-500)" },
      { x: 40, y: 200, w: 300, h: 120, c: "var(--color-bronze-400)" },
      { x: 500, y: 80, w: 180, h: 160, c: "var(--color-sustain-400)" },
    ],
  },
  {
    name: "Reception Area",
    date: "Yesterday",
    roomW: 600,
    roomD: 500,
    items: [
      { x: 200, y: 30, w: 200, h: 100, c: "var(--color-bronze-400)" },
      { x: 60, y: 200, w: 120, h: 80, c: "var(--color-ocean-boat-blue-500)" },
      { x: 350, y: 250, w: 160, h: 100, c: "var(--color-ocean-boat-blue-500)" },
    ],
  },
  {
    name: "Boardroom Redesign",
    date: "3 days ago",
    roomW: 700,
    roomD: 500,
    items: [
      { x: 150, y: 100, w: 400, h: 200, c: "var(--color-bronze-400)" },
      { x: 180, y: 60, w: 50, h: 30, c: "var(--color-ocean-boat-blue-500)" },
      { x: 280, y: 60, w: 50, h: 30, c: "var(--color-ocean-boat-blue-500)" },
      { x: 380, y: 60, w: 50, h: 30, c: "var(--color-ocean-boat-blue-500)" },
      { x: 180, y: 310, w: 50, h: 30, c: "var(--color-ocean-boat-blue-500)" },
      { x: 280, y: 310, w: 50, h: 30, c: "var(--color-ocean-boat-blue-500)" },
      { x: 380, y: 310, w: 50, h: 30, c: "var(--color-ocean-boat-blue-500)" },
    ],
  },
];

function MiniFloorplan({
  roomW,
  roomD,
  items,
  width = 260,
  height = 160,
}: {
  roomW: number;
  roomD: number;
  items: { x: number; y: number; w: number; h: number; c: string }[];
  width?: number;
  height?: number;
}) {
  const pad = 12;
  const iW = width - pad * 2;
  const iH = height - pad * 2;
  const sc = Math.min(iW / roomW, iH / roomD);
  const rW = roomW * sc;
  const rH = roomD * sc;
  const oX = pad + (iW - rW) / 2;
  const oY = pad + (iH - rH) / 2;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <rect x={oX} y={oY} width={rW} height={rH} fill="var(--surface-page)" stroke="var(--border-soft)" strokeWidth={1.2} rx={3} />
      {items.map((it, i) => (
        <rect key={i} x={oX + it.x * sc} y={oY + it.y * sc} width={Math.max(it.w * sc, 2)} height={Math.max(it.h * sc, 2)} fill={it.c} rx={1.5} opacity={0.85} />
      ))}
    </svg>
  );
}

function PlannerIllustration({ icon: Icon, accent, accentBg }: { icon: LucideIcon; accent: string; accentBg: string }) {
  return (
    <div className="relative flex items-center justify-center w-full aspect-[5/3] rounded-[var(--radius-lg)] overflow-hidden" style={{ background: accentBg }}>
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, ${accent} 1px, transparent 0)`, backgroundSize: "20px 20px" }} />
      <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl" style={{ background: accent, color: "white" }}>
        <Icon className="w-7 h-7" strokeWidth={1.6} />
      </div>
    </div>
  );
}

const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } } };

export default function PlannersHub() {
  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse at top, var(--surface-page) 0%, var(--surface-muted) 60%, var(--surface-hover-soft) 100%)" }}>
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-10 pb-20">

        <motion.section className="text-center pt-6 pb-14" initial="hidden" animate="visible" variants={stagger}>
          <motion.p variants={fadeUp} className="typ-label text-muted mb-4 tracking-[var(--type-letter-widest)]">
            Planner Hub
          </motion.p>
          <motion.h1 variants={fadeUp} className="typ-section-title text-strong max-w-xl mx-auto">
            From blank room to finished plan.
          </motion.h1>
          <motion.p variants={fadeUp} className="typ-lead text-muted mt-4 max-w-md mx-auto">
            Four steps. One workspace.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center gap-2.5 w-[130px] sm:w-[140px]">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: step.bg }}>
                      <Icon className="w-5 h-5" style={{ color: step.color }} strokeWidth={1.8} />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="typ-label" style={{ color: step.color, fontSize: "var(--type-caption-size)" }}>
                        Step {step.number}
                      </span>
                      <span className="text-sm font-medium text-strong mt-0.5">{step.label}</span>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="hidden sm:flex items-center px-2">
                      <div className="w-10 h-px" style={{ background: "var(--border-soft)" }} />
                      <ArrowRight className="w-3.5 h-3.5 text-subtle -ml-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        </motion.section>

        <motion.section className="grid gap-5 md:grid-cols-3 mb-16" initial="hidden" animate="visible" variants={stagger}>
          {PLANNERS.map((planner) => {
            const Icon = planner.icon;
            return (
              <motion.div key={planner.href} variants={fadeUp}>
                <Link
                  href={planner.href}
                  className="group flex flex-col rounded-[var(--radius-xl)] border border-[var(--border-soft)] bg-[var(--surface-panel)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] hover:border-[var(--border-hover)] text-left"
                >
                  <PlannerIllustration icon={Icon} accent={planner.accent} accentBg={planner.accentBg} />
                  <div className="flex flex-col flex-1 p-5 pt-4">
                    <h2 className="text-lg font-semibold tracking-[var(--type-letter-title)] text-strong">{planner.title}</h2>
                    <p className="text-sm text-muted mt-1">{planner.tagline}</p>
                    <div className="mt-auto pt-5 flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3" style={{ color: planner.accent }}>
                      {planner.cta} <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.section>

        <motion.section className="mb-16" initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <Ruler className="w-4 h-4 text-muted" strokeWidth={1.8} />
            <h2 className="text-base font-semibold text-strong tracking-[var(--type-letter-title)]">Drawing Tools</h2>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex items-center gap-3 p-3.5 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--surface-panel)] hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-soft)] transition-all text-left"
                >
                  <Icon className="w-4 h-4 text-muted group-hover:text-brand transition-colors shrink-0" strokeWidth={1.8} />
                  <span className="text-sm font-medium text-strong group-hover:text-brand transition-colors">{tool.title}</span>
                </Link>
              );
            })}
          </motion.div>
        </motion.section>

        <motion.section className="mb-16" initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <Sparkles className="w-4 h-4 text-muted" strokeWidth={1.8} />
            <h2 className="text-base font-semibold text-strong tracking-[var(--type-letter-title)]">Start from Template</h2>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATES.map((tpl) => (
              <Link
                key={tpl.title}
                href="/planner/studio"
                className="group flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--surface-panel)] overflow-hidden hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-soft)] transition-all text-left"
              >
                <div className="p-3 pb-0">
                  <MiniFloorplan roomW={tpl.roomW} roomD={tpl.roomD} items={tpl.items} width={300} height={140} />
                </div>
                <div className="p-4 pt-2 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-strong">{tpl.title}</h3>
                    <p className="typ-caption text-muted mt-0.5">{tpl.subtitle}</p>
                  </div>
                  <span className="shrink-0 typ-caption font-medium text-muted group-hover:text-brand transition-colors whitespace-nowrap">
                    Use Template
                  </span>
                </div>
              </Link>
            ))}
          </motion.div>
        </motion.section>

        <motion.section initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <Clock className="w-4 h-4 text-muted" strokeWidth={1.8} />
            <h2 className="text-base font-semibold text-strong tracking-[var(--type-letter-title)]">Recent Plans</h2>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {RECENT_PLANS.map((plan) => (
              <Link
                key={plan.name}
                href="/planner/studio"
                className="group flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--surface-panel)] overflow-hidden hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-soft)] transition-all text-left"
              >
                <div className="p-3 pb-0">
                  <MiniFloorplan roomW={plan.roomW} roomD={plan.roomD} items={plan.items} width={320} height={140} />
                </div>
                <div className="p-4 pt-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-strong truncate">{plan.name}</h3>
                    <p className="typ-caption text-muted mt-0.5">{plan.date}</p>
                  </div>
                  <span className="typ-caption font-medium text-muted group-hover:text-brand transition-colors whitespace-nowrap">
                    Continue editing
                  </span>
                </div>
              </Link>
            ))}
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
