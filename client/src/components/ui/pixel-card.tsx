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
            onError={(e) => {
              // If the image fails to load, use a fallback
              console.log("Quest image failed to load:", questImage);
              
              if (!questImage) {
                // If no image is provided, hide the container
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.style.display = 'none';
                return;
              }
              
              // Extract just the filename from the path
              const imageName = questImage.split('/').pop(); 
              
              if (!imageName) {
                // If we can't extract the filename, hide the container
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.style.display = 'none';
                return;
              }
              
              // 1. First try: Direct path from public/uploads/quest-images
              if (questImage.includes('/uploads/')) {
                // It's already a quest image path, try to fix it by using the direct public path
                e.currentTarget.src = `/uploads/quest-images/${imageName}`;
                console.log("Trying direct quest image path:", `/uploads/quest-images/${imageName}`);
                
                // Set up a second error handler in case this still fails
                e.currentTarget.onerror = () => {
                  // 2. Second try: Check if we can find an image with the same name in public/images/resources
                  e.currentTarget.src = `/images/resources/${imageName}`;
                  console.log("Trying resources path:", `/images/resources/${imageName}`);
                  
                  // Final error handler
                  e.currentTarget.onerror = () => {
                    // 3. Final fallback: Hide the image container if no alternatives work
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.style.display = 'none';
                  };
                };
              } else {
                // Not a quest image, try resources directory
                e.currentTarget.src = `/images/resources/${imageName}`;
                console.log("Trying resources path:", `/images/resources/${imageName}`);
                
                // Set up a second error handler
                e.currentTarget.onerror = () => {
                  // Hide if that fails too
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.style.display = 'none';
                };
              }
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
};

export default PixelCard;
