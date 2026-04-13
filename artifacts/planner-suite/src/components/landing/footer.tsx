import Link from "next/link";

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
              <Link href="/tools/floor-plan" className="hover:text-white/40 transition-colors duration-300">Floor Plans</Link>
              <Link href="/tools/cad" className="hover:text-white/40 transition-colors duration-300">CAD Drawing</Link>
              <Link href="/tools/site-plan" className="hover:text-white/40 transition-colors duration-300">Site Plans</Link>
              <Link href="/templates" className="hover:text-white/40 transition-colors duration-300">Templates</Link>
              <Link href="/viewer/3d" className="hover:text-white/40 transition-colors duration-300">3D Viewer</Link>
            </div>
          </nav>
          <div className="text-[12px] text-white/15 flex flex-wrap items-center gap-x-1">
            <a href="https://oando.co.in" target="_blank" rel="noopener noreferrer" className="hover:text-white/30 transition-colors duration-300">
              oando.co.in
            </a>
            <span className="opacity-30">&middot;</span>
            &copy; {new Date().getFullYear()} One&amp;Only Office Furniture Pvt. Ltd.
            <span className="opacity-30">&middot;</span>
            <a href="/privacy" className="hover:text-white/30 transition-colors duration-300">Privacy Policy</a>
            <span className="opacity-30">&middot;</span>
            <a href="/about" className="hover:text-white/30 transition-colors duration-300">About</a>
            <span className="opacity-30">&middot;</span>
            <a href="/contact" className="hover:text-white/30 transition-colors duration-300">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
