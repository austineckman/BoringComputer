import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Minimize2, Maximize2, Terminal as TerminalIcon, Skull, Zap, Shield, Wifi, Globe, Database, FileText, Lock, Unlock, Key } from 'lucide-react';
import gizboImage from '@assets/gizbo.png';

interface TerminalWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
  windowTitle?: string;
  username?: string;
}

// Define available hacking tools
const HACKING_TOOLS = [
  { name: 'G1ZN1F', icon: <Wifi size={16} />, color: '#00ff00', description: 'Network scanner' },
  { name: 'B1TP3TR', icon: <Skull size={16} />, color: '#ff00ff', description: 'Password cracker' },
  { name: 'SP00FY', icon: <Globe size={16} />, color: '#00ffff', description: 'DNS spoofer' },
  { name: 'BYT3RAG3', icon: <Zap size={16} />, color: '#ffff00', description: 'DDoS simulator' },
  { name: 'G1ZM4SK', icon: <Shield size={16} />, color: '#ff9900', description: 'Stealth proxy' },
  { name: 'DB0WN3R', icon: <Database size={16} />, color: '#9900ff', description: 'Database exploiter' },
  { name: 'F1L3J4CK', icon: <FileText size={16} />, color: '#ff0099', description: 'File system hacker' },
  { name: 'K3YM4ST3R', icon: <Key size={16} />, color: '#00ff99', description: 'Encryption breaker' },
];

// Target systems for the hacking mini-game
const TARGET_SYSTEMS = [
  { name: 'Quantum Gateway Mainframe', difficulty: 'Legendary', reward: 'Neural Interface' },
  { name: 'NeoTech Corporate Server', difficulty: 'Epic', reward: 'Crypto Vault Key' },
  { name: 'SynthLife Biometric Database', difficulty: 'Rare', reward: 'Genome Modifier' },
  { name: 'CyberBank Financial Core', difficulty: 'Epic', reward: 'Digital Asset Token' },
  { name: 'GridMaster Power Network', difficulty: 'Uncommon', reward: 'Energy Amplifier' },
  { name: 'SecureCorp Defense System', difficulty: 'Legendary', reward: 'Stealth Module' },
  { name: 'MediaPlex Content Delivery', difficulty: 'Common', reward: 'Data Stream Filter' },
  { name: 'MindMatrix Neural Web', difficulty: 'Rare', reward: 'Thought Encoder' },
];

// Define glitch effects animation keyframes
const glitchAnimations = [
  { name: 'horizontal-shake', css: 'transform: translate(2px, 0); transform: translate(-2px, 0);' },
  { name: 'vertical-shake', css: 'transform: translate(0, 2px); transform: translate(0, -2px);' },
  { name: 'color-glitch', css: 'color: #ff00ff; color: #00ffff; color: #ffff00;' },
  { name: 'opacity-glitch', css: 'opacity: 0.7; opacity: 1; opacity: 0.5;' },
];

// ASCII art for the hacker panel
const HACKER_LOGO = `
  ██████╗ ██╗███████╗██████╗  ██████╗ ███████╗    ██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗ 
 ██╔════╝ ██║╚══███╔╝██╔══██╗██╔═══██╗██╔════╝    ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
 ██║  ███╗██║  ███╔╝ ██████╔╝██║   ██║███████╗    ███████║███████║██║     █████╔╝ █████╗  ██████╔╝
 ██║   ██║██║ ███╔╝  ██╔══██╗██║   ██║╚════██║    ██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗
 ╚██████╔╝██║███████╗██████╔╝╚██████╔╝███████║    ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║
  ╚═════╝ ╚═╝╚══════╝╚═════╝  ╚═════╝ ╚══════╝    ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
                                                                                                  
           ████████╗ ██████╗  ██████╗ ██╗     ██╗  ██╗██╗████████╗
           ╚══██╔══╝██╔═══██╗██╔═══██╗██║     ██║ ██╔╝██║╚══██╔══╝
              ██║   ██║   ██║██║   ██║██║     █████╔╝ ██║   ██║   
              ██║   ██║   ██║██║   ██║██║     ██╔═██╗ ██║   ██║   
              ██║   ╚██████╔╝╚██████╔╝███████╗██║  ██╗██║   ██║   
              ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝   
`;

const randomHexColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

const TerminalWindow: React.FC<TerminalWindowProps> = ({
  onClose,
  onMinimize,
  isActive,
  windowTitle = "G1ZB0-TERM v3.1.4",
  username = "hacker",
}) => {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState<string>('');
  const [output, setOutput] = useState<Array<{type: string, content: string, color?: string}>>([]);
  const [prompt, setPrompt] = useState<string>(`${username}@gizbo-terminal:~$`);
  const [activePanel, setActivePanel] = useState<'terminal' | 'hacking'>('terminal');
  const [selectedTool, setSelectedTool] = useState<number | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [hackingProgress, setHackingProgress] = useState<number>(0);
  const [hackingStatus, setHackingStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [glitchEffects, setGlitchEffects] = useState<boolean>(false);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize terminal
  useEffect(() => {
    const welcomeMessage = [
      { type: 'ascii', content: HACKER_LOGO, color: '#00ff00' },
      { type: 'text', content: 'Welcome to G1ZB0-TERM v3.1.4 - The Ultimate Hacking Simulation', color: '#00ffff' },
      { type: 'text', content: 'Type "help" to see available commands', color: '#ffff00' },
      { type: 'text', content: '========================================', color: '#ff00ff' },
    ];
    
    setOutput(welcomeMessage);
  }, []);

  // Handle terminal focus
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  // Auto-scroll terminal to bottom when new content is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Random glitch effects for the cyberpunk aesthetic
  useEffect(() => {
    if (activePanel === 'hacking') {
      // Apply glitch effects randomly
      const glitchInterval = setInterval(() => {
        setGlitchEffects(true);
        setTimeout(() => setGlitchEffects(false), 150);
      }, 2000);
      
      return () => clearInterval(glitchInterval);
    }
  }, [activePanel]);

  // Handle simulated hacking progress
  useEffect(() => {
    if (hackingStatus === 'running') {
      const hackingInterval = setInterval(() => {
        setHackingProgress(prev => {
          // Random progress with occasional setbacks for realism
          const increment = Math.random() * 5 - (Math.random() > 0.8 ? 2 : 0);
          const newProgress = Math.max(0, Math.min(100, prev + increment));
          
          // Determine success or failure
          if (newProgress >= 100) {
            clearInterval(hackingInterval);
            setHackingStatus('success');
            handleHackingComplete(true);
            return 100;
          }
          
          // Random chance of failure
          if (Math.random() < 0.01) {
            clearInterval(hackingInterval);
            setHackingStatus('failed');
            handleHackingComplete(false);
            return prev;
          }
          
          return newProgress;
        });
      }, 200);
      
      return () => clearInterval(hackingInterval);
    }
  }, [hackingStatus]);

  const handleHackingComplete = (success: boolean) => {
    if (!selectedTarget || !selectedTool) return;
    
    const target = TARGET_SYSTEMS[selectedTarget];
    const tool = HACKING_TOOLS[selectedTool];
    
    let resultMessages: Array<{type: string, content: string, color: string}> = [];
    
    if (success) {
      resultMessages = [
        { type: 'text', content: '=== HACK SUCCESSFUL ===', color: '#00ff00' },
        { type: 'text', content: `Target: ${target.name}`, color: '#00ffff' },
        { type: 'text', content: `Tool: ${tool.name}`, color: '#ffff00' },
        { type: 'text', content: `Reward: ${target.reward}`, color: '#ff00ff' },
        { type: 'text', content: 'Adding to inventory...', color: '#00ff99' },
      ];
    } else {
      resultMessages = [
        { type: 'text', content: '!!! HACK FAILED !!!', color: '#ff0000' },
        { type: 'text', content: `Target: ${target.name}`, color: '#ff9900' },
        { type: 'text', content: `Tool: ${tool.name}`, color: '#ff00ff' },
        { type: 'text', content: 'Security systems detected intrusion!', color: '#ff0000' },
        { type: 'text', content: 'Connection terminated to avoid detection.', color: '#ff9900' },
      ];
    }
    
    setOutput(prev => [...prev, ...resultMessages]);
  };

  // Handle command execution
  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const cmdParts = trimmedCmd.split(' ');
    const mainCmd = cmdParts[0];
    
    let response: Array<{type: string, content: string, color?: string}> = [];
    
    // Add command to history
    setCommandHistory(prev => [...prev, cmd]);
    
    // Process command
    switch(mainCmd) {
      case 'help':
        response = [
          { type: 'text', content: '=== Available Commands ===', color: '#00ffff' },
          { type: 'text', content: 'help - Display this help message', color: '#ffffff' },
          { type: 'text', content: 'clear - Clear the terminal', color: '#ffffff' },
          { type: 'text', content: 'hack - Launch Gizbo\'s Hacking Toolkit', color: '#00ff00' },
          { type: 'text', content: 'tools - List available hacking tools', color: '#ffffff' },
          { type: 'text', content: 'targets - List potential hacking targets', color: '#ffffff' },
          { type: 'text', content: 'exit - Close the terminal', color: '#ffffff' },
          { type: 'text', content: '===========================', color: '#00ffff' },
        ];
        break;
      
      case 'clear':
        setOutput([]);
        return;
      
      case 'hack':
        response = [{ type: 'text', content: 'Launching Gizbo\'s Hacking Toolkit...', color: '#00ff00' }];
        setTimeout(() => setActivePanel('hacking'), 500);
        break;
      
      case 'tools':
        response = [{ type: 'text', content: '=== Available Hacking Tools ===', color: '#00ffff' }];
        HACKING_TOOLS.forEach(tool => {
          response.push({ 
            type: 'text', 
            content: `${tool.name} - ${tool.description}`,
            color: tool.color
          });
        });
        response.push({ type: 'text', content: '===========================', color: '#00ffff' });
        break;
      
      case 'targets':
        response = [{ type: 'text', content: '=== Potential Targets ===', color: '#00ffff' }];
        TARGET_SYSTEMS.forEach(target => {
          const difficultyColor = 
            target.difficulty === 'Legendary' ? '#ff0000' :
            target.difficulty === 'Epic' ? '#ff00ff' :
            target.difficulty === 'Rare' ? '#0000ff' :
            target.difficulty === 'Uncommon' ? '#00ff00' : '#ffffff';
          
          response.push({ 
            type: 'text', 
            content: `${target.name} - Difficulty: ${target.difficulty} - Reward: ${target.reward}`,
            color: difficultyColor
          });
        });
        response.push({ type: 'text', content: '============================', color: '#00ffff' });
        break;
      
      case 'exit':
        onClose();
        return;
      
      default:
        response = [{ type: 'text', content: `Command not found: ${cmd}. Type 'help' for a list of commands.`, color: '#ff0000' }];
    }
    
    // Update output
    setOutput(prev => [...prev, { type: 'command', content: `${prompt} ${cmd}` }, ...response]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand) {
      executeCommand(currentCommand);
      setCurrentCommand('');
    }
  };

  const startHacking = () => {
    if (selectedTool === null || selectedTarget === null) {
      setOutput(prev => [...prev, 
        { type: 'text', content: 'ERROR: You must select both a tool and a target to start hacking.', color: '#ff0000' }
      ]);
      return;
    }
    
    setHackingProgress(0);
    setHackingStatus('running');
    
    const tool = HACKING_TOOLS[selectedTool];
    const target = TARGET_SYSTEMS[selectedTarget];
    
    setOutput(prev => [...prev, 
      { type: 'text', content: `Initializing ${tool.name} attack on ${target.name}...`, color: '#00ff00' },
      { type: 'text', content: 'Establishing secure connection...', color: '#00ffff' },
      { type: 'text', content: 'Bypassing firewall...', color: '#ffff00' },
      { type: 'text', content: 'Scanning for vulnerabilities...', color: '#ff00ff' },
    ]);
  };

  const returnToTerminal = () => {
    setActivePanel('terminal');
    setSelectedTool(null);
    setSelectedTarget(null);
    setHackingStatus('idle');
    setHackingProgress(0);
  };

  return (
    <div className={`w-full h-full flex flex-col bg-gray-900 border-4 ${isActive ? 'border-cyan-400' : 'border-gray-600'}`}>
      {/* Window title bar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-cyan-700 to-blue-900 text-white px-3 py-2">
        <div className="font-bold truncate">{windowTitle}</div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onMinimize}
            className="w-5 h-5 flex items-center justify-center rounded-sm bg-gray-700 hover:bg-gray-600 text-gray-300"
          >
            <Minimize2 size={14} />
          </button>
          <button 
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded-sm bg-red-700 hover:bg-red-600 text-gray-200"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      {/* Content area */}
      <div className="flex flex-col h-full relative overflow-hidden">
        {/* Hacking panel mode background effects */}
        {activePanel === 'hacking' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Grid background */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] z-0"></div>
            
            {/* Random tech elements floating in the background */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i}
                className="absolute text-2xl opacity-20"
                style={{
                  color: randomHexColor(),
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float-${i % 3} ${5 + Math.random() * 10}s infinite`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              >
                {['⚡', '◈', '◇', '⚙️', '✧', '❯', '⌘', '⌥', '⎔', '#'][i % 10]}
              </div>
            ))}
          </div>
        )}
        
        {activePanel === 'terminal' ? (
          <>
            {/* Terminal output area */}
            <div 
              ref={terminalRef}
              className="flex-1 p-3 overflow-y-auto font-mono text-sm bg-black text-green-400 font-bold"
            >
              {output.map((line, i) => {
                if (line.type === 'ascii') {
                  return (
                    <pre key={i} className="text-xs whitespace-pre font-mono mb-2" style={{ color: line.color }}>
                      {line.content}
                    </pre>
                  );
                } else if (line.type === 'command') {
                  return (
                    <div key={i} className="mb-1 text-yellow-300">
                      {line.content}
                    </div>
                  );
                } else {
                  return (
                    <div key={i} className="mb-1" style={{ color: line.color || '#ffffff' }}>
                      {line.content}
                    </div>
                  );
                }
              })}
            </div>
            
            {/* Command input area */}
            <form onSubmit={handleSubmit} className="flex border-t-2 border-cyan-600 bg-gray-900">
              <div className="p-2 text-cyan-400 font-mono select-none">{prompt}</div>
              <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                className="flex-1 bg-transparent text-cyan-400 font-mono p-2 focus:outline-none"
                autoFocus={isActive}
              />
            </form>
          </>
        ) : (
          <div className={`flex flex-col h-full p-4 bg-gray-900 ${glitchEffects ? 'glitch-effect' : ''}`}>
            {/* Hacking Panel Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <img src={gizboImage} alt="Gizbo" className="w-8 h-8 rounded-full" />
                <h2 className="text-cyan-400 text-xl font-bold glitch-text">G1ZB0'S H4CK1NG T00LK1T</h2>
              </div>
              <button 
                onClick={returnToTerminal}
                className="px-3 py-1 bg-gray-800 text-pink-500 border border-pink-500 hover:bg-pink-900 transition-colors"
              >
                Return to Terminal
              </button>
            </div>
            
            {/* Main hacking interface */}
            <div className="flex flex-1 gap-4">
              {/* Left panel - Tools */}
              <div className="w-1/3 bg-gray-800 border-2 border-cyan-600 p-3 rounded">
                <h3 className="text-pink-500 border-b border-pink-500 pb-1 mb-3">H4CK1NG T00LS</h3>
                <div className="space-y-2">
                  {HACKING_TOOLS.map((tool, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedTool(idx)}
                      className={`flex items-center p-2 cursor-pointer transition-all ${selectedTool === idx 
                        ? 'bg-gray-700 border-l-4 border-r-4' 
                        : 'hover:bg-gray-700'}`}
                      style={{ borderColor: tool.color }}
                    >
                      <div className="mr-2" style={{ color: tool.color }}>{tool.icon}</div>
                      <div>
                        <div style={{ color: tool.color }}>{tool.name}</div>
                        <div className="text-xs text-gray-400">{tool.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right panel - Targets and progress */}
              <div className="flex-1 flex flex-col">
                {/* Target selection */}
                <div className="bg-gray-800 border-2 border-pink-500 p-3 rounded mb-4">
                  <h3 className="text-cyan-400 border-b border-cyan-400 pb-1 mb-3">T4RG3T SYST3MS</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {TARGET_SYSTEMS.map((target, idx) => {
                      const difficultyColor = 
                        target.difficulty === 'Legendary' ? '#ff0000' :
                        target.difficulty === 'Epic' ? '#ff00ff' :
                        target.difficulty === 'Rare' ? '#0000ff' :
                        target.difficulty === 'Uncommon' ? '#00ff00' : '#ffffff';
                      
                      return (
                        <div 
                          key={idx}
                          onClick={() => setSelectedTarget(idx)}
                          className={`p-2 cursor-pointer transition-all ${selectedTarget === idx 
                            ? 'bg-gray-700 border-2' 
                            : 'hover:bg-gray-700 border border-gray-700'}`}
                          style={{ borderColor: difficultyColor }}
                        >
                          <div className="font-bold text-yellow-300">{target.name}</div>
                          <div className="flex justify-between">
                            <span style={{ color: difficultyColor }}>{target.difficulty}</span>
                            <span className="text-green-400">{target.reward}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Hacking progress and controls */}
                <div className="flex-1 bg-gray-800 border-2 border-yellow-500 p-3 rounded flex flex-col">
                  <h3 className="text-yellow-400 border-b border-yellow-400 pb-1 mb-3">H4CK1NG ST4TUS</h3>
                  
                  {hackingStatus === 'idle' ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="text-lg text-cyan-400 mb-4 text-center">
                        Select a tool and target, then initiate the hack
                      </div>
                      <button
                        onClick={startHacking}
                        disabled={selectedTool === null || selectedTarget === null}
                        className={`px-6 py-3 text-lg ${selectedTool !== null && selectedTarget !== null 
                          ? 'bg-pink-900 text-pink-100 hover:bg-pink-700 cursor-pointer' 
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'} transition-colors`}
                      >
                        ⚡ 1N1T14T3 H4CK ⚡
                      </button>
                    </div>
                  ) : hackingStatus === 'running' ? (
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between text-cyan-400 mb-2">
                        <span>Progress:</span>
                        <span>{Math.floor(hackingProgress)}%</span>
                      </div>
                      <div className="w-full h-4 bg-gray-700 mb-4">
                        <div 
                          className="h-full transition-all duration-200"
                          style={{ 
                            width: `${hackingProgress}%`,
                            background: `linear-gradient(90deg, #00ff00, ${hackingProgress > 50 ? '#00ffff' : '#ffff00'}, ${hackingProgress > 80 ? '#ff00ff' : '#00ffff'})`,
                          }} 
                        />
                      </div>
                      
                      <div className="flex-1 overflow-y-auto font-mono text-xs">
                        {/* Animated hacking log */}
                        <div className="space-y-1 text-green-400">
                          {Array.from({ length: Math.ceil(hackingProgress / 5) }).map((_, i) => {
                            const messages = [
                              "Bypassing firewall...",
                              "Cracking encryption...",
                              "Injecting payload...",
                              "Scanning ports...",
                              "Disabling IDS...",
                              "Establishing backdoor...",
                              "Extracting credentials...",
                              "Reading memory...",
                              "Escalating privileges...",
                              "Covering tracks...",
                            ];
                            const randomColor = [
                              "#00ff00", "#00ffff", "#ffff00", "#ff00ff", "#ff0000",
                            ][Math.floor(Math.random() * 5)];
                            
                            return (
                              <div key={i} style={{ color: randomColor }}>
                                [{new Date().toISOString().substring(11, 19)}] {messages[i % messages.length]}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div 
                        className={`text-2xl mb-4 ${hackingStatus === 'success' ? 'text-green-400' : 'text-red-500'}`}
                      >
                        {hackingStatus === 'success' ? '✓ HACK SUCCESSFUL' : '✗ HACK FAILED'}
                      </div>
                      <div className="mb-6 text-center text-yellow-300">
                        {hackingStatus === 'success' 
                          ? `You've successfully hacked ${TARGET_SYSTEMS[selectedTarget || 0].name}` 
                          : 'Security countermeasures detected your intrusion'}
                      </div>
                      <button
                        onClick={() => setHackingStatus('idle')}
                        className="px-6 py-2 bg-cyan-900 text-cyan-100 hover:bg-cyan-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Cyberpunk glitch effects via CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-0 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, 20px) rotate(180deg); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-15px, 10px) rotate(-90deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(10px, -20px) rotate(90deg); }
        }
        
        .glitch-effect {
          animation: glitch 0.2s infinite;
        }
        
        @keyframes glitch {
          0% { transform: translate(2px, 0); text-shadow: -2px 0 #ff00ff; }
          25% { transform: translate(-2px, 0); text-shadow: 2px 0 #00ffff; }
          50% { transform: translate(0, 2px); text-shadow: 2px 0 #ffff00; }
          75% { transform: translate(0, -2px); text-shadow: -2px 0 #ff00ff; }
          100% { transform: translate(2px, 0); text-shadow: 2px 0 #00ffff; }
        }
        
        .glitch-text {
          position: relative;
          color: #00ffff;
          text-shadow: 0 0 5px #00ffff;
        }
        
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .glitch-text::before {
          left: 2px;
          text-shadow: -2px 0 #ff00ff;
          animation: glitch-before 3s infinite linear alternate-reverse;
        }
        
        .glitch-text::after {
          left: -2px;
          text-shadow: 2px 0 #00ffff;
          animation: glitch-after 2s infinite linear alternate-reverse;
        }
        
        @keyframes glitch-before {
          0% { clip-path: inset(0 0 0 0); }
          5% { clip-path: inset(30% 0 25% 0); }
          15% { clip-path: inset(60% 0 40% 0); }
          25% { clip-path: inset(20% 0 70% 0); }
          35% { clip-path: inset(80% 0 10% 0); }
          45% { clip-path: inset(40% 0 50% 0); }
          55% { clip-path: inset(5% 0 95% 0); }
          65% { clip-path: inset(70% 0 5% 0); }
          75% { clip-path: inset(15% 0 85% 0); }
          85% { clip-path: inset(50% 0 35% 0); }
          95% { clip-path: inset(90% 0 5% 0); }
          100% { clip-path: inset(0 0 0 0); }
        }
        
        @keyframes glitch-after {
          0% { clip-path: inset(0 0 0 0); }
          5% { clip-path: inset(25% 0 30% 0); }
          15% { clip-path: inset(40% 0 60% 0); }
          25% { clip-path: inset(70% 0 20% 0); }
          35% { clip-path: inset(10% 0 80% 0); }
          45% { clip-path: inset(50% 0 40% 0); }
          55% { clip-path: inset(95% 0 5% 0); }
          65% { clip-path: inset(5% 0 70% 0); }
          75% { clip-path: inset(85% 0 15% 0); }
          85% { clip-path: inset(35% 0 50% 0); }
          95% { clip-path: inset(5% 0 90% 0); }
          100% { clip-path: inset(0 0 0 0); }
        }
      `}} />
    </div>
  );
};

export default TerminalWindow;
