import React, { useState, useEffect } from 'react';

interface RetroBootScreenProps {
  onComplete?: () => void;
}

const RetroBootScreen: React.FC<RetroBootScreenProps> = ({ onComplete }) => {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayText, setDisplayText] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const bootSequence = [
    "CRAFTINGTABLE OS v2.1.7 (c) 2025 Inventr Labs",
    "Initializing Discord OAuth Module...",
    "Checking authentication tokens...",
    "Verifying user permissions...",
    "",
    "ACCESS GRANTED",
    "Loading user profile...",
    "Establishing secure connection...",
    "Synchronizing Discord roles...",
    "",
    "════════════════════════════════════════════════════════════════",
    "",
    "GIZBO'S WORKSHOP TERMINAL v3.2.1",
    "Scraplight Cartel Network Access",
    "",
    ">>> GIZBO: Well, well, well... another tinkerer enters my domain!",
    ">>> GIZBO: Welcome to the Scraplight Cartel, friend. I'm Gizbo",
    ">>> GIZBO: Sparkwrench - first of my name, last of my patience.",
    "",
    ">>> GIZBO: Your Discord credentials check out. Good, good...",
    ">>> GIZBO: I was getting tired of random pirates trying to",
    ">>> GIZBO: muscle in on my perfectly legitimate business operation.",
    "",
    ">>> GIZBO: Since the Great Collapse tore reality apart, I've been",
    ">>> GIZBO: scavenging the finest dimension-cracking components",
    ">>> GIZBO: that fall from the rifts. Business is booming!",
    "",
    ">>> GIZBO: But enough chatter - you're here to learn, tinker, and",
    ">>> GIZBO: maybe snag some rare components from my vault, eh?",
    "",
    ">>> GIZBO: Remember: If you can fix it, you can own it.",
    ">>> GIZBO: Now let's get you set up with the workshop interface...",
    "",
    "Initializing CraftingTable OS desktop environment...",
    "Loading component libraries...",
    "Preparing workshop tools...",
    "Establishing quest database connection...",
    "",
    "SYSTEM READY",
    "Welcome to CraftingTable OS!"
  ];

  const [typingIndex, setTypingIndex] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    if (currentLine >= bootSequence.length) {
      setIsComplete(true);
      if (onComplete) {
        setTimeout(onComplete, 1000);
      }
      return;
    }

    const currentText = bootSequence[currentLine];
    
    if (currentChar <= currentText.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => {
          const newText = [...prev];
          newText[currentLine] = currentText.substring(0, currentChar);
          return newText;
        });
        setCurrentChar(currentChar + 1);
      }, currentText.length === 0 ? 50 : Math.random() * 30 + 20); // Faster for empty lines

      return () => clearTimeout(timer);
    } else {
      // Line complete, move to next
      const timer = setTimeout(() => {
        setCurrentLine(currentLine + 1);
        setCurrentChar(0);
      }, currentText.includes("GIZBO:") ? 600 : 200); // Longer pause for Gizbo lines

      return () => clearTimeout(timer);
    }
  }, [currentLine, currentChar, bootSequence, onComplete]);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono text-sm p-4 overflow-hidden">
      {/* CRT Screen Effect */}
      <div className="relative min-h-screen">
        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400 to-transparent opacity-10 animate-pulse"></div>
          <div 
            className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400 to-transparent opacity-5"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(34, 197, 94, 0.1) 2px,
                rgba(34, 197, 94, 0.1) 4px
              )`
            }}
          ></div>
        </div>

        {/* Terminal Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="border-b border-green-400 pb-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400">SYSTEM TERMINAL</span>
              </div>
              <div className="text-green-400 text-xs">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Boot Sequence */}
          <div className="space-y-1">
            {displayText.map((line, index) => (
              <div key={index} className="flex items-start">
                <span className="text-green-600 mr-2">
                  {line.includes("GIZBO:") ? ">>>" : 
                   line.includes("ACCESS GRANTED") || line.includes("SYSTEM READY") ? "***" : 
                   line.includes("═") ? "" : ">>>"}
                </span>
                <span className={`${
                  line.includes("ACCESS GRANTED") ? "text-green-300 font-bold animate-pulse" :
                  line.includes("SYSTEM READY") ? "text-green-300 font-bold" :
                  line.includes("GIZBO:") ? "text-yellow-400" :
                  line.includes("Initializing") || line.includes("Loading") || line.includes("Checking") ? "text-blue-400" :
                  line.includes("═") ? "text-gray-500" :
                  "text-green-400"
                }`}>
                  {line}
                </span>
                {index === currentLine && currentChar <= bootSequence[currentLine].length && (
                  <span className="text-green-400 animate-pulse ml-1">█</span>
                )}
              </div>
            ))}
          </div>

          {/* Progress indicator */}
          {!isComplete && (
            <div className="fixed bottom-8 left-4 right-4">
              <div className="flex items-center space-x-4">
                <div className="text-green-400 text-xs">
                  Authenticating... {Math.round((currentLine / bootSequence.length) * 100)}%
                </div>
                <div className="flex-1 h-2 bg-gray-800 border border-green-400">
                  <div 
                    className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300"
                    style={{ width: `${(currentLine / bootSequence.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Completion message */}
          {isComplete && (
            <div className="fixed bottom-8 left-4 right-4 text-center">
              <div className="text-green-300 font-bold animate-pulse">
                AUTHENTICATION COMPLETE - LAUNCHING DESKTOP...
              </div>
            </div>
          )}
        </div>

        {/* CRT Glow Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-green-400 opacity-5 blur-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-transparent to-transparent opacity-10"></div>
        </div>
      </div>
    </div>
  );
};

export default RetroBootScreen;