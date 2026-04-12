import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const BASE = import.meta.env.BASE_URL;

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative overflow-hidden min-h-[70vh] flex items-center">
      <div className="absolute inset-0">
        <img
          src={`${BASE}hero/titan-hero.webp`}
          alt="Workspace by One&Only"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1324]/90 via-[#0B1324]/70 to-[#0B1324]/40" />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 py-20 lg:py-32 relative w-full">
        <motion.div
          className="max-w-[640px]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="text-[48px] md:text-[72px] font-light leading-[1.05] text-white mb-8 tracking-tight">
            Work.
            <br />
            Space.
            <br />
            Performance.
          </h1>
          <div className="flex flex-wrap gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                onClick={onGetStarted}
                className="text-[15px] px-7 py-3 h-auto gap-2 bg-[#1F3653] text-white hover:bg-[#1F3653]/90 rounded-full border border-white/10"
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
