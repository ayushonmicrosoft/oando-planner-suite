import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface CTAProps {
  onGetStarted: () => void;
}

export default function CTA({ onGetStarted }: CTAProps) {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-r from-navy-dark to-navy relative overflow-hidden" aria-label="Call to action">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-1/4 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="max-w-[800px] mx-auto px-5 text-center relative"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-[32px] md:text-[44px] font-bold text-white mb-6">
          Ready to Design Your Office Space?
        </h2>
        <p className="text-[18px] text-white/70 mb-10 max-w-[560px] mx-auto">
          Join thousands of professionals across India who trust One&amp;Only
          for their workspace design and office furniture planning needs. Start free, no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              onClick={onGetStarted}
              className="text-[16px] px-8 py-3 h-auto gap-2 bg-white text-navy hover:bg-white/90 rounded-full shadow-lg"
            >
              Start Designing Now <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
