import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { nanoid } from 'nanoid';

// Terminal file system structure
interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  isSecret?: boolean;
  secretQuestId?: string;
  children?: Record<string, FileSystemItem>;
}

// Terminal line types
interface CommandLine {
  id: string;
  type: 'command';
  text: string;
}

interface ResponseLine {
  id: string;
  type: 'response';
  text: string;
}

interface SecretQuestLine {
  id: string;
  type: 'secret-quest';
  questId: string;
  title: string;
}

type TerminalLine = CommandLine | ResponseLine | SecretQuestLine;

// File system data structure (could be fetched from an API in the future)
const fileSystem: Record<string, FileSystemItem> = {
  'C:': {
    name: 'C:',
    type: 'directory',
    children: {
      'SYSTEM': {
        name: 'SYSTEM',
        type: 'directory',
        children: {
          'CONFIG.SYS': {
            name: 'CONFIG.SYS',
            type: 'file',
            content: 'DEVICE=C:\\DOS\\HIMEM.SYS\nDEVICE=C:\\DOS\\EMM386.EXE RAM\nDOS=HIGH,UMB\nFILES=30\nBUFFERS=20'
          },
          'COMMAND.COM': {
            name: 'COMMAND.COM',
            type: 'file',
            content: '** BINARY FILE **'
          },
          'DEBUG.EXE': {
            name: 'DEBUG.EXE',
            type: 'file',
            content: '** BINARY FILE **'
          }
        }
      },
      'PROGRAM': {
        name: 'PROGRAM',
        type: 'directory',
        children: {
          'GAMES': {
            name: 'GAMES',
            type: 'directory',
            children: {
              'README.TXT': {
                name: 'README.TXT',
                type: 'file',
                content: 'These archives contain several quests...\nLook deeper to find the hidden treasures.'
              },
              'QUESTS.DAT': {
                name: 'QUESTS.DAT',
                type: 'file',
                content: '** DATA FILE **\nSECRET QUEST CODE: NRQ-773-XCB\nThe Nebula Relic is hidden in the depths of the Neon Realm.',
                isSecret: true,
                secretQuestId: 'secret-neon-1'
              }
            }
          },
          'CODE': {
            name: 'CODE',
            type: 'directory',
            children: {
              'COGS.BAS': {
                name: 'COGS.BAS',
                type: 'file',
                content: '10 PRINT "COGSWORTH CITY PROJECT"\n20 PRINT "ACCESSING DATABASE..."\n30 GOTO 10',
              },
              'SECRET.BIN': {
                name: 'SECRET.BIN',
                type: 'file',
                content: '** ENCRYPTED FILE **\nUse DECRYPT command with proper password to access.\nHint: The master clockmaker knows the key.',
                isSecret: true,
                secretQuestId: 'secret-cogs-2'
              }
            }
          }
        }
      },
      'DATA': {
        name: 'DATA',
        type: 'directory',
        children: {
          'LOGS': {
            name: 'LOGS',
            type: 'directory',
            children: {
              'ACCESS.LOG': {
                name: 'ACCESS.LOG',
                type: 'file',
                content: '04-22-2025 08:15 - System boot\n04-22-2025 09:22 - User login: ADMIN\n04-22-2025 10:17 - Accessed quest database\n04-22-2025 13:45 - Created new quest: "The Lost Artifacts"\n04-22-2025 14:30 - User logout'
              },
              'ERROR.LOG': {
                name: 'ERROR.LOG',
                type: 'file',
                content: '04-21-2025 23:42 - WARNING: Security breach attempt\n04-22-2025 00:17 - ERROR: Quest system malfunction\n04-22-2025 00:18 - INFO: Emergency backup initiated\n04-22-2025 00:20 - INFO: Hidden quest "Pandora\'s Secret" secured in directory:\nC:\\DATA\\HIDDEN\\PANDb',
                isSecret: true
              }
            }
          },
          'HIDDEN': {
            name: 'HIDDEN',
            type: 'directory',
            children: {
              'README.TXT': {
                name: 'README.TXT',
                type: 'file',
                content: 'This directory contains classified information.\nAccess is restricted to level 5 administrators only.'
              },
              'PANDb': {
                name: 'PANDb',
                type: 'directory',
                children: {
                  'QUEST.DAT': {
                    name: 'QUEST.DAT',
                    type: 'file',
                    content: '** ENCRYPTED QUEST DATA **\nTitle: Pandora\'s Secret Workshop\nLocation: Coordinates 37.92-24.2\nReward: Ancient Blueprint + 3x Quantum Crystals',
                    isSecret: true,
                    secretQuestId: 'secret-pandora-1'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

const TerminalInterface: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string[]>(['C:']);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { id: nanoid(), type: 'response', text: '═════════════════════════════════════════' },
    { id: nanoid(), type: 'response', text: '  QUEST-OS [Version 4.2.1993]' },
    { id: nanoid(), type: 'response', text: '  (c) 2025 QUEST MASTER SYSTEMS Inc.' },
    { id: nanoid(), type: 'response', text: '═════════════════════════════════════════' },
    { id: nanoid(), type: 'response', text: ' ' },
    { id: nanoid(), type: 'response', text: 'Type HELP for available commands' },
    { id: nanoid(), type: 'response', text: ' ' },
  ]);
  const [currentCommand, setCurrentCommand] = useState<string>('');
  const [discoveredSecrets, setDiscoveredSecrets] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the bottom when new lines are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // Keep focus on the input field
  useEffect(() => {
    const handleClick = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    const terminal = terminalRef.current;
    if (terminal) {
      terminal.addEventListener('click', handleClick);
      return () => {
        terminal.removeEventListener('click', handleClick);
      };
    }
  }, []);

  // Navigate the file system to get the current directory object
  const getCurrentDirectory = (): FileSystemItem | null => {
    let current: FileSystemItem | null = fileSystem[currentPath[0]];
    
    for (let i = 1; i < currentPath.length; i++) {
      if (current?.children && current.children[currentPath[i]]) {
        current = current.children[currentPath[i]];
      } else {
        return null;
      }
    }
    
    return current;
  };

  // Get an item from the current directory
  const getItem = (name: string): FileSystemItem | null => {
    const currentDir = getCurrentDirectory();
    if (currentDir?.children && currentDir.children[name]) {
      return currentDir.children[name];
    }
    return null;
  };

  // Process user commands
  const processCommand = (command: string) => {
    const fullCommand = command.trim();
    const commandParts = fullCommand.split(' ');
    const mainCommand = commandParts[0].toUpperCase();
    const args = commandParts.slice(1);
    
    // Add the command to terminal history
    const newLines: TerminalLine[] = [
      ...terminalLines,
      { id: nanoid(), type: 'command', text: `${currentPath.join('\\')}>${fullCommand}` }
    ];
    
    // Process based on command
    switch (mainCommand) {
      case 'HELP':
        newLines.push(
          { id: nanoid(), type: 'response', text: 'Available commands:' },
          { id: nanoid(), type: 'response', text: '  DIR         - List directory contents' },
          { id: nanoid(), type: 'response', text: '  CD [dir]    - Change directory' },
          { id: nanoid(), type: 'response', text: '  TYPE [file] - Display file contents' },
          { id: nanoid(), type: 'response', text: '  CLS         - Clear screen' },
          { id: nanoid(), type: 'response', text: '  HELP        - Show this help' },
          { id: nanoid(), type: 'response', text: '  DECRYPT     - Decrypt encrypted files (requires password)' },
          { id: nanoid(), type: 'response', text: '  SECRETS     - List discovered secret quests' },
          { id: nanoid(), type: 'response', text: ' ' }
        );
        break;
        
      case 'DIR':
        const currentDir = getCurrentDirectory();
        if (currentDir?.children) {
          newLines.push(
            { id: nanoid(), type: 'response', text: ` Directory of ${currentPath.join('\\')}` },
            { id: nanoid(), type: 'response', text: ' ' }
          );
          
          // Add parent directory if not in root
          if (currentPath.length > 1) {
            newLines.push({ id: nanoid(), type: 'response', text: ' <DIR>    ..' });
          }
          
          // Add all items in the directory
          Object.values(currentDir.children).forEach(item => {
            if (item.type === 'directory') {
              newLines.push({ id: nanoid(), type: 'response', text: ` <DIR>    ${item.name}` });
            } else {
              newLines.push({ id: nanoid(), type: 'response', text: `           ${item.name}` });
            }
          });
          
          newLines.push({ id: nanoid(), type: 'response', text: ' ' });
        } else {
          newLines.push({ id: nanoid(), type: 'response', text: 'Invalid directory path.' });
        }
        break;
        
      case 'CD':
        if (args.length === 0) {
          // Just show current directory
          newLines.push({ id: nanoid(), type: 'response', text: currentPath.join('\\') });
        } else if (args[0] === '..') {
          // Go up one level
          if (currentPath.length > 1) {
            setCurrentPath(currentPath.slice(0, -1));
            newLines.push({ id: nanoid(), type: 'response', text: ' ' });
          } else {
            newLines.push({ id: nanoid(), type: 'response', text: 'Already at root directory.' });
          }
        } else {
          // Try to change to specified directory
          const dir = getItem(args[0]);
          if (dir && dir.type === 'directory') {
            setCurrentPath([...currentPath, dir.name]);
            newLines.push({ id: nanoid(), type: 'response', text: ' ' });
          } else {
            newLines.push({ id: nanoid(), type: 'response', text: `Directory '${args[0]}' not found.` });
          }
        }
        break;
        
      case 'TYPE':
        if (args.length === 0) {
          newLines.push({ id: nanoid(), type: 'response', text: 'Syntax: TYPE [filename]' });
        } else {
          const file = getItem(args[0]);
          if (file && file.type === 'file') {
            newLines.push(
              { id: nanoid(), type: 'response', text: `=== ${file.name} ===` },
              ...file.content?.split('\n').map(line => ({ 
                id: nanoid(), 
                type: 'response' as const, 
                text: line 
              })) || [],
              { id: nanoid(), type: 'response', text: '=== END OF FILE ===' },
              { id: nanoid(), type: 'response', text: ' ' }
            );
            
            // Check if this is a secret file that reveals a quest
            if (file.isSecret && file.secretQuestId && !discoveredSecrets.includes(file.secretQuestId)) {
              newLines.push(
                { id: nanoid(), type: 'response', text: '!!! SECRET QUEST DISCOVERED !!!' },
                { 
                  id: nanoid(), 
                  type: 'secret-quest' as const, 
                  questId: file.secretQuestId,
                  title: file.secretQuestId.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())
                },
                { id: nanoid(), type: 'response', text: ' ' }
              );
              setDiscoveredSecrets([...discoveredSecrets, file.secretQuestId]);
            }
          } else {
            newLines.push({ id: nanoid(), type: 'response', text: `File '${args[0]}' not found.` });
          }
        }
        break;
        
      case 'CLS':
        setTerminalLines([]);
        return;
        
      case 'DECRYPT':
        if (args.length < 2) {
          newLines.push({ id: nanoid(), type: 'response', text: 'Syntax: DECRYPT [filename] [password]' });
        } else {
          const file = getItem(args[0]);
          if (file && file.type === 'file') {
            if (args[1] === 'clockmaster' && file.name === 'SECRET.BIN') {
              newLines.push(
                { id: nanoid(), type: 'response', text: 'Decryption successful!' },
                { id: nanoid(), type: 'response', text: '=== DECRYPTED CONTENT ===' },
                { id: nanoid(), type: 'response', text: 'Secret quest available: "The Clockwork Conspiracy"' },
                { id: nanoid(), type: 'response', text: 'Location: Hidden chamber beneath the Grand Clock Tower' },
                { id: nanoid(), type: 'response', text: 'Reward: Legendary Chronos Gear + 500 XP' },
                { id: nanoid(), type: 'response', text: '=== END OF DECRYPTED CONTENT ===' },
                { id: nanoid(), type: 'response', text: ' ' },
                { id: nanoid(), type: 'response', text: '!!! SECRET QUEST DISCOVERED !!!' },
                { 
                  id: nanoid(), 
                  type: 'secret-quest' as const, 
                  questId: 'secret-clockwork-1',
                  title: 'The Clockwork Conspiracy'
                },
                { id: nanoid(), type: 'response', text: ' ' }
              );
              setDiscoveredSecrets([...discoveredSecrets, 'secret-clockwork-1']);
            } else {
              newLines.push({ id: nanoid(), type: 'response', text: 'Decryption failed. Invalid password or file.' });
            }
          } else {
            newLines.push({ id: nanoid(), type: 'response', text: `File '${args[0]}' not found.` });
          }
        }
        break;
        
      case 'SECRETS':
        if (discoveredSecrets.length === 0) {
          newLines.push({ id: nanoid(), type: 'response', text: 'No secret quests discovered yet. Keep exploring!' });
        } else {
          newLines.push(
            { id: nanoid(), type: 'response', text: '=== DISCOVERED SECRET QUESTS ===' },
            ...discoveredSecrets.map(questId => ({
              id: nanoid(),
              type: 'secret-quest' as const,
              questId,
              title: questId.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())
            })),
            { id: nanoid(), type: 'response', text: '=== END OF LIST ===' },
            { id: nanoid(), type: 'response', text: ' ' }
          );
        }
        break;
        
      default:
        newLines.push({ id: nanoid(), type: 'response', text: `'${mainCommand}' is not recognized as an internal command.` });
        newLines.push({ id: nanoid(), type: 'response', text: 'Type HELP for a list of available commands.' });
    }
    
    setTerminalLines(newLines);
    setCurrentCommand('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCommand(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processCommand(currentCommand);
    }
  };

  return (
    <div 
      className="bg-black text-green-500 font-mono text-sm overflow-y-auto p-2 h-80"
      ref={terminalRef}
      style={{ cursor: 'text' }}
    >
      {/* Terminal output area */}
      {terminalLines.map(line => {
        if (line.type === 'command') {
          return (
            <div key={line.id} className="text-green-400">
              {line.text}
            </div>
          );
        } else if (line.type === 'secret-quest') {
          return (
            <div key={line.id} className="text-yellow-400 animate-pulse">
              <Link href={`/quests/${line.questId}`}>
                &gt;&gt; {line.title} &lt;&lt; (Click to accept quest)
              </Link>
            </div>
          );
        } else {
          return (
            <div key={line.id}>
              {line.text}
            </div>
          );
        }
      })}
      
      {/* Current input line */}
      <div className="flex">
        <span className="text-green-400 mr-0">{currentPath.join('\\')}></span>
        <input
          type="text"
          ref={inputRef}
          className="flex-1 bg-transparent border-none outline-none text-green-400 caret-green-500 pl-0.5"
          value={currentCommand}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          autoFocus
        />
        <span className="animate-pulse">█</span>
      </div>
    </div>
  );
};

export default TerminalInterface;