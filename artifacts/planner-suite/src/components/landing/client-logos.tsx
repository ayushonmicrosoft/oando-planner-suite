"use client";

const logos = [
  { name: "L&T", file: "LandT.webp" },
  { name: "JSW", file: "JSW.webp" },
  { name: "Tata Motors", file: "TataMotors.webp" },
  { name: "Maruti Suzuki", file: "MarutiSuzuki.webp" },
  { name: "Canara Bank", file: "CanaraBank.webp" },
  { name: "Franklin Templeton", file: "FranklinTempleton.webp" },
  { name: "USHA", file: "USHA.webp" },
  { name: "Bihar Government", file: "BiharGovernment.webp" },
  { name: "SAIL", file: "SAIL.webp" },
  { name: "BIS", file: "BIS.webp" },
  { name: "Sonalika", file: "Sonalika.webp" },
  { name: "Survey of India", file: "SurveyofIndia.webp" },
  { name: "CRI Pumps", file: "CRIPumps.webp" },
  { name: "MECON", file: "MECON.webp" },
];

export default function ClientLogos() {
  return (
    <section className="py-10 bg-background border-t border-b border-white/[0.04] overflow-hidden" aria-label="Trusted by leading organisations">
      <div className="max-w-[1200px] mx-auto px-5">
        <p className="text-[11px] text-white/20 text-center font-medium tracking-[0.2em] uppercase mb-8">Trusted by India&apos;s Leading Enterprises</p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {[...logos, ...logos].map((logo, i) => (
            <div key={i} className="flex items-center justify-center px-10 shrink-0">
              <img
                src={`/ClientLogos/${logo.file}`}
                alt={`${logo.name}`}
                className="h-8 w-auto opacity-30 hover:opacity-60 transition-opacity duration-500 grayscale brightness-200"
                loading="lazy"
                width={120}
                height={32}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
