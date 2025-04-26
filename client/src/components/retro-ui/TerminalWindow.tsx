import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import partyKittyImage from '@assets/partykitty.png';

interface TerminalWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  zIndex: number;
}

type CommandResponse = {
  output: string;
  isError?: boolean;
  isHTML?: boolean;
  isSpecial?: boolean;
};

const PartyKittyPopup = ({ position, onClose }: { position: { x: number, y: number }, onClose: () => void }) => {
  const [currentPosition, setCurrentPosition] = useState(position);
  const [rotation, setRotation] = useState(Math.random() * 10 - 5);
  
  // Add a little animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPosition(prev => ({
        x: prev.x + (Math.random() * 6 - 3),
        y: prev.y + (Math.random() * 6 - 3),
      }));
      setRotation(prev => prev + (Math.random() * 4 - 2));
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div 
      className="absolute bg-black border-2 border-yellow-400 rounded-md overflow-hidden shadow-lg"
      style={{ 
        width: 300, 
        height: 280, 
        left: currentPosition.x, 
        top: currentPosition.y,
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.3s ease',
        zIndex: 9999
      }}
    >
      {/* Window bar */}
      <div 
        className="bg-gradient-to-r from-yellow-500 to-yellow-400 px-2 py-1 flex justify-between items-center"
      >
        <div className="text-black font-bold text-sm">PARTY KITTY!</div>
        <button 
          className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
          onClick={onClose}
        >
          <X className="text-white w-3 h-3" />
        </button>
      </div>
      
      {/* Party Kitty Image */}
      <div className="flex flex-col items-center justify-center p-2 h-[calc(100%-50px)]">
        <img 
          src={partyKittyImage}
          alt="Party Kitty" 
          className="max-w-full max-h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="text-yellow-400 text-center mt-2 text-sm font-bold">
          🎉 PARTY TIME! 🎉
        </div>
      </div>
    </div>
  );
};

