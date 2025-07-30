import React, { useRef, useEffect, useState } from 'react';

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
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      card.style.boxShadow = `
        ${(x - centerX) / 5}px ${(y - centerY) / 5}px 50px rgba(0, 0, 0, 0.5),
        0 0 30px rgba(255, 165, 0, 0.3)
      `;
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
      card.style.transition = 'none';
      if (onMouseEnter) onMouseEnter();
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      card.style.transition = 'all 0.3s ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [disabled, onMouseEnter]);

  return (
    <div
      ref={cardRef}
      className={`relative transform-gpu transition-all duration-300 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      onClick={disabled ? undefined : onClick}
      style={{
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
      }}
    >
      {children}
      {isHovered && !disabled && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(45deg, rgba(255, 165, 0, 0.1), rgba(255, 165, 0, 0.2))',
            borderRadius: 'inherit',
          }}
        />
      )}
    </div>
  );
};

export default PixelCard;