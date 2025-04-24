"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export interface SpotlightProps {
  className?: string;
  fill?: string;
}

export const Spotlight = ({
  className = "",
  fill = "rgba(120, 119, 198, 0.15)",
}: SpotlightProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        mouseX.set(x);
        mouseY.set(y);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  const background = useMotionTemplate`radial-gradient(650px circle at ${mouseX}px ${mouseY}px, ${fill}, transparent 70%)`;

  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 z-0 transition duration-300 ${className}`}
      style={{
        background,
      }}
      ref={ref}
    />
  );
};