const TerminalWindow: React.FC<TerminalWindowProps> = ({ onClose, onMinimize, zIndex }) => {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [responses, setResponses] = useState<CommandResponse[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showKittyPopups, setShowKittyPopups] = useState<Array<{ id: number, x: number, y: number }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage = `
      ┌──────────────────────────────────────────────────┐
      │  CRAFTING TABLE OS - TERMINAL v1.0.4815          │
      │  Copyright (c) 2025 Crafting Table Inc.          │
      │  Type 'help' for a list of available commands    │
      └──────────────────────────────────────────────────┘
    `;
    
    setResponses([{ output: welcomeMessage }]);
  }, []);

  // Auto-scroll to the bottom when new responses are added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [responses]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    focusInput();
  }, []);

  // Handle window dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const triggerPartyKitty = () => {
    // Create 5 random positions for popups
    const popups = [];
    for (let i = 0; i < 5; i++) {
      popups.push({
        id: Date.now() + i,
        x: Math.random() * (window.innerWidth - 350),
        y: Math.random() * (window.innerHeight - 300),
      });
    }
    setShowKittyPopups(popups);
  };

  const removeKittyPopup = (id: number) => {
    setShowKittyPopups(prev => prev.filter(popup => popup.id !== id));
  };

  const handleCommand = (command: string) => {
    if (!command.trim()) return;
    
    // Add command to history
    setCommandHistory(prev => [...prev, command]);
    
    // Process command
    const lowerCommand = command.toLowerCase().trim();
    let response: CommandResponse;
    
    if (lowerCommand === 'help') {
      response = {
        output: `
Available commands:
  - help          Show this help message
  - clear         Clear the terminal
  - echo [text]   Print text to the terminal
  - ls            List files in the current directory
  - pwd           Print working directory
  - date          Display current date and time
  - whoami        Display current user
  - cat [file]    Display content of a file
  - find [query]  Search for files (try to find something interesting...)
  - version       Display system version information
  - quit or exit  Close the terminal
`,
      };
    } else if (lowerCommand === 'clear') {
      setResponses([]);
      return;
    } else if (lowerCommand.startsWith('echo ')) {
      const message = command.substring(5);
      response = { output: message };
    } else if (lowerCommand === 'ls') {
      response = {
        output: `
system/
  ├── bin/
  ├── config/
  ├── lib/
  ├── logs/
  └── temp/
home/
  ├── documents/
  ├── pictures/
  │   └── kitty.png
  └── secrets/
`,
      };
    } else if (lowerCommand === 'pwd') {
      response = { output: '/home/user' };
    } else if (lowerCommand === 'date') {
      response = { output: new Date().toString() };
    } else if (lowerCommand === 'whoami') {
      response = { output: 'crafting_master' };
    } else if (lowerCommand.startsWith('cat ')) {
      const file = command.substring(4).trim();
      if (file === 'pictures/kitty.png' || file === '/home/pictures/kitty.png' || file === './pictures/kitty.png') {
        response = { 
          output: 'Cannot display binary file. Try loading it with the "load" command.',
          isError: true 
        };
      } else {
        response = { 
          output: `cat: ${file}: No such file or directory`,
          isError: true 
        };
      }
    } else if (lowerCommand === 'version') {
      response = { output: 'CRAFTING TABLE OS v1.0.4815 (build 20250426)' };
    } else if (lowerCommand === 'quit' || lowerCommand === 'exit') {
      onClose();
      return;
    } else if (lowerCommand.startsWith('find ')) {
      const query = command.substring(5).trim().toLowerCase();
      if (query === 'kitty' || query === 'cat' || query === 'party') {
        response = { 
          output: 'Found 1 result:\n/home/pictures/kitty.png' 
        };
      } else {
        response = { output: 'No results found.' };
      }
    } else if (lowerCommand.startsWith('load ')) {
      const file = command.substring(5).trim();
      if (file === 'pictures/kitty.png' || file === '/home/pictures/kitty.png' || file === './pictures/kitty.png' || file === 'kitty.png') {
        triggerPartyKitty();
        response = { 
          output: 'Loading kitty.png... PARTY TIME!!!',
          isSpecial: true
        };
      } else {
        response = { 
          output: `load: ${file}: No such file or directory`,
          isError: true 
        };
      }
    } else {
      response = {
        output: `Command not found: ${command}. Type 'help' for a list of available commands.`,
        isError: true,
      };
    }
    
    // Display the response
    setResponses(prev => [...prev, { output: `$ ${command}` }, response]);
    setCurrentCommand('');
  };

  return (
    <div
      className="absolute bg-black border-2 border-gray-700 rounded-md overflow-hidden shadow-lg"
      style={{ 
        width: 600, 
        height: 400, 
        left: position.x, 
        top: position.y, 
        zIndex
      }}
      onClick={focusInput}
    >
      {/* Window bar */}
      <div 
        className="bg-gray-800 px-2 py-1 flex justify-between items-center cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="text-white font-mono text-sm">Terminal</div>
        <div className="flex gap-2">
          <button 
            className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-yellow-600"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
          >
            <span className="text-black font-bold text-xs">_</span>
          </button>
          <button 
            className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="text-black w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Terminal output */}
      <div 
        ref={outputRef}
        className="h-[calc(100%-60px)] overflow-y-auto p-2 font-mono text-sm text-green-400 bg-black"
      >
        {responses.map((response, index) => (
          <div 
            key={index} 
            className={`mb-1 whitespace-pre-wrap ${response.isError ? 'text-red-400' : ''} ${response.isSpecial ? 'text-yellow-300 font-bold' : ''}`}
          >
            {response.output}
          </div>
        ))}
      </div>
      
      {/* Terminal input */}
      <div className="bg-black h-[30px] border-t border-gray-700 px-2 py-1 flex items-center">
        <span className="text-green-400 font-mono mr-2">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCommand(currentCommand);
            }
          }}
          className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono text-sm"
          autoFocus
        />
      </div>

      {/* Party Kitty Popups */}
      {showKittyPopups.map(popup => (
        <PartyKittyPopup 
          key={popup.id}
          position={{ x: popup.x, y: popup.y }}
          onClose={() => removeKittyPopup(popup.id)}
        />
      ))}
    </div>
  );
};

export default TerminalWindow;