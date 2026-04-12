"use client";


export default function Footer() {
  return (
    <footer className="bg-navy-dark text-white/70 py-12">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={`/logo-v2-white.webp`} alt="One&Only" className="h-6 w-auto" />
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <span>Floor Plans</span>
            <span>CAD Drawing</span>
            <span>Site Plans</span>
            <span>Templates</span>
            <span>3D Viewer</span>
          </div>
          <div className="text-sm">
            <a href="https://oando.co.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              oando.co.in
            </a>
            <span className="mx-2">&middot;</span>
            &copy; {new Date().getFullYear()} One&Only
          </div>
        </div>
      </div>
    </footer>
  );
}
