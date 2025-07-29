import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCcw, Trash2, ZoomIn, ZoomOut, Move, Play, Save, FileCode, Download } from 'lucide-react';
import AceEditor from 'react-ace';
import ace from 'ace-builds';

// Configure ace paths properly
ace.config.set('basePath', '/node_modules/ace-builds/src-noconflict');
ace.config.set('modePath', '/node_modules/ace-builds/src-noconflict');
ace.config.set('themePath', '/node_modules/ace-builds/src-noconflict');

// Import Arduino syntax highlighting and theme
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

import { 
  oledDisplayExample, 
  sevenSegmentExample, 
  keypadExample, 
  rotaryEncoderExample, 
  multiLibraryExample,
  rgbLedExample,
  buzzerExample
} from '../circuit-builder/simulator/exampleLibraryCode';

// Import our CircuitBuilder component
import CircuitBuilder from '../circuit-builder/CircuitBuilder';

// Import simulator components
import { SimulatorProvider, useSimulator } from '../circuit-builder/simulator/SimulatorContext';
import SimplifiedLogPanel from '../circuit-builder/simulator/SimplifiedLogPanel';
// Import only the proper simulator - legacy simulator removed to enforce hardware emulation
// import AVR8Simulator from '../circuit-builder/simulator/AVR8Simulator'; // REMOVED - uses keyword-based shortcuts
// Import our proper AVR8 simulator 

// import SimulationLogPanel from '../circuit-builder/simulator/SimulationLogPanel';
// import SimulationVisualizer from '../circuit-builder/simulator/SimulationVisualizer';
import { defaultSketch, parseLibraryImports, parseDigitalWrites } from '../circuit-builder/simulator/SimulatorUtils';
import { LibraryManagerProvider } from '../circuit-builder/simulator/LibraryManager';
// import { validateArduinoCode } from '../circuit-builder/simulator/ArduinoCompiler';

// Legacy imports (keeping for compatibility with existing code)
import { 
  componentOptions, 
  createComponent, 
  renderComponent, 
  ComponentData 
} from '../circuit-builder/ComponentGenerator';
import CircuitWire from '../circuit-builder/CircuitWire';
import CircuitPin from '../circuit-builder/CircuitPin';

// Define the PinPosition interface
interface PinPosition {
  id: string;
  x: number;
  y: number;
}

// Types for wire connections
interface WireConnection {
  id: string;
  startPin: PinPosition;
  endPin: PinPosition;
  color: string;
}

interface CircuitBuilderWindowProps {
  onClose: () => void;
}

interface NotificationType {
  message: string;
  type: string;
}

