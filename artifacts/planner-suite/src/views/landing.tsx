"use client";

import { useRouter } from "next/navigation";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import SocialProof from "@/components/landing/social-proof";
import CTA from "@/components/landing/cta";
import Footer from "@/components/landing/footer";
import ClientLogos from "@/components/landing/client-logos";

export default function Landing() {
  const router = useRouter();
  const handleGetStarted = () => router.push("/sign-up");

  return (
    <div className="min-h-screen bg-background">
      <header>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-white/[0.04] transition-all duration-300" aria-label="Main navigation">
          <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={"/logo-v2-white.webp"} alt="One&Only" className="h-6 w-auto" width={120} height={24} />
            </div>
            <div className="hidden md:flex items-center gap-8 text-[13px] text-white/40 font-medium">
              <button onClick={handleGetStarted} className="hover:text-white/80 transition-colors duration-300">Planner</button>
              <button onClick={handleGetStarted} className="hover:text-white/80 transition-colors duration-300">Products</button>
              <button onClick={handleGetStarted} className="hover:text-white/80 transition-colors duration-300">Solutions</button>
              <button onClick={handleGetStarted} className="hover:text-white/80 transition-colors duration-300">Portfolio</button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => router.push("/sign-up")} className="text-[13px] text-white/50 hover:text-white transition-colors duration-300 font-medium px-4 py-1.5">
                Sign In
              </button>
              <button
                onClick={() => router.push("/sign-up")}
                className="text-[13px] bg-white text-[var(--text-inverse)] px-5 py-2 rounded-full hover:bg-white/90 transition-all duration-300 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.08)]"
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main id="main-content">
        <Hero onGetStarted={handleGetStarted} />
        <ClientLogos />
        <Features />
        <SocialProof />
        <CTA onGetStarted={handleGetStarted} />
      </main>
      <Footer />
    </div>
  );
}
