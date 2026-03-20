"use client";

import { motion } from "framer-motion";

export function AnimatedGradientBg() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Base gradient wash — gives depth in light mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-transparent to-violet-50/60 dark:from-transparent dark:via-transparent dark:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-tl from-blue-50/50 via-transparent to-transparent dark:from-transparent dark:via-transparent dark:to-transparent" />

      {/* Gradient mesh blobs — more visible */}
      <motion.div
        className="absolute left-[10%] top-[5%] h-[500px] w-[500px] rounded-full bg-indigo-400/15 blur-[120px] dark:bg-primary/12"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 25, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        style={{ willChange: "transform" }}
      />
      <motion.div
        className="absolute right-[10%] top-[15%] h-[400px] w-[400px] rounded-full bg-violet-400/12 blur-[100px] dark:bg-violet-500/10"
        animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        style={{ willChange: "transform" }}
      />
      <motion.div
        className="absolute bottom-[5%] left-[30%] h-[350px] w-[350px] rounded-full bg-blue-400/10 blur-[100px] dark:bg-blue-500/8"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        style={{ willChange: "transform" }}
      />

      {/* Extra accent blob for light mode richness */}
      <motion.div
        className="absolute right-[25%] bottom-[15%] h-[300px] w-[300px] rounded-full bg-pink-300/8 blur-[90px] dark:bg-transparent"
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        style={{ willChange: "transform" }}
      />

      {/* Floating geometric shapes — more visible in light */}
      <motion.div
        className="absolute left-[15%] top-[20%] h-4 w-4 rounded-sm border border-primary/15 dark:border-primary/20 bg-primary/5 dark:bg-transparent"
        animate={{ y: [0, -30, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[20%] top-[15%] h-3 w-3 rounded-full border border-violet-500/15 dark:border-violet-500/20 bg-violet-500/5 dark:bg-transparent"
        animate={{ y: [0, -25, 0], rotate: [0, -180, -360] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[60%] top-[60%] h-5 w-5 rounded-sm border border-primary/12 dark:border-primary/15 bg-primary/3 dark:bg-transparent"
        animate={{ y: [0, -20, 0], rotate: [0, 90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[10%] bottom-[25%] h-3 w-3 rounded-full border border-blue-500/15 dark:border-blue-500/20 bg-blue-500/5 dark:bg-transparent"
        animate={{ y: [0, -35, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[10%] bottom-[40%] h-4 w-4 rounded-sm border border-violet-500/12 dark:border-violet-500/15 bg-violet-500/3 dark:bg-transparent"
        animate={{ y: [0, -22, 0], rotate: [0, 270, 360] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-50 dark:opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--primary) / 0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Subtle radial glow behind headline area */}
      <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-indigo-100/40 blur-[100px] dark:bg-primary/5" />
    </div>
  );
}
