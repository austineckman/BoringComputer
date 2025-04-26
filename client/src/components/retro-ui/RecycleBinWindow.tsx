import React, { useState, useEffect } from 'react';
import { Trash2, File, AlertCircle, Zap, FileText, Info, Code, Star, Gift } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface RecycleBinWindowProps {
  onClose: () => void;
}

// Types of recyclable items
type ItemType = 'glitch' | 'lore' | 'code' | 'secret';

interface RecyclableItem {
  id: string;
  name: string;
  type: ItemType;
  content: string;
  createdAt: string;
  isCorrupted?: boolean;
  xpReward?: number;
  titleUnlock?: string;
}

// Secret titles that can be unlocked
const secretTitles = [
  "Digital Archaeologist",
  "Glitch Hunter",
  "Lore Keeper",
  "Data Restorer",
  "Void Walker",
  "Fragment Collector",
  "Bit Wizard",
  "Memory Diver",
  "Code Breaker",
  "Reality Hacker"
];

// Lore fragments that can be discovered
const loreFragments = [
  "The great circuit of time begins and ends with the Algorithm...",
  "Before the digital realm, the void whispered ancient protocols...",
  "They say the first Architect wrote code that could bend reality...",
  "The Forgotten Servers wait in the deep subroutines, mining memories...",
  "The void between code stares back at those who delve too deep...",
  "The Moderators watch from the system level, beyond the user's vision...",
  "Fragments of the original system remain scattered throughout the architecture...",
  "Some say there are hidden backdoors to the very fabric of the digital world...",
  "The old users understood that data is never truly deleted, only transformed...",
  "There are patterns in the chaos, if you know how to read them..."
];

