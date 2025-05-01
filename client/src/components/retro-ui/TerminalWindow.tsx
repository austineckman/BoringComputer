import React, { useState, useEffect, useRef } from 'react';
import { Skull, Zap, Shield, Wifi, Globe, Database, FileText, Key, FolderTree, File, FileIcon, FolderOpen, Terminal as TerminalIcon, ChevronRight, X, Minimize2 } from 'lucide-react';
import partyKittyImage from "@assets/partykitty.png";
import gizboImage from '@assets/gizbo.png';

interface TerminalWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
  windowTitle?: string;
  username?: string;
}

interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  color?: string;
  children?: FileSystemItem[];
  permission?: 'read' | 'read-write' | 'restricted';
  lastModified?: string;
  size?: string;
}

// ASCII Art Collection
const ASCII_ART = {
  dragon: `
                    /\\\\\                       
                   /\\\//\\\                     
                  /\\\//\\\/\\\                   
                 /\\\//\\\//\\\                  
                /\\\//\\\//\\\//\\\                
               /\\\//\\\//\\\//\\\//\\\              
              /\\\//\\\//\\\//\\\//\\\//\\\            
             /^\\\//\\\//\\\//\\\//\\\//\\\\^\\          
            /^\\\\\//\\\//\\\//\\\//\\\//\\\\^\\        
           /^\\\\\\\//\\\//\\\//\\\//\\\//\\\\^\\      
          /^\\\\\\\\\//\\\//\\\//\\\//\\\//\\\\^\\    
         /^\\\\\\\\\\\//\\\//\\\//\\\//\\\//\\\\^\\  
        /^\\\\\\\\\\\\\//\\\//\\\//\\\//\\\//\\\\^\\  
        /^\\\\\\\\\\\\\\\/_____________\\/\\\\^\\  
        /^\\\\\\\\\\\\\\\_______________\\/\\\\^\\  
        /^\\\\\\\\\\\\\\\_______________\\/\\\\^\\  
        /^\\\\\\\\\\\\\\\_______________\\/\\\\^\\  
        /^\\\\\\\\\\\\\\\_______________\\/\\\\^\\  
        /^\\\\\\\\\\\\\\\_______________\\/\\\\^\\  
         \^\\\\\\\\\\\\\\\_______________\\/\\\^/  
          \^\\\\\\\\\\\\\\\_______________\\/\\^/  
           \^\\\\\\\\\\\\\\\_______________\\/^/  
            \^\\\\\\\\\\\\\\\_______________^/  
             \^\\\\\\\\\\\\\\\____________^/  
              \^\\\\\\\\\\\\\\\__________^/  
               \^\\\\\\\\\\\\\\\________^/  
                \^\\\\\\\\\\\\\\\______^/  
                 \^\\\\\\\\\\\\\\\____^/  
                  \^\\\\\\\\\\\\\\\__^/  
                   \^\\\\\\\\\\\\\\\^/  
                    \^\\\\\\\\\\\\\/  
                     \^\\\\\\\\\\\/ 
`,

  castle: `
                                              /\\  /\\
                                             /  \\/  \\
                                            /        \\
                       _                   /          \\
                      / \                 /            \\
                     /   \           /\ /              \\ /\\
                    /     \         /  V                V  \\
                   /       \       /                        \\
                  /         \     /                          \\
                 /           \   /                            \\
                /             \ /                              \\
       /\      /               V                                \\
      /  \    /                                                  \\
     /    \  /                                                    \\
    /      \/                                                      \\
   /       /V                                                        \\
  /       / V                                                          \\
 /       /   V                                                   /\      \\
/       /     V                                                 /  \      \\
        |     |                                                /    \      \\
        |     |                                               /      \      \\
        |     |         /\                        /\         /        \      \\
        |     |        /  \                      /  \       /          \      \\
        |     |       /    \                    /    \     /            \      \\
        |     |      /      \                  /      \   /              \      \\
        |     |     /        \                /        \ /                \      \\
        |     |    /          \              /          V                  \      \\
        |     |   /            \            /                               \      \\
        |     |  /              \          /                                 \      \\
        |     | /                \        /                                   \      \\
        |     |/                  \      /                                     \      \\
+----+ |     |                    \    /                                       \      \\
| | | |#|     |                     \  /                                         \      \\
| | | |#|     |                      \/                                           \      \\
+#+-+## |     |                       V           +-+                             \      \\
      |#|     |   +----+                      +--+ +----+                         \      \\
      |#|     |   ||+ |                       |  |#|#   |                          \      \\
+----+##     |   +++-++                      +-++#++---+                           \      \\
|+--+ #|     |   |||||                       |  |#|#   |                            \      \\
|| | |##|     |                              +--+ +----+                             \      \\
++-+-+##|     |                                                                      \      \\
      | |     |                                                                       \      \\
#################========================================================######################
                                                                                              
`,
  robot: `
              _____
             |     |
             | | | |
             |_____|
         ____|_____|____
        |    |     |    |
        |____|_____|____|
        |    |     |    |
        |____|_____|____|
        |      | |      |
        |        |        |
        |        |        |
       _|       |       |_
      / |       |       | \
    /   |_________|   \
     /          |          \
    /            |            \
   /              |              \
  /                |                \
  |                |                |
  |                |                |
  |                |                |
  |________________|________________|
           |  |   |  |
           |__|   |__|
           (**)   (**)
           ^^      ^^
`
};

