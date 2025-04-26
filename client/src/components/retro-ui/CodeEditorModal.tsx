import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { X, PlayCircle, Save, RotateCw } from 'lucide-react';

interface CodeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode: string;
  onSaveCode: (code: string) => void;
  onRunCode: (code: string) => void;
}

const CodeEditorModal: React.FC<CodeEditorModalProps> = ({
  isOpen,
  onClose,
  initialCode,
  onSaveCode,
  onRunCode
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const handleSave = () => {
    onSaveCode(code);
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput('Running code simulation...');
    
    // This is a simulation - we're not actually executing the Python code
    // Instead we pass it to our parent component to parse and simulate
    onRunCode(code);
    
    setTimeout(() => {
      setIsRunning(false);
    }, 1000);
  };

  const handleReset = () => {
    setCode(initialCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-100 w-4/5 max-w-4xl rounded-md shadow-lg overflow-hidden flex flex-col border-2 border-neutral-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 flex justify-between items-center">
          <h2 className="text-lg font-semibold">MicroPython Code Editor</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-red-200 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Editor Area */}
        <div className="grid grid-cols-12 gap-2 p-4 h-[70vh]">
          {/* Code Editor */}
          <div className="col-span-8 flex flex-col h-full">
            <div className="bg-neutral-200 px-2 py-1 flex items-center space-x-2 rounded-t-md">
              <button 
                onClick={handleSave} 
                className="px-2 py-1 bg-green-500 text-white rounded flex items-center space-x-1 hover:bg-green-600"
              >
                <Save size={16} />
                <span>Save</span>
              </button>
              <button 
                onClick={handleRun}
                disabled={isRunning}
                className={`px-2 py-1 text-white rounded flex items-center space-x-1 
                  ${isRunning ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                <PlayCircle size={16} />
                <span>{isRunning ? 'Running...' : 'Run Simulation'}</span>
              </button>
              <button 
                onClick={handleReset}
                className="px-2 py-1 bg-neutral-500 text-white rounded flex items-center space-x-1 hover:bg-neutral-600"
              >
                <RotateCw size={16} />
                <span>Reset</span>
              </button>
            </div>
            <div className="flex-grow border border-neutral-300 rounded-b-md overflow-hidden">
              <CodeMirror
                value={code}
                height="100%"
                extensions={[python()]}
                onChange={(value) => setCode(value)}
                theme="dark"
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightActiveLine: true,
                  foldGutter: true,
                  indentOnInput: true,
                }}
              />
            </div>
          </div>
          
          {/* Output/Documentation Panel */}
          <div className="col-span-4 bg-neutral-800 text-green-400 rounded-md p-3 font-mono text-sm overflow-auto">
            <div className="mb-2 text-white font-semibold border-b border-neutral-700 pb-1">Output:</div>
            <pre className="whitespace-pre-wrap">{output}</pre>
            
            <div className="mt-4 mb-2 text-white font-semibold border-b border-neutral-700 pb-1">Quick Reference:</div>
            <div className="text-xs">
              <p className="mb-1 text-yellow-300">LED Control:</p>
              <pre className="text-green-300 mb-2">
{`from machine import Pin
led = Pin(25, Pin.OUT)  # GP25
led.on()  # HIGH/ON
led.off()  # LOW/OFF`}
              </pre>
              
              <p className="mb-1 text-yellow-300">Pin States:</p>
              <pre className="text-green-300 mb-2">
{`# Set pin to HIGH or LOW
pin = Pin(0, Pin.OUT)  # GP0
pin.value(1)  # HIGH
pin.value(0)  # LOW`}
              </pre>
            </div>
          </div>
        </div>
        
        {/* Footer with Help Text */}
        <div className="bg-neutral-200 px-4 py-2 text-xs text-neutral-700">
          <p>
            <span className="font-bold">Note:</span> This is a simplified simulation. 
            Only basic digital output functionality (HIGH/LOW) is implemented.
            The simulation will interpret code to determine pin states of your microcontroller.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorModal;