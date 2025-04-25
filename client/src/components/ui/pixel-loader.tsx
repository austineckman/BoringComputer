import React from "react";

type PixelLoaderProps = {
  size?: "sm" | "md" | "lg";
  color?: string;
};

const PixelLoader: React.FC<PixelLoaderProps> = ({
  size = "md",
  color = "orange",
}) => {
  const sizesMap = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };
  
  const sizeClass = sizesMap[size];
  const colorClass = `text-brand-${color}`;

  return (
    <div className={`${sizeClass} relative`} aria-label="Loading">
      <div className={`${colorClass} animate-pixel-loader`}>
        <div className="absolute top-0 left-0 w-2/6 h-2/6 bg-current"></div>
        <div className="absolute top-0 right-0 w-2/6 h-2/6 bg-current"></div>
        <div className="absolute bottom-0 left-0 w-2/6 h-2/6 bg-current"></div>
        <div className="absolute bottom-0 right-0 w-2/6 h-2/6 bg-current"></div>
      </div>
    </div>
  );
};

export default PixelLoader;