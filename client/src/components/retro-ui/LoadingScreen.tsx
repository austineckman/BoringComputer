import React, { useState, useEffect, useRef } from "react";

// Synth-style modular logo
const SYNTH_LOGO = `
   ▄████████  ▄████████    ▄████████    ▄████████     ███     
  ███    ███ ███    ███   ███    ███   ███    ███ ▀█████████▄ 
  ███    █▀  ███    ███   ███    ███   ███    █▀     ▀███▀▀██ 
  ███        ███    ███   ███    ███  ▄███▄▄▄         ███   ▀ 
▀███████████ ███    ███ ▀███████████ ▀▀███▀▀▀         ███     
         ███ ███    ███   ███    ███   ███             ███     
   ▄█    ███ ███    ███   ███    ███   ███             ███     
 ▄████████▀   ██████████   ███    █▀    ███            ▄████▀   
                                                              
      ╔═══════════════════════════════════════════════╗       
      ║ █▌▐█ ▐█▀▀█ ▐█▀▀█ █▌ █ █     ▐█▀▀▀ █▀▀  █▌ █ ║       
      ║ █▌▐█ ▐█  █ ▐█  █ █▌ █ █     ▐█▀▀  ▀▀█  █▌ █ ║       
      ║ ▀▀▀▀ ▐▀▀▀▀ ▐▀▀▀▀ ▀▀▀▀ ▀▀▀▀▀ ▐▀▀▀▀ ▀▀▀  ▀▀▀▀ ║       
      ╚═══════════════════════════════════════════════╝       
`;

// Modular synth interface messages
const SYNTH_MESSAGES = [
  "INITIALIZING MODULAR SYNTHESIS ENGINE...",
  "LOADING OSCILLATOR MODULES...",
  "CALIBRATING VOLTAGE CONTROLLED FILTERS...",
  "CONNECTING PATCH CABLES...",
  "TUNING ANALOG CIRCUITS...",
  "WARMING UP VACUUM TUBES...",
  "SYNCHRONIZING SEQUENCER PATTERNS...",
  "ADJUSTING ENVELOPE GENERATORS...",
  "LOADING WAVEFORM TABLES...",
  "CONFIGURING AUDIO ROUTING MATRIX...",
  "TESTING SIGNAL PROCESSORS...",
  "INITIALIZING DELAY MODULES...",
  "SETTING UP REVERB CHAMBERS...",
  "LOADING SAMPLE BANKS...",
  "CONNECTING MIDI INTERFACES...",
  "FINALIZING SYSTEM PATCH...",
];

