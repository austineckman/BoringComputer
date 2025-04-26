import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import PartyKittyPopup from './PartyKittyPopup';

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

const TerminalWindow: React.FC<TerminalWindowProps> = ({ onClose, onMinimize, zIndex }) => {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [responses, setResponses] = useState<CommandResponse[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isMoving, setIsMoving] = useState(false);
  const [showKittyPopups, setShowKittyPopups] = useState<Array<{ id: number, x: number, y: number }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

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

  // Move window with mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isMoving && terminalRef.current) {
        setPosition({
          x: e.clientX - terminalRef.current.offsetWidth / 2,
          y: e.clientY - 20,
        });
      }
    };

    const handleMouseUp = () => {
      setIsMoving(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMoving]);

  const startMoving = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMoving(true);
  };

  const triggerPartyKitty = () => {
    // Create 5 random positions for popups
    const popups = [];
    for (let i = 0; i < 5; i++) {
      popups.push({
        id: Date.now() + i,
        x: Math.random() * (window.innerWidth - 300),
        y: Math.random() * (window.innerHeight - 300),
      });
    }
    setShowKittyPopups(popups);
  };

  const removeKittyPopup = (id: number) => {
    setShowKittyPopups(prev => prev.filter(popup => popup.id !== id));
  };

  const handleCommand = (command: string) => {
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
      ref={terminalRef}
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
        onMouseDown={startMoving}
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