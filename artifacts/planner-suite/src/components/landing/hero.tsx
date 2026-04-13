"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center" aria-label="Hero">
      <div className="absolute inset-0">
        <img
          src={`/hero/titan-hero.webp`}
          alt="Modern office workspace designed by One&Only"
          className="w-full h-full object-cover scale-105"
          width={1920}
          height={1080}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-background)]/95 via-[var(--color-dark-midnight-blue-850)]/85 to-[var(--color-dark-midnight-blue-850)]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)]/40 via-transparent to-transparent" />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 py-28 lg:py-40 relative w-full">
        <motion.div
          className="max-w-[680px]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-white/60 font-medium tracking-wide">India&apos;s #1 Office Planning Platform</span>
          </motion.div>

          <h1 className="text-[46px] md:text-[64px] lg:text-[76px] font-bold leading-[1.02] text-white mb-7 tracking-[-0.03em]">
            Design Your
            <br />
            <span className="bg-gradient-to-r from-[var(--color-ocean-boat-blue-500)] via-[var(--color-ocean-boat-blue-400)] to-[var(--color-ocean-boat-blue-500)] bg-clip-text text-transparent">
              Perfect Office
            </span>
          </h1>

          <p className="text-[17px] md:text-[19px] text-white/50 mb-10 max-w-[520px] leading-[1.7] font-light">
            Plan, visualize, and furnish your workspace with professional-grade tools.
            From 2D floor plans to 3D walkthroughs — all in one platform.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                onClick={onGetStarted}
                className="text-[15px] px-8 py-6 h-auto gap-2.5 bg-white text-[var(--text-inverse)] hover:bg-white/90 rounded-full font-semibold shadow-[0_18px_40px_-12px_rgba(255,255,255,0.15)]"
              >
                Start Planning Free <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                onClick={onGetStarted}
                className="text-[15px] px-8 py-6 h-auto gap-2.5 bg-white/[0.06] text-white hover:bg-white/[0.12] rounded-full border border-white/[0.10] backdrop-blur-xl font-medium"
              >
                <Play className="w-4 h-4 fill-current" /> Watch Demo
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 flex items-center gap-6 text-white/30 text-sm"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              120+ organisations trust us
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--color-background)] to-transparent" />
    </section>
  );
}
