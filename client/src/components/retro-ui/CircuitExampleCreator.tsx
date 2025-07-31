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

// Circuit Builder Canvas Component for Oracle
interface CircuitBuilderCanvasProps {
  components: ComponentData[];
  wires: WireConnection[];
  onComponentsChange: (components: ComponentData[]) => void;
  onWiresChange: (wires: WireConnection[]) => void;
  selectedComponent: string | null;
  onComponentSelect: (id: string | null) => void;
  selectedWire: string | null;
  onWireSelect: (id: string | null) => void;
  zoom: number;
  pan: { x: number; y: number };
  isPanning: boolean;
  onPanStart: (panning: boolean) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const CircuitBuilderCanvas: React.FC<CircuitBuilderCanvasProps> = ({
  components,
  wires,
  onComponentsChange,
  onWiresChange,
  selectedComponent,
  onComponentSelect,
  selectedWire,
  onWireSelect,
  zoom,
  pan,
  isPanning,
  onPanStart,
  canvasRef
}) => {
  const gridSize = 20;

  const addComponent = (type: string) => {
    const newComponent = createComponent(type, { x: 300, y: 200 });
    onComponentsChange([...components, newComponent]);
  };

  const handleComponentClick = (componentId: string) => {
    onComponentSelect(selectedComponent === componentId ? null : componentId);
    onWireSelect(null);
  };

  const handleWireClick = (wireId: string) => {
    onWireSelect(selectedWire === wireId ? null : wireId);
    onComponentSelect(null);
  };

  const renderGrid = () => {
    const gridLines = [];
    const canvasWidth = 2000;
    const canvasHeight = 1500;
    
    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={canvasHeight}
          stroke="#374151"
          strokeWidth="0.5"
          opacity="0.3"
        />
      );
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={canvasWidth}
          y2={y}
          stroke="#374151"
          strokeWidth="0.5"
          opacity="0.3"
        />
      );
    }
    
    return gridLines;
  };

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {/* Component Palette */}
      <div className="absolute top-4 left-4 z-10 bg-gray-800 border border-gray-700 rounded-lg p-2">
        <div className="grid grid-cols-4 gap-2">
          {componentOptions.slice(0, 8).map((option) => (
            <button
              key={option.name}
              onClick={() => addComponent(option.name)}
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 flex items-center justify-center"
              title={option.name}
            >
              <img 
                src={option.imagePath} 
                alt={option.name}
                className="w-6 h-6 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </button>
          ))}
        </div>
      </div>
      
      {/* Circuit Canvas */}
      <div 
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: 'top left'
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {renderGrid()}
          
          {/* Render wires */}
          {wires.map((wire) => (
            <CircuitWire
              key={wire.id}
              wire={wire}
              isSelected={selectedWire === wire.id}
              onClick={() => handleWireClick(wire.id)}
            />
          ))}
        </svg>
        
        {/* Render components */}
        {components.map((component) => (
          <div
            key={component.id}
            className={`absolute cursor-pointer ${
              selectedComponent === component.id ? 'ring-2 ring-orange-500' : ''
            }`}
            style={{
              left: component.attrs.posLeft,
              top: component.attrs.posTop,
              transform: `rotate(${component.attrs.rotate || 0}deg)`,
              transformOrigin: 'center',
              pointerEvents: 'auto'
            }}
            onClick={() => handleComponentClick(component.id)}
          >
            {renderComponent(component)}
            
            {/* Component pins */}
            {component.pins?.map((pin) => (
              <CircuitPin
                key={pin.id}
                pin={pin}
                component={component}
                onPinClick={(pinId) => {
                  // Handle pin connections for wire creation
                  console.log(`Pin clicked: ${pinId}`);
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

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
    setCode: updateSimulatorCode
  } = useSimulator();

  // Initialize simulator with existing code
  useEffect(() => {
    updateSimulatorCode(code);
  }, []);

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
              <div className="flex-1 relative">
                <CircuitBuilderCanvas
                  components={components}
                  wires={wires}
                  onComponentsChange={setComponents}
                  onWiresChange={setWires}
                  selectedComponent={selectedComponent}
                  onComponentSelect={setSelectedComponent}
                  selectedWire={selectedWire}
                  onWireSelect={setSelectedWire}
                  zoom={zoom}
                  pan={pan}
                  isPanning={isPanning}
                  onPanStart={setIsPanning}
                  canvasRef={canvasRef}
                />
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