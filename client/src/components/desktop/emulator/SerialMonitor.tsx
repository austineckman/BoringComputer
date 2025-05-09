import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEmulator } from './EmulatorContext';

/**
 * Serial Monitor Component
 * 
 * Displays serial output from the emulated Arduino and allows sending serial input
 */
export function SerialMonitor() {
  const { serialData, logs, clearSerialData, clearLogs } = useEmulator();
  const [inputValue, setInputValue] = useState('');
  const serialContentRef = useRef<HTMLDivElement>(null);
  const logsContentRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll on new data
  useEffect(() => {
    if (serialContentRef.current) {
      serialContentRef.current.scrollTop = serialContentRef.current.scrollHeight;
    }
  }, [serialData]);
  
  useEffect(() => {
    if (logsContentRef.current) {
      logsContentRef.current.scrollTop = logsContentRef.current.scrollHeight;
    }
  }, [logs]);
  
  // Handle send button click
  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    // This would send data to the emulator
    // For now, just clear the input
    setInputValue('');
  };
  
  // Handle input key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  return (
    <div className="h-full w-full flex flex-col">
      <Tabs defaultValue="serial" className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center p-2 border-b">
          <TabsList>
            <TabsTrigger value="serial">
              <Terminal className="h-4 w-4 mr-2" />
              Serial Monitor
            </TabsTrigger>
            <TabsTrigger value="log">
              <Terminal className="h-4 w-4 mr-2" />
              Emulator Log
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearSerialData()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <TabsContent value="serial" className="flex-1 flex flex-col overflow-hidden mt-0 pt-0">
          <div 
            ref={serialContentRef}
            className="flex-1 overflow-auto p-2 bg-black font-mono text-sm text-green-500"
          >
            {serialData.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
          
          <div className="flex items-center gap-2 p-2 border-t">
            <Input
              placeholder="Send to serial..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="log" className="flex-1 overflow-hidden mt-0 pt-0">
          <div className="flex justify-end p-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearLogs()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div 
            ref={logsContentRef}
            className="h-full overflow-auto p-2 bg-black font-mono text-xs text-blue-400"
          >
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}