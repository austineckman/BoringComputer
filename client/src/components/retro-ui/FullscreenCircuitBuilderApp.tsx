import React, { useState, useEffect } from 'react';
import CircuitBuilderWindow from './CircuitBuilderWindow';
import { useLocation } from 'wouter';
import { ArrowLeft, Cpu, Zap, BookOpen, HelpCircle, Volume2, VolumeX, Code, Maximize } from 'lucide-react';
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
    
    // Force fullscreen styling
    document.body.style.overflow = 'hidden';
    
    return () => {
      bgMusic.pause();
      document.body.style.overflow = '';
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
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-indigo-950 z-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-indigo-950">
        <div className="absolute inset-0 opacity-10" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(
              circle at 15px 15px,
              rgba(74, 222, 128, 1) 2px,
              transparent 0
            )`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
      
      {/* Main Content */}
      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3 bg-indigo-900 border-b-2 border-indigo-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                className="mr-4 p-2 bg-purple-800 hover:bg-purple-700 rounded-md transition-colors flex items-center"
                onClick={() => navigate('/')}
              >
                <ArrowLeft size={18} className="text-white" />
                <span className="ml-2 text-white hidden sm:inline">Back</span>
              </button>
              
              <div className="flex items-center">
                <Cpu className="h-7 w-7 mr-3 text-green-400 animate-pulse" />
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-300 tracking-wider">
                  CIRCUIT FORGE
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)} 
                className="p-2 rounded-md bg-indigo-800 hover:bg-indigo-700 transition-colors"
              >
                {soundEnabled ? 
                  <Volume2 size={20} className="text-green-400" /> : 
                  <VolumeX size={20} className="text-red-400" />
                }
              </button>
              
              <button 
                onClick={requestFullscreen} 
                className="p-2 rounded-md bg-indigo-800 hover:bg-indigo-700 transition-colors"
              >
                <Maximize size={20} className="text-cyan-300" />
              </button>
              
              <button 
                onClick={() => setShowTutorial(true)} 
                className="p-2 rounded-md bg-indigo-800 hover:bg-indigo-700 transition-colors flex items-center"
              >
                <HelpCircle size={20} className="text-cyan-300" />
                <span className="ml-2 text-cyan-100 hidden sm:inline">Tutorial</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Circuit Builder Area */}
        <div className="flex-grow">
          <CircuitBuilderWindow />
        </div>
        
        {/* Footer */}
        <div className="py-2 px-4 bg-indigo-900 text-white border-t-2 border-indigo-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 shadow-md"></div>
              <span className="text-blue-200 mr-4">Inputs</span>
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2 shadow-md"></div>
              <span className="text-red-200">Outputs</span>
            </div>
            
            <div className="text-center">
              <span className="px-3 py-1 bg-indigo-800/60 rounded text-sm text-cyan-300 border border-indigo-700 shadow-lg">
                ELECTRONIC WORKSHOP
              </span>
            </div>
            
            <div className="flex items-center">
              <Code size={16} className="mr-2 text-green-400" />
              <span className="text-green-200">MicroPython Editor</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-indigo-900 border-2 border-purple-500 rounded-lg w-full max-w-2xl p-6 relative shadow-[0_0_15px_rgba(74,222,128,0.3)]">
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
                    className={`w-2 h-2 rounded-full ${currentTip === index ? 'bg-green-400' : 'bg-gray-600'}`}
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