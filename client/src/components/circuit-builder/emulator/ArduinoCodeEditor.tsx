import React, { useState, useRef, useEffect } from 'react';
import AceEditor from 'react-ace';

// Import required ace modules
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

interface ArduinoCodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  isRunning?: boolean;
  height?: string;
  width?: string;
}

/**
 * Advanced Arduino Code Editor Component
 * 
 * This component provides a complete code editing experience for Arduino sketches
 * with auto-completion, syntax highlighting, and error markers.
 */
export function ArduinoCodeEditor({
  code,
  onChange,
  isRunning = false,
  height = '100%',
  width = '100%'
}: ArduinoCodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [annotations, setAnnotations] = useState<any[]>([]);
  
  // Arduino-specific auto-completion suggestions
  const arduinoCompletions = [
    { name: 'setup', value: 'setup', meta: 'function', score: 1000 },
    { name: 'loop', value: 'loop', meta: 'function', score: 1000 },
    { name: 'pinMode', value: 'pinMode', meta: 'function', score: 900 },
    { name: 'digitalWrite', value: 'digitalWrite', meta: 'function', score: 900 },
    { name: 'digitalRead', value: 'digitalRead', meta: 'function', score: 900 },
    { name: 'analogRead', value: 'analogRead', meta: 'function', score: 900 },
    { name: 'analogWrite', value: 'analogWrite', meta: 'function', score: 900 },
    { name: 'delay', value: 'delay', meta: 'function', score: 900 },
    { name: 'delayMicroseconds', value: 'delayMicroseconds', meta: 'function', score: 900 },
    { name: 'millis', value: 'millis', meta: 'function', score: 900 },
    { name: 'micros', value: 'micros', meta: 'function', score: 900 },
    { name: 'map', value: 'map', meta: 'function', score: 800 },
    { name: 'constrain', value: 'constrain', meta: 'function', score: 800 },
    { name: 'min', value: 'min', meta: 'function', score: 800 },
    { name: 'max', value: 'max', meta: 'function', score: 800 },
    { name: 'abs', value: 'abs', meta: 'function', score: 800 },
    { name: 'pow', value: 'pow', meta: 'function', score: 800 },
    { name: 'sqrt', value: 'sqrt', meta: 'function', score: 800 },
    { name: 'sin', value: 'sin', meta: 'function', score: 800 },
    { name: 'cos', value: 'cos', meta: 'function', score: 800 },
    { name: 'tan', value: 'tan', meta: 'function', score: 800 },
    { name: 'randomSeed', value: 'randomSeed', meta: 'function', score: 800 },
    { name: 'random', value: 'random', meta: 'function', score: 800 },
    { name: 'attachInterrupt', value: 'attachInterrupt', meta: 'function', score: 800 },
    { name: 'detachInterrupt', value: 'detachInterrupt', meta: 'function', score: 800 },
    { name: 'interrupts', value: 'interrupts', meta: 'function', score: 800 },
    { name: 'noInterrupts', value: 'noInterrupts', meta: 'function', score: 800 },
    { name: 'Serial.begin', value: 'Serial.begin', meta: 'function', score: 950 },
    { name: 'Serial.print', value: 'Serial.print', meta: 'function', score: 950 },
    { name: 'Serial.println', value: 'Serial.println', meta: 'function', score: 950 },
    { name: 'Serial.available', value: 'Serial.available', meta: 'function', score: 950 },
    { name: 'Serial.read', value: 'Serial.read', meta: 'function', score: 950 },
    { name: 'Serial.write', value: 'Serial.write', meta: 'function', score: 950 },
    { name: 'HIGH', value: 'HIGH', meta: 'constant', score: 900 },
    { name: 'LOW', value: 'LOW', meta: 'constant', score: 900 },
    { name: 'INPUT', value: 'INPUT', meta: 'constant', score: 900 },
    { name: 'OUTPUT', value: 'OUTPUT', meta: 'constant', score: 900 },
    { name: 'INPUT_PULLUP', value: 'INPUT_PULLUP', meta: 'constant', score: 900 },
    { name: 'LED_BUILTIN', value: 'LED_BUILTIN', meta: 'constant', score: 800 },
    // OLED and I2C related completions
    { name: 'Wire.begin', value: 'Wire.begin', meta: 'function', score: 850 },
    { name: 'Wire.requestFrom', value: 'Wire.requestFrom', meta: 'function', score: 850 },
    { name: 'Wire.beginTransmission', value: 'Wire.beginTransmission', meta: 'function', score: 850 },
    { name: 'Wire.endTransmission', value: 'Wire.endTransmission', meta: 'function', score: 850 },
    { name: 'Wire.write', value: 'Wire.write', meta: 'function', score: 850 },
    { name: 'Wire.available', value: 'Wire.available', meta: 'function', score: 850 },
    { name: 'Wire.read', value: 'Wire.read', meta: 'function', score: 850 },
    { name: 'SPI.begin', value: 'SPI.begin', meta: 'function', score: 850 },
    { name: 'SPI.transfer', value: 'SPI.transfer', meta: 'function', score: 850 },
    { name: 'SPI.end', value: 'SPI.end', meta: 'function', score: 850 },
    // Common variable types
    { name: 'int', value: 'int', meta: 'type', score: 850 },
    { name: 'bool', value: 'bool', meta: 'type', score: 850 },
    { name: 'char', value: 'char', meta: 'type', score: 850 },
    { name: 'byte', value: 'byte', meta: 'type', score: 850 },
    { name: 'float', value: 'float', meta: 'type', score: 850 },
    { name: 'double', value: 'double', meta: 'type', score: 850 },
    { name: 'long', value: 'long', meta: 'type', score: 850 },
    { name: 'void', value: 'void', meta: 'type', score: 850 },
    // Code snippets
    { 
      name: 'setupFunction', 
      value: 'void setup() {\n  // Initialize pins and peripherals here\n  \n}\n', 
      meta: 'snippet', 
      score: 1000 
    },
    { 
      name: 'loopFunction', 
      value: 'void loop() {\n  // Main code here, runs repeatedly\n  \n}\n', 
      meta: 'snippet', 
      score: 1000 
    },
    { 
      name: 'serialSetup', 
      value: 'Serial.begin(9600);\n', 
      meta: 'snippet', 
      score: 900 
    },
    {
      name: 'ledBlink',
      value: 'digitalWrite(LED_BUILTIN, HIGH);\ndelay(1000);\ndigitalWrite(LED_BUILTIN, LOW);\ndelay(1000);\n',
      meta: 'snippet',
      score: 850
    },
    {
      name: 'readAnalogSensor',
      value: 'int sensorValue = analogRead(A0);\n',
      meta: 'snippet',
      score: 850
    },
    {
      name: 'wireBegin',
      value: 'Wire.begin();\n',
      meta: 'snippet',
      score: 850
    }
  ];
  
  // Set up auto-completion with Arduino-specific keywords
  useEffect(() => {
    if (editorRef.current) {
      const langTools = window.ace.require('ace/ext/language_tools');
      
      // Create a custom completer
      const arduinoCompleter = {
        getCompletions: (editor: any, session: any, pos: any, prefix: string, callback: Function) => {
          if (prefix.length === 0) {
            callback(null, []);
            return;
          }
          
          callback(null, arduinoCompletions);
        }
      };
      
      // Add completer to the editor
      if (langTools && !langTools.completers.includes(arduinoCompleter)) {
        langTools.addCompleter(arduinoCompleter);
      }
    }
  }, [editorRef.current]);
  
  // Simulate code validation
  const validateCode = (code: string) => {
    const newAnnotations: any[] = [];
    const newMarkers: any[] = [];
    
    // Simple validation: check for missing semicolons and braces
    const lines = code.split('\n');
    
    let openBraces = 0;
    
    lines.forEach((line, index) => {
      // Check for missing semicolons
      if (line.trim() && 
          !line.trim().endsWith('{') && 
          !line.trim().endsWith('}') && 
          !line.trim().endsWith(';') && 
          !line.trim().startsWith('#') &&
          !line.trim().startsWith('//') &&
          !line.trim().match(/void\s+\w+\s*\(.*\)\s*$/) // Function declaration
         ) {
        newAnnotations.push({
          row: index,
          column: line.length,
          text: 'Missing semicolon',
          type: 'warning'
        });
        
        newMarkers.push({
          startRow: index,
          endRow: index,
          startCol: line.length - 1,
          endCol: line.length,
          className: 'editor-warning',
          type: 'text'
        });
      }
      
      // Count braces for brace matching
      const openBracesInLine = (line.match(/{/g) || []).length;
      const closedBracesInLine = (line.match(/}/g) || []).length;
      openBraces += openBracesInLine - closedBracesInLine;
    });
    
    // Check for unbalanced braces
    if (openBraces > 0) {
      newAnnotations.push({
        row: lines.length - 1,
        column: 0,
        text: `Missing ${openBraces} closing brace(s)`,
        type: 'error'
      });
    } else if (openBraces < 0) {
      newAnnotations.push({
        row: lines.length - 1,
        column: 0,
        text: `Extra ${Math.abs(openBraces)} closing brace(s)`,
        type: 'error'
      });
    }
    
    setAnnotations(newAnnotations);
    setMarkers(newMarkers);
  };
  
  // Trigger validation when code changes
  useEffect(() => {
    validateCode(code);
  }, [code]);
  
  return (
    <div 
      className="h-full w-full flex flex-col overflow-hidden"
      data-testid="arduino-code-editor"
    >
      <div className="bg-gray-900 text-white text-xs flex justify-between items-center px-2 py-1 border-b border-gray-700">
        <span className="font-mono">sketch.ino</span>
        <span className={`px-2 py-0.5 rounded text-xs ${isRunning ? 'bg-green-700' : 'bg-red-700'}`}>
          {isRunning ? 'Running' : 'Stopped'}
        </span>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <AceEditor
          ref={editorRef}
          mode="c_cpp"
          theme="monokai"
          name="arduino-code-editor"
          value={code}
          onChange={onChange}
          fontSize={14}
          width={width}
          height={height}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2,
            useWorker: false, // Disable web worker for performance
          }}
          markers={markers}
          annotations={annotations}
          editorProps={{ $blockScrolling: Infinity }}
          className="arduino-editor"
        />
      </div>
    </div>
  );
}