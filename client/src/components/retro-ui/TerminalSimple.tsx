import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

interface TerminalSimpleProps {
  onClose?: () => void;
}

const TerminalSimple: React.FC<TerminalSimpleProps> = ({ onClose }) => {
  const [commandInput, setCommandInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [promptVisible, setPromptVisible] = useState(true);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [hackerMode, setHackerMode] = useState(false);
  const [gizboDisplayed, setGizboDisplayed] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [terminalColor, setTerminalColor] = useState("green");
  
  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Initialize terminal with welcome message
  useEffect(() => {
    setTerminalOutput([
      "CraftingTableOS [Version 1.0.4815]",
      "(c) 2025 CraftingTable LLC. Good luck on your hunt for the three golden keys",
      "",
      "Type 'help' for available commands.",
      ""
    ]);
  }, []);

  // Handle command submission
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commandInput.trim()) return;
    
    // Add command to output
    setTerminalOutput(prev => [
      ...prev, 
      `C:\>${commandInput}`
    ]);
    
    // Process command
    processCommand(commandInput.trim().toLowerCase());
    
    // Clear input
    setCommandInput("");
  };

  // Process commands
  const processCommand = (command: string) => {
    const cmd = command.split(' ')[0];
    const args = command.substring(cmd.length).trim();
    
    switch (cmd) {
      case "help":
        setTerminalOutput(prev => [
          ...prev,
          "Available commands:",
          "  help         - Shows this help information",
          "  wanted       - Displays the wanted poster for Gizbo",
          "  hack/haxtool - Opens the hacking toolkit",
          "  clear        - Clears the terminal screen",
          "  exit         - Closes the terminal window",
          ""
        ]);
        break;
        
      case "clear":
        setTerminalOutput([
          "CraftingTableOS [Version 1.0.4815]",
          "(c) 2025 CraftingTable LLC. Good luck on your hunt for the three golden keys",
          ""
        ]);
        break;
        
      case "wanted":
        displayGizboWantedPoster();
        break;
        
      case "hack":
      case "haxtool":
        displayHackingToolkit();
        break;
        
      case "1":
      case "2":
      case "3":
        if (currentTool === "hacking") {
          selectHackingTool(cmd);
        } else {
          setTerminalOutput(prev => [
            ...prev,
            `Command not recognized: ${command}`,
            ""
          ]);
        }
        break;
        
      case "exit":
        setTerminalOutput(prev => [...prev, "Closing terminal window..."]);
        if (onClose) setTimeout(onClose, 500);
        break;
        
      default:
        setTerminalOutput(prev => [
          ...prev,
          `'${command}' is not recognized as an internal or external command, operable program or batch file.`,
          ""
        ]);
    }
  };

  // Display Gizbo wanted poster
  const displayGizboWantedPoster = () => {
    setGizboDisplayed(true);
    const gizboArt = [
"███████████████████████████████████████████████████████████",
"██████▓▓▓▓▒▒▒▒▒▒▒▒▒▓▒▓██▓▓▒▒▒▒▒▒▒▒▒▓▓▓███████▓▒▒▒▒▒▒▒▒▒▓▒▒██",
"█████▓▓▓▓▓▓▓▓▓▒▒▒▒░▒▒▒▓▓▒▒▒░░▒▒▒▒▒▒▒░░░▒▒▒▒▒▒░░░░░░░░▒▒▒░░░░",
"█████▓▒▒▓▒▓█▓▓▒▒░░▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░▒▒░░░░░░░░░░░ ░░░▒░",
"█████▒▒▒▒▒▓▓▓▓▒░░░░▒▒░░░░░░░░░     ░▒░░░░░░░░░░░░░   ░░░░░",
"████▓▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░      ░░░░░░░░░░░░░░ ░░░░ ░",
"████▓▒▒▒▒░░░░░▓▓▓▓▓▓▓▒░░░▒▓░░░░▒▒▒▒▒▒░░░▓▓▓▓▒▒▒▒░░░░▒▓▓▓▒ ░",
"█████▒▒▒▒▒▒░░░███████▓░░░▒█▓░░░██████░░░███████▓░░░░▓████▒ ",
"█████▓▒░░░░░░░░▓████▓▒  ▒██▓░  ░▓███    ░█████▓▒░   ░▓████▓",
"██████▓▒▒░░░░░░░█████▓░▒████░  ▓███░    ███▓███▒░░░░░▓█████",
"               ",
"     !!  WANTED: GIZBO THE INVENTOR  !!",
"       REWARD: 500 GOLD AND 3 CRYSTALS",
"     !!   FOR UNAUTHORIZED CRAFTING   !!",
    ];
    
    setTerminalOutput(prev => [
      ...prev,
      ...gizboArt,
      ""
    ]);
  };

  // Display hacking toolkit menu
  const displayHackingToolkit = () => {
    setCurrentTool("hacking");
    setTerminalOutput(prev => [
      ...prev,
      "",
      "=== HACKING TOOLKIT v3.5 ===",
      "",
      "AVAILABLE TOOLS:",
      "1. NETsurfer - Network scanning & infiltration tool",
      "2. CRYPTbreaker - Password cracking & cryptography tool",
      "3. SECURITYghost - System vulnerability scanner",
      "",
      "Enter tool number (1-3) to select:",
      ""
    ]);
  };

  // Handle selection of a hacking tool
  const selectHackingTool = (toolNumber: string) => {
    let toolName = "";
    let toolDescription = "";
    let toolOutput: string[] = [];
    
    switch (toolNumber) {
      case "1":
        toolName = "NETsurfer";
        toolDescription = "Network scanning & infiltration tool";
        toolOutput = [
          "Initializing network scanner...",
          "Scanning for active hosts...",
          "Identifying open ports and services...",
          "Fingerprinting operating systems...",
          "Detecting vulnerabilities in network services...",
          "Gathering networking intelligence...",
          "Compiling scan results...",
          "",
          "--- Operation complete ---",
          "",
          "DISCOVERED DEVICES:",
          "[192.168.1.1] Router - VxWorks 5.4",
          "  Open ports: 80, 443, 22",
          "[192.168.1.5] Desktop - Windows 10",
          "  Open ports: 135, 139, 445, 3389",
          "[192.168.1.10] Server - Ubuntu 22.04 LTS",
          "  Open ports: 21, 22, 80, 443, 3306",
          "",
          "VULNERABILITIES:",
          "[CVE-2022-1234] Critical - Remote code execution in VxWorks web interface",
          "[CVE-2021-4321] High - SMB protocol vulnerability allows privilege escalation",
          "[CVE-2023-5678] Medium - MQTT broker authentication bypass",
          ""
        ];
        break;
        
      case "2":
        toolName = "CRYPTbreaker";
        toolDescription = "Password cracking & cryptography tool";
        toolOutput = [
          "Loading encryption dictionaries...",
          "Analyzing hash patterns...",
          "Identifying encryption algorithms...",
          "Running dictionary attack...",
          "Attempting rainbow table lookups...",
          "Executing brute force attack...",
          "Decrypting secured files...",
          "",
          "--- Operation complete ---",
          "",
          "PASSWORD CRACKED: Passw0rd123!",
          "",
          "ENCRYPTED FILES DECRYPTED:",
          "[AES-256] financial_records.xlsx (2.4 MB)",
          "[AES-128] project_plans.docx (1.8 MB)",
          "[Triple DES] customer_database.sql (15.2 MB)",
          ""
        ];
        break;
        
      case "3":
        toolName = "SECURITYghost";
        toolDescription = "System vulnerability scanner";
        toolOutput = [
          "Initializing security audit...",
          "Scanning system configurations...",
          "Checking installed software versions...",
          "Analyzing user permissions...",
          "Auditing network services...",
          "Reviewing security policies...",
          "Generating security report...",
          "",
          "--- Operation complete ---",
          "",
          "SECURITY ASSESSMENT:",
          "OS Security          [██████    ] 65%",
          "Network Configuration[████      ] 42%",
          "Application Security [███████   ] 78%",
          "User Permissions     [█████████ ] 91%",
          "Data Encryption      [███       ] 35%",
          "",
          "VULNERABILITIES DETECTED:",
          "[OS-1234] Medium - Kernel - Outdated version with known memory leaks",
          "[NET-5678] Critical - Firewall - Multiple ports exposed to WAN without filtering",
          "[ENC-1122] High - Disk Encryption - Weak encryption algorithm (DES) in use",
          ""
        ];
        break;
    }
    
    setHackerMode(true);
    setTerminalColor("green");
    setCurrentTool(null);
    
    // Display tool launch message
    setTerminalOutput(prev => [
      ...prev,
      `Launching ${toolName} - ${toolDescription}...`,
      "",
      "SIMULATING HACKING SEQUENCE...",
      ""
    ]);
    
    // Simulate typing out the tool output with a delay
    let outputIndex = 0;
    const typeInterval = setInterval(() => {
      if (outputIndex < toolOutput.length) {
        setTerminalOutput(prev => [...prev, toolOutput[outputIndex]]);
        outputIndex++;
      } else {
        clearInterval(typeInterval);
        setHackerMode(false);
        setTerminalColor("green");
      }
    }, 400);
  };

  // Get style for terminal colors
  const getTerminalColorStyle = () => {
    if (hackerMode) {
      return {
        color: "#33FF33",
        backgroundColor: "#000",
      };
    }
    
    switch (terminalColor) {
      case "green":
      default:
        return {
          color: "#33FF33",
          backgroundColor: "#000",
        };
    }
  };

  return (
    <div className="flex flex-col h-full p-1 bg-black overflow-hidden font-mono text-sm">
      <div 
        ref={outputRef}
        className="flex-1 overflow-y-auto whitespace-pre-wrap pb-2"
        style={{ maxHeight: "calc(100% - 30px)" }}
      >
        {terminalOutput.map((line, index) => (
          <div key={index} style={getTerminalColorStyle()}>
            {line}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleCommandSubmit} className="flex">
        <div style={getTerminalColorStyle()}>C:\&gt;</div>
        <input
          ref={inputRef}
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          className="flex-1 bg-transparent outline-none border-none ml-2"
          style={getTerminalColorStyle()}
          autoFocus
        />
      </form>
    </div>
  );
};

export default TerminalSimple;