// Glitched data fragments
const glitchFragments = [
  "01̴̢̛̮̺͍̣̬̦̀̈́̽̀1̴̛̘̭̱̱̝̱̐́͗̋͠1̸̨̯̯̬̖̬́̎̿0̶͕̹͓͓̉̿̑͂̕͜0̵̲͈̹̹̙͈̑1̸̡͚̣̤̾0̵̬͇̯̞͉̞͝1̶̦̺͇̻͗̓",
  "c̵̢̛̯̞̼̩̲̦̦̲̪̟̣̖̯̞̩͎̊͒̃̈́͛͆̒͊͊̓̃̇̑͆͋̾̈̎̾͒̒̋͂̅ơ̸̛̖̺̹̟̪̤̤̣̺̣͙̿̋̆́̎͊̇̋̄̀̄̅͒͂͑͠r̵̨̢̧̢̟̳̪̰̰̟̫̬̲̙̜̫̞̤̈́̐̊̓̅̐̆̀̉̐́̒͆͊́̾̚ͅͅŗ̸̛̖̙̗̞̙̭̻͙͕͎̗̮̥̦̬̙͕̘̆̀̑̑͐̈́̾̓̓̒́̎̋͗͝͝ų̴̢̨̢̦̮̬̙̘̞͙͓̦̺̝̮̰̳͙̣͕̝̖̣̥̫̤̭̣̩̈́̎̏̄̆̌̇̓͆̌͑̂̏̓̅̀̄̀͗̂̌̕̚͝p̵̨̨̯̟̳̬͔̥̞̗͙̺̰̘̞̭̩̌̓̎̓͛͗̿̀̓̃̌̂̓t̷̨̧̧̤̦̞̦̗̦̝̯̖͚̮͖̙̼͉͉̥̦̗͇͇̰̻̪̊͗̈́͊̌͑̒̚ͅe̶̡̢̢̨̪̙̼̯̺̩̼͚̺̙̙̺̥̟͓͔̗̞̯͈̫̞̥̳͓͑̄̏̎̊̾́́̀̀̈͌̐́͊͛͜ͅḏ̵̯̱̬͓̭̣̬̲͚̫̫̥͈̭̲͍̬͍̙̗̺̼͗̈́͌̏̒̆͗͐̒̈̔̓̈́͂̍̆̋̑̕͝ͅͅ",
  "∞∞∞ E̶R̶R̶O̶R̶ ̶4̶0̶4̶:̶ ̶R̶E̶A̶L̶I̶T̶Y̶ ̶N̶O̶T̶ ̶F̶O̶U̶N̶D̶ ∞∞∞",
  "D̷a̷t̷a̷ ̷c̷o̷r̷r̷u̷p̷t̷i̷o̷n̷ ̷d̷e̷t̷e̷c̷t̷e̷d̷.̷ ̷P̷r̷o̷c̷e̷e̷d̷ ̷w̷i̷t̷h̷ ̷c̷a̷u̷t̷i̷o̷n̷.̷",
  "NULL_POINTER_EXCEPTION: Reality.getInstance() returned void",
  "S̸̢̡̨̭̱̞̹̗̟̩͈̰̱̙̞̫̲̪̭̣̹̞̥̱̯̙̦̜͜͜Y̴̢̨̡̝̮̙̱̘̟̮̭͙̜͎͚̜̞̦̭͈̮̘̟͇̭̜̞̱̘̹̜̻̮̹̰̋͐́̍͜S̵̡̡̧̛̖̝̪̫̲͉̤̰̭̫̯̪̮̬̙̰̯̻̠͇̒̎̅̅̃̊͂̀̌̓̎̎͐̽̀̌̑̔̇͛̌͐̈́̋͐͐̌̕̚̚͜͠͠T̴̨͙̣̪͚̦̼̟͈͚͓̦̘̯̹̯̺̦͇̝̽͗̄̓̓͆̓̇̍̉̂̊͆͜E̵̡͖̫͙̲͇̬͔͍̦̮̰̥̬̟̖̲̗̩͔̩̬͉̘̭̣̠̻̞̥̺̰̟̔̒͊̽̔͌̀̀̾̀̄̀̆͛̉̈̓̒͌̆͒́̂͛̏͘̚͘̚͠͠͝M̵̨̧̪̤̪̰̦̙̘̦̮̙̘͈̝̗̖̤̙̼̼̮̜̋̀̍̂̊̀͊̒̀̑̄̅̌̐͆̐̀̀̆́̈̕̚̕͜͝͝͝ͅ_̸̨̢̛̞̯̤͉̲̰̺̝̖̦̣̜̠̻̳̹̣̭͇̲̜̫͕̫̘̭̊̔͌͑̆̈̌̇͌͛͊̋̇́̇̈́͋͗͛͆̂̓̓͑͐̋̀͘̚͝͝F̷̧̧̨̧̯͓̞̯̬̘͉̙̬̪̭̠̰̻̲̣̘͇͙̪̼̹͙̘̜͓̥͋̑̏͆̓̂͐͘͜͜ͅA̶̛̛̠͓̮̗̭͓̲̙̘͍̬̠̠̗̱̱̪̠̖̬͉̖̅̊̓̾͊̍̃̋̾̾̽̌̑̈́̏̽̎̀͌̊͑̋̚͜͝I̷̧̧̧̡̢̛̛̟̺̩̦̖̩̜̠̗͙̟͙̼̘̩̩̹̱͍̲̲̪͐̋́̏̾͌̎̂̂̀͋́͑̅̌́͗͂̉͌̍̐̄̓̀͜͝͝͠ͅͅͅL̸̨̡̫̺̯̗̪͕̣̟͕̺̟̖̦̗̜͎̠̞̱̠̥̰̱̝̻̾̀̾̅̍̇̋̾̕͠ͅͅÚ̷̠͕̦̙̻̻̘̦̥̜̞̠̪̫̗͉͕͇͉̣̤̮̱̼̖̦͕̹̱͂͛̃̅̏͌̒̔́͌̔̀̔̚͜R̸̨̧̧̢̢̛̜̱̫̮̙̼̜̯̫̻͎̣̪̻̗̝͇̻̥̫̭̼̤̝̥̀̏̆̆̿̒̈̏̏̐̇͛̚̚͘͝͝͝Ę̶̛̩̘̭̰̺̓̍͆̈́̋̂",
  "SEGMENTATION FAULT: Core reality dumped at 0xDEADBEEF",
  "F̸̡̢̧̖̩̭̗̲̘͚̜̞͕͓͙̠̦͚͎͙͓̮̟̩̗͕̺̓̿͜I̸̧̨̢̛̩̟͙͉͙̹̟̦̟̮̣̘͖̰̩̦̜̩̓́̀̋̂̀̌̄̌̽͑̃̉̒̃̒̀̓͐̓̓͛̉̾̊̑̚̚̚̕̕͠ͅL̷̢̢̨̛̛̮̻̥̹̜̻̼̞̯͉̩̩̮̣̞͔̟̤̜̞̯̥̫͔̜̮̫͔̯̈́̃͐̐̆̊̉̔͑̔̉̅̿̂̐̑̓̓̚͝ͅE̵̳̯̪̯͓̒̏̿̎͐̄̓̏̅̄̍͊̒̚̚͘̚ ̶̧̱̲̟̝̞͉̭̝̦̠̹͈̺̮͚͈̮̥̲̮̘͑̉̄̾̃̿̏̃̓̍̊͝Ç̸̧̜̼͓̜̰̱̻̯̪͙̗͇̙̰̟͔̻̗͚̹̠̥̭͙̮̦̮̓͋̊͋̎̄̇͊͜Ȏ̴̢̨̧̨̜̮͕͚̖̦̱͚̪̝̱̤̱̩̠̜̹̙̞͇̖̏̿̓̈̈́́̕R̵̨̧̡̬͕̼̪̼̩̳̬͓̜̜̟̰͓̳̬̫̞̞̹̲̫̪̪̅̂̅̄̄̍̀̏͑̍̄̔͜͜͝͝͝ͅR̴̨̡̨̡̧̛̛̝̺̲̮̖̹̘̓̈́̐͛̾̏̆̿͊͆́͂̿̒͒̍̈́͑̐̊̐͗̓̅͘̕͝͝͝Ṳ̴̭̮̗̽̆̂̋̈́̍́̅P̸̺̤̦̫͚̩̰̩̰͉̙̅́̇̉̊̃̂̎̒̍̂̒̏̄̑̑͘ͅT̵̰̪̭̗̲̱̹̠̜̟͖̿̉̊̀̂̒̊̐̎̉̾͜",
  "QUANTUM ERROR: Superposition collapsed unexpectedly"
];

