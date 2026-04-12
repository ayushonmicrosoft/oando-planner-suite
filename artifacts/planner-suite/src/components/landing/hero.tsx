"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative overflow-hidden min-h-[70vh] flex items-center" aria-label="Hero">
      <div className="absolute inset-0">
        <img
          src={`/hero/titan-hero.webp`}
          alt="Modern office workspace designed by One&Only — professional office furniture layout and interior planning"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/90 via-navy-dark/70 to-navy-dark/40" />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 py-20 lg:py-32 relative w-full">
        <motion.div
          className="max-w-[640px]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="text-[48px] md:text-[72px] font-light leading-[1.05] text-white mb-4 tracking-tight">
            Office Planner &amp; Workspace Design Tool
          </h1>
          <p className="text-[18px] md:text-[20px] text-white/80 mb-8 max-w-[520px] leading-relaxed">
            Plan, design, and visualize your office space with India&apos;s leading office furniture planning software. From quick layouts to professional blueprints.
          </p>
          <div className="flex flex-wrap gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                onClick={onGetStarted}
                className="text-[15px] px-7 py-3 h-auto gap-2 bg-navy text-white hover:bg-navy/90 rounded-full border border-white/10"
              >
                Explore Products
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                onClick={onGetStarted}
                className="text-[15px] px-7 py-3 h-auto gap-2 bg-white/10 text-white hover:bg-white/20 rounded-full border border-white/20 backdrop-blur-sm"
              >
                Request Quote
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
