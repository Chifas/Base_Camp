"use client";

import { motion } from "framer-motion";

export function AnimatedGradientBg() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Gradient mesh blobs */}
      <motion.div
        className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15"
        animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
        transition={{ duration: 25, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        style={{ willChange: "transform" }}
      />
      <motion.div
        className="absolute -right-20 top-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/8 blur-[100px] dark:bg-violet-500/12"
        animate={{ x: [0, -60, 0], y: [0, 80, 0] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        style={{ willChange: "transform" }}
      />
      <motion.div
        className="absolute -bottom-20 left-1/3 h-[300px] w-[300px] rounded-full bg-blue-500/6 blur-[80px] dark:bg-blue-500/10"
        animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
        transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        style={{ willChange: "transform" }}
      />

      {/* Floating geometric shapes */}
      <motion.div
        className="absolute left-[15%] top-[20%] h-4 w-4 rounded-sm border border-primary/10 dark:border-primary/20"
        animate={{ y: [0, -30, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[20%] top-[15%] h-3 w-3 rounded-full border border-violet-500/10 dark:border-violet-500/20"
        animate={{ y: [0, -25, 0], rotate: [0, -180, -360] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[60%] top-[60%] h-5 w-5 rounded-sm border border-primary/8 dark:border-primary/15"
        animate={{ y: [0, -20, 0], rotate: [0, 90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[10%] bottom-[25%] h-3 w-3 rounded-full border border-blue-500/10 dark:border-blue-500/20"
        animate={{ y: [0, -35, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[10%] bottom-[40%] h-4 w-4 rounded-sm border border-violet-500/8 dark:border-violet-500/15"
        animate={{ y: [0, -22, 0], rotate: [0, 270, 360] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--primary) / 0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}
