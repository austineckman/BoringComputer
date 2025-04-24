import React from "react";
import { cn } from "@/lib/utils";

interface PixelCardProps {
  className?: string;
  children: React.ReactNode;
  active?: boolean;
  interactive?: boolean;
}

const PixelCard = ({
  className,
  children,
  active = false,
  interactive = false,
}: PixelCardProps) => {
  return (
    <div
      className={cn(
        "pixel-border bg-space-mid rounded-lg overflow-hidden",
        interactive && "quest-card",
        active && "border-2 border-brand-orange",
        className
      )}
    >
      {children}
    </div>
  );
};

export const PixelCardHeader = ({
  className,
  children,
  color = "bg-space-light",
  heroImage,
}: {
  className?: string;
  children: React.ReactNode;
  color?: string;
  heroImage?: string;
}) => {
  return (
    <>
      {heroImage && (
        <div className="w-full h-48 relative">
          <img 
            src={heroImage} 
            alt="Quest hero image" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-space-dark/90 to-transparent"></div>
        </div>
      )}
      <div
        className={cn(
          `${color} px-4 py-2 flex justify-between items-center`,
          className
        )}
      >
        {children}
      </div>
    </>
  );
};

export const PixelCardContent = ({
  className,
  children,
  questImage,
  imageAlt,
}: {
  className?: string;
  children: React.ReactNode;
  questImage?: string;
  imageAlt?: string;
}) => {
  return (
    <div className={cn("p-5", className)}>
      {questImage && (
        <div className="mb-4 w-full overflow-hidden rounded-md">
          <img 
            src={questImage} 
            alt={imageAlt || "Quest image"} 
            className="w-full h-auto object-cover" 
          />
        </div>
      )}
      {children}
    </div>
  );
};

export default PixelCard;