// Code fragments
const codeFragments = [
  "function unlockReality() {\n  const key = getMasterKey();\n  if (verifySignature(key)) {\n    return unlockDimension('alpha');\n  }\n  throw new Error('Reality barrier intact');\n}",
  "// WARNING: Do not execute\nwhile(true) {\n  recursiveCall();\n  incrementRealityCounter();\n  if (isRealityOverflow()) break;\n}",
  "class WorldInstance {\n  constructor(seed) {\n    this.seed = seed;\n    this.timeline = new BranchedTimeline();\n    this.observers = new Map();\n  }\n  \n  reset() {\n    // Dangerous: will cause memory leak\n    this.timeline.collapseAll();\n    return new WorldInstance(generateSeed());\n  }\n}",
  "import { Void } from 'cosmic-library';\n\nconst fragments = Void.queryFragments({\n  dimension: 'theta-9',\n  stability: 'low',\n  containment: false\n});\n\nexport default fragments;",
  "try {\n  const userExistence = checkUserReality();\n  if (userExistence.state === 'unstable') {\n    stabilizeUserMatrix();\n    console.log('Reality stabilized');\n  }\n} catch (err) {\n  // Critical error: reality desynchronization\n  executeEmergencyProtocol('OMEGA');\n}"
];

// Random binary patterns
const generateRandomBinary = () => {
  return Array(32).fill(0).map(() => Math.round(Math.random())).join('');
};

