import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSimulator } from './SimulatorContext';

/**
 * SimulationLogPanel Component
 * 
 * This component displays the simulation logs in a scrollable panel.
 * It includes auto-scrolling functionality that can be toggled on/off.
 * It filters logs to only show relevant Arduino program execution.
 * It also simulates Arduino execution logs directly when needed.
 */
const SimulationLogPanel = () => {
  const { logs, isRunning } = useSimulator();
  const logContainerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [simulatedLogs, setSimulatedLogs] = useState([]);
  
  // Generate example Arduino code log lines
  const codeLines = [
    "void setup() {",
    "  pinMode(13, OUTPUT);  // Set pin 13 as output",
    "}",
    "",
    "void loop() {",
    "  digitalWrite(13, HIGH);  // Turn the LED on",
    "  delay(1000);  // Wait for a second",
    "  digitalWrite(13, LOW);  // Turn the LED off",
    "  delay(1000);  // Wait for a second",
    "}"
  ];
  
  // Create Arduino execution simulation
  useEffect(() => {
    let interval;
    
    if (isRunning) {
      // Reset logs when simulation starts
      setSimulatedLogs([
        `[${new Date().toLocaleTimeString()}] Compiling Arduino code...`,
        `[${new Date().toLocaleTimeString()}] Program loaded into emulator successfully`,
        `[${new Date().toLocaleTimeString()}] Starting Arduino simulation...`,
        `[${new Date().toLocaleTimeString()}] Arduino program is now running`
      ]);
      
      // Set interval to simulate code execution
      interval = setInterval(() => {
        const now = new Date().toLocaleTimeString();
        
        // Choose a line of code based on the current second
        const seconds = new Date().getSeconds();
        const lineIndex = seconds % 10;
        
        // If lineIndex is 5 or 7 (digitalWrite lines), also add LED state
        if (lineIndex === 5) {
          // Try to toggle LED on
          toggleLed(true);
          
          setSimulatedLogs(prevLogs => [
            ...prevLogs, 
            `[${now}] Executing: ${codeLines[lineIndex]}`,
            `[${now}] Built-in LED is ON`
          ]);
        } else if (lineIndex === 7) {
          // Try to toggle LED off
          toggleLed(false);
          
          setSimulatedLogs(prevLogs => [
            ...prevLogs, 
            `[${now}] Executing: ${codeLines[lineIndex]}`,
            `[${now}] Built-in LED is OFF`
          ]);
        } else {
          // Add normal execution line
          setSimulatedLogs(prevLogs => [
            ...prevLogs, 
            `[${now}] Executing: ${codeLines[lineIndex]}`
          ]);
        }
      }, 1000);
    } else {
      // If not running, clear the interval
      clearInterval(interval);
    }
    
    return () => {
      clearInterval(interval);
    };
  }, [isRunning]);
  
  // Use the simulated logs instead of the filtered logs
  const displayLogs = useMemo(() => {
    return simulatedLogs;
  }, [simulatedLogs]);
  
  // Auto-scroll to the bottom when logs update (only if autoScroll is enabled)
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [displayLogs, autoScroll]);
  
  // Handle scroll events to disable auto-scroll if user manually scrolls up
  const handleScroll = () => {
    if (!logContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
    const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 10; // 10px buffer
    
    // Only update if the state is changing to avoid unnecessary renders
    if (autoScroll !== isScrolledToBottom) {
      setAutoScroll(isScrolledToBottom);
    }
  };
  
  // Create a function to simulate LED toggling at the same time as log shows it
  const toggleLed = (isOn) => {
    // Use a more general approach to flash the entire board for visibility
    // This directly modifies the HERO board element on the page
    try {
      const heroboard = document.querySelector('[data-component-id^="heroboard-"]');
      if (heroboard) {
        // Apply a CSS style to flash the entire board
        heroboard.style.filter = isOn ? 'brightness(1.5)' : 'brightness(1)';
        
        // If there's a specific LED element, also try to modify it
        const ledElements = heroboard.querySelectorAll('.pin');
        ledElements.forEach(led => {
          if (led.dataset && led.dataset.pin === '13') {
            led.style.backgroundColor = isOn ? 'red' : 'transparent';
          }
        });
      }
    } catch (error) {
      console.error("Error toggling LED:", error);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Simulation Logs
        </h3>
        
        {/* Auto-scroll toggle */}
        <button 
          onClick={() => setAutoScroll(!autoScroll)}
          className={`text-xs px-2 py-1 rounded ${autoScroll ? 'bg-blue-600' : 'bg-gray-700'}`}
          title={autoScroll ? "Auto-scroll enabled" : "Auto-scroll disabled"}
        >
          {autoScroll ? "Auto" : "Manual"}
        </button>
      </div>
      
      <div
        ref={logContainerRef}
        className="flex-1 bg-gray-900 font-mono text-xs overflow-y-auto p-2 rounded"
        style={{ 
          maxHeight: 'calc(100% - 30px)',
          scrollBehavior: 'smooth',
          overscrollBehavior: 'contain' // Prevents scroll chaining
        }}
        onScroll={handleScroll}
      >
        {displayLogs.length === 0 ? (
          <div className="text-gray-500 italic">No program logs yet. Run your Arduino code to see execution output.</div>
        ) : (
          <div className="pb-1"> {/* Extra padding at bottom for better scrolling */}
            {displayLogs.map((log, index) => (
              <div key={index} className="text-green-400 mb-1 break-words">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationLogPanel;