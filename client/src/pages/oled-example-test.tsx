import React, { useState } from 'react';
import SimulatorProvider from '@/components/circuit-builder/simulator/SimulatorContext';
import LibraryManager from '@/components/circuit-builder/simulator/LibraryManager';
import basicOLEDExample from '@/components/circuit-builder/simulator/examples/oled-test-example';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const OLEDExampleTest = () => {
  const [code, setCode] = useState(basicOLEDExample);
  const [isUploading, setIsUploading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleUpload = () => {
    setIsUploading(true);
    addLog("Uploading code to simulator...");
    
    // Update the simulator context with our code
    if (window.simulatorContext) {
      window.simulatorContext.code = code;
      window.simulatorContext.isRunning = true;
      addLog("Code uploaded. Running simulation...");
      
      // Force a refresh of the simulation
      const event = new CustomEvent('simulationStarted', { detail: { code } });
      window.dispatchEvent(event);
    } else {
      addLog("ERROR: Simulator context not available");
    }
    
    setIsUploading(false);
  };

  const addLog = (message: string) => {
    setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  return (
    <SimulatorProvider>
      <LibraryManager />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">OLED Display Test</h1>
        <p className="mb-6">
          This page lets you test OLED display code with the simulator.
          Wire up an OLED display with proper I2C connections:
          <ul className="list-disc ml-6 mt-2">
            <li>OLED SDA → Arduino A4</li>
            <li>OLED SCL → Arduino A5</li>
            <li>OLED VCC → Arduino 5V</li>
            <li>OLED GND → Arduino GND</li>
          </ul>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Arduino Code</CardTitle>
              <CardDescription>
                Edit the U8g2 OLED example below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                className="font-mono h-96"
              />
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
              >
                Upload to Simulator
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Simulator Logs</CardTitle>
              <CardDescription>
                Messages from the simulator will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded h-96 overflow-y-auto font-mono">
                {logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SimulatorProvider>
  );
};

export default OLEDExampleTest;