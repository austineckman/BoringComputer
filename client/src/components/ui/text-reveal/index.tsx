"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useTransform, useScroll, useSpring, MotionValue } from "framer-motion";

export interface TextRevealProps {
  text: string;
  className?: string;
  revealText?: boolean;
  revealOpacity?: number;
}

export const TextReveal = ({
  text,
  className = "",
  revealText = false,
  revealOpacity = 0.5,
}: TextRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [textArray, setTextArray] = useState<string[]>([]);

  useEffect(() => {
    setTextArray(text.split(""));
  }, [text]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ position: "relative" }}
    >
      <div className={hasEntered ? "opacity-100" : "opacity-0"}>
        {text}
      </div>
      {revealText && (
        <div
          className="absolute top-0 left-0 w-full h-full flex"
          style={{ color: "currentColor", opacity: revealOpacity }}
        >
          {textArray.map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              initial={{ opacity: 0, y: "0.25em" }}
              animate={
                hasEntered
                  ? {
                      opacity: 1,
                      y: "0em",
                      transition: { duration: 0.4, delay: index * 0.05 },
                    }
                  : {}
              }
              style={{ width: letter === " " ? "0.25em" : "auto" }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
};