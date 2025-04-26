import React, { useState, useEffect } from 'react';
import CircuitBuilderWindow from './CircuitBuilderWindow';
import { useLocation } from 'wouter';
import { ArrowLeft, Cpu, Zap, BookOpen, HelpCircle, Volume2, VolumeX, Code, Maximize } from 'lucide-react';
import { ReactSVG } from 'react-svg';

// CSS for the truly full-screen mode
const fullscreenStyle = `
  .circuit-forge-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    background-color: #1e1b4b;
    overflow: hidden;
  }

  .circuit-forge-fullscreen body {
    overflow: hidden;
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 10px rgba(74, 222, 128, 0.5), 0 0 20px rgba(56, 189, 248, 0.3); }
    50% { box-shadow: 0 0 20px rgba(74, 222, 128, 0.8), 0 0 40px rgba(56, 189, 248, 0.5); }
  }

  .animate-pulse-glow {
    animation: pulse-glow 3s infinite;
  }

  .pixel-grid-bg {
    background-image: 
      linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
      linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
    background-size: 
      10px 10px,
      10px 10px,
      50px 50px,
      50px 50px;
  }

  .circuit-pattern {
    background-image: radial-gradient(
      circle at 15px 15px,
      rgba(74, 222, 128, 0.1) 2px,
      transparent 0
    );
    background-size: 50px 50px;
  }
`;

