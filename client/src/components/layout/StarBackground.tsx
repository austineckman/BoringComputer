import { useEffect, useRef } from "react";

interface StarBackgroundProps {
  starCount?: number;
}

const StarBackground = ({ starCount = 100 }: StarBackgroundProps) => {
  const starFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!starFieldRef.current) return;
    
    // Clear any existing stars
    starFieldRef.current.innerHTML = "";
    
    // Create star field background
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      star.style.width = `${Math.random() * 2 + 1}px`;
      star.style.height = star.style.width;
      starFieldRef.current.appendChild(star);
    }
  }, [starCount]);

  return <div className="star-field" ref={starFieldRef} />;
};

export default StarBackground;