// Glitch messages for high progress
const GLITCH_MESSAGES = [
  "VCO_DRIFT_DETECTED::COMPENSATING...",
  "FILTER_RESONANCE_OVERFLOW//LIMITING...",
  "PATCH_CABLE_INTERFERENCE>>>ROUTING...",
  "ANALOG_NOISE_INJECTION:::FILTERING...",
  "VOLTAGE_SPIKE_DETECTED||REGULATING...",
  "SEQUENCER_CLOCK_JITTER```STABILIZING...",
  "FEEDBACK_LOOP_WARNING:::DAMPENING...",
  "OSCILLATOR_SYNC_ERROR<<<RETUNING...",
  "ENVELOPE_TRIGGER_ANOMALY---RESETTING...",
  "MODULATION_MATRIX_CHAOS~~~REALIGNING...",
];

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadComplete }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");
  const [vuLevel, setVuLevel] = useState(0);
  const [scanlineOffset, setScanlineOffset] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  // Main loading simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const increment = prev < 80 ? Math.random() * 3 : Math.random() * 1.5;
        const newProgress = Math.min(prev + increment, 100);
        
        if (newProgress >= 100 && prev < 100) {
          setTimeout(() => onLoadComplete(), 1000);
        }
        
        return newProgress;
      });
    }, 150);
    
    return () => clearInterval(interval);
  }, [onLoadComplete]);

  // Message cycling
  useEffect(() => {
    const messageInterval = setInterval(() => {
      const messagePool = loadingProgress > 75 ? GLITCH_MESSAGES : SYNTH_MESSAGES;
      const newMessage = messagePool[Math.floor(Math.random() * messagePool.length)];
      setCurrentMessage(newMessage);
    }, 800);
    
    return () => clearInterval(messageInterval);
  }, [loadingProgress]);

  // VU meter animation
  useEffect(() => {
    const vuInterval = setInterval(() => {
      setVuLevel(prev => {
        const target = (loadingProgress / 100) * 0.8 + Math.random() * 0.2;
        return prev + (target - prev) * 0.3;
      });
    }, 50);
    
    return () => clearInterval(vuInterval);
  }, [loadingProgress]);

  // Scanline animation
  useEffect(() => {
    const scanlineInterval = setInterval(() => {
      setScanlineOffset(prev => (prev + 1) % 4);
    }, 100);
    
    return () => clearInterval(scanlineInterval);
  }, []);

  // Circuit board animation background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Circuit traces
    const traces: Array<{x1: number, y1: number, x2: number, y2: number, opacity: number}> = [];
    
    // Generate random circuit traces
    for (let i = 0; i < 15; i++) {
      traces.push({
        x1: Math.random() * canvas.width,
        y1: Math.random() * canvas.height,
        x2: Math.random() * canvas.width,
        y2: Math.random() * canvas.height,
        opacity: Math.random() * 0.3 + 0.1
      });
    }
    
    const drawCircuits = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Draw traces
      traces.forEach(trace => {
        ctx.strokeStyle = `rgba(0, 255, 255, ${trace.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(trace.x1, trace.y1);
        ctx.lineTo(trace.x2, trace.y2);
        ctx.stroke();
        
        // Animated pulse
        const time = Date.now() * 0.001;
        const pulse = Math.sin(time * 2 + trace.x1 * 0.01) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 0, 255, ${pulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(trace.x1, trace.y1, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(drawCircuits);
    };
    
    drawCircuits();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Circuit board background */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />
      
      {/* Scanlines overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(transparent 50%, rgba(0, 255, 255, 0.03) 50%)`,
          backgroundSize: '100% 4px',
          transform: `translateY(${scanlineOffset}px)`
        }}
      />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        
        {/* Synth Logo */}
        <div className="mb-8">
          <pre className="text-cyan-400 text-xs font-mono leading-tight text-center filter drop-shadow-lg">
            {SYNTH_LOGO}
          </pre>
        </div>
        
        {/* Modular Interface Panel */}
        <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-cyan-500 rounded-lg p-6 w-full max-w-4xl shadow-2xl">
          
          {/* Header with VU meters */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-cyan-400 font-mono text-sm">
              MODULAR_SYNTH_OS v2.1.4
            </div>
            <div className="flex space-x-2">
              {/* VU Meter */}
              {Array.from({length: 20}).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-8 ${
                    i < vuLevel * 20 
                      ? i < 14 ? 'bg-green-500' : i < 18 ? 'bg-yellow-500' : 'bg-red-500'
                      : 'bg-gray-800'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Progress bars styled as faders */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {['OSC', 'FILT', 'ENV', 'LFO'].map((label, i) => (
              <div key={label} className="text-center">
                <div className="text-cyan-400 text-xs mb-2">{label}</div>
                <div className="h-32 w-4 bg-gray-800 border border-cyan-500 mx-auto relative">
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-500 to-purple-500 transition-all duration-300"
                    style={{ height: `${(loadingProgress + i * 5) % 100}%` }}
                  />
                  <div className="absolute w-6 h-2 bg-white border border-gray-400 -left-1 transition-all duration-300"
                       style={{ bottom: `${(loadingProgress + i * 5) % 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          
          {/* Main progress display */}
          <div className="mb-6">
            <div className="flex justify-between text-cyan-400 text-sm mb-2">
              <span>SYSTEM INITIALIZATION</span>
              <span>{Math.floor(loadingProgress)}%</span>
            </div>
            <div className="h-6 bg-gray-800 border-2 border-cyan-500 rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-300 relative"
                style={{ width: `${loadingProgress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Message display */}
          <div className="bg-black border border-cyan-500 p-4 rounded">
            <div className="text-cyan-400 font-mono text-sm">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">●</span>
                <span className="animate-pulse">{currentMessage}</span>
              </div>
            </div>
          </div>
          
          {/* Patch matrix visualization */}
          <div className="mt-6 grid grid-cols-8 gap-1">
            {Array.from({length: 32}).map((_, i) => (
              <div
                key={i}
                className={`h-3 w-3 border border-cyan-700 ${
                  Math.random() < loadingProgress / 100 
                    ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50' 
                    : 'bg-gray-800'
                }`}
                style={{
                  animationDelay: `${i * 50}ms`,
                  animation: Math.random() < 0.1 ? 'pulse 1s infinite' : 'none'
                }}
              />
            ))}
          </div>
          
        </div>
        
        {/* Status indicators */}
        <div className="mt-6 flex space-x-8 text-xs">
          <div className="flex items-center text-green-500">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            POWER: NOMINAL
          </div>
          <div className="flex items-center text-cyan-400">
            <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse" />
            SYNC: LOCKED
          </div>
          <div className="flex items-center text-purple-400">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse" />
            PATCH: {loadingProgress < 100 ? 'LOADING' : 'READY'}
          </div>
        </div>
        
      </div>
      
      {/* Glow effects */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-conic from-purple-900/10 via-transparent to-cyan-900/10 pointer-events-none" />
      
    </div>
  );
};

export default LoadingScreen;