import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Eye, EyeOff, ArrowLeft, Play, RotateCcw, Trash2, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
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

// Import circuit builder components
import CircuitBuilder from '../circuit-builder/CircuitBuilder';
import { SimulatorProvider, useSimulator } from '../circuit-builder/simulator/SimulatorContext';
import SimplifiedLogPanel from '../circuit-builder/simulator/SimplifiedLogPanel';
import { LibraryManagerProvider } from '../circuit-builder/simulator/LibraryManager';

// Legacy imports for component management
import { 
  componentOptions, 
  createComponent, 
  renderComponent, 
  ComponentData 
} from '../circuit-builder/ComponentGenerator';
import CircuitWire from '../circuit-builder/CircuitWire';
import CircuitPin from '../circuit-builder/CircuitPin';

// Types
interface PinPosition {
  id: string;
  x: number;
  y: number;
}

interface WireConnection {
  id: string;
  startPin: PinPosition;
  endPin: PinPosition;
  color: string;
}

interface CircuitExample {
  id?: string;
  name: string;
  description: string;
  arduinoCode: string;
  circuitData: any;
  isPublished: boolean;
}

interface CircuitExampleCreatorProps {
  onCancel: () => void;
  onSave: (example: CircuitExample) => void;
  existingExample?: CircuitExample | null;
}



