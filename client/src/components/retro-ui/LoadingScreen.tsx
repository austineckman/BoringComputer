import React, { useState, useEffect, useRef } from "react";

// CraftingTable OS Logo
const SYNTH_LOGO = `
   ╔═══════════════════════════════════════════════════════╗
   ║                                                       ║
   ║   ██████╗██████╗  █████╗ ███████╗████████╗██╗███╗   ██╗ ║
   ║  ██╔════╝██╔══██╗██╔══██╗██╔════╝╚══██╔══╝██║████╗  ██║ ║
   ║  ██║     ██████╔╝███████║█████╗     ██║   ██║██╔██╗ ██║ ║
   ║  ██║     ██╔══██╗██╔══██║██╔══╝     ██║   ██║██║╚██╗██║ ║
   ║  ╚██████╗██║  ██║██║  ██║██║        ██║   ██║██║ ╚████║ ║
   ║   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝        ╚═╝   ╚═╝╚═╝  ╚═══╝ ║
   ║                                                       ║
   ║  ████████╗ █████╗ ██████╗ ██╗     ███████╗             ║
   ║  ╚══██╔══╝██╔══██╗██╔══██╗██║     ██╔════╝             ║
   ║     ██║   ███████║██████╔╝██║     █████╗               ║
   ║     ██║   ██╔══██║██╔══██╗██║     ██╔══╝               ║
   ║     ██║   ██║  ██║██████╔╝███████╗███████╗             ║
   ║     ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝             ║
   ║                                                       ║
   ║                      O S                             ║
   ║                                                       ║
   ╚═══════════════════════════════════════════════════════╝
`;

