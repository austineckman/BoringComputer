import React, { useState, useRef, useEffect } from 'react';

interface PixelCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  disabled?: boolean;
}

export const PixelCard: React.FC<PixelCardProps> = ({ 
  children, 
  className = "", 
  onClick, 
  onMouseEnter,
  disabled = false 
}) => {
  const [pixels, setPixels] = useState<Array<{ x: number; y: number; color: string }>>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];

  const generatePixels = (centerX: number, centerY: number) => {
    const newPixels = [];
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const radius = 100 + Math.random() * 50;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const color = colors[Math.floor(Math.random() * colors.length)];
      newPixels.push({ x, y, color });
    }
    return newPixels;
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (disabled) return;
    
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = e.clientX - rect.left;
      const centerY = e.clientY - rect.top;
      setPixels(generatePixels(centerX, centerY));
      
      if (onMouseEnter) onMouseEnter();
    }
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    
    // Clear pixels after a short delay for smooth exit
    timeoutRef.current = setTimeout(() => {
      setPixels([]);
    }, 300);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled) return;
    
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = e.clientX - rect.left;
      const centerY = e.clientY - rect.top;
      setPixels(generatePixels(centerX, centerY));
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {children}
      
      {/* Pixel Animation Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {pixels.map((pixel, index) => (
          <div
            key={index}
            className="absolute w-1 h-1"
            style={{
              left: pixel.x,
              top: pixel.y,
              backgroundColor: pixel.color,
              animation: `pixelExplode 0.8s ease-out forwards`,
              animationDelay: `${index * 0.01}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PixelCard;