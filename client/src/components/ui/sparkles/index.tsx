"use client";

import React, { useRef, useEffect } from "react";
import { useTheme } from "next-themes";

interface SparklesCoreProps {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
  className?: string;
  particleImage?: string;
}

type Particle = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  size: number;
  particleImage?: HTMLImageElement;
};

export const SparklesCore = ({
  id,
  className,
  background,
  minSize,
  maxSize,
  speed,
  particleColor,
  particleDensity,
  particleImage,
}: SparklesCoreProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame: number;
    let particles: Particle[] = [];
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    const handleResize = () => {
      if (canvas) {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
      }
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(
        Math.max(
          Math.round((width * height) / (particleDensity || 10000)),
          10
        ),
        300
      );

      let img: HTMLImageElement | undefined;
      if (particleImage) {
        img = new Image();
        img.src = particleImage;
      }

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          ox: Math.random() * width,
          oy: Math.random() * height,
          vx: Math.random() - 0.5,
          vy: Math.random() - 0.5,
          size: Math.random() * ((maxSize || 4) - (minSize || 1)) + (minSize || 1),
          particleImage: img,
        });
      }
    };

    const drawParticles = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = background || "rgba(0, 0, 0, 0)";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = particleColor || (isDarkTheme ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)");

      const speedFactor = speed || 0.5;

      particles.forEach((p) => {
        p.x += p.vx * speedFactor;
        p.y += p.vy * speedFactor;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        if (p.particleImage) {
          ctx.drawImage(
            p.particleImage,
            p.x - p.size / 2,
            p.y - p.size / 2,
            p.size,
            p.size
          );
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.strokeStyle = particleColor || (isDarkTheme ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)");
          ctx.stroke();
        }
      });

      animationFrame = requestAnimationFrame(drawParticles);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    drawParticles();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrame);
    };
  }, [
    background, 
    minSize, 
    maxSize, 
    speed, 
    particleColor, 
    particleDensity, 
    particleImage, 
    isDarkTheme
  ]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
};