import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    quote: "This tool transformed how we handle facility planning. We used to spend weeks with architects for minor changes. Now our team makes updates in hours.",
    name: "Michael Johnson",
    title: "Battalion Chief, Loudoun Fire and Rescue",
  },
  {
    quote: "Our commercial construction company oversees office buildouts from initial design to completion. This provided an affordable, user-friendly tool for making rapid adjustments without relying on architects for every minor change.",
    name: "Jake Goodew",
    title: "Project Manager, Arete Commercial Construction",
  },
  {
    quote: "After evaluating available options, we determined this tool best met our needs for producing detailed, accurate diagrams that integrate seamlessly with existing documentation tools.",
    name: "Massi A. Martin, DPA",
    title: "Commanding Officer, Crime Scene Unit",
  },
  {
    quote: "We're able to create clear, easy-to-follow diagrams with directions and annotations that our team can quickly understand on scene. The software produces accurate, professional drawings for reconstruction.",
    name: "Jonathan Shim",
    title: "Captain, Office of the Fire Marshal",
  },
];

const stats = [
  { value: "120+", label: "Organisations served" },
  { value: "259+", label: "Projects delivered" },
  { value: "15+", label: "Years experience" },
  { value: "18+", label: "Sectors served" },
];

const reviews = [
  { stars: 5, title: "Best Diagramming Tool for Teams", text: "Makes it incredibly easy to create professional-quality diagrams. The templates are comprehensive and the learning curve is minimal.", reviewer: "IT Manager" },
  { stars: 5, title: "Perfect for Floor Plans", text: "We use it for all our facility planning. The scaled drawing feature is accurate and intuitive. Highly recommend for any organization.", reviewer: "Facilities Director" },
  { stars: 5, title: "Great Alternative to Legacy CAD", text: "Better templates, easier to use, and the collaboration features are excellent. Haven't looked back since switching.", reviewer: "Operations Manager" },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

export default function SocialProof() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((p) => (p + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-[1200px] mx-auto px-5">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-navy">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[32px] md:text-[44px] font-bold text-foreground mb-4">
            Trusted by Thousands of Teams
          </h2>
          <p className="text-[18px] text-muted-foreground">
            Real teams. Real results. See how professionals get more done.
          </p>
        </motion.div>

        <div className="max-w-[800px] mx-auto mb-16">
          <div className="bg-card border rounded-xl p-8 md:p-12 shadow-sm min-h-[240px]">
            <div className="flex items-start gap-3 mb-6">
              <svg className="w-10 h-10 text-navy/30 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <blockquote className="text-[16px] md:text-[18px] text-muted-foreground leading-relaxed italic mb-8">
                  &ldquo;{testimonials[active].quote}&rdquo;
                </blockquote>
                <div>
                  <div className="font-bold text-foreground text-[16px]">{testimonials[active].name}</div>
                  <div className="text-[14px] text-muted-foreground">{testimonials[active].title}</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === active ? "bg-navy w-8" : "bg-border hover:bg-muted-foreground"
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <StarRating count={review.stars} />
              <h3 className="font-bold text-foreground text-[16px] mt-3 mb-2">{review.title}</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">{review.text}</p>
              <p className="text-[13px] text-muted-foreground/70">{review.reviewer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
