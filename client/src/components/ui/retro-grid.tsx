import React, { useEffect, useRef } from "react";

interface RetroGridProps {
  title?: string;
  className?: string;
  gridProps?: React.HTMLAttributes<HTMLDivElement>;
}

export default function RetroGrid({
  title = "Ready Player One",
  className,
  gridProps,
}: RetroGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size to match container size
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    
    // Draw the grid
    const drawGrid = () => {
      if (!ctx || !canvas) return;
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Grid settings
      const gridSize = 40; // Size of grid cells
      const gridColor = "#4a00e021"; // Light purple color with low opacity for the grid
      
      // Calculate the number of cells in each dimension
      const cellsX = Math.ceil(width / gridSize);
      const cellsY = Math.ceil(height / gridSize);
      
      // Draw vertical lines
      for (let i = 0; i <= cellsX; i++) {
        const x = i * gridSize;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.strokeStyle = gridColor;
        ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let i = 0; i <= cellsY; i++) {
        const y = i * gridSize;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.strokeStyle = gridColor;
        ctx.stroke();
      }
      
      // Add a gradient horizon line
      const gradient = ctx.createLinearGradient(0, height * 0.7, 0, height * 0.8);
      gradient.addColorStop(0, "#4a00e010");
      gradient.addColorStop(0.5, "#4a00e035"); 
      gradient.addColorStop(1, "#4a00e005");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height * 0.7, width, height * 0.3);
    };
    
    // Initial setup
    resizeCanvas();
    drawGrid();
    
    // Set up resize listener
    const handleResize = () => {
      resizeCanvas();
      drawGrid();
    };
    
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full ${className}`} 
      {...gridProps}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 w-full h-full"
      />
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
        <h1 className="text-5xl md:text-7xl font-pixel leading-none text-center text-white drop-shadow-[0_0_15px_rgba(74,0,224,0.8)]">
          {title}
        </h1>
      </div>
    </div>
  );
}