import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

interface TerminalWindowProps {
  startingDirectory?: string;
}

const TerminalWindow: React.FC<TerminalWindowProps> = ({ startingDirectory }) => {
  const { user } = useAuth();
  // Use user's name for the directory if available, otherwise use CRAFTINGTABLE
  const userDir = user?.username ? user.username.toUpperCase() : "CRAFTINGTABLE";
  startingDirectory = startingDirectory || `C:\\${userDir}`;
  const [currentDirectory, setCurrentDirectory] = useState(startingDirectory);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandInput, setCommandInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<Array<{type: string, content: string}>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const [terminalColor, setTerminalColor] = useState("green");
  const [commandProcessor, setCommandProcessor] = useState<(cmd: string) => void | null>(null);
  
  // Hacker mode state
  const [hackerMode, setHackerMode] = useState(false);
  const [activeHackerTool, setActiveHackerTool] = useState<string | null>(null);
  const [hackerToolStage, setHackerToolStage] = useState(0);
  const [matrixActive, setMatrixActive] = useState(false);
  const hackerAnimationId = useRef<number | null>(null);

  // Initialize terminal output
  useEffect(() => {
    setTerminalOutput([
      { type: "system", content: "CraftingTableOS [Version 1.0.4815]" },
      { type: "system", content: "(c) 2025 CraftingTable LLC. Good luck on your hunt for the three golden keys" },
      { type: "system", content: "" },
      { type: "prompt", content: `${currentDirectory}>` }
    ]);
  }, []);

  // Create a dynamic file system with the user's directory
  const fileSystem: any = {
    "C:": {}
  };
  
  // Add user directory with common files
  fileSystem["C:"][userDir] = {
    "readme.txt": "Welcome to CraftingTableOS!\nType 'help' to see available commands.\n\nGood luck on your hunt for the three golden keys!",
    "secrets.txt": "Hidden areas can be found in the most unexpected places.\nTry using 'secret' command to reveal one of them.",
    "lore.txt": "CraftingTable was founded in 2025 to create adventures with crafting, exploration, and discovery.",
    "QUESTS": {
      "active_quests.dat": "Quest_1: Circuit Basics\nQuest_2: LED Adventures\nQuest_3: Digital Logic",
    },
    "INVENTORY": {
      "manifest.dat": "This folder contains information about your inventory items.",
    },
    "SYSTEM": {
      "help.sys": "HELP SYSTEM FILE - DO NOT MODIFY",
      "config.sys": "COLOR=GREEN\nUSER_LEVEL=1\nMUSIC=ON",
    }
  };

  // Available commands
  const availableCommands = {
    "help": "Shows this help information",
    "dir": "Lists files in current directory",
    "cd": "Changes directory (Usage: cd FOLDERNAME or cd .. to go up)",
    "pwd": "Shows current directory path",
    "clear": "Clears the terminal screen",
    "sysinfo": "Displays system information",
    "ver": "Shows OS version information",
    "date": "Shows current date",
    "time": "Shows current time",
    "inventory": "Lists items in your inventory",
    "quest": "Quest management (Usage: quest list or quest info QUESTNAME)",
    "type": "Displays content of a text file (Usage: type FILENAME)",
    "color": "Changes terminal color (Usage: color green|amber|blue|white)",
    "echo": "Displays a message (Usage: echo MESSAGE)",
    "secret": "Reveals a hidden message",
    "fortune": "Shows a random fortune",
    "credits": "Shows game credits",
    "ascii-art": "Displays ASCII art (Usage: ascii-art robot|castle|dragon)",
    "partykitty": "Shows the party kitty image in a popup window",
    "calc": "Simple calculator (Usage: calc 5+5)",
    "hack": "Opens the hacking toolkit (Usage: hack)",
    "haxtool": "Alias for hack command",
    "wanted": "Displays the wanted poster for Gizbo",
    "exit": "Closes the terminal window"
  };

  // Define type for hacker tools to fix TypeScript errors
  type HackerToolType = {
    description: string;
    version: string;
    author: string;
    logo: string;
    stages: { message: string; duration: number }[];
    discoveredDevices?: { ip: string; type: string; ports: number[]; os: string }[];
    vulnerabilities?: { id: string; severity: string; description: string }[] | { id: string; severity: string; component: string; risk: string }[];
    passwordCandidates?: string[];
    hashTypes?: string[];
    encryptedFiles?: { name: string; size: string; encryption: string }[];
    threatLevels?: { name: string; level: number; color: string }[];
    recommendations?: string[];
  };

  // Hacker tools configuration
  const hackerTools: Record<string, HackerToolType> = {
    "NETsurfer": {
      description: "Network scanning & infiltration tool",
      version: "3.1.4",
      author: "0xDEADC0DE",
      logo: `
        ╔═╗╔╗╔═╗╔╦╗╔═╗╦ ╦╦═╗╔═╗╔═╗╦═╗
        ║╣ ╠╩╗╚═╗ ║ ║ ║║ ║╠╦╝╠╣ ║╣ ╠╦╝
        ╚═╝╚═╝╚═╝ ╩ ╚═╝╚═╝╩╚═╚  ╚═╝╩╚═
      `,
      stages: [
        { message: "Initializing network scanner...", duration: 1500 },
        { message: "Scanning for active hosts...", duration: 2000 },
        { message: "Identifying open ports and services...", duration: 2500 },
        { message: "Fingerprinting operating systems...", duration: 1800 },
        { message: "Detecting vulnerabilities in network services...", duration: 2200 },
        { message: "Gathering networking intelligence...", duration: 1700 },
        { message: "Compiling scan results...", duration: 1500 },
      ],
      discoveredDevices: [
        { ip: "192.168.1.1", type: "Router", ports: [80, 443, 22], os: "VxWorks 5.4" },
        { ip: "192.168.1.5", type: "Desktop", ports: [135, 139, 445, 3389], os: "Windows 10" },
        { ip: "192.168.1.10", type: "Server", ports: [21, 22, 80, 443, 3306], os: "Ubuntu 22.04 LTS" },
        { ip: "192.168.1.15", type: "IoT Device", ports: [80, 1883, 8883], os: "Custom Linux 4.14" },
        { ip: "192.168.1.20", type: "Mobile", ports: [62078], os: "iOS 16.0" },
      ],
      vulnerabilities: [
        { id: "CVE-2022-1234", severity: "Critical", description: "Remote code execution in VxWorks web interface" },
        { id: "CVE-2021-4321", severity: "High", description: "SMB protocol vulnerability allows privilege escalation" },
        { id: "CVE-2023-5678", severity: "Medium", description: "MQTT broker authentication bypass" },
        { id: "CVE-2022-9876", severity: "Low", description: "Information disclosure in HTTP headers" },
      ]
    },
    "CRYPTbreaker": {
      description: "Password cracking & cryptography tool",
      version: "2.7.1",
      author: "Thr3adr1pp3r",
      logo: `
        ┏┓┏┓┏┓   ┏┓
        ┃┃┃┃┗┓┏┳━┫┗┓
        ┣┛┃┃ ┃┃┃━┫┏┫
        ┗━┗┛ ┗┻┻━┻━┛
      `,
      stages: [
        { message: "Loading encryption dictionaries...", duration: 1200 },
        { message: "Analyzing hash patterns...", duration: 1800 },
        { message: "Identifying encryption algorithms...", duration: 2000 },
        { message: "Running dictionary attack...", duration: 2500 },
        { message: "Attempting rainbow table lookups...", duration: 1500 },
        { message: "Executing brute force attack...", duration: 3000 },
        { message: "Decrypting secured files...", duration: 2200 },
      ],
      passwordCandidates: [
        "Passw0rd123!", "Summer2023", "letmein", "qwerty123", "admin1234", 
        "welcome1", "123456789", "iloveyou", "1q2w3e4r", "football"
      ],
      hashTypes: ["MD5", "SHA-1", "SHA-256", "bcrypt", "NTLM"],
      encryptedFiles: [
        { name: "financial_records.xlsx", size: "2.4 MB", encryption: "AES-256" },
        { name: "project_plans.docx", size: "1.8 MB", encryption: "AES-128" },
        { name: "customer_database.sql", size: "15.2 MB", encryption: "Triple DES" },
        { name: "keychain.dat", size: "256 KB", encryption: "Blowfish" },
        { name: "private_messages.txt", size: "782 KB", encryption: "RSA-2048" },
      ]
    },
    "SECURITYghost": {
      description: "System vulnerability scanner",
      version: "4.0.2",
      author: "Ph4nt0mR00t",
      logo: `
        ╔═╗╔═╗╔═╗╦ ╦╦═╗╦╔╦╗╦ ╦
        ╚═╗║╣ ║  ║ ║╠╦╝║ ║ ╚╦╝
        ╚═╝╚═╝╚═╝╚═╝╩╚═╩ ╩  ╩ 
                ╔═╗╦ ╦╔═╗╔═╗╔╦╗
                ║ ╦╠═╣║ ║╚═╗ ║ 
                ╚═╝╩ ╩╚═╝╚═╝ ╩ 
      `,
      stages: [
        { message: "Initializing security audit...", duration: 1400 },
        { message: "Scanning system configurations...", duration: 1800 },
        { message: "Checking installed software versions...", duration: 2000 },
        { message: "Analyzing user permissions...", duration: 1700 },
        { message: "Auditing network services...", duration: 2200 },
        { message: "Reviewing security policies...", duration: 1500 },
        { message: "Generating security report...", duration: 2000 },
      ],
      threatLevels: [
        { name: "OS Security", level: 65, color: "yellow" },
        { name: "Network Configuration", level: 42, color: "red" },
        { name: "Application Security", level: 78, color: "green" },
        { name: "User Permissions", level: 91, color: "green" },
        { name: "Data Encryption", level: 35, color: "red" },
        { name: "Physical Security", level: 83, color: "green" },
      ],
      vulnerabilities: [
        { id: "OS-1234", severity: "Medium", component: "Kernel", risk: "Outdated version with known memory leaks" },
        { id: "NET-5678", severity: "Critical", component: "Firewall", risk: "Multiple ports exposed to WAN without filtering" },
        { id: "APP-9101", severity: "Low", component: "Browser", risk: "Cookie security policy not enforced" },
        { id: "ENC-1122", severity: "High", component: "Disk Encryption", risk: "Weak encryption algorithm (DES) in use" },
      ],
      recommendations: [
        "Update kernel to version 5.15 or higher",
        "Configure firewall to block all incoming connections by default",
        "Enable HTTPS-only mode in all browsers",
        "Upgrade disk encryption to AES-256",
        "Implement two-factor authentication for all admin accounts",
        "Set up regular security audits and penetration testing",
      ]
    }
  };

  // Random fortunes array
  const fortunes = [
    "You will find a hidden treasure where you least expect it.",
    "A mysterious stranger will soon enter your life.",
    "The next crafting recipe you try will yield unexpected results.",
    "Your coding skills are improving every day.",
    "A great adventure awaits you in the digital realm.",
    "Today is a good day to debug that persistent bug.",
    "Look to the old archives for ancient knowledge.",
    "You will soon discover a hidden feature in your favorite tool.",
    "The error message contains the key to your solution.",
    "Your persistence will pay off with a rare discovery.",
    "Don't forget to save your progress before venturing into the unknown.",
    "A breakthrough in your current project is just around the corner.",
    "Challenge yourself with a new quest today.",
    "Your programming skills will improve with practice.",
    "The best error message is the one that never shows up."
  ];

  // ASCII art collection
  const asciiArt = {
    gizbo: `
███████████████████████████████████████████████████████████
██████▓▓▓▓▒▒▒▒▒▒▒▒▒▓▒▓██▓▓▒▒▒▒▒▒▒▒▒▓▓▓███████▓▒▒▒▒▒▒▒▒▒▓▒▒██
█████▓▓▓▓▓▓▓▓▓▒▒▒▒░▒▒▒▓▓▒▒▒░░▒▒▒▒▒▒▒░░░▒▒▒▒▒▒░░░░░░░░▒▒▒░░░░
█████▓▒▒▓▒▓█▓▓▒▒░░▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░▒▒░░░░░░░░░░░ ░░░▒░
█████▒▒▒▒▒▓▓▓▓▒░░░░▒▒░░░░░░░░░     ░▒░░░░░░░░░░░░░   ░░░░░
████▓▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░      ░░░░░░░░░░░░░░ ░░░░ ░
████▓▒▒▒▒░░░░░▓▓▓▓▓▓▓▒░░░▒▓░░░░▒▒▒▒▒▒░░░▓▓▓▓▒▒▒▒░░░░▒▓▓▓▒ ░
█████▒▒▒▒▒▒░░░███████▓░░░▒█▓░░░██████░░░███████▓░░░░▓████▒ 
█████▓▒░░░░░░░░▓████▓▒  ▒██▓░  ░▓███    ░█████▓▒░   ░▓████▓
██████▓▒▒░░░░░░░█████▓░▒████░  ▓███░    ███▓███▒░░░░░▓█████
               
     !!  WANTED: GIZBO THE INVENTOR  !!
       REWARD: 500 GOLD AND 3 CRYSTALS
     !!   FOR UNAUTHORIZED CRAFTING   !!
    `,
    robot: `
      ,::////;::-.\n    /:'///// \`::::/|/\n    /'    /   / \`::/'\n   /_    \`  \.  \`\ /\n  //  \`-.   \.   ///\n / /--. \`-.  \`-.////\n/ /   \.  \`-.  \`-.//\n|/      \`-.  \`-.  /\n'-._______.-'--._/
    `,
    castle: `
       /\                 /\
    __/  \_______________/  \__
    |_____|_____________|_____|
    |     |             |     |
 ___|_____|_____________|_____|___
 |                               |
 |_______________________________|
 |_|___|___|___|___|___|___|_|_|
    `,
    dragon: `
      <\\>//
      /<O> <O>\
     /   V    \
    /___n_n___\
   /           \
  /             \
 /               \
/_________________\
    `
  };

  // Focus input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Auto-scroll to the bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Handle command submission
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commandInput.trim()) return;
    
    // Add command to history
    setCommandHistory(prev => [...prev, commandInput]);
    setHistoryIndex(-1);
    
    // Add command to output
    addToOutput("command", commandInput);
    
    // Process command
    processCommand(commandInput);
    
    // Clear input
    setCommandInput("");
  };

  // Add line to terminal output
  const addToOutput = (type: string, content: string) => {
    if (type === "command") {
      setTerminalOutput(prev => [...prev, { type: "command", content: `${currentDirectory}>${content}` }]);
    } else {
      setTerminalOutput(prev => [...prev, { type, content }]);
    }
  };

  // Add prompt line after command execution
  const addPrompt = () => {
    addToOutput("prompt", `${currentDirectory}>`);
  };

  // Get random technical jargon for hacker effect
  const getRandomTechnicalJargon = () => {
    const technicalTerms = [
      "Running subroutine 0x7A42F...",
      "Executing packet handshake protocol...",
      "Bypassing security layer...",
      "Decrypting XOR cipher...",
      "Injecting payload to memory address 0x8CF2E...",
      "Signal strength: 87%",
      "Routing through proxy servers...",
      "Initializing buffer overflow sequence...",
      "Compiling machine code instructions...",
      "Deploying rootkit to target system...",
      "Calculating hash values...",
      "Scanning for active countermeasures...",
      "Disabling IDS/IPS systems...",
      "Establishing encrypted tunnel...",
      "Memory allocation successful.",
      "Binary pattern matching in progress...",
      "Extracting registry keys...",
      "System timestamp modified.",
      "Backdoor installed at port 4721.",
      "SSL certificate successfully spoofed."
    ];

    return technicalTerms[Math.floor(Math.random() * technicalTerms.length)];
  };

  // Get path components from a path string
  const getPathComponents = (path: string) => {
    return path.split('\\').filter(Boolean);
  };

  // Navigate to an object at the specified path in the virtual file system
  const getObjectAtPath = (path: string) => {
    const components = getPathComponents(path);
    let current: any = fileSystem;
    
    for (const component of components) {
      if (current[component]) {
        current = current[component];
      } else {
        return null;
      }
    }
    
    return current;
  };

  // Check if path is a directory (an object with properties)
  const isDirectory = (path: string) => {
    const obj = getObjectAtPath(path);
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
  };

  // Check if path is a file (a string)
  const isFile = (path: string) => {
    const parentPath = path.substring(0, path.lastIndexOf('\\'));
    const fileName = path.substring(path.lastIndexOf('\\') + 1);
    const parent = getObjectAtPath(parentPath);
    
    return parent !== null && typeof parent[fileName] === 'string';
  };

  // Matrix rain effect for hacker mode
  useEffect(() => {
    if (!matrixActive || !hackerMode) return;
    
    // Create canvas for matrix effect if it doesn't exist
    let canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'matrix-canvas';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = '1';
      canvas.style.opacity = '0.1';
      
      const terminalEl = document.querySelector('.font-mono') as HTMLElement;
      if (terminalEl && terminalEl.parentNode) {
        terminalEl.parentNode.insertBefore(canvas, terminalEl);
      }
    }
    
    // Initialize canvas size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Matrix rain characters
    const chars = '01アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン[]{}+-*/=0123456789ABCDEF';
    
    // Columns configuration
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];
    
    // Initialize drops at random positions
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -canvas.height / fontSize;
    }
    
    // Drawing function
    const drawMatrix = () => {
      // Semi-transparent black to create trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set the character style
      ctx.fillStyle = '#0F0'; // Green text
      ctx.font = fontSize + 'px monospace';
      
      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // Draw the character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Move drops down for next frame
        drops[i]++;
        
        // Reset drops to top with randomness
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.random() * -10;
        }
      }
      
      // Only continue animation if matrix is still active
      if (matrixActive) {
        hackerAnimationId.current = requestAnimationFrame(drawMatrix);
      } else {
        // Clean up canvas if matrix effect is disabled
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    
    // Start the animation
    hackerAnimationId.current = requestAnimationFrame(drawMatrix);
    
    // Cleanup on unmount
    return () => {
      if (hackerAnimationId.current) {
        cancelAnimationFrame(hackerAnimationId.current);
      }
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [matrixActive, hackerMode]);

  // Hacker tool simulation effect
  useEffect(() => {
    if (!hackerMode || !activeHackerTool) return;
    
    // Get tool configuration
    const tool = hackerTools[activeHackerTool as keyof typeof hackerTools];
    if (!tool) return;
    
    // Get current stage info
    const currentStage = tool.stages[hackerToolStage];
    if (!currentStage) {
      // If we've reached the end of stages, exit hacker mode
      setTimeout(() => {
        // Show completion message
        addToOutput("hack-success", "\n--- Operation complete ---\n");
        
        if (activeHackerTool === "NETsurfer" && tool.discoveredDevices && tool.vulnerabilities) {
          // Show discovered devices for NETsurfer
          addToOutput("hack-data", "DISCOVERED DEVICES:");
          tool.discoveredDevices.forEach((device) => {
            addToOutput("hack-data", `[${device.ip}] ${device.type} - ${device.os}\n  Open ports: ${device.ports.join(", ")}`);
          });
          addToOutput("hack-data", "\nVULNERABILITIES:");
          (tool.vulnerabilities as {id: string; severity: string; description: string}[]).forEach((vuln) => {
            addToOutput("hack-data", `[${vuln.id}] ${vuln.severity} - ${vuln.description}`);
          });
        } else if (activeHackerTool === "CRYPTbreaker" && tool.passwordCandidates && tool.encryptedFiles) {
          // Show cracked password for CRYPTbreaker
          const password = tool.passwordCandidates[Math.floor(Math.random() * tool.passwordCandidates.length)];
          addToOutput("hack-data", `PASSWORD CRACKED: ${password}`);
          addToOutput("hack-data", "\nENCRYPTED FILES DECRYPTED:");
          tool.encryptedFiles.forEach((file) => {
            addToOutput("hack-data", `[${file.encryption}] ${file.name} (${file.size})`);
          });
        } else if (activeHackerTool === "SECURITYghost" && tool.threatLevels && tool.vulnerabilities && tool.recommendations) {
          // Show security report for SECURITYghost
          addToOutput("hack-data", "SECURITY ASSESSMENT:");
          tool.threatLevels.forEach((threat) => {
            const bars = Math.floor(threat.level / 10);
            const barDisplay = '[' + '█'.repeat(bars) + ' '.repeat(10 - bars) + ']';
            addToOutput("hack-data", `${threat.name.padEnd(20)} ${barDisplay} ${threat.level}%`);
          });
          addToOutput("hack-data", "\nVULNERABILITIES DETECTED:");
          (tool.vulnerabilities as {id: string; severity: string; component: string; risk: string}[]).forEach((vuln) => {
            addToOutput("hack-data", `[${vuln.id}] ${vuln.severity} - ${vuln.component} - ${vuln.risk}`);
          });
          addToOutput("hack-data", "\nRECOMMENDATIONS:");
          tool.recommendations.forEach((rec, i) => {
            addToOutput("hack-data", `${i + 1}. ${rec}`);
          });
        }
        
        // Exit hacker mode
        setHackerMode(false);
        setActiveHackerTool(null);
        setHackerToolStage(0);
        setMatrixActive(false);
        
        // Reset terminal color
        setTerminalColor("green");
        
        addPrompt();
      }, 2000);
      return;
    }
    
    // Type out the current stage message
    addToOutput("hack-progress", currentStage.message);
    
    // Add some random technical jargon for effect
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        addToOutput("hack-data", getRandomTechnicalJargon());
      }, Math.random() * 500);
    }
    
    // Move to next stage after duration
    const timer = setTimeout(() => {
      setHackerToolStage(prev => prev + 1);
    }, currentStage.duration);
    
    return () => clearTimeout(timer);
  }, [hackerMode, activeHackerTool, hackerToolStage, currentDirectory]);

  // Process the user's command
  const processCommand = (cmd: string) => {
    const parts = cmd.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    switch (command) {
      case "help":
        // Show help information
        addToOutput("output", "Available commands:");
        Object.entries(availableCommands).forEach(([cmd, desc]) => {
          addToOutput("output", `  ${cmd.padEnd(12)} - ${desc}`);
        });
        break;
        
      case "dir":
        // List files in current directory
        const currentPathObj = getObjectAtPath(currentDirectory);
        if (currentPathObj) {
          addToOutput("output", ` Directory of ${currentDirectory}`);
          addToOutput("output", "");
          Object.entries(currentPathObj).forEach(([name, content]) => {
            const isDir = typeof content === 'object';
            const dateStr = new Date().toLocaleDateString("en-US", { 
              year: '2-digit', 
              month: '2-digit', 
              day: '2-digit' 
            });
            const timeStr = new Date().toLocaleTimeString("en-US", { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            
            if (isDir) {
              addToOutput("output", `${dateStr}  ${timeStr}    <DIR>          ${name}`);
            } else {
              const size = (content as string).length;
              addToOutput("output", `${dateStr}  ${timeStr}       ${size.toString().padStart(8)} ${name}`);
            }
          });
        } else {
          addToOutput("error", `Directory not found: ${currentDirectory}`);
        }
        break;
        
      case "cd":
        // Change directory
        if (!args.length) {
          // Just show current directory
          addToOutput("output", currentDirectory);
        } else if (args[0] === "..") {
          // Go up one level
          const pathComponents = currentDirectory.split('\\');
          if (pathComponents.length > 1) {
            pathComponents.pop();
            setCurrentDirectory(pathComponents.join('\\'));
          }
        } else {
          // Go to specified directory
          let targetPath = args[0];
          if (!targetPath.includes('\\')) {
            targetPath = `${currentDirectory}\\${targetPath}`;
          }
          
          if (isDirectory(targetPath)) {
            setCurrentDirectory(targetPath);
          } else {
            addToOutput("error", `The system cannot find the path specified: ${args[0]}`);
          }
        }
        break;
        
      case "pwd":
        // Print working directory
        addToOutput("output", currentDirectory);
        break;
        
      case "clear":
        // Clear screen, but keep initial system message
        setTerminalOutput([
          { type: "system", content: "CraftingTableOS [Version 1.0.4815]" },
          { type: "system", content: "(c) 2025 CraftingTable LLC. Good luck on your hunt for the three golden keys" },
          { type: "system", content: "" }
        ]);
        break;
        
      case "sysinfo":
        // Show system information
        addToOutput("output", "SYSTEM INFORMATION");
        addToOutput("output", "-----------------");
        addToOutput("output", `OS Name:                   CraftingTableOS`);
        addToOutput("output", `OS Version:                1.0.4815`);
        addToOutput("output", `System Type:               Crafting Exploration Platform`);
        addToOutput("output", `User Name:                 ${user?.username || "Unknown"}`);
        addToOutput("output", `User Level:                ${user?.level || 1}`);
        addToOutput("output", `Items in Inventory:        ${user?.inventory ? Object.keys(user.inventory).length : 0}`);
        break;
        
      case "ver":
        // Show version information
        addToOutput("output", "CraftingTableOS [Version 1.0.4815]");
        break;
        
      case "date":
        // Show current date
        addToOutput("output", new Date().toLocaleDateString());
        break;
        
      case "time":
        // Show current time
        addToOutput("output", new Date().toLocaleTimeString());
        break;
        
      case "inventory":
        // Show inventory items
        if (user?.inventory) {
          const items = Object.entries(user.inventory);
          if (items.length > 0) {
            addToOutput("output", "INVENTORY CONTENTS:");
            addToOutput("output", "------------------");
            items.forEach(([itemId, quantity]) => {
              addToOutput("output", `${itemId.padEnd(20)} Quantity: ${quantity}`);
            });
          } else {
            addToOutput("output", "Your inventory is empty.");
          }
        } else {
          addToOutput("output", "Your inventory is empty.");
        }
        break;
        
      case "quest":
        // Quest management
        if (args.length === 0) {
          addToOutput("error", "Usage: quest list | quest info <quest-name>");
        } else if (args[0] === "list") {
          addToOutput("output", "AVAILABLE QUESTS:");
          addToOutput("output", "----------------");
          addToOutput("output", "1. Circuit Basics - Learn about electrical circuits");
          addToOutput("output", "2. LED Adventures - Create light patterns with LEDs");
          addToOutput("output", "3. Digital Logic - Explore logic gates and binary");
        } else if (args[0] === "info" && args[1]) {
          const questName = args.slice(1).join(" ");
          switch(questName.toLowerCase()) {
            case "circuit":
            case "circuit basics":
              addToOutput("output", "QUEST: Circuit Basics");
              addToOutput("output", "---------------------");
              addToOutput("output", "Difficulty: Beginner");
              addToOutput("output", "Rewards: 100 XP, 5 Copper, 2 Circuit Boards");
              addToOutput("output", "");
              addToOutput("output", "Description: Learn the fundamentals of electrical circuits");
              addToOutput("output", "by connecting components in a virtual breadboard.");
              break;
            case "led":
            case "led adventures":
              addToOutput("output", "QUEST: LED Adventures");
              addToOutput("output", "---------------------");
              addToOutput("output", "Difficulty: Intermediate");
              addToOutput("output", "Rewards: 150 XP, 3 LEDs, 1 Crystal");
              addToOutput("output", "");
              addToOutput("output", "Description: Create dazzling light patterns with LEDs");
              addToOutput("output", "and learn about pulse width modulation.");
              break;
            case "digital":
            case "digital logic":
              addToOutput("output", "QUEST: Digital Logic");
              addToOutput("output", "---------------------");
              addToOutput("output", "Difficulty: Advanced");
              addToOutput("output", "Rewards: 200 XP, 1 Tech Scrap, 3 Circuit Boards");
              addToOutput("output", "");
              addToOutput("output", "Description: Explore the world of logic gates and binary");
              addToOutput("output", "systems by building digital circuits.");
              break;
            default:
              addToOutput("error", `Quest '${questName}' not found.`);
          }
        } else {
          addToOutput("error", "Usage: quest list | quest info <quest-name>");
        }
        break;
        
      case "type":
        // Display file content
        if (args.length === 0) {
          addToOutput("error", "Usage: type FILENAME");
        } else {
          const fileName = args[0];
          let filePath = fileName;
          if (!filePath.includes('\\')) {
            filePath = `${currentDirectory}\\${fileName}`;
          }
          
          const parentPath = filePath.substring(0, filePath.lastIndexOf('\\'));
          const fileNameOnly = filePath.substring(filePath.lastIndexOf('\\') + 1);
          const parent = getObjectAtPath(parentPath);
          
          if (parent && typeof parent[fileNameOnly] === 'string') {
            addToOutput("output", `--- ${fileName} ---`);
            const content = parent[fileNameOnly] as string;
            content.split('\n').forEach(line => {
              addToOutput("output", line);
            });
          } else {
            addToOutput("error", `File not found: ${fileName}`);
          }
        }
        break;
        
      case "color":
        // Change terminal color
        if (args.length === 0) {
          addToOutput("output", `Current terminal color: ${terminalColor}`);
          addToOutput("output", "Available colors: green, amber, blue, white");
        } else {
          const color = args[0].toLowerCase();
          if (["green", "amber", "blue", "white"].includes(color)) {
            setTerminalColor(color);
            addToOutput("output", `Terminal color changed to ${color}`);
          } else {
            addToOutput("error", `Invalid color: ${color}`);
            addToOutput("output", "Available colors: green, amber, blue, white");
          }
        }
        break;
        
      case "echo":
        // Echo text back to user
        if (args.length === 0) {
          addToOutput("output", "");
        } else {
          addToOutput("output", args.join(" "));
        }
        break;
        
      case "secret":
        // Reveal a hidden message
        addToOutput("output", "HIDDEN MESSAGE UNLOCKED");
        addToOutput("output", "---------------------");
        addToOutput("output", "Congratulations! You've discovered a secret.");
        addToOutput("output", "");
        addToOutput("output", "There are many hidden commands and easter eggs in the system.");
        addToOutput("output", "Keep exploring to find them all!");
        addToOutput("output", "");
        addToOutput("output", "Hint: Try using the 'ascii-art' command with different arguments.");
        break;
        
      case "partykitty":
        // Display party kitty in a popup window
        addToOutput("output", "🐱 Opening Party Kitty window! 🎉");
        addToOutput("output", "The party cat has appeared!");
        // Dispatch custom event to open the Party Kitty window
        window.dispatchEvent(new Event('openPartyKitty'));
        break;
        
      case "fortune":
        // Show random fortune cookie message
        const randomIndex = Math.floor(Math.random() * fortunes.length);
        addToOutput("output", "Your fortune:");
        addToOutput("output", `"${fortunes[randomIndex]}"`);        
        break;
        
      case "credits":
        // Show game credits
        addToOutput("output", "CREDITS");
        addToOutput("output", "-------");
        addToOutput("output", "CraftingTable LLC - Crafting Exploration Platform");
        addToOutput("output", "Created in 2025");
        addToOutput("output", "");
        addToOutput("output", "Designed for finding the three golden keys");
        addToOutput("output", "through crafting, exploration, and adventure.");
        addToOutput("output", "");
        addToOutput("output", "Thank you for playing!");
        break;
        
      case "ascii-art":
        // Display ASCII art
        if (args.length === 0) {
          addToOutput("output", "Usage: ascii-art robot|castle|dragon|gizbo");
        } else {
          const artType = args[0].toLowerCase();
          if (asciiArt[artType as keyof typeof asciiArt]) {
            // Split art into lines and add each line to output
            asciiArt[artType as keyof typeof asciiArt].trim().split('\n').forEach(line => {
              addToOutput("output", line);
            });
          } else {
            addToOutput("error", `Unknown art type: ${artType}`);
            addToOutput("output", "Available types: robot, castle, dragon, gizbo");
          }
        }
        break;
        
      case "calc":
        // Simple calculator
        if (args.length === 0) {
          addToOutput("output", "Usage: calc <expression> (e.g., calc 5+5)");
        } else {
          try {
            // Basic calculator using eval (be careful with this in production!)
            const expression = args.join('');
            // Check if expression only contains numbers and basic operators
            if (/^[0-9+\-*/().\s]+$/.test(expression)) {
              // eslint-disable-next-line no-eval
              const result = eval(expression);
              addToOutput("output", `${expression} = ${result}`);
            } else {
              addToOutput("error", "Invalid expression. Only numbers and basic operators (+, -, *, /) are allowed.");
            }
          } catch (e) {
            addToOutput("error", "Error calculating result. Check your expression.");
          }
        }
        break;
        
      case "wanted":
        // Display Gizbo's wanted poster
        asciiArt["gizbo"].trim().split('\n').forEach(line => {
          addToOutput("output", line);
        });
        break;
        
      case "hack":
      case "haxtool":
        // Open the hacking toolkit
        if (hackerMode) {
          addToOutput("error", "A hacking operation is already in progress!");
          break;
        }
        
        // Display hacking toolkit menu
        addToOutput("output", "\n=== HACKING TOOLKIT v3.5 ===\n");
        addToOutput("output", "AVAILABLE TOOLS:");
        addToOutput("output", "1. NETsurfer - Network scanning & infiltration tool");
        addToOutput("output", "2. CRYPTbreaker - Password cracking & cryptography tool");
        addToOutput("output", "3. SECURITYghost - System vulnerability scanner");
        addToOutput("output", "\nEnter tool number or 'exit': ");
        
        // Set up a special listener for the next command
        const originalProcessCommand = processCommand;
        const handleHackToolSelection = (toolChoice: string) => {
          if (toolChoice.trim().toLowerCase() === "exit" || 
              toolChoice.trim().toLowerCase() === "quit" || 
              toolChoice.trim().toLowerCase() === "q") {
            addToOutput("output", "Exiting hacking toolkit...");
            return;
          }
          
          let selectedTool: string | null = null;
          if (toolChoice === "1" || toolChoice.toLowerCase() === "netsurfer") {
            selectedTool = "NETsurfer";
          } else if (toolChoice === "2" || toolChoice.toLowerCase() === "cryptbreaker") {
            selectedTool = "CRYPTbreaker";
          } else if (toolChoice === "3" || toolChoice.toLowerCase() === "securityghost") {
            selectedTool = "SECURITYghost";
          } else {
            addToOutput("error", `Invalid tool selection: ${toolChoice}`);
            return;
          }
          
          // Start the hacking tool
          const tool = hackerTools[selectedTool as keyof typeof hackerTools];
          if (tool) {
            addToOutput("output", `\nLaunching ${selectedTool} v${tool.version} by ${tool.author}...\n`);
            
            // Display the tool logo
            tool.logo.trim().split('\n').forEach(line => {
              addToOutput("hack-logo", line);
            });
            
            // Start hacker mode
            setHackerMode(true);
            setActiveHackerTool(selectedTool);
            setHackerToolStage(0);
            setMatrixActive(true);
            setTerminalColor("green");
          } else {
            addToOutput("error", `Tool initialization failed: ${selectedTool}`);
          }
        };
        
        // Store the original command input handler
        const originalCommandInputHandler = handleCommandSubmit;
        
        // Replace it with our special handler just for this interaction
        const handleHackToolInput = (e: React.FormEvent) => {
          e.preventDefault();
          
          if (!commandInput.trim()) return;
          
          // Add command to history
          setCommandHistory(prev => [...prev, commandInput]);
          setHistoryIndex(-1);
          
          // Add command to output
          addToOutput("command", commandInput);
          
          // Process the hack tool selection
          handleHackToolSelection(commandInput);
          
          // Clear input
          setCommandInput("");
          
          // Restore original handler
          document.querySelector('form')?.removeEventListener('submit', handleHackToolInput as any);
          document.querySelector('form')?.addEventListener('submit', originalCommandInputHandler as any);
        };
        
        // Replace the form submit handler
        document.querySelector('form')?.removeEventListener('submit', originalCommandInputHandler as any);
        document.querySelector('form')?.addEventListener('submit', handleHackToolInput as any);
        break;
      
      case "exit":
        // This will be handled by the parent component
        addToOutput("output", "Closing terminal window...");
        break;
        
      default:
        // Command not recognized
        addToOutput("error", `'${command}' is not recognized as an internal or external command, operable program or batch file.`);
    }
    
    // Add prompt for next command (except for exit command)
    if (command !== "exit") {
      addPrompt();
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Navigate command history
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        setHistoryIndex(prev => prev + 1);
        setCommandInput(commandHistory[commandHistory.length - 1 - historyIndex - 1]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        setHistoryIndex(prev => prev - 1);
        setCommandInput(commandHistory[commandHistory.length - 1 - historyIndex + 1]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput("");
      }
    }
  };

  // Get terminal color styles
  const getTerminalColorStyle = () => {
    switch (terminalColor) {
      case "amber":
        return {
          color: "#FFBF00",
          backgroundColor: "#000",
        };
      case "blue":
        return {
          color: "#00AAFF",
          backgroundColor: "#000",
        };
      case "white":
        return {
          color: "#F0F0F0",
          backgroundColor: "#000",
        };
      case "green":
      default:
        return {
          color: "#33FF33",
          backgroundColor: "#000",
        };
    }
  };
  
  // Get text style based on line type
  const getLineStyle = (type: string) => {
    const baseStyle = getTerminalColorStyle();
    
    if (type === "error") {
      return { ...baseStyle, color: "#FF5555" };
    } else if (type === "hack-progress") {
      return { ...baseStyle, color: "#33FF33", fontWeight: "bold" };
    } else if (type === "hack-data") {
      return { ...baseStyle, color: "#33AAFF" };
    } else if (type === "hack-success") {
      return { ...baseStyle, color: "#FFFF33", fontWeight: "bold" };
    } else if (type === "hack-logo") {
      return { ...baseStyle, color: "#FF3333", fontWeight: "bold" };
    }
    
    return baseStyle;
  };

  return (
    <div className="flex flex-col h-full p-1 bg-black overflow-hidden font-mono text-sm">
      <div 
        ref={outputRef}
        className="flex-1 overflow-y-auto whitespace-pre-wrap pb-2"
        style={{ maxHeight: "calc(100% - 30px)" }}
      >
        {terminalOutput.map((line, index) => (
          <div key={index} style={getLineStyle(line.type)}>
            {line.content}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleCommandSubmit} className="flex">
        <div style={getTerminalColorStyle()}>{currentDirectory + '>'}</div>
        <input
          ref={inputRef}
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none border-none ml-2"
          style={getTerminalColorStyle()}
          autoFocus
        />
      </form>
    </div>
  );
};

export default TerminalWindow;