const FullscreenCircuitBuilderApp: React.FC = () => {
  const [, navigate] = useLocation();
  const [showTutorial, setShowTutorial] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTip, setCurrentTip] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(true);
  
  // Apply fullscreen styles when component mounts
  useEffect(() => {
    // Inject the CSS for fullscreen mode
    const styleElement = document.createElement('style');
    styleElement.textContent = fullscreenStyle;
    document.head.appendChild(styleElement);
    
    // Add fullscreen class to document body
    document.documentElement.classList.add('circuit-forge-fullscreen');
    
    return () => {
      // Clean up by removing the style and class when component unmounts
      document.head.removeChild(styleElement);
      document.documentElement.classList.remove('circuit-forge-fullscreen');
    };
  }, []);
  
  // Audio effects
  useEffect(() => {
    // Load background music
    const bgMusic = new Audio('/sounds/Pixel Hearth.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    if (soundEnabled) {
      try {
        bgMusic.play().catch(e => console.warn('Could not autoplay audio:', e));
      } catch (error) {
        console.warn('Audio playback error:', error);
      }
    }
    
    return () => {
      bgMusic.pause();
    };
  }, [soundEnabled]);
  
  const tutorialTips = [
    {
      title: "Welcome to Circuit Builder!",
      content: "This is your workshop for creating and experimenting with electronic circuits. Drag components from the palette to the canvas to get started!",
      image: "/images/tutorial/welcome.png"
    },
    {
      title: "Connecting Components",
      content: "Click on connection points to create wires between components. Red points are outputs, blue points are inputs.",
      image: "/images/tutorial/connections.png"
    },
    {
      title: "Programming Microcontrollers",
      content: "Hover over a microcontroller and click the code icon to open the code editor. Write MicroPython code to control your circuit!",
      image: "/images/tutorial/code.png"
    },
    {
      title: "Running Simulations",
      content: "Click the Simulate button to see your circuit in action. Batteries and microcontrollers will power components like LEDs.",
      image: "/images/tutorial/simulate.png"
    }
  ];

  const handleNextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tutorialTips.length);
  };

  const handlePrevTip = () => {
    setCurrentTip((prev) => (prev - 1 + tutorialTips.length) % tutorialTips.length);
  };

  // Request browser fullscreen
  const requestFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="circuit-forge-app absolute inset-0 overflow-hidden">
      {/* Pixel Art Background */}
      <div className="absolute inset-0 bg-indigo-950 pixel-grid-bg z-0" />
      <div className="absolute inset-0 circuit-pattern z-0 opacity-30" />
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Header with back button */}
        <div className="header px-4 py-2 flex items-center border-b-2 border-purple-600/50 bg-indigo-900/90 text-white backdrop-blur-sm">
          <button 
            className="back-btn p-2 mr-3 bg-purple-800 hover:bg-purple-700 rounded-md transition-colors duration-200 flex items-center space-x-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Hub</span>
          </button>
          
          <div className="flex items-center">
            <Cpu className="h-6 w-6 mr-2 text-green-400 animate-pulse" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-300 tracking-wider font-pixelated">CIRCUIT FORGE</h1>
          </div>
          
          <div className="ml-auto flex space-x-3">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              className="p-2 rounded-md bg-indigo-800 hover:bg-indigo-700 transition-colors"
              title={soundEnabled ? "Mute sound" : "Enable sound"}
            >
              {soundEnabled ? <Volume2 size={18} className="text-green-400" /> : <VolumeX size={18} className="text-red-400" />}
            </button>
            
            <button 
              onClick={requestFullscreen} 
              className="p-2 rounded-md bg-indigo-800 hover:bg-indigo-700 transition-colors"
              title="Toggle fullscreen"
            >
              <Maximize size={18} className="text-cyan-300" />
            </button>
            
            <button 
              onClick={() => setShowTutorial(true)} 
              className="p-2 rounded-md bg-indigo-800 hover:bg-indigo-700 transition-colors flex items-center space-x-1"
            >
              <HelpCircle size={18} className="text-cyan-300" />
              <span className="hidden sm:inline text-cyan-100">Tutorial</span>
            </button>
            
            <div className="hidden md:flex items-center px-3 py-1 rounded-md bg-indigo-800/50 text-xs border border-indigo-700/30">
              <Zap className="h-4 w-4 mr-1 text-yellow-400" />
              <span className="text-cyan-100 font-pixelated tracking-wider">BUILD • CONNECT • PROGRAM • SIMULATE</span>
            </div>
          </div>
        </div>
        
        {/* Circuit Builder Interface */}
        <div className="flex-grow overflow-hidden relative">
          <CircuitBuilderWindow />
        </div>
        
        {/* Footer with pixel art style */}
        <div className="footer py-2 px-4 bg-indigo-900/90 text-white text-sm border-t-2 border-purple-600/50 backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 shadow-glow"></div>
              <span className="text-blue-200">Inputs</span>
              <div className="w-3 h-3 rounded-full bg-red-500 mx-2 shadow-glow-red"></div>
              <span className="text-red-200">Outputs</span>
            </div>
            
            <div className="text-center">
              <span className="px-2 py-1 bg-indigo-800/60 rounded text-xs font-pixelated text-cyan-300 border border-indigo-700/50 animate-pulse-glow inline-block">
                LEVEL 1: ELECTRONIC APPRENTICE
              </span>
            </div>
            
            <div className="flex justify-end text-xs items-center">
              <Code size={14} className="mr-1 text-green-400" />
              <span className="text-green-200">Microcontroller code editor available</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-indigo-900 border-2 border-purple-500 rounded-lg w-full max-w-2xl p-6 relative animate-pulse-glow">
            <button 
              className="absolute top-3 right-3 text-white hover:text-red-400"
              onClick={() => setShowTutorial(false)}
            >
              <ArrowLeft size={20} />
              <span className="ml-1">Close</span>
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-300">{tutorialTips[currentTip].title}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center justify-center">
                <div className="w-full h-48 bg-purple-800/50 rounded-lg flex items-center justify-center border border-purple-500">
                  {/* Placeholder for tutorial images - these would need to be created */}
                  <div className="text-white text-center">
                    <Cpu size={48} className="mx-auto mb-2 text-green-400" />
                    <p className="text-sm">Tutorial Image</p>
                  </div>
                </div>
              </div>
              
              <div className="text-white">
                <p className="text-lg text-cyan-100">{tutorialTips[currentTip].content}</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded text-white border border-indigo-500 transition-all duration-200 hover:scale-105"
                onClick={handlePrevTip}
              >
                Previous Tip
              </button>
              
              <div className="flex space-x-1 items-center">
                {tutorialTips.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full ${currentTip === index ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}
                  />
                ))}
              </div>
              
              <button 
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded text-white border border-indigo-500 transition-all duration-200 hover:scale-105"
                onClick={handleNextTip}
              >
                Next Tip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullscreenCircuitBuilderApp;