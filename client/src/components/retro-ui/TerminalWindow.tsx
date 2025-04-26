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
  const [terminalOutput, setTerminalOutput] = useState<Array<{type: string, content: string}>>([
    { type: "system", content: "CraftingTableOS [Version 1.0.4815]" },
    { type: "system", content: "(c) 2025 CraftingTable LLC. Good luck on your hunt for the three golden keys" },
    { type: "system", content: "" },
    { type: "prompt", content: `${currentDirectory}>` }
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const [terminalColor, setTerminalColor] = useState("green");

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
    "calc": "Simple calculator (Usage: calc 5+5)",
    "exit": "Closes the terminal window"
  };

  // Fortune cookie messages
  const fortunes = [
    "A journey of a thousand miles begins with a single step.",
    "The greatest risk is not taking one.",
    "Code today, debug tomorrow.",
    "Hidden treasures await those who explore every directory.",
    "Your next quest will bring unexpected rewards.",
    "The circuit board of life has many connections.",
    "When the code works on the first try, be suspicious.",
    "Great adventures await in the digital realm.",
    "Your programming skills will improve with practice.",
    "The best error message is the one that never shows up."
  ];

  // ASCII art collection
  const asciiArt = {
    robot: `
      ,::////;::-.
    /:'///// \`::::/|/
    /'    /   / \`::/'
   /_    \`  \`.  \`\\ /
  //  \`-.   \`.   ///
 / /--. \`-.  \`-.////
/ /   \`.  \`-.  \`-.//
|/      \`-.  \`-.  /
'-._______.-'--._/
    `,
    castle: `
       /\\                 /\\
    __/  \\_______________/  \\__
    |_____|_____________|_____|
    |     |             |     |
 ___|_____|_____________|_____|___
 |                               |
 |_______________________________|
 |_|___|___|___|___|___|___|_|_|
    `,
    dragon: `
      <\\\\\\\\>//
      /<O> <O>\\
     /   V    \\
    /___n_n___\\
   /           \\
  /             \\
 /               \\
/_________________\\
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
          addToOutput("output", "Usage: ascii-art robot|castle|dragon");
        } else {
          const artType = args[0].toLowerCase();
          if (asciiArt[artType as keyof typeof asciiArt]) {
            asciiArt[artType as keyof typeof asciiArt].trim().split('\n').forEach(line => {
              addToOutput("output", line);
            });
          } else {
            addToOutput("error", `Art type '${artType}' not found.`);
            addToOutput("output", "Available types: robot, castle, dragon");
          }
        }
        break;
        
      case "calc":
        // Simple calculator
        if (args.length === 0) {
          addToOutput("output", "Usage: calc EXPRESSION (e.g., calc 5+5)");
        } else {
          const expression = args.join("");
          try {
            // Note: Using eval for simplicity in this demo - in production, a proper math parser would be better
            const result = eval(expression);
            addToOutput("output", `${expression} = ${result}`);
          } catch (error) {
            addToOutput("error", `Invalid expression: ${expression}`);
          }
        }
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