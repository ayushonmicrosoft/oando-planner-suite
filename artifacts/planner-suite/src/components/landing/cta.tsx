"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface CTAProps {
  onGetStarted: () => void;
}

export default function CTA({ onGetStarted }: CTAProps) {
  return (
    <section className="py-28 lg:py-36 bg-[#070D12] relative overflow-hidden" aria-label="Call to action">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#5488B6]/[0.05] rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#5488B6]/[0.08] rounded-full blur-[80px]" />
      </div>

      <motion.div
        className="max-w-[680px] mx-auto px-5 text-center relative"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#5488B6] mb-4">Get Started</p>
        <h2 className="text-[32px] md:text-[48px] font-bold text-white mb-6 tracking-[-0.02em]">
          Ready to Design Your
          <br />
          Perfect Workspace?
        </h2>
        <p className="text-[17px] text-white/35 mb-10 max-w-[480px] mx-auto leading-relaxed">
          Join 120+ organisations across India who trust One&amp;Only for their workspace design and office furniture planning.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              onClick={onGetStarted}
              className="text-[15px] px-10 py-6 h-auto gap-2.5 bg-white text-[#0B1324] hover:bg-white/90 rounded-full font-semibold shadow-[0_18px_40px_-12px_rgba(255,255,255,0.15)]"
            >
              Start Planning Free <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </motion.div>
        </div>
        <p className="text-[13px] text-white/15 mt-8">No credit card required</p>
      </motion.div>
    </section>
  );
}
