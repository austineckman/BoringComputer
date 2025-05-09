import React, { useEffect, useState } from 'react';
import { useEmulator } from './EmulatorContext';
import Editor from '@monaco-editor/react';

/**
 * Arduino Code Editor Component
 * 
 * Provides a code editor for Arduino sketches with syntax highlighting
 */
export function CodeEditor() {
  const { code, setCode, isRunning } = useEmulator();
  const [editorOptions, setEditorOptions] = useState({
    theme: 'vs-dark',
    fontSize: 14,
    minimap: { enabled: false },
    automaticLayout: true
  });
  
  // Register Arduino language support when the component mounts
  useEffect(() => {
    // This would normally set up Arduino language syntax highlighting
    // For simplicity, we'll use C++ highlighting since Arduino is based on C++
  }, []);
  
  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Set up C++ language features for Arduino
    monaco.languages.registerCompletionItemProvider('cpp', {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions = [
          {
            label: 'setup',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'void setup() {\n  $0\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'The setup function runs once when the board starts'
          },
          {
            label: 'loop',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'void loop() {\n  $0\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'The loop function runs repeatedly'
          },
          {
            label: 'digitalWrite',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'digitalWrite(${1:pin}, ${2:HIGH});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Write a HIGH or LOW value to a digital pin'
          },
          {
            label: 'digitalRead',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'digitalRead(${1:pin})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Read a HIGH or LOW value from a digital pin'
          },
          {
            label: 'analogWrite',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'analogWrite(${1:pin}, ${2:value});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Write an analog value (PWM) to a pin'
          },
          {
            label: 'analogRead',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'analogRead(${1:pin})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Read an analog value from a pin'
          },
          {
            label: 'pinMode',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'pinMode(${1:pin}, ${2:mode});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Configure a pin for input or output'
          },
          {
            label: 'delay',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'delay(${1:ms});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Pause the program for a specified time in milliseconds'
          }
        ];
        
        return { suggestions };
      }
    });
  };
  
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-between items-center p-2 bg-muted/30">
        <div className="text-sm font-medium">Arduino Code</div>
        <div className="text-xs text-muted-foreground">
          {isRunning ? 'Running' : 'Stopped'}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Editor
          defaultLanguage="cpp"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            ...editorOptions,
            readOnly: isRunning // Prevent editing while running
          }}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
}