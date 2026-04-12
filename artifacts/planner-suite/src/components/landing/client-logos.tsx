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
    <section className="py-10 bg-white border-b overflow-hidden" aria-label="Trusted by leading organisations">
      <div className="relative">
        <div className="flex animate-scroll-left" style={{ width: "max-content" }}>
          {[...logos, ...logos].map((logo, i) => (
            <div key={i} className="flex items-center justify-center px-8 shrink-0">
              <img
                src={`/ClientLogos/${logo.file}`}
                alt={`${logo.name} — One&Only client for office furniture and workspace planning`}
                className="h-10 w-auto opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                loading="lazy"
                width={120}
                height={40}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
