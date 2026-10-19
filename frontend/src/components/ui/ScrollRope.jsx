// src/components/ui/ScrollRope.jsx
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

/* Vertical "rope" that fills as the page scrolls, with a knot riding the tip.
   On mobile it collapses to a thin top progress bar. */
const ScrollRope = ({ color = "#f5b83d" }) => {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const knotTop = useTransform(p, (v) => `${v * 100}%`);

  return (
    <>
      {/* desktop rope */}
      <div className="hidden lg:block fixed left-4 xl:left-6 top-24 bottom-10 w-px z-40 pointer-events-none"
           style={{ background: "var(--border-subtle, rgba(255,255,255,.08))" }} aria-hidden>
        <motion.div className="absolute inset-0 origin-top"
                    style={{ scaleY: p, background: `linear-gradient(${color},${color}00)` }} />
        <motion.span className="absolute -left-[5px] w-[11px] h-[11px] rounded-full"
                     style={{ top: knotTop, background: color, boxShadow: `0 0 14px ${color}` }} />
      </div>
      {/* mobile bar */}
      <motion.div className="lg:hidden fixed top-0 left-0 right-0 h-[3px] origin-left z-50 pointer-events-none"
                  style={{ scaleX: p, background: color }} aria-hidden />
    </>
  );
};

export default ScrollRope;