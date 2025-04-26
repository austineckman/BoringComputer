import React, { useState, useEffect, useRef } from "react";

// ASCII art - new retro computer terminal design
const SMALL_ASCII_ART = `
             ________________________________________________
            /                                                \\
           |    _________________________________________     |
           |   |                                         |    |
           |   |  C:\\> CRAFTING TABLE OS v1.0.4815       |    |
           |   |  C:\\> BOOT SEQUENCE INITIATED           |    |
           |   |  C:\\> LOADING CORE MODULES...           |    |
           |   |                                         |    |
           |   |  C:\\> SYSTEM STATUS: NOMINAL            |    |
           |   |  C:\\> MEMORY CHECK: PASSED              |    |
           |   |  C:\\> QUANTUM ARRAY: OPERATIONAL        |    |
           |   |                                         |    |
           |   |  C:\\> FIND THE KEYS                     |    |
           |   |  C:\\> CRAFTING WORLD INITIALIZED        |    |
           |   |  C:\\> _                                 |    |
           |   |                                         |    |
           |   |_________________________________________|    |
           |                                                  |
            \\_________________________________________________/
                   \\___________________________________/
                ___________________________________________
             _-'    .-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.  --- \`-_
          _-'.-.-. .---.-.-.-.-.-.-.-.-.-.-.-.-.-.-.--.  .-.-..\`-_
       _-'.-.-.-. .---.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-\`__\`. .-.-.-..\`-_
    _-'.-.-.-.-. .-----.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-----. .-.-.-.-..\`-_
 _-'.-.-.-.-.-. .---.-. .-------------------------. .-.---. .---.-.-.-..\`-_
:-------------------------------------------------------------------------:
\`---._.-------------------------------------------------------------._.---'
`;

// List of loading messages for the terminal
const LOADING_MESSAGES = [
  "Initializing CraftingTableOS v1.0.4815...",
  "Checking system integrity...",
  "Loading database modules...",
  "Establishing secure connection...",
  "Mounting virtual filesystems...",
  "Calibrating quantum flux capacitor...",
  "Analyzing temporal anomalies...",
  "Searching for the three golden keys...",
  "Connecting to the central crafting network...",
  "Loading user profile data...",
  "Initializing inventory management system...",
  "Checking for updates to the crafting table...",
  "Warming up the pixel renderer...",
  "Activating retro compatibility mode...",
  "Preparing GUI components...",
  "Loading background music modules...",
  "Running final diagnostics...",
  "Initializing desktop environment...",
];

// As progress gets higher, we'll show these garbled/glitched messages
const GLITCH_MESSAGES = [
  "W@rn!ng: M3m0ry c0rrup+ion d3t3cted...",
  "C0de inj3c+!on att3mpt bl0ck3d...",
  "Synta&* err0r^^ in m0dul3 l0ading...",
  "D@t@ fragm3n+s r3c0v3r3d...",
  ">Syst3m inst@bil!ty d3t3c+ed<!",
  "F!le s¥st3m ch@0s r3p0rt3d...",
  "KEY.<ANOMALY>.DETECTED:///",
  "SYNCHRONIZATION.FAILURE..#@%",
  "MEMORY_OVERFLOW:ERROR:0x94FF32...",
  "ATTEMPTING_RECOVERY-SEQUENCE...",
  "TIMELINE_CORRUPTION_DETECTED...",
  "DIMENSIONAL_RIFT_CLOSING...",
  "REALITY.PARAMETERS.NORMALIZING...",
  "SYSTEM.REBOOT.IMMINENT...3...2...1...",
];

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadComplete }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageSpeed, setMessageSpeed] = useState(500); // Faster initial messages
  const [terminalCursor, setTerminalCursor] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  
  // Simulate loading progress
  useEffect(() => {
    const simulateLoading = () => {
      setLoadingProgress(prev => {
        // Adjust increment to control loading speed - doubled for faster loading
        const increment = prev < 70 ? 
          Math.random() * 4 : 
          Math.random() * 3;
        
        const newProgress = Math.min(prev + increment, 100);
        
        // Speed up messages as loading progresses - all speeds reduced
        if (prev < 30 && newProgress >= 30) {
          setMessageSpeed(400); // Speed up a bit
        } else if (prev < 60 && newProgress >= 60) {
          setMessageSpeed(250); // Speed up more
        } else if (prev < 85 && newProgress >= 85) {
          setMessageSpeed(150); // Speed up a lot
        } else if (prev < 95 && newProgress >= 95) {
          setMessageSpeed(50); // Very fast at the end
        }
        
        // When we reach 100%, signal that loading is complete
        if (newProgress >= 100 && prev < 100) {
          // Let the user see the final state for a moment before transitioning
          setTimeout(() => {
            onLoadComplete();
          }, 500); // Faster completion
        }
        
        return newProgress;
      });
    };
    
    const interval = setInterval(simulateLoading, 90); // Faster interval
    return () => clearInterval(interval);
  }, [onLoadComplete]);
  
  // Show loading messages
  useEffect(() => {
    let messageTimer: NodeJS.Timeout;
    let messageIndex = 0;
    
    const showNextMessage = () => {
      let message: string;
      
      // Decide if we show a normal message or a glitched message based on progress
      if (loadingProgress < 50 || (loadingProgress < 85 && Math.random() > 0.3)) {
        // Normal message
        message = LOADING_MESSAGES[messageIndex % LOADING_MESSAGES.length];
        messageIndex++;
      } else {
        // Glitched message - more likely as we approach 100%
        const glitchIndex = Math.floor(Math.random() * GLITCH_MESSAGES.length);
        message = GLITCH_MESSAGES[glitchIndex];
        
        // Add some random glitch characters for extra effect
        if (loadingProgress > 85) {
          const glitchChars = "@#$%^&*!~`';:.,<>/?\\|{}[]";
          const numGlitches = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < numGlitches; i++) {
            const position = Math.floor(Math.random() * message.length);
            const glitchChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
            message = message.substring(0, position) + glitchChar + message.substring(position + 1);
          }
        }
      }
      
      // Set the current message and add it to the messages array
      setCurrentMessage(message);
      messageTimer = setTimeout(() => {
        setMessages(prev => [...prev, message]);
        setCurrentMessage("");
        
        // Schedule the next message
        showNextMessage();
      }, messageSpeed);
    };
    
    showNextMessage();
    
    return () => {
      clearTimeout(messageTimer);
    };
  }, [loadingProgress, messageSpeed]);
  
  // Keep terminal scrolled to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages, currentMessage]);
  
  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setTerminalCursor(prev => !prev);
    }, 530);
    
    return () => clearInterval(cursorInterval);
  }, []);
  
  // Render random "matrix-like" characters in the background
  useEffect(() => {
    const canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-={}[]|;:,.<>?/';
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    
    let drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -20);
    }
    
    const drawMatrix = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Start with orange-ish color
      const baseColor = 'rgba(255, 165, 0, ';
      
      for (let i = 0; i < drops.length; i++) {
        // Generate a more orangeish color with varying opacity
        const alpha = Math.random() * 0.5 + 0.5;
        ctx.fillStyle = baseColor + alpha + ')';
        
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Reset drops when they go off screen
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        drops[i]++;
      }
      
      animationFrameRef.current = requestAnimationFrame(drawMatrix);
    };
    
    drawMatrix();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Random glitch effect on terminal text at intervals
  useEffect(() => {
    if (loadingProgress < 70) return;
    
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const terminalElement = document.getElementById('terminal-output');
        if (terminalElement) {
          terminalElement.classList.add('glitch-effect');
          setTimeout(() => {
            terminalElement.classList.remove('glitch-effect');
          }, 150);
        }
      }
    }, 1000);
    
    return () => clearInterval(glitchInterval);
  }, [loadingProgress]);
  
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Matrix-like background */}
      <canvas id="matrix-canvas" className="absolute inset-0 opacity-30"></canvas>
      
      {/* Main terminal */}
      <div 
        className="relative z-10 w-full max-w-3xl bg-black border border-orange-500 rounded p-4 flex flex-col"
        style={{ height: '80vh' }}
      >
        {/* Terminal header */}
        <div className="border-b border-orange-500 pb-2 mb-4 flex justify-between items-center">
          <div className="text-orange-500 font-mono text-sm">
            CRAFTING_TABLE_OS v1.0.4815
          </div>
          <div className="text-orange-400 font-mono text-xs">
            {new Date().toLocaleTimeString()} | BOOT SEQUENCE
          </div>
        </div>
        
        {/* ASCII art - smaller version */}
        <div className="mb-4">
          <pre className="text-orange-500 font-mono text-sm leading-tight">
            {SMALL_ASCII_ART}
          </pre>
        </div>
        
        {/* Loading bar */}
        <div className="h-4 bg-black border border-orange-500 mb-4">
          <div 
            className="h-full bg-orange-500 transition-all duration-300 ease-linear"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
        
        {/* Loading percentage */}
        <div className="text-orange-400 font-mono text-xs mb-4 flex justify-between">
          <span>SYSTEM BOOT: {Math.floor(loadingProgress)}% COMPLETE</span>
          <span>{loadingProgress < 70 ? "STATUS: NOMINAL" : 
                 loadingProgress < 90 ? "STATUS: WARNING" : 
                 "STATUS: CRITICAL"}</span>
        </div>
        
        {/* Terminal output - scrollable */}
        <div 
          ref={terminalRef}
          id="terminal-output"
          className="bg-black flex-1 font-mono text-sm overflow-y-auto p-2 text-orange-400"
          style={{ 
            maxHeight: 'calc(80vh - 200px)',
            boxShadow: 'inset 0 0 10px rgba(255, 165, 0, 0.2)'
          }}
        >
          {messages.map((msg, index) => (
            <div key={index} className={`mb-1 ${loadingProgress > 80 && Math.random() > 0.7 ? 'text-green-400' : ''}`}>
              $ {msg}
            </div>
          ))}
          {currentMessage && (
            <div className="flex">
              <span>$ {currentMessage}</span>
              <span className={terminalCursor ? 'opacity-100' : 'opacity-0'}>▊</span>
            </div>
          )}
        </div>
        
        {/* Footer with system info */}
        <div className="border-t border-orange-500 pt-2 mt-4">
          <div className="flex justify-between text-orange-500 font-mono text-xs">
            <div>
              MEMORY: {Math.floor(loadingProgress)}% ALLOCATED
            </div>
            <div>
              CPU: {Math.min(99, Math.floor(loadingProgress * 1.2))}% USAGE
            </div>
            <div>
              {loadingProgress < 90 ? 
                "BOOT SEQUENCE IN PROGRESS..." : 
                "PREPARING DESKTOP ENVIRONMENT..."}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add some CSS for the glitch effect */}
      <style>{`
        .glitch-effect {
          animation: glitch 0.3s infinite;
          text-shadow: 2px 0 #ff0000, -2px 0 #00ff00;
        }
        
        @keyframes glitch {
          0% {
            transform: translate(2px, 0);
            text-shadow: 2px 0 #ff0000, -2px 0 #00ff00;
          }
          25% {
            transform: translate(-2px, 0);
            text-shadow: -2px 0 #ff0000, 2px 0 #00ff00;
          }
          50% {
            transform: translate(0, 2px);
            text-shadow: 2px 0 #0000ff, -2px 0 #ff0000;
          }
          75% {
            transform: translate(0, -2px);
            text-shadow: -2px 0 #0000ff, 2px 0 #ff0000;
          }
          100% {
            transform: translate(2px, 0);
            text-shadow: 2px 0 #ff0000, -2px 0 #00ff00;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;