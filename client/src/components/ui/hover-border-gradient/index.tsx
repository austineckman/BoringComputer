"use client";

import React, { useState } from "react";
import { motion, MotionProps, useMotionTemplate, useMotionValue } from "framer-motion";

export interface HoverBorderGradientProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  as?: React.ElementType;
  duration?: number;
  animateProps?: MotionProps;
  from?: number;
  via?: number;
  to?: number;
  fromColor?: string;
  viaColor?: string;
  toColor?: string;
  border?: number;
  borderRadius?: number;
}

export const HoverBorderGradient = ({
  children,
  className = "",
  containerClassName = "",
  animateProps,
  as = "div",
  from = 0,
  via = 0,
  to = 0,
  fromColor = "rgb(var(--foreground))",
  viaColor = "rgb(var(--foreground))",
  toColor = "rgb(var(--foreground))",
  border = 1,
  borderRadius = 8,
}: HoverBorderGradientProps) => {
  const Component = as;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
  };

  const background = useMotionTemplate`
    radial-gradient(
      ${hovered ? "500px" : "0px"} circle at ${mouseX}px ${mouseY}px,
      ${fromColor},
      ${viaColor},
      ${toColor}
    )
  `;

  return (
    <motion.div
      style={{
        position: "relative",
        display: "flex", 
        borderRadius: borderRadius
      }}
      className={containerClassName}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...animateProps}
    >
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background,
          zIndex: 0,
          opacity: 0.5,
          pointerEvents: "none",
          borderRadius: borderRadius
        }}
      />
      <Component
        style={{
          position: "relative",
          zIndex: 2,
          borderRadius: borderRadius,
          width: "100%"
        }}
        className={className}
      >
        {children}
      </Component>
    </motion.div>
  );
};