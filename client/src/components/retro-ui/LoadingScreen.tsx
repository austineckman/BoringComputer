import React, { useState, useEffect, useRef } from "react";

// ASCII art for the loading screen
const ASCII_ART = `
   ▄████▄   ██▀███   ▄▄▄        █████▒▄▄▄█████▓ ██▓ ███▄    █   ▄████ 
  ▒██▀ ▀█  ▓██ ▒ ██▒▒████▄    ▓██   ▒ ▓  ██▒ ▓▒▓██▒ ██ ▀█   █  ██▒ ▀█▒
  ▒▓█    ▄ ▓██ ░▄█ ▒▒██  ▀█▄  ▒████ ░ ▒ ▓██░ ▒░▒██▒▓██  ▀█ ██▒▒██░▄▄▄░
  ▒▓▓▄ ▄██▒▒██▀▀█▄  ░██▄▄▄▄██ ░▓█▒  ░ ░ ▓██▓ ░ ░██░▓██▒  ▐▌██▒░▓█  ██▓
  ▒ ▓███▀ ░░██▓ ▒██▒ ▓█   ▓██▒░▒█░      ▒██▒ ░ ░██░▒██░   ▓██░░▒▓███▀▒
  ░ ░▒ ▒  ░░ ▒▓ ░▒▓░ ▒▒   ▓▒█░ ▒ ░      ▒ ░░   ░▓  ░ ▒░   ▒ ▒  ░▒   ▒ 
    ░  ▒     ░▒ ░ ▒░  ▒   ▒▒ ░ ░          ░     ▒ ░░ ░░   ░ ▒░  ░   ░ 
  ░          ░░   ░   ░   ▒    ░ ░      ░       ▒ ░   ░   ░ ░ ░ ░   ░ 
  ░ ░         ░           ░  ░                  ░           ░       ░ 
  ░                                                                    
 ▄▄▄█████▓ ▄▄▄       ▄▄▄▄    ██▓    ▓█████   ▒█████    ██████         
 ▓  ██▒ ▓▒▒████▄    ▓█████▄ ▓██▒    ▓█   ▀  ▒██▒  ██▒▒██    ▒         
 ▒ ▓██░ ▒░▒██  ▀█▄  ▒██▒ ▄██▒██░    ▒███    ▒██░  ██▒░ ▓██▄           
 ░ ▓██▓ ░ ░██▄▄▄▄██ ▒██░█▀  ▒██░    ▒▓█  ▄  ▒██   ██░  ▒   ██▒        
   ▒██▒ ░  ▓█   ▓██▒░▓█  ▀█▓░██████▒░▒████▒░ ████▓▒░▒██████▒▒        
   ▒ ░░    ▒▒   ▓▒█░░▒▓███▀▒░ ▒░▓  ░░░ ▒░ ░░ ▒░▒░▒░ ▒ ▒▓▒ ▒ ░        
     ░      ▒   ▒▒ ░▒░▒   ░ ░ ░ ▒  ░ ░ ░  ░  ░ ▒ ▒░ ░ ░▒  ░ ░        
   ░        ░   ▒    ░    ░   ░ ░      ░   ░ ░ ░ ▒  ░  ░  ░          
              ░  ░ ░          ░  ░   ░  ░    ░ ░        ░          
                        ░                                            
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

// Easter egg messages (randomly shown)
const EASTER_EGGS = [
  "ERROR 418: I'm a teapot. Just kidding, proceeding with boot sequence...",
  "Did you know? The three golden keys unlock something special...",
  "Secret developer mode activated... Just kidding!",
  "Fun fact: This system runs on pure imagination.",
  "Detecting cats on keyboard... Shooing them away...",
  "Hmm, have you tried turning it off and on again?",
  "Remember: Don't feed the gremlins after midnight.",
  "System temperature: HOT HOT HOT!",
  "Coffee levels critical. Recommend immediate refill.",
  "Searching for meaning of life... file not found.",
  "Loading unnecessary complex animations...",
  "That wasn't a bug, it was a feature!",
  "Generating witty loading messages...",
  "Reticulating splines...",
  "Looking for the ANY key...",
];

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadComplete }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [easterEggMessage, setEasterEggMessage] = useState("");
  const animationFrameRef = useRef<number>();
  
  // Terminal blink effect
  const [terminalCursor, setTerminalCursor] = useState(true);
  
  // Simulate loading progress
  useEffect(() => {
    const simulateLoading = () => {
      setLoadingProgress(prev => {
        // Slow down the loading a bit toward the end for dramatic effect
        const increment = prev < 70 ? 
          Math.random() * 2.5 : 
          Math.random() * 1.2;
        
        const newProgress = Math.min(prev + increment, 100);
        
        // When we reach 100%, signal that loading is complete
        if (newProgress >= 100 && prev < 100) {
          // Let the user see the 100% state for a moment before transitioning
          setTimeout(() => {
            onLoadComplete();
          }, 1000);
        }
        
        return newProgress;
      });
    };
    
    const interval = setInterval(simulateLoading, 180);
    return () => clearInterval(interval);
  }, [onLoadComplete]);
  
  // Show loading messages
  useEffect(() => {
    let currentIndex = 0;
    let messageTimer: NodeJS.Timeout;
    
    const showNextMessage = () => {
      // Add the current message to our messages array
      if (currentIndex < LOADING_MESSAGES.length) {
        const message = LOADING_MESSAGES[currentIndex];
        setCurrentMessage(message);
        
        // After a delay, add it to the messages list and clear current
        messageTimer = setTimeout(() => {
          setMessages(prev => [...prev, message]);
          setCurrentMessage("");
          currentIndex++;
          
          // Randomly show an easter egg after some messages
          if (currentIndex > 3 && Math.random() < 0.3 && !showEasterEgg) {
            const randomEgg = EASTER_EGGS[Math.floor(Math.random() * EASTER_EGGS.length)];
            setEasterEggMessage(randomEgg);
            setShowEasterEgg(true);
            
            // Hide the easter egg after a few seconds
            setTimeout(() => {
              setShowEasterEgg(false);
            }, 3000);
          }
          
          // Schedule the next message
          if (currentIndex < LOADING_MESSAGES.length) {
            showNextMessage();
          }
        }, 1500); // Display each message for 1.5 seconds
      }
    };
    
    showNextMessage();
    
    return () => {
      clearTimeout(messageTimer);
    };
  }, []);
  
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
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    
    let drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }
    
    const drawMatrix = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#0f0';
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
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
  
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Matrix-like background */}
      <canvas id="matrix-canvas" className="absolute inset-0 opacity-20"></canvas>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl px-6">
        {/* ASCII Logo */}
        <div className="mb-8">
          <pre className="text-green-500 font-mono text-xs leading-tight whitespace-pre overflow-x-auto">
            {ASCII_ART}
          </pre>
        </div>
        
        {/* Loading bar */}
        <div className="h-6 bg-gray-800 border-2 border-green-500 rounded-sm mb-6 overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-300 ease-linear"
            style={{ width: `${loadingProgress}%` }}
          >
          </div>
        </div>
        
        {/* Loading percentage */}
        <div className="text-green-500 font-mono text-center mb-6">
          Loading CraftingTableOS... {Math.floor(loadingProgress)}%
        </div>
        
        {/* Terminal window */}
        <div className="bg-black border-2 border-green-500 p-4 rounded-sm h-60 overflow-hidden font-mono text-sm">
          <div className="text-green-500 mb-2">
            # CraftingTableOS Terminal v1.0.4815
          </div>
          
          {/* Previous messages */}
          <div className="text-green-400">
            {messages.map((msg, index) => (
              <div key={index}>$ {msg}</div>
            ))}
          </div>
          
          {/* Current message being "typed" */}
          <div className="text-green-400 flex">
            <span>$ {currentMessage}</span>
            <span className={terminalCursor ? 'opacity-100' : 'opacity-0'}>_</span>
          </div>
          
          {/* Easter egg message */}
          {showEasterEgg && (
            <div className="text-yellow-300 mt-2 font-bold">
              ! {easterEggMessage}
            </div>
          )}
        </div>
        
        {/* Credits */}
        <div className="text-gray-500 text-xs mt-4 text-center">
          © CraftingTable LLC v1.0.4815 | All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;