import React, { useState, useEffect } from 'react';
import CircuitBuilderWindow from './CircuitBuilderWindow';
import { useLocation } from 'wouter';
import { ArrowLeft, Cpu, Zap, BookOpen, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { ReactSVG } from 'react-svg';

const FullscreenCircuitBuilderApp: React.FC = () => {
  const [, navigate] = useLocation();
  const [showTutorial, setShowTutorial] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTip, setCurrentTip] = useState(0);
  
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

  return (
    <div className="fullscreen-circuit-builder h-screen w-screen overflow-hidden relative">
      {/* Pixel Art Background */}
      <div 
        className="absolute inset-0 bg-repeat opacity-20 z-0" 
        style={{ 
          backgroundImage: "url('/images/pixel-grid-bg.png')", 
          backgroundSize: "128px 128px" 
        }}
      />
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full w-full bg-gradient-to-b from-indigo-900/50 to-purple-900/50 backdrop-blur-sm">
        {/* Header with back button */}
        <div className="header px-4 py-2 flex items-center border-b-2 border-purple-600/50 bg-indigo-900/80 text-white backdrop-blur-sm">
          <button 
            className="back-btn p-2 mr-3 bg-purple-800 hover:bg-purple-700 rounded-md transition-colors duration-200 flex items-center space-x-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Hub</span>
          </button>
          
          <div className="flex items-center">
            <Cpu className="h-6 w-6 mr-2 text-green-400" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-300 tracking-wider">CIRCUIT FORGE</h1>
          </div>
          
          <div className="ml-auto flex space-x-3">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              className="p-2 rounded-md bg-indigo-800 hover:bg-indigo-700 transition-colors"
              title={soundEnabled ? "Mute sound" : "Enable sound"}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            
            <button 
              onClick={() => setShowTutorial(true)} 
              className="p-2 rounded-md bg-indigo-800 hover:bg-indigo-700 transition-colors flex items-center space-x-1"
            >
              <HelpCircle size={18} />
              <span className="hidden sm:inline">Tutorial</span>
            </button>
            
            <div className="hidden md:flex items-center px-3 py-1 rounded-md bg-indigo-800/50 text-xs">
              <Zap className="h-4 w-4 mr-1 text-yellow-400" />
              <span>Build • Connect • Program • Simulate</span>
            </div>
          </div>
        </div>
        
        {/* Circuit Builder Interface */}
        <div className="flex-grow overflow-hidden">
          <CircuitBuilderWindow />
        </div>
        
        {/* Footer with pixel art style */}
        <div className="footer py-2 px-4 bg-indigo-900/80 text-white text-sm border-t-2 border-purple-600/50 backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span>Inputs</span>
              <div className="w-3 h-3 rounded-full bg-red-500 mx-2"></div>
              <span>Outputs</span>
            </div>
            
            <div className="text-center">
              <span className="px-2 py-1 bg-indigo-800/60 rounded text-xs font-pixelated">
                LEVEL 1: ELECTRONIC APPRENTICE
              </span>
            </div>
            
            <div className="flex justify-end text-xs items-center">
              <BookOpen size={14} className="mr-1" />
              <span>Click component icons for quick info</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-indigo-900 border-2 border-purple-500 rounded-lg w-full max-w-2xl p-6 relative">
            <button 
              className="absolute top-3 right-3 text-white hover:text-red-400"
              onClick={() => setShowTutorial(false)}
            >
              <ArrowLeft size={20} />
              <span className="ml-1">Close</span>
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">{tutorialTips[currentTip].title}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center justify-center">
                <div className="w-full h-48 bg-purple-800/50 rounded-lg flex items-center justify-center">
                  {/* Placeholder for tutorial images - these would need to be created */}
                  <div className="text-white text-center">
                    <Cpu size={48} className="mx-auto mb-2 text-green-400" />
                    <p className="text-sm">Tutorial Image</p>
                  </div>
                </div>
              </div>
              
              <div className="text-white">
                <p className="text-lg">{tutorialTips[currentTip].content}</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded text-white"
                onClick={handlePrevTip}
              >
                Previous Tip
              </button>
              
              <div className="flex space-x-1">
                {tutorialTips.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full ${currentTip === index ? 'bg-green-400' : 'bg-gray-600'}`}
                  />
                ))}
              </div>
              
              <button 
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded text-white"
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