"use client";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-dark-midnight-blue-950)] border-t border-white/[0.04] py-10" role="contentinfo">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={`/logo-v2-white.webp`} alt="One&Only Office Furniture Pvt. Ltd." className="h-5 w-auto opacity-50" width={100} height={20} />
          </div>
          <nav aria-label="Footer navigation">
            <div className="flex flex-wrap justify-center gap-8 text-[13px] text-white/20">
              <span className="hover:text-white/40 transition-colors duration-300 cursor-pointer">Floor Plans</span>
              <span className="hover:text-white/40 transition-colors duration-300 cursor-pointer">CAD Drawing</span>
              <span className="hover:text-white/40 transition-colors duration-300 cursor-pointer">Site Plans</span>
              <span className="hover:text-white/40 transition-colors duration-300 cursor-pointer">Templates</span>
              <span className="hover:text-white/40 transition-colors duration-300 cursor-pointer">3D Viewer</span>
            </div>
          </nav>
          <div className="text-[12px] text-white/15">
            <a href="https://oando.co.in" target="_blank" rel="noopener noreferrer" className="hover:text-white/30 transition-colors duration-300">
              oando.co.in
            </a>
            <span className="mx-2 opacity-30">&middot;</span>
            &copy; {new Date().getFullYear()} One&amp;Only Office Furniture Pvt. Ltd.
          </div>
        </div>
      </div>
    </footer>
  );
}
