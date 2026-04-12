import { Grid3X3, Pencil, LayoutGrid, Shapes, ImagePlus, Map, FileSignature, Box } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Grid3X3,
    title: "2D Canvas Planner",
    desc: "Drag-and-drop furniture onto a Konva-powered canvas. Resize, rotate, and snap to grid with transform handles.",
    color: "text-navy bg-navy/10",
  },
  {
    icon: FileSignature,
    title: "Blueprint Wizard",
    desc: "Step-by-step guided room setup. Choose dimensions, select furniture by category, auto-generate a bill of quantities.",
    color: "text-navy-mid bg-navy-mid/10",
  },
  {
    icon: Pencil,
    title: "CAD Drawing",
    desc: "Vector drawing with lines, rectangles, ellipses, text and measurement tools. Professional-grade precision.",
    color: "text-navy-light bg-navy-light/10",
  },
  {
    icon: LayoutGrid,
    title: "Floor Plan Creator",
    desc: "Room-based layout builder with 12 room presets, automatic area calculations, and color-coded zones.",
    color: "text-emerald-600 bg-emerald-600/10",
  },
  {
    icon: Shapes,
    title: "Custom Shapes",
    desc: "25+ categorized shapes for walls, furniture, electrical, plumbing and safety elements. Full drag, resize, rotate.",
    color: "text-cat-purple bg-cat-purple/10",
  },
  {
    icon: Map,
    title: "Site Plan Designer",
    desc: "Create outdoor site plans with buildings, parking lots, roads, landscaping, and utility elements on a scaled grid.",
    color: "text-cat-green bg-cat-green/10",
  },
  {
    icon: ImagePlus,
    title: "Import & Scale",
    desc: "Upload existing blueprints, calibrate scale, and annotate over imported images with lines and measurements.",
    color: "text-cat-amber bg-cat-amber/10",
  },
  {
    icon: Box,
    title: "3D Viewer",
    desc: "Visualize any plan in interactive 3D. First-person walkthrough and orbit mode with real-time rendering.",
    color: "text-cat-teal bg-cat-teal/10",
  },
];

export default function Features() {
  return (
    <section className="py-20 lg:py-28 bg-secondary/50">
      <div className="max-w-[1200px] mx-auto px-5">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[32px] md:text-[44px] font-bold text-foreground mb-4">
            Everything You Need to Design Any Space
          </h2>
          <p className="text-[18px] text-muted-foreground max-w-[600px] mx-auto">
            8 powerful tools in one suite. From quick sketches to professional blueprints.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="bg-card border rounded-xl p-6 hover:shadow-lg hover:border-navy/30 transition-all duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className={`w-12 h-12 rounded-lg ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground text-[16px] mb-2">{f.title}</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
