import React, { useState, useEffect, useRef } from "react";

// ASCII art - craftable logo for terminal welcome message
const CRAFTABLE_ASCII_ART = `
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@%%%%%%%@%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@#@@%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%@@@@@@@@@@@@@@@@@@
@@@@@@@@@%@#+++#%@@@*+*+#+++++#@@@%+++%@@+++++#@#++%@@@+++@@#++#+@#++%@*+*%+*+++*%#@@@@@@@@@@@@@@@@@
@@@@@@@%%@#+*##*+@%++%#+#@**@%*+@@@#++*@@%++@#++@++@@@@%+*@*+*%*+@@+*@@**%%*%**%*%@%@@@@@@@@@@@@@@@@
@@@@@@@@@@***@@@*@++#@@%@@++@@++@@@+%**@@%++@@+*@+*@@@@%++@++%@@%@@++@@*+%@@@**@@@@%@@@@@@@@@@@@@@@@
@@@@@@@%%@@***+#@@*+%@@@@@++++*%@@#+@*+#@@*++++%@++@@@@%+*@+*@@#%%@++++*+%@@@**@@%@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@%*++@**%@@@@@+*@*+%@@*++++*@@*+@@@@@+*@@%%%**@*+@@#*%@++@@#*%@@@*+@@@%@@@@@@@@@@@@@@@@@
@@@@@@@@@@#%@@@++#**+@%+%@+*@%**@@+%@@*+@@++@@@@@+*%%*#%*+@**#@#*@@++@@#*%@@@**@@@%@@@@@@@@@@@@@@@@@
@@@@@@@@@@*******@@%***+%#**#%**%*##@%###%#*%@@@######%###@@#****%%+*%@***@@#*+#@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@###%@@@@@@@@@@@@@@@@@@@@@@@@@%*++++*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@%@@@@@@@@@@@@@@@@@%%%@@@@@@@@*++++++++++%@@@@@@@#*#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@%@@@@@@@@@@@@@@%%##*#@@@@@@#**++++++++**@@@@@*+*%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@%@@@@@@@@@@@@@@@%##%#**#%@@**++++++++++#%@@@@+**%@@#*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@#@@@@@@@@@@@@@@@@%%@@@%####@%#@@%#***%@%*@@@%%%******#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@%@%@@@@@@@@@@@@@@%*@@@@@@@@%@#%@@@*++%@@@#@%%%##@####@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@%@@@@@@@@@@@@@@#%@@@@@@@@@@#+*#*#@@***+*%@#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@
@@@@@@@@@@@%@@@@@@@@@@@@@%%@@@@@@@@@@@@@@#+****#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@
@@@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@@@@@%#%@@%###*%%@@%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@
@@@@@@@@@@%%@@@@@@@*+**%#@@@%***@@@@#**#**#@@@%#******#@#******#%@##**@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@
@@@@@@@@@@%@@@@@@#*+*@%*#@@@@+++#@@@@***##+**@#+##+*##*@@***%##+#@%**%@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@
@@@@@@@@@%%%@@@@@++*@@@@@@@@#*%**@@@@*+*@@**+@@@@%+*@@@@@***@@%@@@%+*%@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@
@@@@@@@@@@@%@@@@@*+%@@@@@@@@+*@**#@@@**+*+*+%@@@@#**@@@@@+****#@@@%+*@@@@@@@@@@@@#%@@@@@@@@@@@@@@@@
@@@@@@@@@@@%@@@@@+**@@@@%@@**+***+@@@***@***@@@@@%**@@@@@***@@%@@@%**%@@@%@@@@@@%@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@#@@@@@%+**##+*@%+*@@@***@@***@@+*#@@@@#**@@@@@+**##%*#@%+*###*+@@@@@%@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@%@@@@@@@%#**#@%***@@%**#%#*#*#@*##%@@#*###@@@********%@*****##*@@@@%@%@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@%%%@@@@%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%@@%@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@%@%@@@@@@%%@@@@@%@@@@@@@@@@@%%%%@@@@@@@@%@@@@@@@@@@%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
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
]

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
          setTimeout(() => {
            onLoadComplete();
          }, 800);
        }
        
        return newProgress;
      });
    };
    
    // Run the loading simulation more frequently to make loading faster
    const interval = setInterval(simulateLoading, 150); // Update more frequently
    
    return () => clearInterval(interval);
  }, [onLoadComplete]);
  
  // Initialize the matrix rain animation
  useEffect(() => {
    const canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Matrix characters - use more code-like symbols
    const chars = '01アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン[]{}+-*/=0123456789ABCDEF';
    const columns = Math.floor(canvas.width / 14); // Character width
    const drops: number[] = [];
    
    // Initialize drops at random positions
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }
    
    const drawMatrix = () => {
      // Semi-transparent black to create trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#0F0'; // Green text
      ctx.font = '14px monospace';
      
      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = chars[Math.floor(Math.random() * chars.length)];
        // x coordinate dependent on column, y on drop position
        ctx.fillText(text, i * 14, drops[i] * 14);
        
        // Move drops down for next frame
        drops[i]++;
        
        // Reset drop when it reaches the bottom with some randomness
        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.random() * -20;
        }
      }
      
      // Request next frame
      animationFrameRef.current = requestAnimationFrame(drawMatrix);
    };
    
    // Start the animation
    drawMatrix();
    
    // Clean up on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Handle the terminal message display
  useEffect(() => {
    // Skip if we've reached the end
    if (loadingProgress >= 100) return;
    
    // Add ASCII logo as the first message at the start
    if (messages.length === 0) {
      // Add the ASCII art with some newlines to ensure it's visible
      setMessages([`\n\n${CRAFTABLE_ASCII_ART}\n\n`]);
    }
    
    // Terminal cursor blink effect
    const cursorInterval = setInterval(() => {
      setTerminalCursor(prev => !prev);
    }, 500);
    
    // Show a new message based on loading progress
    const messageInterval = setInterval(() => {
      let messagePool = LOADING_MESSAGES;
      
      // Show glitched messages more frequently as we approach 100%
      if (loadingProgress > 75 && Math.random() > 0.5) {
        messagePool = GLITCH_MESSAGES;
      }
      
      const newMessage = messagePool[Math.floor(Math.random() * messagePool.length)];
      
      // Type-writer effect for the message
      let charIndex = 0;
      setCurrentMessage('');
      
      const typeInterval = setInterval(() => {
        if (charIndex < newMessage.length) {
          setCurrentMessage(prev => prev + newMessage.charAt(charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          
          // After typing is done, add to message history and clear current
          setTimeout(() => {
            setMessages(prev => [...prev, newMessage]);
            setCurrentMessage('');
            
            // Scroll to bottom of terminal output
            if (terminalRef.current) {
              terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
            }
          }, 200);
        }
      }, 25); // Type faster (was 40ms)
      
      return () => clearInterval(typeInterval);
    }, messageSpeed); // Controlled by loading progress
    
    // Occasionally add glitch effect to the terminal
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        const terminalElement = document.getElementById('terminal-output');
        if (terminalElement) {
          terminalElement.classList.add('glitch-effect');
          setTimeout(() => {
            terminalElement.classList.remove('glitch-effect');
          }, 150);
        }
      }
    }, 1000);
    
    return () => {
      clearInterval(cursorInterval);
      clearInterval(messageInterval);
      clearInterval(glitchInterval);
    };
  }, [loadingProgress, messageSpeed, messages.length]);
  
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
        
        {/* No ASCII art at the top - removed as requested */}
        
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
        
        {/* ASCII art is now displayed in the terminal window */}
        
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
            <div key={index} 
              className={`mb-1 
                ${loadingProgress > 80 && Math.random() > 0.7 ? 'text-green-400' : ''}
                ${index === 0 ? 'whitespace-pre font-mono text-amber-500 text-[4px] leading-[3px] scale-[0.9] origin-top-left block transform opacity-90' : ''}`}>
              {index === 0 ? msg : `$ ${msg}`}
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
