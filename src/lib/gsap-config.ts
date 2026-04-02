import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register plugins once (client-side only)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };

// Shared eases
export const EASE_OUT_EXPO = "expo.out";
export const EASE_OUT_BACK = "back.out(1.7)";
export const EASE_INOUT_SINE = "sine.inOut";