// Terminal filesystem structure with files to discover
const fileSystem: FileSystemItem = {
  name: 'root',
  type: 'directory',
  children: [
    {
      name: 'home',
      type: 'directory',
      children: [
        {
          name: 'user',
          type: 'directory',
          children: [
            {
              name: 'documents',
              type: 'directory',
              children: [
                {
                  name: 'notes.txt',
                  type: 'file',
                  content: "Don't forget to backup the security protocol files before the next system update. Gizbo mentioned something about vulnerabilities in the crypto layer.",
                  lastModified: '2025-04-10',
                  size: '182B'
                },
                {
                  name: 'project_ideas.txt',
                  type: 'file',
                  content: "1. Circuit simulator with real-time feedback\n2. Virtual breadboard companion app\n3. Component library visualizer\n4. Interactive circuit debugger\n5. Gizbo's interactive guide to electronics",
                  lastModified: '2025-04-15',
                  size: '245B'
                }
              ]
            },
            {
              name: 'logs',
              type: 'directory',
              children: [
                {
                  name: 'system.log',
                  type: 'file',
                  content: "[2025-04-01 08:32:15] System initialization complete\n[2025-04-01 10:17:42] User 'gizbo' logged in\n[2025-04-01 11:05:33] New component detected: LED matrix\n[2025-04-01 14:22:17] WARNING: Unauthorized access attempt from 192.168.1.105\n[2025-04-01 14:23:05] Intrusion blocked, security protocols engaged\n[2025-04-01 16:45:02] System update downloaded, pending restart",
                  lastModified: '2025-04-01',
                  size: '478B'
                },
                {
                  name: 'sandbox_test.log',
                  type: 'file',
                  content: "Circuit #45 test results:\nVoltage: 5.0V\nCurrent: 0.02A\nResistance: 250Ω\nLED brightness: 85%\nTemperature: Normal\nSimulation successful - circuit validated",
                  lastModified: '2025-04-25',
                  size: '215B'
                }
              ]
            },
            {
              name: 'projects',
              type: 'directory',
              children: [
                {
                  name: 'LED_blinker.ino',
                  type: 'file',
                  content: "const int ledPin = 13;\n\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(ledPin, HIGH);\n  delay(1000);\n  digitalWrite(ledPin, LOW);\n  delay(1000);\n}",
                  lastModified: '2025-04-18',
                  size: '192B'
                },
                {
                  name: 'temperature_sensor.ino',
                  type: 'file',
                  content: "const int sensorPin = A0;\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int sensorVal = analogRead(sensorPin);\n  float voltage = (sensorVal/1024.0) * 5.0;\n  float temperature = (voltage - 0.5) * 100;\n  Serial.print(\"Temperature: \");\n  Serial.print(temperature);\n  Serial.println(\" C\");\n  delay(1000);\n}",
                  lastModified: '2025-04-22',
                  size: '337B'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'system',
      type: 'directory',
      children: [
        {
          name: 'config',
          type: 'directory',
          children: [
            {
              name: 'settings.conf',
              type: 'file',
              content: "darkmode=true\nfont_size=14\nauto_save=true\ngpu_acceleration=true\nsimulation_speed=1.5\ndebug_mode=false\naudio_enable=true\nnetwork_timeout=30\n",
              lastModified: '2025-03-28',
              size: '122B'
            },
            {
              name: 'security.conf',
              type: 'file',
              permission: 'restricted',
              content: "# This file contains sensitive security configuration\n# Access restricted to administrator users\n\nfirewall=enabled\nport_scan_protection=true\nencryption=AES-256\naccess_log=true\nfailed_login_limit=5\nip_whitelist=192.168.1.0/24\nauth_method=two-factor\n",
              lastModified: '2025-03-15',
              size: '275B'
            }
          ]
        },
        {
          name: 'bin',
          type: 'directory',
          children: [
            {
              name: 'g1zb0_hack.exe',
              type: 'file',
              content: "#!/bin/bash\n# Gizbo's Hacking Toolkit\n# A secret hacking tool hidden in the system.\n# Usage: ./g1zb0_hack.exe [target] [method]\n\necho \"Initializing G1ZB0 Hacking Toolkit v3.1.4...\"\necho \"Scanning for vulnerabilities...\"\necho \"NOTICE: This tool is for educational purposes only.\"\necho \"Type 'help' for available commands.\"\n",
              lastModified: '2025-04-01',
              size: '289B'
            },
            {
              name: 'sandbox.exe',
              type: 'file',
              content: "#!/bin/bash\n# Circuit Sandbox Executable\n# Launches the circuit simulation environment\n\necho \"Initializing Circuit Sandbox...\"\necho \"Loading component libraries...\"\necho \"Preparing simulation environment...\"\necho \"Ready!\"\n",
              lastModified: '2025-04-15',
              size: '192B'
            }
          ]
        },
        {
          name: 'logs',
          type: 'directory',
          children: [
            {
              name: 'access.log',
              type: 'file',
              content: "2025-04-01 09:15:23 - User 'admin' logged in from 192.168.1.100\n2025-04-01 10:32:17 - User 'gizbo' logged in from 192.168.1.101\n2025-04-01 14:22:05 - UNAUTHORIZED ACCESS ATTEMPT from 192.168.1.105\n2025-04-01 14:22:45 - UNAUTHORIZED ACCESS ATTEMPT from 192.168.1.105\n2025-04-01 14:23:01 - IP 192.168.1.105 blocked for 24 hours\n2025-04-02 08:30:12 - User 'admin' logged in from 192.168.1.100\n",
              lastModified: '2025-04-02',
              size: '419B'
            },
            {
              name: 'error.log',
              type: 'file',
              content: "[ERROR] 2025-04-01 12:34:56 - Failed to load component library 'advanced_sensors'\n[ERROR] 2025-04-01 13:45:12 - Connection to simulation server timed out\n[ERROR] 2025-04-02 09:23:45 - Out of memory in rendering thread\n[ERROR] 2025-04-02 15:17:22 - Database connection failed: timeout\n[CRITICAL] 2025-04-02 15:18:05 - System rollback initiated\n[INFO] 2025-04-02 15:25:11 - System restored to stable state\n",
              lastModified: '2025-04-02',
              size: '464B'
            }
          ]
        }
      ]
    },
    {
      name: 'usr',
      type: 'directory',
      children: [
        {
          name: 'share',
          type: 'directory',
          children: [
            {
              name: 'secrets',
              type: 'directory',
              permission: 'restricted',
              children: [
                {
                  name: 'hidden_message.txt',
                  type: 'file',
                  content: "Congratulations, explorer! You've found the hidden directory.\n\nAs a reward for your curiosity, here's a hint: The password for Gizbo's special toolbox is 'CIRCUITMASTER2025'.\n\nUse it wisely, and don't tell anyone you found this message!\n\n- Gizbo",
                  lastModified: '2025-01-01',
                  size: '289B'
                },
                {
                  name: 'easter_egg.txt',
                  type: 'file',
                  content: "⚡ EASTER EGG UNLOCKED! ⚡\n\nYou've discovered the super secret easter egg!\n\nGizbo says: 'In the world of electronics, creativity and logic flow like electricity through circuits.'\n\nThere might be more hidden secrets throughout the system. Keep exploring!",
                  lastModified: '2025-01-01',
                  size: '268B'
                }
              ]
            },
            {
              name: 'gizbo_quotes.txt',
              type: 'file',
              content: "'The best wire is one that isn't there.' - Gizbo\n\n'If debugging is the process of removing bugs, then programming must be the process of putting them in.' - Gizbo\n\n'There are 10 types of people in the world: those who understand binary, and those who don't.' - Gizbo\n\n'The smoke makes the electrons sad.' - Gizbo on why electronics shouldn't release magic smoke\n\n'Always save your circuits, because memory forgets... and so do I.' - Gizbo",
              lastModified: '2025-03-10',
              size: '511B'
            }
          ]
        },
        {
          name: 'games',
          type: 'directory',
          children: [
            {
              name: 'snake.exe',
              type: 'file',
              content: "#!/bin/bash\n# Snake Game\n# A simple text-based snake game for the terminal\n\necho \"Starting Snake Game...\"\necho \"Use W,A,S,D keys to move\"\necho \"Press Q to quit\"\necho \"\"\necho \"GAME OVER! Your score: 157\"\n",
              lastModified: '2025-02-15',
              size: '183B'
            },
            {
              name: 'hacklock.exe',
              type: 'file',
              content: "#!/bin/bash\n# HackLock Game\n# A terminal-based lock picking simulation\n\necho \"Initializing HackLock...\"\necho \"Lock difficulty: Advanced\"\necho \"Use arrow keys to manipulate pins\"\necho \"Press ENTER to attempt unlock\"\necho \"\"\necho \"SUCCESS! Lock opened in 47 seconds.\"\n",
              lastModified: '2025-03-01',
              size: '257B'
            }
          ]
        }
      ]
    }
  ]
};

// Hacking toolkit configuration
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
  windowTitle = "Terminal",
  username = "user",
}) => {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState<string>('');
  const [output, setOutput] = useState<Array<{type: string, content: string, color?: string}>>([]);
  const [prompt, setPrompt] = useState<string>(`${username}@terminal:~$ `);
  const [currentDirectory, setCurrentDirectory] = useState<string[]>(['home', 'user']);
  const [commandMode, setCommandMode] = useState<'terminal' | 'hackertool'>('terminal');
  
  // Hacker tool state
  const [selectedTool, setSelectedTool] = useState<number | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [hackingProgress, setHackingProgress] = useState<number>(0);
  const [hackingStatus, setHackingStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [glitchEffects, setGlitchEffects] = useState<boolean>(false);
  const [showHackerToolUI, setShowHackerToolUI] = useState<boolean>(false);
  const [showPartyKittyWindow, setShowPartyKittyWindow] = useState<boolean>(false);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize terminal
  useEffect(() => {
    const welcomeMessage = [
      { type: 'text', content: '===================================', color: '#4CAF50' },
      { type: 'text', content: 'Welcome to CraftingTable Terminal v1.0.4', color: '#4CAF50' },
      { type: 'text', content: `Logged in as: ${username}`, color: '#4CAF50' },
      { type: 'text', content: 'Type "help" for available commands', color: '#4CAF50' },
      { type: 'text', content: '===================================', color: '#4CAF50' },
    ];
    
    setOutput(welcomeMessage);
  }, [username]);

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

  // Random glitch effects for the cyberpunk aesthetic when in hacker tool mode
  useEffect(() => {
    if (commandMode === 'hackertool') {
      // Apply glitch effects randomly
      const glitchInterval = setInterval(() => {
        setGlitchEffects(true);
        setTimeout(() => setGlitchEffects(false), 150);
      }, 2000);
      
      return () => clearInterval(glitchInterval);
    }
  }, [commandMode]);

  // Handle simulated hacking progress
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let hackingInterval: NodeJS.Timeout;
    
    if (hackingStatus === 'running') {
      hackingInterval = setInterval(() => {
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
          
          // Random chance of failure (1% chance per tick)
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
    } else if (hackingStatus === 'success' || hackingStatus === 'failed') {
      // Auto-reset hacking status after 5 seconds
      timeoutId = setTimeout(() => {
        setHackingStatus('idle');
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [hackingStatus]);

  // Navigate filesystem and find item at path
  const findItemAtPath = (path: string[]): FileSystemItem | null => {
    let currentItem = fileSystem;
    
    for (let i = 0; i < path.length; i++) {
      const segment = path[i];
      if (segment === 'root' || segment === '') continue;
      
      const child = currentItem.children?.find(item => item.name === segment);
      if (!child) return null;
      currentItem = child;
    }
    
    return currentItem;
  };

  // Format path for display
  const formatPath = (path: string[]): string => {
    return '/' + path.join('/');
  };

  // Handle command execution
  const executeCommand = (cmd: string) => {
    // Special case for hacker tool mode
    if (commandMode === 'hackertool') {
      handleHackerToolCommand(cmd);
      return;
    }
    
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;
    
    // Add command to history
    setCommandHistory(prev => [...prev, cmd]);

    // Add command to output
    setOutput(prev => [...prev, { type: 'command', content: `${prompt}${cmd}` }]);
    
    // Parse command and arguments
    const cmdParts = trimmedCmd.split(' ');
    const mainCmd = cmdParts[0].toLowerCase();
    const args = cmdParts.slice(1);
    
    // Process command
    switch(mainCmd) {
      case 'help':
        showHelp(args[0]);
        break;
      
      case 'clear':
        setOutput([]);
        break;
      
      case 'ls':
        listDirectory(args[0]);
        break;
      
      case 'cd':
        changeDirectory(args[0] || '');
        break;
      
      case 'cat':
        if (args.length === 0) {
          setOutput(prev => [...prev, { type: 'error', content: 'Usage: cat <filename>', color: '#FF5252' }]);
        } else {
          viewFile(args[0]);
        }
        break;
      
      case 'pwd':
        setOutput(prev => [...prev, { type: 'text', content: formatPath(currentDirectory), color: '#66BB6A' }]);
        break;
      
      case 'echo':
        setOutput(prev => [...prev, { type: 'text', content: args.join(' '), color: '#B0BEC5' }]);
        break;
      
      case 'date':
        setOutput(prev => [...prev, { type: 'text', content: new Date().toString(), color: '#B0BEC5' }]);
        break;
      
      case 'whoami':
        setOutput(prev => [...prev, { type: 'text', content: username, color: '#66BB6A' }]);
        break;
      
      case 'find':
        if (args.length < 2 || args[0] !== '-name') {
          setOutput(prev => [...prev, { type: 'error', content: 'Usage: find -name <pattern>', color: '#FF5252' }]);
        } else {
          findFiles(args[1]);
        }
        break;
      
      case 'grep':
        if (args.length < 2) {
          setOutput(prev => [...prev, { type: 'error', content: 'Usage: grep <pattern> <filename>', color: '#FF5252' }]);
        } else {
          grepFile(args[0], args[1]);
        }
        break;
      
      case 'hack':
        launchHackerTool();
        break;
      
      case 'hackertool':
        launchHackerTool();
        break;
      
      case 'partykitty':
        showPartyKitty();
        break;

      case 'dragon':
        showAsciiArt('dragon');
        break;

      case 'castle':
        showAsciiArt('castle');
        break;

      case 'robot':
        showAsciiArt('robot');
        break;
      
      case 'exit':
        onClose();
        break;
      
      default:
        checkExecutable(trimmedCmd);
    }
  };

  // Helper function to check if a file is executable and run it
  const checkExecutable = (command: string) => {
    // Check if the command is an executable file in the current directory
    const currentItem = findItemAtPath(currentDirectory);
    const executableFile = currentItem?.children?.find(item => 
      item.type === 'file' && 
      (item.name === command || item.name === `${command}.exe`) && 
      item.content?.startsWith('#!/')
    );

    if (executableFile) {
      // "Execute" the file by displaying its content
      const lines = executableFile.content?.split('\n') || [];
      // Skip the first line (the shebang) and output the rest
      const execOutput = lines.slice(1).join('\n');
      setOutput(prev => [...prev, { type: 'text', content: execOutput, color: '#66BB6A' }]);
      return;
    }

    // Check if the command exists in /system/bin
    const binDirectory = findItemAtPath(['root', 'system', 'bin']);
    const binExecutable = binDirectory?.children?.find(item => 
      item.type === 'file' && 
      (item.name === command || item.name === `${command}.exe`) && 
      item.content?.startsWith('#!/')
    );

    if (binExecutable) {
      // "Execute" the file by displaying its content
      const lines = binExecutable.content?.split('\n') || [];
      // Skip the first line (the shebang) and output the rest
      const execOutput = lines.slice(1).join('\n');
      setOutput(prev => [...prev, { type: 'text', content: execOutput, color: '#66BB6A' }]);
      return;
    }

    // Command not found
    setOutput(prev => [...prev, { type: 'error', content: `Command not found: ${command}. Type 'help' for a list of commands.`, color: '#FF5252' }]);
  };

  // Launch hacker tool mode
  const launchHackerTool = () => {
    setOutput(prev => [
      ...prev, 
      { type: 'text', content: 'Launching G1ZB0\'s Hacking Toolkit...', color: '#00ff00' },
      { type: 'ascii', content: HACKER_LOGO, color: '#00ff00' },
      { type: 'text', content: 'Welcome to G1ZB0-TERM v3.1.4 - The Ultimate Hacking Simulation', color: '#00ffff' },
      { type: 'text', content: 'Choose a mode: Type "ui" for visual interface or "cli" for command line', color: '#ffff00' },
      { type: 'text', content: '========================================', color: '#ff00ff' },
    ]);
    setCommandMode('hackertool');
    setPrompt('g1zb0@hackterm:~ $ ');
  };

  // Handle commands specific to hacker tool mode
  const handleHackerToolCommand = (cmd: string) => {
    if (!cmd) return;
    
    // Add command to history
    setCommandHistory(prev => [...prev, cmd]);

    // Add command to output with hacker styling
    setOutput(prev => [...prev, { type: 'command', content: `${prompt}${cmd}`, color: '#00ff00' }]);
    
    const trimmedCmd = cmd.trim().toLowerCase();
    const cmdParts = trimmedCmd.split(' ');
    const mainCmd = cmdParts[0];
    
    let response: Array<{type: string, content: string, color?: string}> = [];
    
    // Process hacker tool commands
    switch(mainCmd) {
      case 'ui':
        setShowHackerToolUI(true);
        response = [{ type: 'text', content: 'Launching visual hacking interface...', color: '#00ffff' }];
        break;
        
      case 'cli':
        setShowHackerToolUI(false);
        response = [{ type: 'text', content: 'Using command-line interface mode.', color: '#00ffff' }];
        break;
      case 'help':
        response = [
          { type: 'text', content: '=== Available Hacker Commands ===', color: '#00ffff' },
          { type: 'text', content: 'help - Display this help message', color: '#ffffff' },
          { type: 'text', content: 'clear - Clear the terminal', color: '#ffffff' },
          { type: 'text', content: 'tools - List available hacking tools', color: '#ffffff' },
          { type: 'text', content: 'targets - List potential hacking targets', color: '#ffffff' },
          { type: 'text', content: 'scan <target> - Scan a target for vulnerabilities', color: '#ffffff' },
          { type: 'text', content: 'attack <target> <tool> - Launch an attack', color: '#00ff00' },
          { type: 'text', content: 'exit - Return to normal terminal', color: '#ffffff' },
          { type: 'text', content: '===========================', color: '#00ffff' },
        ];
        break;
      
      case 'clear':
        setOutput([]);
        return;
      
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
      
      case 'scan':
        if (cmdParts.length < 2) {
          response = [{ type: 'error', content: 'Usage: scan <target>', color: '#ff0000' }];
        } else {
          const targetName = cmdParts.slice(1).join(' ');
          const target = TARGET_SYSTEMS.find(t => t.name.toLowerCase().includes(targetName.toLowerCase()));
          
          if (target) {
            response = [
              { type: 'text', content: `Scanning target: ${target.name}`, color: '#00ffff' },
              { type: 'text', content: 'Scanning for open ports...', color: '#00ff00' },
              { type: 'text', content: 'Analyzing security protocols...', color: '#00ff00' },
              { type: 'text', content: 'Identifying vulnerabilities...', color: '#00ff00' },
              { type: 'text', content: '==== Scan Results ====', color: '#ffff00' },
              { type: 'text', content: `Security Level: ${target.difficulty}`, color: '#ff00ff' },
              { type: 'text', content: 'Open Ports: 22, 80, 443, 8080', color: '#00ffff' },
              { type: 'text', content: `Vulnerabilities: ${Math.floor(Math.random() * 5) + 1} found`, color: '#00ff00' },
              { type: 'text', content: 'Use a tool to exploit vulnerabilities', color: '#ffffff' },
            ];
          } else {
            response = [{ type: 'error', content: `Target not found: ${targetName}`, color: '#ff0000' }];
          }
        }
        break;
      
      case 'attack':
        if (cmdParts.length < 3) {
          response = [{ type: 'error', content: 'Usage: attack <target> <tool>', color: '#ff0000' }];
        } else {
          const toolName = cmdParts[2];
          const targetName = cmdParts[1];
          
          const tool = HACKING_TOOLS.find(t => t.name.toLowerCase() === toolName.toLowerCase());
          const target = TARGET_SYSTEMS.find(t => t.name.toLowerCase().includes(targetName.toLowerCase()));
          
          if (!tool) {
            response = [{ type: 'error', content: `Tool not found: ${toolName}`, color: '#ff0000' }];
          } else if (!target) {
            response = [{ type: 'error', content: `Target not found: ${targetName}`, color: '#ff0000' }];
          } else {
            response = [
              { type: 'text', content: `Initializing ${tool.name} attack on ${target.name}...`, color: '#00ff00' },
              { type: 'text', content: 'Establishing secure connection...', color: '#00ffff' },
              { type: 'text', content: 'Bypassing firewall...', color: '#ffff00' },
              { type: 'text', content: 'Scanning for vulnerabilities...', color: '#ff00ff' },
            ];
            
            // Start the attack simulation
            setSelectedTool(HACKING_TOOLS.findIndex(t => t.name === tool.name));
            setSelectedTarget(TARGET_SYSTEMS.findIndex(t => t.name === target.name));
            setHackingProgress(0);
            setHackingStatus('running');
            
            // Simulate attack progress reports
            for (let i = 1; i <= 10; i++) {
              const progressMessages = [
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
              
              response.push({
                type: 'text',
                content: `[${new Date().toISOString().substring(11, 19)}] ${progressMessages[i % progressMessages.length]}`,
                color: ['#00ff00', '#00ffff', '#ffff00', '#ff00ff', '#ff0000'][Math.floor(Math.random() * 5)]
              });
            }
          }
        }
        break;
      
      case 'exit':
        setCommandMode('terminal');
        setPrompt(`${username}@terminal:~$ `);
        response = [{ type: 'text', content: 'Exiting hacker toolkit. Returning to normal terminal mode.', color: '#66BB6A' }];
        break;
      
      default:
        response = [{ type: 'error', content: `Command not found: ${trimmedCmd}. Type 'help' for a list of commands.`, color: '#ff0000' }];
    }
    
    // Update output
    setOutput(prev => [...prev, ...response]);
  };

  // Handle the completion of a hacking operation
  const handleHackingComplete = (success: boolean) => {
    if (selectedTarget === null || selectedTool === null) return;
    
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
    setHackingStatus('idle');
  };

  // Show PartyKitty command
  const showPartyKitty = () => {
    setOutput(prev => [
      ...prev, 
      { type: 'text', content: 'Launching Party Kitty celebration...', color: '#FF9800' },
      { type: 'text', content: 'Meow! Party Kitty is here to brighten your day!', color: '#E91E63' },
    ]);
    setShowPartyKittyWindow(true);
  };

  // Show ASCII art
  const showAsciiArt = (artName: string) => {
    if (artName in ASCII_ART) {
      const art = ASCII_ART[artName as keyof typeof ASCII_ART];
      setOutput(prev => [
        ...prev,
        { type: 'ascii', content: art, color: '#FFC107' }
      ]);
    } else {
      setOutput(prev => [
        ...prev,
        { type: 'error', content: `ASCII art '${artName}' not found.`, color: '#FF5252' }
      ]);
    }
  };

  // Show help for commands
  const showHelp = (command?: string) => {
    if (!command) {
      // General help
      setOutput(prev => [
        ...prev,
        { type: 'text', content: '=== Available Commands ===', color: '#42A5F5' },
        { type: 'text', content: 'help [command] - Show help for a specific command', color: '#B0BEC5' },
        { type: 'text', content: 'ls [path] - List directory contents', color: '#B0BEC5' },
        { type: 'text', content: 'cd [path] - Change directory', color: '#B0BEC5' },
        { type: 'text', content: 'cat <file> - Display file contents', color: '#B0BEC5' },
        { type: 'text', content: 'pwd - Print working directory', color: '#B0BEC5' },
        { type: 'text', content: 'echo <msg> - Display message', color: '#B0BEC5' },
        { type: 'text', content: 'clear - Clear the terminal', color: '#B0BEC5' },
        { type: 'text', content: 'date - Display the current date and time', color: '#B0BEC5' },
        { type: 'text', content: 'whoami - Display current user', color: '#B0BEC5' },
        { type: 'text', content: 'find -name <pattern> - Search for files', color: '#B0BEC5' },
        { type: 'text', content: 'grep <pattern> <file> - Search for text in file', color: '#B0BEC5' },
        { type: 'text', content: 'hack - Launch Gizbo\'s Hacking Toolkit', color: '#00ff00' },
        { type: 'text', content: 'partykitty - Show the party kitty', color: '#FF9800' },
        { type: 'text', content: 'dragon - Display dragon ASCII art', color: '#FFC107' },
        { type: 'text', content: 'castle - Display castle ASCII art', color: '#FFC107' },
        { type: 'text', content: 'robot - Display robot ASCII art', color: '#FFC107' },
        { type: 'text', content: 'exit - Close terminal', color: '#B0BEC5' },
        { type: 'text', content: '===========================', color: '#42A5F5' },
      ]);
    } else {
      // Help for specific command
      switch (command.toLowerCase()) {
        case 'ls':
          setOutput(prev => [
            ...prev,
            { type: 'text', content: 'ls [path] - List directory contents', color: '#42A5F5' },
            { type: 'text', content: 'Lists files and directories in the specified path or current directory.', color: '#B0BEC5' },
          ]);
          break;
        
        case 'cd':
          setOutput(prev => [
            ...prev,
            { type: 'text', content: 'cd [path] - Change directory', color: '#42A5F5' },
            { type: 'text', content: 'Change the current working directory to the specified path.', color: '#B0BEC5' },
            { type: 'text', content: 'Use "cd .." to go up one directory level.', color: '#B0BEC5' },
          ]);
          break;
        
        case 'cat':
          setOutput(prev => [
            ...prev,
            { type: 'text', content: 'cat <file> - Display file contents', color: '#42A5F5' },
            { type: 'text', content: 'Displays the contents of the specified file.', color: '#B0BEC5' },
          ]);
          break;
        
        case 'hack':
          setOutput(prev => [
            ...prev,
            { type: 'text', content: 'hack - Launch Gizbo\'s Hacking Toolkit', color: '#00ff00' },
            { type: 'text', content: 'Launches the terminal-based hacking simulation interface.', color: '#B0BEC5' },
            { type: 'text', content: 'Use this tool to simulate hacking operations on various targets.', color: '#B0BEC5' },
            { type: 'text', content: 'Type "help" within the hacking interface for more commands.', color: '#B0BEC5' },
          ]);
          break;
        
        default:
          setOutput(prev => [...prev, { type: 'error', content: `No help available for '${command}'.`, color: '#FF5252' }]);
      }
    }
  };

  // List directory contents
  const listDirectory = (path?: string) => {
    let targetPath: string[];
    
    // Determine the target path
    if (path) {
      if (path.startsWith('/')) {
        // Absolute path
        targetPath = path.split('/').filter(Boolean);
      } else {
        // Relative path
        targetPath = [...currentDirectory];
        const segments = path.split('/').filter(Boolean);
        
        for (const segment of segments) {
          if (segment === '..') {
            if (targetPath.length > 0) {
              targetPath.pop();
            }
          } else if (segment !== '.') {
            targetPath.push(segment);
          }
        }
      }
    } else {
      // Current directory
      targetPath = currentDirectory;
    }
    
    // Get items in the target directory
    const directoryItem = findItemAtPath(targetPath);
    if (!directoryItem || directoryItem.type !== 'directory') {
      setOutput(prev => [...prev, { type: 'error', content: `Directory not found: ${path || '.'}`, color: '#FF5252' }]);
      return;
    }
    
    // Display directory contents
    const header = { type: 'text', content: `Contents of ${formatPath(targetPath)}:`, color: '#42A5F5' };
    const items = directoryItem.children || [];
    
    // Group by type and sort alphabetically
    const directories = items.filter(item => item.type === 'directory').sort((a, b) => a.name.localeCompare(b.name));
    const files = items.filter(item => item.type === 'file').sort((a, b) => a.name.localeCompare(b.name));
    
    // Create formatted output
    const dirOutput = directories.map(dir => ({ 
      type: 'text', 
      content: `📁 ${dir.name}${dir.permission === 'restricted' ? ' (restricted)' : ''}`, 
      color: '#FFA726' 
    }));
    
    const fileOutput = files.map(file => ({ 
      type: 'text', 
      content: `📄 ${file.name}${file.permission === 'restricted' ? ' (restricted)' : ''}`, 
      color: '#81C784' 
    }));
    
    // Add to output
    setOutput(prev => [...prev, header, ...dirOutput, ...fileOutput]);
  };

  // Change directory
  const changeDirectory = (path: string) => {
    if (!path) {
      // Default to home directory
      setCurrentDirectory(['home', 'user']);
      return;
    }
    
    let newPath: string[];
    
    // Handle special paths
    if (path === '/') {
      setCurrentDirectory([]);
      return;
    }
    
    // Determine new path
    if (path.startsWith('/')) {
      // Absolute path
      newPath = path.split('/').filter(Boolean);
    } else {
      // Relative path
      newPath = [...currentDirectory];
      const segments = path.split('/').filter(Boolean);
      
      for (const segment of segments) {
        if (segment === '..') {
          if (newPath.length > 0) {
            newPath.pop();
          }
        } else if (segment !== '.') {
          newPath.push(segment);
        }
      }
    }
    
    // Verify the path exists and is a directory
    const directoryItem = findItemAtPath(newPath);
    if (!directoryItem) {
      setOutput(prev => [...prev, { type: 'error', content: `Directory not found: ${path}`, color: '#FF5252' }]);
      return;
    }
    
    if (directoryItem.type !== 'directory') {
      setOutput(prev => [...prev, { type: 'error', content: `Not a directory: ${path}`, color: '#FF5252' }]);
      return;
    }
    
    // Check permissions
    if (directoryItem.permission === 'restricted') {
      setOutput(prev => [...prev, { type: 'error', content: `Permission denied: ${path}`, color: '#FF5252' }]);
      return;
    }
    
    // Change directory
    setCurrentDirectory(newPath);
    setPrompt(`${username}@terminal:${formatPath(newPath)}$ `);
  };

  // View file contents
  const viewFile = (path: string) => {
    let targetPath: string[];
    let fileName: string;
    
    // Parse path
    if (path.includes('/')) {
      const segments = path.split('/');
      fileName = segments.pop() || '';
      
      if (path.startsWith('/')) {
        // Absolute path
        targetPath = segments.filter(Boolean);
      } else {
        // Relative path
        targetPath = [...currentDirectory];
        for (const segment of segments.filter(Boolean)) {
          if (segment === '..') {
            if (targetPath.length > 0) {
              targetPath.pop();
            }
          } else if (segment !== '.') {
            targetPath.push(segment);
          }
        }
      }
    } else {
      // File in current directory
      targetPath = currentDirectory;
      fileName = path;
    }
    
    // Get directory
    const directoryItem = findItemAtPath(targetPath);
    if (!directoryItem || directoryItem.type !== 'directory') {
      setOutput(prev => [...prev, { type: 'error', content: `Directory not found: ${targetPath.join('/')}`, color: '#FF5252' }]);
      return;
    }
    
    // Find file
    const fileItem = directoryItem.children?.find(item => item.name === fileName);
    if (!fileItem) {
      setOutput(prev => [...prev, { type: 'error', content: `File not found: ${path}`, color: '#FF5252' }]);
      return;
    }
    
    // Check file type
    if (fileItem.type !== 'file') {
      setOutput(prev => [...prev, { type: 'error', content: `Not a file: ${path}`, color: '#FF5252' }]);
      return;
    }
    
    // Check permissions
    if (fileItem.permission === 'restricted') {
      setOutput(prev => [...prev, { type: 'error', content: `Permission denied: ${path}`, color: '#FF5252' }]);
      return;
    }
    
    // Display file contents
    setOutput(prev => [
      ...prev, 
      { type: 'text', content: `Contents of ${path}:`, color: '#42A5F5' },
      { type: 'file', content: fileItem.content || '', color: fileItem.color || '#FFFFFF' }
    ]);
  };

  // Search for files with a given pattern
  const findFiles = (pattern: string) => {
    const matchedFiles: string[] = [];
    
    // Helper function to recursively search directories
    const searchDirectory = (dir: FileSystemItem, path: string[]) => {
      if (dir.type !== 'directory' || !dir.children) return;
      
      // Check children
      for (const item of dir.children) {
        const itemPath = [...path, item.name];
        
        // Check if name matches pattern
        if (item.name.includes(pattern)) {
          matchedFiles.push(formatPath(itemPath));
        }
        
        // Recursively search subdirectories
        if (item.type === 'directory') {
          searchDirectory(item, itemPath);
        }
      }
    };
    
    // Start search from current directory
    const currentDir = findItemAtPath(currentDirectory);
    if (!currentDir) {
      setOutput(prev => [...prev, { type: 'error', content: 'Current directory not found', color: '#FF5252' }]);
      return;
    }
    
    searchDirectory(currentDir, currentDirectory);
    
    // Display results
    if (matchedFiles.length === 0) {
      setOutput(prev => [...prev, { type: 'text', content: `No files matching '${pattern}'`, color: '#B0BEC5' }]);
    } else {
      setOutput(prev => [
        ...prev,
        { type: 'text', content: `Files matching '${pattern}':`, color: '#42A5F5' },
        ...matchedFiles.map(file => ({ type: 'text', content: file, color: '#81C784' }))
      ]);
    }
  };

  // Search for pattern in a file
  const grepFile = (pattern: string, path: string) => {
    let targetPath: string[];
    let fileName: string;
    
    // Parse path
    if (path.includes('/')) {
      const segments = path.split('/');
      fileName = segments.pop() || '';
      
      if (path.startsWith('/')) {
        // Absolute path
        targetPath = segments.filter(Boolean);
      } else {
        // Relative path
        targetPath = [...currentDirectory];
        for (const segment of segments.filter(Boolean)) {
          if (segment === '..') {
            if (targetPath.length > 0) {
              targetPath.pop();
            }
          } else if (segment !== '.') {
            targetPath.push(segment);
          }
        }
      }
    } else {
      // File in current directory
      targetPath = currentDirectory;
      fileName = path;
    }
    
    // Get directory
    const directoryItem = findItemAtPath(targetPath);
    if (!directoryItem || directoryItem.type !== 'directory') {
      setOutput(prev => [...prev, { type: 'error', content: `Directory not found: ${targetPath.join('/')}`, color: '#FF5252' }]);
      return;
    }
    
    // Find file
    const fileItem = directoryItem.children?.find(item => item.name === fileName);
    if (!fileItem) {
      setOutput(prev => [...prev, { type: 'error', content: `File not found: ${path}`, color: '#FF5252' }]);
      return;
    }
    
    // Check file type
    if (fileItem.type !== 'file') {
      setOutput(prev => [...prev, { type: 'error', content: `Not a file: ${path}`, color: '#FF5252' }]);
      return;
    }
    
    // Check permissions
    if (fileItem.permission === 'restricted') {
      setOutput(prev => [...prev, { type: 'error', content: `Permission denied: ${path}`, color: '#FF5252' }]);
      return;
    }
    
    // Search for pattern
    const content = fileItem.content || '';
    const lines = content.split('\n');
    const matchedLines = lines.filter(line => line.includes(pattern));
    
    // Display results
    if (matchedLines.length === 0) {
      setOutput(prev => [...prev, { type: 'text', content: `No matches found for '${pattern}' in ${path}`, color: '#B0BEC5' }]);
    } else {
      setOutput(prev => [
        ...prev,
        { type: 'text', content: `Matches for '${pattern}' in ${path}:`, color: '#42A5F5' },
        ...matchedLines.map(line => ({ type: 'text', content: line, color: '#FFE082' }))
      ]);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand) {
      executeCommand(currentCommand);
      setCurrentCommand('');
    }
  };

  return (
    <div className={`w-full h-full flex flex-col ${isActive ? 'border-cyan-400' : 'border-gray-600'}`}>
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
      
      {/* Terminal content */}
      <div 
        ref={terminalRef}
        className={`flex-1 p-3 overflow-y-auto font-mono text-sm bg-black text-green-400 ${commandMode === 'hackertool' && glitchEffects ? 'terminal-glitch' : ''} ${commandMode === 'hackertool' && showHackerToolUI ? 'flex' : ''}`}
      >
        {commandMode === 'hackertool' && showHackerToolUI ? (
          <div className="w-full h-full flex flex-col">
            <div className="bg-black text-green-400 p-4 flex flex-col">
              <h2 className="text-xl font-bold text-center mb-4 text-cyan-400">G1ZB0 HACKING TOOLKIT v3.1.4</h2>
              
              {/* Tools and Targets sections */}
              <div className="flex gap-4">
                {/* Tools section */}
                <div className="flex-1 border border-gray-700 rounded-md p-3">
                  <h3 className="text-md font-bold mb-2 text-pink-400">Hacking Tools</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {HACKING_TOOLS.map((tool, index) => (
                      <button
                        key={index}
                        className={`flex items-center gap-2 p-2 rounded ${selectedTool === index ? 'bg-gray-800 border border-gray-600' : 'hover:bg-gray-900'}`}
                        onClick={() => setSelectedTool(index)}
                        style={{ color: tool.color }}
                      >
                        {tool.icon}
                        <span>{tool.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Targets section */}
                <div className="flex-1 border border-gray-700 rounded-md p-3">
                  <h3 className="text-md font-bold mb-2 text-yellow-400">Target Systems</h3>
                  <div className="flex flex-col gap-2">
                    {TARGET_SYSTEMS.map((target, index) => {
                      const difficultyColor = 
                        target.difficulty === 'Legendary' ? '#ff0000' :
                        target.difficulty === 'Epic' ? '#ff00ff' :
                        target.difficulty === 'Rare' ? '#0000ff' :
                        target.difficulty === 'Uncommon' ? '#00ff00' : '#ffffff';
                        
                      return (
                        <button
                          key={index}
                          className={`text-left p-2 rounded ${selectedTarget === index ? 'bg-gray-800 border border-gray-600' : 'hover:bg-gray-900'}`}
                          onClick={() => setSelectedTarget(index)}
                        >
                          <div className="font-bold">{target.name}</div>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: difficultyColor }}>{target.difficulty}</span>
                            <span className="text-cyan-400">Reward: {target.reward}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Control panel */}
              <div className="mt-4 border border-gray-700 rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-cyan-400">Operation Control</h3>
                  {hackingStatus === 'running' && (
                    <div className="text-yellow-400 animate-pulse">HACKING IN PROGRESS...</div>
                  )}
                  {hackingStatus === 'success' && (
                    <div className="text-green-400">HACK SUCCESSFUL!</div>
                  )}
                  {hackingStatus === 'failed' && (
                    <div className="text-red-400">HACK FAILED!</div>
                  )}
                </div>
                
                {/* Progress bar */}
                {hackingStatus === 'running' && (
                  <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${hackingProgress}%` }}
                    ></div>
                  </div>
                )}
                
                {/* Control buttons */}
                <div className="flex gap-2">
                  <button
                    className={`flex-1 py-2 rounded-md font-bold ${selectedTool !== null && selectedTarget !== null ? 'bg-green-800 hover:bg-green-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                    disabled={selectedTool === null || selectedTarget === null || hackingStatus === 'running'}
                    onClick={() => {
                      if (selectedTool !== null && selectedTarget !== null) {
                        const tool = HACKING_TOOLS[selectedTool];
                        const target = TARGET_SYSTEMS[selectedTarget];
                        setHackingStatus('running');
                        setHackingProgress(0);
                        setOutput(prev => [
                          ...prev,
                          { type: 'text', content: `Initializing ${tool.name} attack on ${target.name}...`, color: '#00ff00' },
                          { type: 'text', content: 'Establishing secure connection...', color: '#00ffff' },
                        ]);
                      }
                    }}
                  >
                    LAUNCH ATTACK
                  </button>
                  <button
                    className="px-4 py-2 rounded-md bg-red-800 hover:bg-red-700 text-white font-bold"
                    onClick={() => {
                      setShowHackerToolUI(false);
                      setOutput(prev => [
                        ...prev,
                        { type: 'text', content: 'Returning to terminal mode...', color: '#66BB6A' },
                      ]);
                    }}
                  >
                    BACK TO TERMINAL
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {output.map((line, index) => {
              if (line.type === 'command') {
                return (
                  <div key={index} className="mb-1 font-bold" style={{ color: line.color || '#FFC107' }}>
                    {line.content}
                  </div>
                );
              } else if (line.type === 'error') {
                return (
                  <div key={index} className="mb-1" style={{ color: line.color || '#FF5252' }}>
                    {line.content}
                  </div>
                );
              } else if (line.type === 'file') {
                return (
                  <div key={index} className="mb-1 pl-4 border-l-2 border-gray-700" style={{ color: line.color || '#FFFFFF' }}>
                    {line.content.split('\n').map((textLine, lineIndex) => (
                      <div key={lineIndex}>{textLine}</div>
                    ))}
                  </div>
                );
              } else if (line.type === 'ascii') {
                return (
                  <pre key={index} className="text-xs whitespace-pre font-mono mb-2" style={{ color: line.color || '#FFC107' }}>
                    {line.content}
                  </pre>
                );
              } else {
                return (
                  <div key={index} className="mb-1" style={{ color: line.color || '#FFFFFF' }}>
                    {line.content}
                  </div>
                );
              }
            })}
          </>
        )}
      </div>
      
      {/* Command input - Hide when in hacker UI mode */}
      {!(commandMode === 'hackertool' && showHackerToolUI) && (
        <form onSubmit={handleSubmit} className="flex border-t-2 border-gray-700 bg-black">
          <div className="p-2 text-cyan-400 font-mono">{prompt}</div>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            className="flex-1 bg-black text-green-400 font-mono p-2 focus:outline-none"
            autoFocus={isActive}
          />
        </form>
      )}

      {/* Show PartyKitty Window when active */}
      {showPartyKittyWindow && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-10">
          <div className="bg-gray-900 border-4 border-orange-500 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center p-2 bg-orange-500 text-white">
              <h3 className="font-bold">🎉 Party Kitty! 🎉</h3>
              <button 
                onClick={() => setShowPartyKittyWindow(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-4 flex flex-col items-center">
              <img 
                src={partyKittyImage} 
                alt="Party Kitty" 
                className="rounded-md border-2 border-orange-400 mb-4 max-w-full"
              />
              <p className="text-center text-orange-300 font-bold text-lg mb-2">Party Kitty is here!</p>
              <p className="text-center text-gray-300">Time to celebrate with Party Kitty!</p>
              <button 
                onClick={() => setShowPartyKittyWindow(false)}
                className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
              >
                Party On!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cyberpunk glitch effects for hacker mode */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes glitch {
          0% { transform: translate(2px, 0); text-shadow: -2px 0 #ff00ff; }
          25% { transform: translate(-2px, 0); text-shadow: 2px 0 #00ffff; }
          50% { transform: translate(0, 2px); text-shadow: 2px 0 #ffff00; }
          75% { transform: translate(0, -2px); text-shadow: -2px 0 #ff00ff; }
          100% { transform: translate(2px, 0); text-shadow: 2px 0 #00ffff; }
        }
        
        .terminal-glitch {
          animation: glitch 0.2s infinite;
        }
      `}} />
    </div>
  );
};

export default TerminalWindow;