// Massive hacker-era synth messages
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
  "CHECKING POWER SUPPLY VOLTAGES...",
  "INITIALIZING ANALOG-TO-DIGITAL CONVERTERS...",
  "LOADING FIRMWARE TO MICROPROCESSORS...",
  "CALIBRATING CONTROL VOLTAGE GENERATORS...",
  "TESTING GATE SIGNAL PATHS...",
  "SYNCHRONIZING CLOCK DIVIDERS...",
  "LOADING PRESET CONFIGURATIONS...",
  "INITIALIZING STEP SEQUENCERS...",
  "CONFIGURING TRIGGER OUTPUTS...",
  "WARMING UP ANALOG CIRCUITRY...",
  "ESTABLISHING TIMING REFERENCES...",
  "LOADING WAVETABLE OSCILLATORS...",
  "CONFIGURING FILTER BANKS...",
  "INITIALIZING EFFECTS PROCESSORS...",
  "SCANNING MEMORY BANKS 0x0000-0xFFFF...",
  "LOADING BOOTLOADER V2.1.4815...",
  "CHECKING CPU CACHE COHERENCY...",
  "INITIALIZING SYSTEM TIMERS...",
  "LOADING KERNEL MODULES...",
  "SCANNING FOR HARDWARE INTERRUPTS...",
  "INITIALIZING DMA CONTROLLERS...",
  "SETTING UP MEMORY MANAGEMENT UNIT...",
  "LOADING DEVICE DRIVERS...",
  "ESTABLISHING SYSTEM CALLS TABLE...",
  "CONFIGURING PROCESS SCHEDULER...",
  "INITIALIZING FILE SYSTEM DRIVERS...",
  "MOUNTING ROOT FILESYSTEM...",
  "STARTING SYSTEM DAEMONS...",
  "LOADING NETWORK PROTOCOLS...",
  "INITIALIZING GRAPHICS SUBSYSTEM...",
  "CONFIGURING AUDIO PIPELINE...",
  "LOADING USER INTERFACE MODULES...",
  "ESTABLISHING SECURITY CONTEXT...",
  "INITIALIZING CRYPTO ENGINES...",
  "SETTING UP VIRTUAL MEMORY...",
  "CONFIGURING SWAP SPACE...",
  "LOADING SHARED LIBRARIES...",
  "INITIALIZING SYMBOL TABLES...",
  "SETTING UP EXCEPTION HANDLERS...",
  "CONFIGURING REAL-TIME CLOCK...",
  "LOADING POWER MANAGEMENT...",
  "INITIALIZING THERMAL MONITORING...",
  "CONFIGURING CPU FREQUENCY SCALING...",
  "SETTING UP WATCHDOG TIMER...",
  "LOADING HARDWARE ABSTRACTION LAYER...",
  "INITIALIZING PLATFORM DRIVERS...",
  "CONFIGURING INTERRUPT CONTROLLERS...",
  "SETTING UP DIRECT MEMORY ACCESS...",
  "LOADING FIRMWARE BLOBS...",
  "INITIALIZING MICROCODE UPDATES...",
  "CONFIGURING CACHE HIERARCHIES...",
  "SETTING UP TRANSLATION LOOKASIDE BUFFERS...",
  "LOADING PERFORMANCE COUNTERS...",
  "INITIALIZING DEBUG INTERFACES...",
  "CONFIGURING TRACE BUFFERS...",
  "SETTING UP PROFILING HOOKS...",
  "LOADING INSTRUMENTATION FRAMEWORK...",
  "INITIALIZING LOGGING SUBSYSTEM...",
  "CONFIGURING AUDIT TRAIL...",
  "SETTING UP SYSTEM MONITORING...",
  "LOADING DIAGNOSTIC TOOLS...",
  "INITIALIZING HEALTH CHECKS...",
  "CONFIGURING FAULT TOLERANCE...",
  "SETTING UP REDUNDANCY SYSTEMS...",
  "LOADING BACKUP PROCEDURES...",
  "INITIALIZING RECOVERY PROTOCOLS...",
  "CONFIGURING EMERGENCY HANDLERS...",
  "SETTING UP PANIC ROUTINES...",
  "LOADING CRASH DUMP FACILITIES..."
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
  "MEMORY_CORRUPTION_DETECTED///FIXING...",
  "THERMAL_RUNAWAY_PREVENTED||COOLING...",
  "POWER_REGULATION_FAILURE```SWITCHING...",
  "SIGNAL_PATH_CROSSTALK:::ISOLATING...",
  "TIMING_REFERENCE_LOST---RESYNC...",
];

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadComplete }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [scrollingMessages, setScrollingMessages] = useState<string[]>([
    "SYSTEM BOOT SEQUENCE INITIATED...",
    "CHECKING HARDWARE COMPATIBILITY...",
    "LOADING CORE SYSTEM MODULES...",
    "INITIALIZING RANDOM ACCESS MEMORY...",
    "SETTING UP INTERRUPT VECTORS...",
    "LOADING SYSTEM LIBRARIES..."
  ]);
  const [vuLevel, setVuLevel] = useState(0);
  const [scanlineOffset, setScanlineOffset] = useState(0);
  const [staticIntensity, setStaticIntensity] = useState(0);
  const [glitchOffset, setGlitchOffset] = useState(0);
  const [cubeRotation, setCubeRotation] = useState({ x: 0, y: 0 });
  const [movingElements, setMovingElements] = useState<Array<{id: number, x: number, y: number, speed: number}>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const staticAnimationRef = useRef<number>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Ultra-fast scrolling messages system
  useEffect(() => {
    const messageInterval = setInterval(() => {
      const messagePool = loadingProgress > 75 ? GLITCH_MESSAGES : SYNTH_MESSAGES;
      const newMessage = messagePool[Math.floor(Math.random() * messagePool.length)];
      
      setScrollingMessages(prev => {
        const updated = [...prev, newMessage];
        return updated.slice(-40); // Keep more messages visible
      });
      
      // Auto scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
    }, 120); // Much faster message cycling for hacker feel
    
    return () => clearInterval(messageInterval);
  }, [loadingProgress]);

  // Static/noise effects
  useEffect(() => {
    const staticInterval = setInterval(() => {
      setStaticIntensity(Math.random() * 0.8 + 0.2);
      setGlitchOffset(Math.random() * 10 - 5);
    }, 80);
    
    return () => clearInterval(staticInterval);
  }, []);

  // Moving elements initialization
  useEffect(() => {
    const elements = Array.from({length: 8}, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: Math.random() * 2 + 0.5
    }));
    setMovingElements(elements);
  }, []);

  // Moving elements animation
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setMovingElements(prev => prev.map(el => ({
        ...el,
        x: (el.x + el.speed) % window.innerWidth,
        y: el.y + Math.sin(Date.now() * 0.001 + el.id) * 0.5
      })));
    }, 50);
    
    return () => clearInterval(moveInterval);
  }, []);

  // 3D Cube rotation animation
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setCubeRotation(prev => ({
        x: prev.x + 1,
        y: prev.y + 0.5
      }));
    }, 50);
    
    return () => clearInterval(rotationInterval);
  }, []);

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

  // Static effects canvas
  useEffect(() => {
    const canvas = staticCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const drawStatic = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * staticIntensity * 255;
        data[i] = noise; // Red
        data[i + 1] = noise * 0.7; // Green
        data[i + 2] = noise * 1.2; // Blue
        data[i + 3] = noise * 0.1; // Alpha
      }
      
      ctx.putImageData(imageData, 0, 0);
      staticAnimationRef.current = requestAnimationFrame(drawStatic);
    };
    
    drawStatic();
    
    return () => {
      if (staticAnimationRef.current) {
        cancelAnimationFrame(staticAnimationRef.current);
      }
    };
  }, [staticIntensity]);

  // Circuit board animation background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const traces: Array<{x1: number, y1: number, x2: number, y2: number, opacity: number, speed: number}> = [];
    
    for (let i = 0; i < 25; i++) {
      traces.push({
        x1: Math.random() * canvas.width,
        y1: Math.random() * canvas.height,
        x2: Math.random() * canvas.width,
        y2: Math.random() * canvas.height,
        opacity: Math.random() * 0.4 + 0.1,
        speed: Math.random() * 2 + 0.5
      });
    }
    
    const drawCircuits = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw animated grid with glitch
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.05 + staticIntensity * 0.1})`;
      ctx.lineWidth = 1;
      for (let x = glitchOffset; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = glitchOffset; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Draw animated traces
      traces.forEach((trace, index) => {
        const time = Date.now() * 0.001;
        const animatedOpacity = trace.opacity + Math.sin(time * trace.speed + index) * 0.2;
        
        ctx.strokeStyle = `rgba(0, 255, 255, ${Math.max(0, animatedOpacity)})`;
        ctx.lineWidth = 2 + Math.sin(time * 3 + index) * 0.5;
        ctx.beginPath();
        ctx.moveTo(trace.x1, trace.y1);
        ctx.lineTo(trace.x2, trace.y2);
        ctx.stroke();
        
        // Animated pulse points
        const pulse = Math.sin(time * 4 + trace.x1 * 0.01) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 0, 255, ${pulse * 0.8})`;
        ctx.beginPath();
        ctx.arc(trace.x1 + Math.sin(time) * 2, trace.y1, 4 + pulse * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Data flow particles
        const flowProgress = (time * trace.speed) % 1;
        const flowX = trace.x1 + (trace.x2 - trace.x1) * flowProgress;
        const flowY = trace.y1 + (trace.y2 - trace.y1) * flowProgress;
        
        ctx.fillStyle = `rgba(0, 255, 255, ${1 - flowProgress})`;
        ctx.beginPath();
        ctx.arc(flowX, flowY, 2, 0, Math.PI * 2);
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
  }, [staticIntensity, glitchOffset]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden z-[9999]">
      {/* Static noise background */}
      <canvas ref={staticCanvasRef} className="absolute inset-0 opacity-20" />
      
      {/* Circuit board background */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-50" />
      
      {/* Moving elements */}
      {movingElements.map(el => (
        <div
          key={el.id}
          className="absolute w-1 h-1 bg-cyan-500 animate-pulse"
          style={{
            left: `${el.x}px`,
            top: `${el.y}px`,
            boxShadow: '0 0 10px cyan'
          }}
        />
      ))}
      
      {/* Enhanced scanlines overlay with glitch */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(transparent 50%, rgba(0, 255, 255, ${0.05 + staticIntensity * 0.05}) 50%)`,
          backgroundSize: '100% 2px',
          transform: `translateY(${scanlineOffset + glitchOffset}px)`
        }}
      />
      
      {/* Additional static overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(circle, transparent 40%, rgba(0, 255, 255, ${staticIntensity * 0.1}) 100%)`,
          filter: `contrast(${1 + staticIntensity * 0.5}) brightness(${1 + staticIntensity * 0.3})`
        }}
      />
      
      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        
        {/* Left side - Scrolling terminal */}
        <div className="w-1/3 h-full">
          <div className="bg-black border border-cyan-500 h-[80vh] overflow-hidden">
            <div className="p-2 border-b border-cyan-500 text-cyan-400 text-xs font-mono">
              SYSTEM CONSOLE v2.1.4 :: MODULAR_SYNTH_OS
            </div>
            <div className="p-3 h-full overflow-hidden">
              <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {scrollingMessages.map((msg, index) => (
                  <div key={index} className="text-cyan-400 font-mono text-xs mb-1">
                    <span className="text-green-500">[{String(index + 1).padStart(3, '0')}]</span> 
                    <span className="ml-2 animate-pulse">{msg}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Center - 3D Rotating Cube and Logo */}
        <div className="w-1/3 flex flex-col items-center justify-center">
          {/* Synth Logo */}
          <div className="mb-8">
            <pre className="text-cyan-400 text-xs font-mono leading-tight text-center filter drop-shadow-lg">
              {SYNTH_LOGO}
            </pre>
          </div>
          
          {/* 3D Rotating Cube - 1997 style */}
          <div className="mb-8" style={{ perspective: '1000px' }}>
            <div 
              className="w-32 h-32 relative"
              style={{
                transform: `rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg)`,
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Cube faces */}
              <div className="absolute w-32 h-32 border-2 border-cyan-500 bg-gradient-to-br from-cyan-900/30 to-purple-900/30" 
                   style={{ transform: 'translateZ(64px)' }} />
              <div className="absolute w-32 h-32 border-2 border-cyan-500 bg-gradient-to-br from-purple-900/30 to-pink-900/30" 
                   style={{ transform: 'rotateY(90deg) translateZ(64px)' }} />
              <div className="absolute w-32 h-32 border-2 border-cyan-500 bg-gradient-to-br from-pink-900/30 to-cyan-900/30" 
                   style={{ transform: 'rotateY(180deg) translateZ(64px)' }} />
              <div className="absolute w-32 h-32 border-2 border-cyan-500 bg-gradient-to-br from-cyan-900/30 to-purple-900/30" 
                   style={{ transform: 'rotateY(-90deg) translateZ(64px)' }} />
              <div className="absolute w-32 h-32 border-2 border-cyan-500 bg-gradient-to-br from-purple-900/30 to-pink-900/30" 
                   style={{ transform: 'rotateX(90deg) translateZ(64px)' }} />
              <div className="absolute w-32 h-32 border-2 border-cyan-500 bg-gradient-to-br from-pink-900/30 to-cyan-900/30" 
                   style={{ transform: 'rotateX(-90deg) translateZ(64px)' }} />
              
              {/* Center glow effect */}
              <div className="absolute inset-0 bg-cyan-500/20 rounded animate-pulse" />
            </div>
          </div>
          
          {/* Loading percentage */}
          <div className="text-cyan-400 font-mono text-3xl mb-4 animate-pulse">
            {Math.floor(loadingProgress)}%
          </div>
          
          {/* Status */}
          <div className="text-center">
            <div className="text-cyan-400 font-mono text-sm mb-2">SYSTEM INITIALIZATION</div>
            <div className="flex space-x-4 text-xs">
              <div className="flex items-center text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                POWER
              </div>
              <div className="flex items-center text-cyan-400">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse" />
                SYNC
              </div>
              <div className="flex items-center text-purple-400">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse" />
                READY
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Modular Interface */}
        <div className="w-1/3">
          <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-cyan-500 rounded-lg p-4 h-[80vh]">
            
            {/* Header with VU meters */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-cyan-400 font-mono text-sm">
                PATCH MATRIX
              </div>
              <div className="flex space-x-1">
                {Array.from({length: 16}).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-6 ${
                      i < vuLevel * 16 
                        ? i < 11 ? 'bg-green-500' : i < 14 ? 'bg-yellow-500' : 'bg-red-500'
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
                  <div className="h-20 w-3 bg-gray-800 border border-cyan-500 mx-auto relative">
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-500 to-purple-500 transition-all duration-300"
                      style={{ height: `${(loadingProgress + i * 10) % 100}%` }}
                    />
                    <div className="absolute w-4 h-1 bg-white border border-gray-400 -left-0.5 transition-all duration-300"
                         style={{ bottom: `${(loadingProgress + i * 10) % 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Main progress display */}
            <div className="mb-6">
              <div className="h-4 bg-gray-800 border-2 border-cyan-500 rounded overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-300 relative"
                  style={{ width: `${loadingProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
                </div>
              </div>
            </div>
            
            {/* Patch matrix visualization */}
            <div className="grid grid-cols-8 gap-1">
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
        </div>
        
      </div>
      
      {/* Glow effects */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-conic from-purple-900/10 via-transparent to-cyan-900/10 pointer-events-none" />
      
    </div>
  );
};

export default LoadingScreen;