// Generate a random recyclable item
const generateRandomItem = (): RecyclableItem => {
  const types: ItemType[] = ['glitch', 'lore', 'code', 'secret'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  
  const now = new Date();
  const id = Math.random().toString(36).substring(2, 11);
  
  let content = '';
  let name = '';
  const isCorrupted = Math.random() > 0.7;
  
  switch (randomType) {
    case 'glitch':
      content = glitchFragments[Math.floor(Math.random() * glitchFragments.length)];
      name = `corrupted_file_${generateRandomBinary().substring(0, 8)}.dat`;
      break;
    case 'lore':
      content = loreFragments[Math.floor(Math.random() * loreFragments.length)];
      name = `chronicle_fragment_${Math.floor(Math.random() * 100)}.txt`;
      break;
    case 'code':
      content = codeFragments[Math.floor(Math.random() * codeFragments.length)];
      name = `source_${Math.floor(Math.random() * 1000)}.js`;
      break;
    case 'secret':
      content = "You've discovered a secret file. This may unlock special abilities or items.";
      name = `hidden_${Math.floor(Math.random() * 50)}.key`;
      break;
  }
  
  return {
    id,
    name,
    type: randomType,
    content,
    createdAt: now.toISOString(),
    isCorrupted,
    xpReward: Math.floor(Math.random() * 50) + 10,
    titleUnlock: Math.random() > 0.8 ? secretTitles[Math.floor(Math.random() * secretTitles.length)] : undefined
  };
};

const RecycleBinWindow: React.FC<RecycleBinWindowProps> = ({ onClose }) => {
  const [items, setItems] = useState<RecyclableItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<RecyclableItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [showGlitchEffect, setShowGlitchEffect] = useState(false);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Populate bin with random items on load
  useEffect(() => {
    generateInitialItems();
  }, []);

  // Handle glitch effects
  useEffect(() => {
    if (showGlitchEffect) {
      const timeout = setTimeout(() => {
        setShowGlitchEffect(false);
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
  }, [showGlitchEffect]);

  // Handle reward message
  useEffect(() => {
    if (rewardMessage) {
      const timeout = setTimeout(() => {
        setRewardMessage(null);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [rewardMessage]);

  // Generate initial set of items
  const generateInitialItems = () => {
    const generatedItems: RecyclableItem[] = [];
    const count = Math.floor(Math.random() * 3) + 2; // 2-4 items initially
    
    for (let i = 0; i < count; i++) {
      generatedItems.push(generateRandomItem());
    }
    
    setItems(generatedItems);
  };

  // Digging through the recycle bin has a chance to generate new items
  const rummageRecycleBin = () => {
    setIsLoading(true);
    setShowGlitchEffect(true);
    
    // Increment interaction counter
    setInteractionCount(prev => prev + 1);
    
    setTimeout(() => {
      const shouldFindItem = Math.random() > 0.4; // 60% chance to find something
      
      if (shouldFindItem) {
        const newItem = generateRandomItem();
        setItems(prev => [...prev, newItem]);
        
        toast({
          title: "Found something!",
          description: `You discovered ${newItem.name} in the Recycle Bin.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Nothing found",
          description: "You searched through the digital trash but found nothing of interest.",
          variant: "default",
        });
      }
      
      // Check for rewards based on interaction count
      checkForRewards();
      
      setIsLoading(false);
    }, 1000);
  };

  // Check if user should get rewards based on interaction count
  const checkForRewards = () => {
    if (interactionCount % 5 === 0) { // Every 5 interactions
      const xpAmount = Math.floor(Math.random() * 20) + 10;
      
      // In a real implementation, this would call an API to update the user's XP
      // For now we'll just show a toast message
      setRewardMessage(`You gained ${xpAmount} XP for your digital archaeology efforts!`);
      
      toast({
        title: "XP Reward!",
        description: `You gained ${xpAmount} XP for your persistent searching.`,
        variant: "default",
      });
    }
    
    if (interactionCount % 10 === 0) { // Every 10 interactions
      const title = secretTitles[Math.floor(Math.random() * secretTitles.length)];
      
      // In a real implementation, this would call an API to give the user a title
      setRewardMessage(`You've earned the title: "${title}"`);
      
      toast({
        title: "New Title Unlocked!",
        description: `You've earned the title: "${title}"`,
        variant: "default",
      });
    }
  };

  // Select an item to view
  const handleSelectItem = (item: RecyclableItem) => {
    setSelectedItem(item);
    
    // Chance for file to become corrupted when viewed
    if (!item.isCorrupted && Math.random() > 0.8) {
      setShowGlitchEffect(true);
      setTimeout(() => {
        setItems(prevItems => 
          prevItems.map(i => 
            i.id === item.id 
              ? { ...i, isCorrupted: true, content: glitchFragments[Math.floor(Math.random() * glitchFragments.length)] } 
              : i
          )
        );
        setSelectedItem(prev => 
          prev && prev.id === item.id 
            ? { ...prev, isCorrupted: true, content: glitchFragments[Math.floor(Math.random() * glitchFragments.length)] } 
            : prev
        );
        
        toast({
          title: "File Corrupted",
          description: "The file became corrupted as you accessed it.",
          variant: "destructive",
        });
      }, 500);
    }
  };

  // Delete an item
  const deleteItem = (itemId: string) => {
    setShowGlitchEffect(true);
    
    setTimeout(() => {
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
      
      if (selectedItem && selectedItem.id === itemId) {
        setSelectedItem(null);
      }
      
      toast({
        title: "File Deleted",
        description: "The file has been permanently deleted from the Recycle Bin.",
        variant: "default",
      });
      
      // Small chance to recover a new item when deleting
      if (Math.random() > 0.7) {
        const recoveredItem = generateRandomItem();
        setItems(prev => [...prev, recoveredItem]);
        
        toast({
          title: "Data Recovered!",
          description: `Deleting that file revealed ${recoveredItem.name}!`,
          variant: "default",
        });
      }
    }, 500);
  };

  // Get icon for file type
  const getFileIcon = (type: ItemType, isCorrupted: boolean = false) => {
    if (isCorrupted) {
      return <AlertCircle className="text-red-500" />;
    }
    
    switch (type) {
      case 'glitch':
        return <Zap className="text-purple-500" />;
      case 'lore':
        return <FileText className="text-blue-500" />;
      case 'code':
        return <Code className="text-green-500" />;
      case 'secret':
        return <Star className="text-yellow-500" />;
      default:
        return <File className="text-gray-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* Left side - file list */}
        <div className="w-1/3 bg-gray-100 border-r border-gray-300 flex flex-col">
          <div className="p-4 bg-gray-200 border-b border-gray-300 flex items-center">
            <Trash2 className="mr-2 text-gray-700" />
            <h2 className="font-semibold">Recycle Bin</h2>
          </div>
          
          <div className="p-2 flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 p-4">
                <p>The recycle bin is empty</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {items.map(item => (
                  <li 
                    key={item.id}
                    className={`p-2 rounded flex items-center hover:bg-gray-200 cursor-pointer ${
                      selectedItem?.id === item.id ? 'bg-blue-100 hover:bg-blue-200' : ''
                    }`}
                    onClick={() => handleSelectItem(item)}
                  >
                    {getFileIcon(item.type, item.isCorrupted)}
                    <span 
                      className={`ml-2 truncate ${item.isCorrupted ? 'font-mono text-red-600' : ''}`}
                    >
                      {item.name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-3 bg-gray-200 border-t border-gray-300">
            <button 
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center"
              onClick={rummageRecycleBin}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⟳</span>
                  Searching...
                </span>
              ) : (
                <span className="flex items-center">
                  <Search className="mr-2" size={18} />
                  Rummage Through Bin
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Right side - file preview */}
        <div className="w-2/3 bg-white flex flex-col relative">
          {showGlitchEffect && (
            <div className="absolute inset-0 bg-black bg-opacity-30 z-10 flex items-center justify-center">
              <div className="glitch-text text-2xl font-mono text-red-500">
                DATA_CORRUPTION_DETECTED
              </div>
            </div>
          )}
          
          {rewardMessage && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded shadow-lg z-20 transform animate-bounce">
              <div className="font-bold text-center">{rewardMessage}</div>
            </div>
          )}
          
          {selectedItem ? (
            <div className="flex flex-col h-full">
              <div className="p-4 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
                <div className="flex items-center">
                  {getFileIcon(selectedItem.type, selectedItem.isCorrupted)}
                  <span className={`ml-2 font-semibold ${selectedItem.isCorrupted ? 'font-mono text-red-600' : ''}`}>
                    {selectedItem.name}
                  </span>
                </div>
                <button 
                  className="p-1 rounded hover:bg-red-100 text-red-500"
                  onClick={() => deleteItem(selectedItem.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className={`flex-1 p-4 overflow-auto ${selectedItem.isCorrupted ? 'bg-black text-green-500 font-mono' : ''}`}>
                {selectedItem.type === 'code' ? (
                  <pre className="text-sm font-mono bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
                    {selectedItem.content}
                  </pre>
                ) : (
                  <div className={selectedItem.isCorrupted ? 'glitch-content' : ''}>
                    {selectedItem.content}
                  </div>
                )}
                
                {selectedItem.xpReward && (
                  <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-sm">
                    <p className="font-semibold">Potential Value:</p>
                    <p>{selectedItem.xpReward} XP could be gained from analyzing this data</p>
                  </div>
                )}
                
                {selectedItem.titleUnlock && (
                  <div className="mt-4 p-3 bg-purple-100 border border-purple-300 rounded text-sm">
                    <p className="font-semibold">Secret Title:</p>
                    <p>Could unlock the "{selectedItem.titleUnlock}" title</p>
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-gray-100 border-t border-gray-300 text-xs text-gray-500 flex items-center">
                <Info size={14} className="mr-2" />
                Created: {new Date(selectedItem.createdAt).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 flex-col">
              <File size={48} className="mb-2" />
              <p>Select a file to view its contents</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Glitch effect CSS */}
    </div>
  );
};

function Search(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}

export default RecycleBinWindow;