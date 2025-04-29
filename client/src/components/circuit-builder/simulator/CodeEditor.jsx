import React, { useEffect, useRef, useState } from 'react';
import AceEditor from 'ace-builds/src-min-noconflict/ace';
import 'ace-builds/src-min-noconflict/mode-c_cpp';
import 'ace-builds/src-min-noconflict/theme-monokai';
import 'ace-builds/src-min-noconflict/ext-language_tools';

/**
 * Arduino Code Editor Component
 * 
 * This component provides a code editor for writing Arduino code
 * with syntax highlighting and basic auto-completion
 */
const CodeEditor = ({ 
  initialCode = DEFAULT_CODE,
  onChange,
  onSave,
  onCompile,
  onRun,
  isRunning,
  compilationError
}) => {
  const editorRef = useRef(null);
  const aceEditorRef = useRef(null);
  const [code, setCode] = useState(initialCode);

  // Initialize Ace editor
  useEffect(() => {
    if (editorRef.current && !aceEditorRef.current) {
      // Initialize Ace editor
      aceEditorRef.current = AceEditor.edit(editorRef.current);
      aceEditorRef.current.setTheme('ace/theme/monokai');
      aceEditorRef.current.session.setMode('ace/mode/c_cpp');
      aceEditorRef.current.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        showPrintMargin: false,
        highlightActiveLine: true,
        fontSize: 14
      });
      
      // Set initial code
      aceEditorRef.current.session.setValue(code);
      
      // Add change listener
      aceEditorRef.current.session.on('change', () => {
        const newCode = aceEditorRef.current.getValue();
        setCode(newCode);
        if (onChange) {
          onChange(newCode);
        }
      });
    }
    
    return () => {
      // Clean up if component unmounts
      if (aceEditorRef.current) {
        aceEditorRef.current.destroy();
        aceEditorRef.current = null;
      }
    };
  }, []);

  // Handle save button click
  const handleSave = () => {
    if (onSave) {
      onSave(code);
    }
  };

  // Handle compile button click
  const handleCompile = () => {
    if (onCompile) {
      onCompile(code);
    }
  };

  // Handle run button click
  const handleRun = () => {
    if (onRun) {
      onRun(code);
    }
  };

  return (
    <div className="code-editor-container">
      <div className="editor-header">
        <h3>Arduino Code Editor</h3>
        <div className="editor-buttons">
          <button 
            className="save-btn"
            onClick={handleSave}
          >
            Save
          </button>
          <button 
            className="compile-btn"
            onClick={handleCompile}
          >
            Compile
          </button>
          <button 
            className={`run-btn ${isRunning ? 'running' : ''}`}
            onClick={handleRun}
          >
            {isRunning ? 'Stop' : 'Run'}
          </button>
        </div>
      </div>
      
      <div 
        ref={editorRef}
        className="code-editor"
        style={{ height: '300px', width: '100%' }}
      ></div>
      
      {compilationError && (
        <div className="compilation-error">
          <h4>Compilation Error:</h4>
          <pre>{compilationError}</pre>
        </div>
      )}
    </div>
  );
};

// Default Arduino code template
const DEFAULT_CODE = `// Arduino code
void setup() {
  // Set pin modes
  pinMode(13, OUTPUT); // Built-in LED
  pinMode(12, OUTPUT); // Buzzer
  pinMode(11, OUTPUT); // RGB LED Red
  pinMode(10, OUTPUT); // RGB LED Green
  pinMode(9, OUTPUT);  // RGB LED Blue
  pinMode(8, INPUT);   // Button
}

void loop() {
  // Read button state
  int buttonState = digitalRead(8);
  
  // If button is pressed
  if (buttonState == HIGH) {
    // Turn on LED and buzzer
    digitalWrite(13, HIGH);
    digitalWrite(12, HIGH);
    
    // RGB LED shows green
    digitalWrite(11, LOW);
    digitalWrite(10, HIGH);
    digitalWrite(9, LOW);
  } else {
    // Turn off LED and buzzer
    digitalWrite(13, LOW);
    digitalWrite(12, LOW);
    
    // RGB LED shows blue when idle
    digitalWrite(11, LOW);
    digitalWrite(10, LOW);
    digitalWrite(9, HIGH);
  }
  
  // Short delay
  delay(100);
}`;

export default CodeEditor;