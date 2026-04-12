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
  const handleGetStarted = () => router.push("/sign-in");

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-[#0B1324] border-b border-white/10">
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={"/logo-v2-white.webp"} alt="One&Only" className="h-7 w-auto" />
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/80">
            <button onClick={handleGetStarted} className="hover:text-white transition-colors">Planner</button>
            <button onClick={handleGetStarted} className="hover:text-white transition-colors">Products</button>
            <button onClick={handleGetStarted} className="hover:text-white transition-colors">Solutions</button>
            <button onClick={handleGetStarted} className="hover:text-white transition-colors">Portfolio</button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/sign-in")} className="text-sm text-white hover:text-white/80 transition-colors font-medium border border-white/40 px-4 py-1.5 rounded-full hover:border-white/70">
              Sign In
            </button>
            <button
              onClick={() => router.push("/sign-up")}
              className="text-sm bg-white text-navy px-5 py-2 rounded-full hover:bg-white/90 transition-colors font-medium"
            >
              Guided Planner
            </button>
          </div>
        </div>
      </nav>

      <Hero onGetStarted={handleGetStarted} />
      <ClientLogos />
      <Features />
      <SocialProof />
      <CTA onGetStarted={handleGetStarted} />
      <Footer />
    </div>
  );
}
