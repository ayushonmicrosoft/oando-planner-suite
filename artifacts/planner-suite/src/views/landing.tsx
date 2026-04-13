"use client";

import Link from "next/link";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import SocialProof from "@/components/landing/social-proof";
import CTA from "@/components/landing/cta";
import Footer from "@/components/landing/footer";
import ClientLogos from "@/components/landing/client-logos";

export default function Landing() {
  const handleGetStarted = () => { window.location.href = "/sign-up"; };

  return (
    <div className="min-h-screen bg-background">
      <header>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-white/[0.04] transition-all duration-300" aria-label="Main navigation">
          <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={"/logo-v2-white.webp"} alt="One&Only" className="h-6 w-auto" width={120} height={24} />
            </div>
            <div className="hidden md:flex items-center gap-8 text-[13px] text-white/40 font-medium">
              <Link href="/planner/canvas" className="hover:text-white/80 transition-colors duration-300">Planner</Link>
              <Link href="/catalog" className="hover:text-white/80 transition-colors duration-300">Products</Link>
              <Link href="/templates" className="hover:text-white/80 transition-colors duration-300">Solutions</Link>
              <Link href="/projects" className="hover:text-white/80 transition-colors duration-300">Portfolio</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/sign-up" className="text-[13px] text-white/50 hover:text-white transition-colors duration-300 font-medium px-4 py-1.5">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-[13px] bg-white text-[var(--text-inverse)] px-5 py-2 rounded-full hover:bg-white/90 transition-all duration-300 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.08)]"
              >
                Get Started
              </Link>
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