const CircuitExampleCreator: React.FC<CircuitExampleCreatorProps> = ({ 
  onCancel, 
  onSave, 
  existingExample 
}) => {
  const { user } = useAuth();

  // Form state
  const [name, setName] = useState(existingExample?.name || '');
  const [description, setDescription] = useState(existingExample?.description || '');
  const [isPublished, setIsPublished] = useState(existingExample?.isPublished || false);
  
  // Circuit state
  const [components, setComponents] = useState<ComponentData[]>(existingExample?.circuitData?.components || []);
  const [wires, setWires] = useState<WireConnection[]>(existingExample?.circuitData?.wires || []);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [selectedWire, setSelectedWire] = useState<string | null>(null);
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Wire creation state
  const [wireCreationMode, setWireCreationMode] = useState(false);
  const [wireStartPin, setWireStartPin] = useState<PinPosition | null>(null);
  const [wireEndPin, setWireEndPin] = useState<PinPosition | null>(null);
  const [tempWirePosition, setTempWirePosition] = useState<{ x: number; y: number } | null>(null);
  
  // Canvas view state
  const [zoom, setZoom] = useState(existingExample?.circuitData?.zoom || 1);
  const [pan, setPan] = useState(existingExample?.circuitData?.pan || { x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Code state
  const defaultCode = `// Circuit Example Template
// Describe what this example demonstrates
// Add clear comments explaining each section

void setup() {
  // Initialize your components here
  Serial.begin(9600);
  
}

void loop() {
  // Your main program logic here
  
}

/* 
  Example Notes:
  - Explain the circuit connections
  - Mention any special requirements
  - Include expected behavior
*/`;
  
  const [code, setCode] = useState(existingExample?.arduinoCode || defaultCode);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const gridSize = 20;

  // Use simulator context
  const { 
    startSimulation,
    stopSimulation,
    addLog: addSimulatorLog,
    logs: simulatorLogs,
    updateComponentState,
    updateComponentPins,
    setCode: updateSimulatorCode,
    components: simulatorComponents,
    wires: simulatorWires,
    setComponents: setSimulatorComponents,
    setWires: setSimulatorWires
  } = useSimulator();

  // Initialize simulator with existing code and circuit data
  useEffect(() => {
    updateSimulatorCode(code);
    
    // Load existing circuit data into simulator
    if (existingExample?.circuitData?.components) {
      setSimulatorComponents(existingExample.circuitData.components);
    }
    if (existingExample?.circuitData?.wires) {
      setSimulatorWires(existingExample.circuitData.wires);
    }
  }, []);

  // Sync circuit data from simulator to parent state for saving
  useEffect(() => {
    console.log('Simulator components changed:', simulatorComponents);
    setComponents(simulatorComponents || []);
  }, [simulatorComponents]);

  useEffect(() => {
    console.log('Simulator wires changed:', simulatorWires);
    setWires(simulatorWires || []);
  }, [simulatorWires]);

  // Handle saving the example
  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a name for the example');
      return;
    }

    const circuitData = {
      components,
      wires,
      zoom,
      pan
    };

    console.log('Saving circuit data:', {
      components: components.length,
      wires: wires.length,
      simulatorComponents: simulatorComponents?.length || 0,
      simulatorWires: simulatorWires?.length || 0,
      actualComponents: components,
      actualWires: wires
    });

    const exampleData: CircuitExample = {
      id: existingExample?.id,
      name: name.trim(),
      description: description.trim(),
      arduinoCode: code,
      circuitData,
      isPublished
    };

    onSave(exampleData);
  };

  // Delete selected component or wire
  const deleteSelectedItem = () => {
    if (selectedComponent) {
      setComponents(components.filter(c => c.id !== selectedComponent));
      const updatedWires = wires.filter(wire => 
        !wire.startPin.id.startsWith(`${selectedComponent}-`) && 
        !wire.endPin.id.startsWith(`${selectedComponent}-`)
      );
      setWires(updatedWires);
      setSelectedComponent(null);
    } else if (selectedWire) {
      setWires(wires.filter(w => w.id !== selectedWire));
      setSelectedWire(null);
    }
  };

  // Rotate selected component
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

  // Run simulation
  const runSimulation = () => {
    if (isSimulationRunning) {
      addSimulatorLog('Stopping simulation...');
      stopSimulation();
      setIsSimulationRunning(false);
      if (typeof window !== 'undefined') {
        (window as any).isSimulationRunning = false;
      }
    } else {
      addSimulatorLog('Starting simulation...');
      const currentCode = code;
      updateSimulatorCode(currentCode);
      setIsSimulationRunning(true);
      if (typeof window !== 'undefined') {
        (window as any).isSimulationRunning = true;
      }
      startSimulation(currentCode);
    }
  };

  return (
    <SimulatorProvider>
      <LibraryManagerProvider>
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onCancel}
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-xl font-bold text-orange-400">
                  {existingExample ? 'Edit Circuit Example' : 'Create Circuit Example'}
                </h2>
                <p className="text-gray-400 text-sm">Design your circuit and write Arduino code</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2"
              >
                <Save size={18} />
                <span>Save Example</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Circuit Builder */}
            <div className="w-2/3 bg-gray-900 flex flex-col">
              {/* Circuit Toolbar */}
              <div className="bg-gray-800 p-2 border-b border-gray-700 flex items-center space-x-2">
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
                <span className="text-xs text-gray-400">{Math.round(zoom * 100)}%</span>
                
                <div className="w-px h-6 bg-gray-600 mx-2"></div>
                
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

                <div className="w-px h-6 bg-gray-600 mx-2"></div>
                
                <button 
                  className={`p-1 rounded text-xs ${isSimulationRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  onClick={runSimulation}
                  title={isSimulationRunning ? "Stop Simulation" : "Run Simulation"}
                >
                  <Play size={18} />
                </button>
              </div>

              {/* Circuit Canvas */}
              <div className="flex-1 relative overflow-hidden">
                <CircuitBuilder />
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-1/3 bg-gray-800 flex flex-col">
              {/* Example Details Form */}
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">Example Details</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-orange-500 text-white"
                      placeholder="Enter example name..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-orange-500 text-white h-20 resize-none"
                      placeholder="Describe what this example teaches..."
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center text-gray-300">
                      <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="flex items-center">
                        {isPublished ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                        Publish (make visible to students)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 flex flex-col">
                <div className="p-2 bg-gray-700 border-b border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300">Arduino Code</h4>
                </div>
                <div className="flex-1">
                  <AceEditor
                    mode="c_cpp"
                    theme="monokai"
                    name="circuit-example-editor"
                    value={code}
                    onChange={(newCode) => setCode(newCode)}
                    width="100%"
                    height="100%"
                    fontSize={13}
                    showPrintMargin={false}
                    showGutter={true}
                    highlightActiveLine={true}
                    wrapEnabled={true}
                    setOptions={{
                      enableBasicAutocompletion: true,
                      enableLiveAutocompletion: true,
                      enableSnippets: true,
                      showLineNumbers: true,
                      tabSize: 2,
                    }}
                    style={{
                      fontFamily: "'Source Code Pro', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
                      backgroundColor: "#1E1E1E",
                    }}
                  />
                </div>
              </div>

              {/* Simulation Log */}
              <div className="h-32 border-t border-gray-700">
                <SimplifiedLogPanel />
              </div>
            </div>
          </div>
        </div>
      </LibraryManagerProvider>
    </SimulatorProvider>
  );
};

export default CircuitExampleCreator;