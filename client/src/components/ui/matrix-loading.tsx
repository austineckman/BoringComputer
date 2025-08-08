import React, { useEffect, useRef } from 'react';

interface MatrixLoadingProps {
  message?: string;
  className?: string;
}

export function MatrixLoading({ message = "Loading...", className = "" }: MatrixLoadingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters - mix of katakana, hiragana, and some ASCII
    const matrixChars = "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑";
    const chars = matrixChars.split("");

    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    let animationId: number;

    const draw = () => {
      // Black background with slight transparency for trailing effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0'; // Matrix green
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // Draw character
        ctx.fillStyle = `rgba(0, 255, 0, ${Math.random() * 0.8 + 0.2})`;
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop randomly or when it reaches bottom
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className={`fixed inset-0 bg-black flex items-center justify-center z-50 ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ background: 'black' }}
      />
      <div className="relative z-10 text-center">
        <div className="text-green-400 text-xl font-mono mb-4 animate-pulse">
          {message}
        </div>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}