const CircuitBuilderWindow: React.FC<CircuitBuilderWindowProps> = ({ onClose }) => {
  // State for components and wires
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [wires, setWires] = useState<WireConnection[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [selectedWire, setSelectedWire] = useState<string | null>(null);
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // State for creating a wire
  const [wireCreationMode, setWireCreationMode] = useState(false);
  const [wireStartPin, setWireStartPin] = useState<PinPosition | null>(null);
  const [wireEndPin, setWireEndPin] = useState<PinPosition | null>(null);
  const [tempWirePosition, setTempWirePosition] = useState<{ x: number; y: number } | null>(null);
  
  // Canvas view state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Code editor state
  const [editorReady, setEditorReady] = useState(false);
  
  // Default Arduino code for new projects
  const defaultCode = `// This example blinks an LED connected to pin 13 (or the built-in LED)
// This is a great first test for your Arduino setup!

void setup() {
  // Initialize digital pin LED_BUILTIN (usually pin 13) as an output
  pinMode(LED_BUILTIN, OUTPUT);
  
  // Add more pin initializations here if needed
  // For example: pinMode(10, OUTPUT); // for another LED
}

void loop() {
  // Turn the LED on
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);  // Wait for 1 second (1000 milliseconds)
  
  // Turn the LED off
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);  // Wait for 1 second
  
  // The loop repeats indefinitely
}

/* 
  Common Arduino functions:
  
  - digitalWrite(pin, value): Sets a digital pin to HIGH or LOW
  - digitalRead(pin): Reads a digital pin, returns HIGH or LOW
  - analogWrite(pin, value): Sets an analog value (PWM) on a pin (0-255)
  - analogRead(pin): Reads an analog input, returns 0-1023
  - delay(ms): Pauses program execution for 'ms' milliseconds
  - millis(): Returns time since program started in milliseconds
  
  Available libraries (include with #include <LibraryName.h>):
  
  - U8g2lib.h: For OLED displays
  - TM1637Display.h: For 7-segment displays 
  - Keypad.h: For matrix keypads
  - BasicEncoder.h: For rotary encoders
*/`;
  
  // References
  const canvasRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const gridSize = 20; // Size of grid squares in pixels

  // Simple editor for now
  useEffect(() => {
    setEditorReady(true);
  }, []);

  // Generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  // Add a new component to the canvas
  const addComponent = (componentName: string) => {
    // Default position in the center of visible canvas
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    let centerX = 0;
    let centerY = 0;
    
    if (canvasRect) {
      centerX = (canvasRect.width / 2 - pan.x) / zoom;
      centerY = (canvasRect.height / 2 - pan.y) / zoom;
    }
    
    const newComponent = createComponent(componentName);
    
    // Update position to be centered in the current view
    newComponent.attrs.left = Math.round(centerX / gridSize) * gridSize;
    newComponent.attrs.top = Math.round(centerY / gridSize) * gridSize;
    
    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent.id);
    setSelectedWire(null);
  };

  // Delete the selected component or wire
  const deleteSelectedItem = () => {
    if (selectedComponent) {
      // Remove the component
      setComponents(components.filter(c => c.id !== selectedComponent));
      
      // Also remove any wires connected to this component
      const updatedWires = wires.filter(wire => 
        !wire.startPin.id.startsWith(`${selectedComponent}-`) && 
        !wire.endPin.id.startsWith(`${selectedComponent}-`)
      );
      setWires(updatedWires);
      setSelectedComponent(null);
    } else if (selectedWire) {
      // Remove the wire
      setWires(wires.filter(w => w.id !== selectedWire));
      setSelectedWire(null);
    }
  };

  // Rotate the selected component
  const rotateSelectedComponent = () => {
    if (selectedComponent) {
      setComponents(components.map(c => {
        if (c.id === selectedComponent) {
          return {
            ...c,
            attrs: {
              ...c.attrs,
              rotate: (c.attrs.rotate + 90) % 360
            }
          };
        }
        return c;
      }));
    }
  };

  // Handle component mouse down event for dragging
  const handleComponentMouseDown = (id: string, isActive: boolean) => {
    if (!isActive) return;
    
    setSelectedComponent(id);
    setSelectedWire(null);
    
    const component = components.find(c => c.id === id);
    if (!component) return;
    
    setDraggingComponent(id);
    setDragOffset({ x: 10, y: 10 }); // Offset from top-left corner
  };

  // Handle mouse move for dragging components
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingComponent) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      // Calculate new position
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      const left = Math.round(((mouseX - dragOffset.x) / zoom - pan.x) / gridSize) * gridSize;
      const top = Math.round(((mouseY - dragOffset.y) / zoom - pan.y) / gridSize) * gridSize;
      
      setComponents(components.map(c => {
        if (c.id === draggingComponent) {
          return { 
            ...c, 
            attrs: {
              ...c.attrs,
              left,
              top
            } 
          };
        }
        return c;
      }));
    } else if (isPanning) {
      // Handle canvas panning
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      
      setPan({
        x: pan.x + dx,
        y: pan.y + dy
      });
      
      setPanStart({
        x: e.clientX,
        y: e.clientY
      });
    } else if (wireCreationMode && wireStartPin) {
      // Show wire while dragging
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        setTempWirePosition({
          x: e.clientX - canvasRect.left,
          y: e.clientY - canvasRect.top
        });
      }
    }
  };

  // Handle mouse up to stop dragging
  const handleCanvasMouseUp = () => {
    setDraggingComponent(null);
    setIsPanning(false);
    
    // Clear temporary wire if we're not connecting to a pin
    if (wireCreationMode && !wireEndPin) {
      setWireCreationMode(false);
      setWireStartPin(null);
      setTempWirePosition(null);
    }
  };

  // Handle mouse down on the canvas for panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Clear any selection when clicking on the canvas
    if (!wireCreationMode) {
      setSelectedComponent(null);
      setSelectedWire(null);
    }
    
    // Only start panning if the middle mouse button (wheel) is pressed or 
    // if holding the spacebar and using left click
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY
      });
      e.preventDefault();
    }
  };

  // Handle wheel for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Get the cursor position relative to the canvas
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;
    
    // Calculate the point on the canvas under the cursor before zooming
    const pointXBeforeZoom = mouseX / zoom - pan.x;
    const pointYBeforeZoom = mouseY / zoom - pan.y;
    
    // Adjust zoom based on wheel direction
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom * zoomDelta));
    
    // Calculate the point after zooming
    const pointXAfterZoom = mouseX / newZoom - pan.x;
    const pointYAfterZoom = mouseY / newZoom - pan.y;
    
    // Adjust pan to keep the point under the cursor
    const panXDelta = pointXAfterZoom - pointXBeforeZoom;
    const panYDelta = pointYAfterZoom - pointYBeforeZoom;
    
    setZoom(newZoom);
    setPan({
      x: pan.x + panXDelta,
      y: pan.y + panYDelta
    });
  };

  // Key handler for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedItem();
      } else if (e.key === 'r') {
        rotateSelectedComponent();
      } else if (e.key === 'Escape') {
        // Cancel wire creation mode
        if (wireCreationMode) {
          setWireCreationMode(false);
          setWireStartPin(null);
          setTempWirePosition(null);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, selectedWire, wireCreationMode, wireStartPin]);

  // Handle pin click for wire creation
  const handlePinClick = (pinId: string) => {
    if (!wireCreationMode) {
      // Start wire creation
      setWireCreationMode(true);
      
      // Get the pin element position
      const pinElement = document.getElementById(pinId);
      if (pinElement) {
        const pinRect = pinElement.getBoundingClientRect();
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        
        if (canvasRect) {
          // Calculate pin position relative to canvas
          const pinX = (pinRect.left + pinRect.width/2 - canvasRect.left) / zoom - pan.x;
          const pinY = (pinRect.top + pinRect.height/2 - canvasRect.top) / zoom - pan.y;
          
          const startPin: PinPosition = {
            id: pinId,
            x: pinX,
            y: pinY,
          };
          
          setWireStartPin(startPin);
        }
      }
    } else if (wireStartPin && wireStartPin.id !== pinId) {
      // Complete wire creation
      // Get the pin element position
      const pinElement = document.getElementById(pinId);
      if (pinElement) {
        const pinRect = pinElement.getBoundingClientRect();
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        
        if (canvasRect) {
          // Calculate pin position relative to canvas
          const pinX = (pinRect.left + pinRect.width/2 - canvasRect.left) / zoom - pan.x;
          const pinY = (pinRect.top + pinRect.height/2 - canvasRect.top) / zoom - pan.y;
          
          const endPin: PinPosition = {
            id: pinId,
            x: pinX,
            y: pinY,
          };
          
          // Create a new wire with appropriate color based on the pin types
          const [startCompId, startPinName] = wireStartPin.id.split('-', 2);
          const [endCompId, endPinName] = pinId.split('-', 2);
          
          // Determine wire color based on pin type
          let wireColor = '#3b82f6'; // Default blue
          
          if (startPinName && endPinName) {
            // Power connections
            if (startPinName.includes('5v') || startPinName.includes('3v3') || 
                endPinName.includes('5v') || endPinName.includes('3v3')) {
              wireColor = '#ff6666'; // Red for power
            }
            // Ground connections
            else if (startPinName.includes('gnd') || endPinName.includes('gnd')) {
              wireColor = '#aaaaaa'; // Gray for ground
            }
            // Digital pin connections
            else if ((startPinName.startsWith('d') || endPinName.startsWith('d')) && 
                    !isNaN(parseInt(startPinName.substring(1), 10)) || 
                    !isNaN(parseInt(endPinName.substring(1), 10))) {
              wireColor = '#66ffff'; // Cyan for digital
            }
            // Analog pin connections
            else if ((startPinName.startsWith('a') || endPinName.startsWith('a')) && 
                    !isNaN(parseInt(startPinName.substring(1), 10)) || 
                    !isNaN(parseInt(endPinName.substring(1), 10))) {
              wireColor = '#ffcc66'; // Orange for analog
            }
          }
          
          // Create a new wire
          const newWire: WireConnection = {
            id: generateId(),
            startPin: wireStartPin,
            endPin: endPin,
            color: wireColor
          };
          
          setWires([...wires, newWire]);
          
          // Reset wire creation mode
          setWireCreationMode(false);
          setWireStartPin(null);
          setTempWirePosition(null);
        }
      }
    }
  };

  // Handle wire click
  const handleWireClick = (wireId: string) => {
    setSelectedWire(wireId);
    setSelectedComponent(null);
  };

  // Get code from the editor (simple textarea for now)
  const [code, setCode] = useState(defaultCode);
  
  const getCode = () => {
    return code;
  };

  // Notification system
  const [notification, setNotification] = useState<NotificationType | null>(null);
  
  // Show a notification in the bottom right corner
  const showNotification = (message: string, type = 'success') => {
    setNotification({ message, type });
    
    // Auto-hide the notification - longer for errors so users can read them
    const duration = type === 'error' ? 6000 : 3000;
    
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };
  
  // Save the current project
  const saveProject = () => {
    // Get the current code from the editor
    const currentCode = getCode();
    
    // Update the project data
    const projectData = {
      components,
      wires,
      code: currentCode
    };
    
    // In a real app, you'd save this to a database or file
    console.log('Saving project:', projectData);
    
    // Update the local code state
    setCode(currentCode);
    
    // Update the simulator context with the latest code
    // This is crucial for the simulator to use the latest code
    updateSimulatorCode(currentCode);
    
    if (typeof window !== 'undefined') {
      // Store in localStorage for persistence
      try {
        localStorage.setItem('arduino-sandbox-code', currentCode);
        localStorage.setItem('arduino-sandbox-lastSaved', new Date().toISOString());
      } catch (err) {
        console.error('Error saving to localStorage:', err);
      }
    }
    
    // Show notification
    showNotification('Project saved!');
  };

  // Local simulation state
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [showExampleDropdown, setShowExampleDropdown] = useState(false);

  // Use simulator context
  const { 
    startSimulation,
    stopSimulation,
    addLog: addSimulatorLog,
    logs: simulatorLogs,
    updateComponentState,  // Access the updateComponentState function
    updateComponentPins,   // Access the updateComponentPins function for pin-specific updates
    setCode: updateSimulatorCode // Get the simulator's setCode function
  } = useSimulator();
  
  // Run the simulation
  const runSimulation = () => {
    if (isSimulationRunning) {
      // Stop the simulation
      addSimulationLog('Stopping simulation...');
      stopSimulation();
      setIsSimulationRunning(false);
      if (typeof window !== 'undefined') {
        window.isSimulationRunning = false; // Set global flag for components
      }
      addSimulationLog('Simulation stopped');
      showNotification('Simulation stopped successfully', 'info');
    } else {
      // Show a notification that we're starting compilation
      showNotification('Starting Arduino simulation...', 'info');
      
      // Get the current code from the editor
      const currentCode = getCode();
      
      // Update the simulator context with current code BEFORE starting simulation
      updateSimulatorCode(currentCode);
      
      // Add a small delay to ensure the code is set before starting simulation
      setTimeout(() => {
        setIsSimulationRunning(true);
        if (typeof window !== 'undefined') {
          window.isSimulationRunning = true; // Set global flag for components
        }
        
        // Start the simulation - this will now parse the real code
        startSimulation();
      }, 100); // 100ms delay to ensure code is properly set
      showNotification('Arduino simulation started!', 'success');
    }
  };
  
  // Set global simulation state when component mounts/unmounts
  useEffect(() => {
    // Initialize global state
    if (typeof window !== 'undefined') {
      window.isSimulationRunning = isSimulationRunning;
    }
    
    // Cleanup when component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        window.isSimulationRunning = false;
      }
    };
  }, [isSimulationRunning]);
  
  // Add a log entry with timestamp
  const addSimulationLog = (message: string) => {
    addSimulatorLog(message);
    console.log(`[Simulator] ${message}`);
  };
  
  // Handle loading example code
  const loadExampleCode = (exampleType: string) => {
    let exampleCode;
    
    switch(exampleType) {
      case 'oled':
        exampleCode = oledDisplayExample;
        addSimulationLog('Loaded OLED Display example');
        break;
      case 'sevenSegment':
        exampleCode = sevenSegmentExample;
        addSimulationLog('Loaded 7-Segment Display example');
        break;
      case 'keypad':
        exampleCode = keypadExample;
        addSimulationLog('Loaded Keypad example');
        break;
      case 'encoder':
        exampleCode = rotaryEncoderExample;
        addSimulationLog('Loaded Rotary Encoder example');
        break;
      case 'multi':
        exampleCode = multiLibraryExample;
        addSimulationLog('Loaded multi-library example');
        break;
      case 'rgbled':
        exampleCode = rgbLedExample;
        addSimulationLog('Loaded RGB LED example');
        break;
      case 'buzzer':
        exampleCode = buzzerExample;
        addSimulationLog('Loaded Buzzer example');
        break;
      default:
        exampleCode = defaultCode;
        addSimulationLog('Loaded default blink example');
    }
    
    // Detect libraries in the loaded example
    const libraries = parseLibraryImports(exampleCode);
    if (libraries.length > 0) {
      addSimulationLog(`Detected libraries: ${libraries.join(', ')}`);
      
      // In a real implementation, we would check if these libraries are available
      // and load them if needed
      libraries.forEach((library: string) => {
        addSimulationLog(`Loading library: ${library}`);
      });
    }
    
    // Detect pins used in the code
    const pinWrites = parseDigitalWrites(exampleCode);
    const pins = Object.keys(pinWrites);
    if (pins.length > 0) {
      addSimulationLog(`Detected pins: ${pins.join(', ')}`);
    }
    
    // Update the code in the editor
    setCode(exampleCode);
    
    // Update the simulator code
    updateSimulatorCode(exampleCode);
    
    // Close the dropdown
    setShowExampleDropdown(false);
    
    // Show notification
    showNotification('Example code loaded!');
  };

  // Update the Save Code button to also save the project
  useEffect(() => {
    // Get the Save Code button
    const saveCodeBtn = document.querySelector('button.bg-green-600.hover\\:bg-green-700');
    if (saveCodeBtn) {
      // Add a click handler to save the project
      saveCodeBtn.addEventListener('click', saveProject);
      
      // Clean up when component unmounts
      return () => {
        saveCodeBtn.removeEventListener('click', saveProject);
      };
    }
  }, [saveProject]);

  return (
    <LibraryManagerProvider>
      <div className="flex flex-col w-full h-full bg-gray-800 text-white overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-900 p-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <img 
            src="/@fs/home/runner/workspace/attached_assets/led.icon.png" 
            alt="Sandbox" 
            className="h-6 mr-2" 
          />
          <h2 className="text-lg font-bold">Sandbox</h2>
        </div>
        <div className="flex items-center space-x-2">
          {/* Canvas controls */}
          <button 
            className="bg-gray-700 p-1 rounded hover:bg-gray-600 text-xs"
            onClick={() => setZoom(Math.min(3, zoom * 1.2))}
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button 
            className="bg-gray-700 p-1 rounded hover:bg-gray-600 text-xs"
            onClick={() => setZoom(Math.max(0.1, zoom * 0.8))}
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <button 
            className="bg-gray-700 p-1 rounded hover:bg-gray-600 text-xs"
            onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}
            title="Reset View"
          >
            <Move size={18} />
          </button>
          <span className="text-xs">{Math.round(zoom * 100)}%</span>
          
          {/* Component controls */}
          <button 
            className={`p-1 rounded text-xs ${selectedComponent ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600 opacity-50 cursor-not-allowed'}`}
            onClick={rotateSelectedComponent}
            disabled={!selectedComponent}
            title="Rotate Selected Component"
          >
            <RotateCcw size={18} />
          </button>
          <button 
            className={`p-1 rounded text-xs ${selectedComponent || selectedWire ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600 opacity-50 cursor-not-allowed'}`}
            onClick={deleteSelectedItem}
            disabled={!selectedComponent && !selectedWire}
            title="Delete Selected Item"
          >
            <Trash2 size={18} />
          </button>
          
          {/* Project controls */}
          <div className="w-px h-6 bg-gray-600 mx-2"></div>
          <button 
            className={`p-1 rounded text-xs ${isSimulationRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            onClick={runSimulation}
            title={isSimulationRunning ? "Stop Simulation" : "Run Simulation"}
          >
            <Play size={18} />
          </button>
          <button 
            className="bg-blue-600 p-1 rounded hover:bg-blue-700 text-xs"
            onClick={saveProject}
            title="Save Project"
          >
            <Save size={18} />
          </button>
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 ml-4"
            title="Close Sandbox"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Sandbox Component */}
        <div className="w-full bg-gray-900 overflow-hidden relative">
          <CircuitBuilder />
          
          {/* Proper simulator implementation with real execution */}
          {/* Simulator removed - needs proper AVR8 implementation */}
          <div className="p-4 text-gray-400">
            <p>Emulator integration in progress...</p>
          </div>
          {/* <ProperAVR8Simulator 
            code={code}
            isRunning={isSimulationRunning}
            onPinChange={(pinOrComponent: any, isHigh: any) => {
              // Handle pin change events from the simulator
              if (typeof pinOrComponent === 'number') {
                // This is a pin change event
                const pin = pinOrComponent;
                console.log(`Simulator: Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
                
                // Standard pin change
                addSimulationLog(`Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
                
                // Special handling for pin 13 - update all HERO boards DIRECTLY
                if (pin === 13) {
                  // Find all HERO boards in the component list - always update pin 13
                  const heroBoards = components.filter(c => c.type === 'heroboard');
                  
                  if (heroBoards.length > 0) {
                    heroBoards.forEach(board => {
                      // Update the pin state for this board's pin 13 LED - forced direct update
                      updateComponentPins(board.id, { '13': isHigh });
                      console.log(`[DIRECT] Updated HERO board ${board.id} pin 13 LED to ${isHigh ? 'ON' : 'OFF'}`);
                    });
                  } else {
                    // No heroboards found, use a generic ID that will get picked up anyway
                    updateComponentPins('heroboard', { '13': isHigh });
                    console.log(`[AVR8] Pin 13 changed to ${isHigh ? 'HIGH' : 'LOW'} (hardware emulation)`);
                  }
                  
                  // Force state refresh
                  setTimeout(() => {
                    console.log(`Refreshing component states after pin 13 update`);
                  }, 10);
                }
              } else if (typeof pinOrComponent === 'object' && pinOrComponent.componentId) {
                // This is a component state update
                const { componentId, type, color } = pinOrComponent;
                console.log(`Simulator: Component ${componentId} (${type}) state updated to ${isHigh ? 'ON' : 'OFF'}`);
                
                // Different handling based on component type
                if (type === 'rgbled') {
                  // Use the global update method for RGB LEDs
                  if (typeof window !== 'undefined' && window.updateRGBLED && window.updateRGBLED[componentId]) {
                    // For RGB LEDs, we need to use the actual PWM value (0-255)
                    // Get the analog value directly from digital state (0 or 255)
                    let analogValue = isHigh ? 255 : 0;
                    
                    // We don't have direct access to compiledCode analog values here,
                    // so we're using the digital state (HIGH/LOW) to set colors
                    // This will allow the RGB LED to at least show some color when pins are HIGH
                    
                    console.log(`Updating RGB LED ${componentId} ${color} channel to ${analogValue} (${isHigh ? 'HIGH' : 'LOW'})`);
                    window.updateRGBLED[componentId](color, analogValue);
                    
                    // Log the change for user feedback
                    addSimulationLog(`Updated RGB LED ${componentId} ${color} channel to ${analogValue}`);
                  } else {
                    console.warn(`RGB LED ${componentId} update function not found`);
                  }
                } else {
                  // Standard LED component update
                  const componentState = { isLit: isHigh };
                  
                  // Log the state we're about to update to help debugging
                  console.log(`Updating component state for ${componentId}:`, componentState);
                  
                  // Update the state in the context
                  updateComponentState(componentId, componentState);
                  
                  // Log the change for user feedback
                  addSimulationLog(`Updated ${type} ${componentId} to ${isHigh ? 'ON' : 'OFF'}`);
                }
              }
            }}
            onLog={addSimulationLog}
          /> */}
        </div>
      </div>
      
      {/* Bottom Code Editor */}
      <div className="h-1/3 bg-gray-800 border-t border-gray-700 flex flex-col">
        <div className="p-2 bg-gray-900 text-sm font-bold border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center">
            <FileCode size={16} className="mr-2 text-blue-400" />
            <span>Arduino Code</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className={`px-2 py-1 rounded text-xs flex items-center ${isSimulationRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              onClick={runSimulation}
            >
              <Play size={14} className="mr-1" />
              <span>{isSimulationRunning ? 'Stop Simulation' : 'Run Simulation'}</span>
            </button>
            <button className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs flex items-center">
              <Save size={14} className="mr-1" />
              <span>Save Code</span>
            </button>
            
            <div className="relative">
              <button 
                className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs flex items-center"
                onClick={() => setShowExampleDropdown(!showExampleDropdown)}
              >
                <Download size={14} className="mr-1" />
                <span>Load Example</span>
              </button>
              
              {showExampleDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => loadExampleCode('default')}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      Basic Blink
                    </button>
                    <button
                      onClick={() => loadExampleCode('oled')}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      OLED Display
                    </button>
                    <button
                      onClick={() => loadExampleCode('rgbled')}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      RGB LED Control
                    </button>
                    <button
                      onClick={() => loadExampleCode('buzzer')}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      Buzzer & Tones
                    </button>
                    <button
                      onClick={() => loadExampleCode('sevenSegment')}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      7-Segment Display
                    </button>
                    <button
                      onClick={() => loadExampleCode('keypad')}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      4x4 Keypad
                    </button>
                    <button
                      onClick={() => loadExampleCode('encoder')}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      Rotary Encoder
                    </button>
                    <button
                      onClick={() => loadExampleCode('multi')}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      Multi-Library Demo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <div className="h-full">
              <AceEditor
                mode="c_cpp"
                theme="monokai"
                name="arduino-code-editor"
                value={code}
                onChange={(newCode) => setCode(newCode)}
                width="100%"
                height="100%"
                fontSize={14}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                wrapEnabled={false}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: true,
                  showLineNumbers: true,
                  tabSize: 2,
                  firstLineNumber: 1, // Start line numbers at 1
                  scrollPastEnd: false, // Prevents auto-scrolling past the end
                }}
                style={{
                  fontFamily: "'Source Code Pro', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
                  backgroundColor: "#1E1E1E",
                  minHeight: '200px'
                }}
                editorProps={{ $blockScrolling: Infinity }} // Prevents scrolling issues
              />
            </div>
          </div>
          
          <div className="w-1/3 p-2 overflow-auto">
            <div className="h-full">
              <SimplifiedLogPanel />
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification popup */}
      {notification && (
        <div 
          className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg z-50 animate-pulse ${
            notification.type === 'error' 
              ? 'bg-red-600 text-white border border-red-300' 
              : 'bg-green-600 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}
      </div>
    </LibraryManagerProvider>
  );
};

export default CircuitBuilderWindow;