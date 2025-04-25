import React, { useEffect, useState } from 'react';

interface PixelLoaderProps {
  message?: string;
  color?: string;
  size?: number;
  speed?: number;
}

const PixelLoader: React.FC<PixelLoaderProps> = ({
  message = "Loading...",
  color = "#ff6b6b",
  size = 8,
  speed = 300,
}) => {
  const [frame, setFrame] = useState(0);
  
  // Animation frames represented as ASCII art patterns
  const frames = [
    [
      "  ██  ", 
      "██████", 
      "██████", 
      "██████", 
      "  ██  "
    ],
    [
      " ████ ", 
      "██████", 
      "██████", 
      "██████", 
      " ████ "
    ],
    [
      "██████", 
      "██████", 
      "██████", 
      "██████", 
      "██████"
    ],
    [
      "██████", 
      "██  ██", 
      "██  ██", 
      "██  ██", 
      "██████"
    ],
    [
      "██████", 
      "██  ██", 
      "      ", 
      "██  ██", 
      "██████"
    ],
    [
      "██  ██", 
      "      ", 
      "      ", 
      "      ", 
      "██  ██"
    ],
    [
      "██  ██", 
      "      ", 
      "  ██  ", 
      "      ", 
      "██  ██"
    ],
    [
      "██  ██", 
      "      ", 
      " ████ ", 
      "      ", 
      "██  ██"
    ],
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prevFrame) => (prevFrame + 1) % frames.length);
    }, speed);
    
    return () => clearInterval(interval);
  }, [frames.length, speed]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <div 
        className="relative"
        style={{
          height: `${size * 5}px`,
          width: `${size * 6}px`,
        }}
      >
        {frames[frame].map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {[...row].map((cell, cellIndex) => (
              <div 
                key={`${rowIndex}-${cellIndex}`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: cell === "█" ? color : "transparent",
                  imageRendering: "pixelated",
                }}
              />
            ))}
          </div>
        ))}
      </div>
      
      <div className="text-sm font-pixel text-center animate-pulse mt-2">
        {message}
      </div>
    </div>
  );
};

export default PixelLoader;