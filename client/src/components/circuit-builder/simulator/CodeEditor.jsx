import React, { useRef, useEffect } from 'react';
import AceEditor from 'ace-builds/src-min-noconflict/ace';
import 'ace-builds/src-min-noconflict/mode-c_cpp';
import 'ace-builds/src-min-noconflict/theme-monokai';
import 'ace-builds/src-min-noconflict/ext-language_tools';

/**
 * CodeEditor component - Provides syntax-highlighted code editing
 * for Arduino code
 */
const CodeEditor = ({ code, onChange, readOnly = false }) => {
  const editorRef = useRef(null);
  const aceEditorRef = useRef(null);
  
  // Initialize Ace editor
  useEffect(() => {
    if (!editorRef.current) return;
    
    // Create editor instance
    aceEditorRef.current = AceEditor.edit(editorRef.current, {
      mode: 'ace/mode/c_cpp',
      theme: 'ace/theme/monokai',
      fontSize: 14,
      showPrintMargin: false,
      showGutter: true,
      highlightActiveLine: true,
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      wrap: true
    });
    
    // Set initial value
    aceEditorRef.current.setValue(code, -1);
    
    // Add change event handler
    aceEditorRef.current.on('change', () => {
      if (onChange) {
        const newCode = aceEditorRef.current.getValue();
        onChange(newCode);
      }
    });
    
    // Clean up on unmount
    return () => {
      if (aceEditorRef.current) {
        aceEditorRef.current.destroy();
        aceEditorRef.current = null;
      }
    };
  }, [editorRef]);
  
  // Update editor when readOnly prop changes
  useEffect(() => {
    if (aceEditorRef.current) {
      aceEditorRef.current.setReadOnly(readOnly);
    }
  }, [readOnly]);
  
  // Update editor content when code prop changes
  useEffect(() => {
    if (aceEditorRef.current && aceEditorRef.current.getValue() !== code) {
      aceEditorRef.current.setValue(code, -1);
    }
  }, [code]);
  
  return (
    <div className="code-editor">
      <div 
        ref={editorRef} 
        className="ace-editor-container"
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'relative',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      ></div>
      {readOnly && (
        <div className="editor-overlay">
          <div className="editor-readonly-message">
            Editor is read-only while simulation is running
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;