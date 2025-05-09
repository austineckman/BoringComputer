import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, CircuitBoard, MonitorPlay, Cpu, Joystick, PanelLeft, PanelRight } from 'lucide-react';
import { AppWindow } from '../os/AppWindow';
import { CodeEditor } from './emulator/CodeEditor';
import { CircuitBuilder } from './emulator/CircuitBuilder';
import { EmulatorControls } from './emulator/EmulatorControls';
import { SerialMonitor } from './emulator/SerialMonitor';
import { EmulatorProvider } from './emulator/EmulatorContext';
import { ComponentPalette } from './emulator/components/ComponentPalette';

// Desktop app icon for CraftingTable OS
const EMULATOR_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNpcmN1aXQtYm9hcmQiPjxyZWN0IHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgeD0iMyIgeT0iMyIgcng9IjIiIHJ5PSIyIi8+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjIiLz48cGF0aCBkPSJNOS4xNCAxNUg3YTIgMiAwIDAgMSAwLTRoMiIvPjxwYXRoIGQ9Ik0xNSA5aDJhMiAyIDAgMCAxIDIgMnY0TTkuMTQgMTVsNS41Mi0zLjUyTTE1IDE3aDJhMiAyIDAgMSAwIDAtNGgtMSIvPjwvc3ZnPg==';

/**
 * Universal Emulator Desktop App - TinkerCAD-inspired with Retro Gaming Twist
 * 
 * This component serves as the entry point for the emulator app 
 * in the CraftingTable OS desktop environment.
 */
export function UniversalEmulator({ 
  appId, 
  isActive, 
  onClose 
}: { 
  appId: string; 
  isActive: boolean; 
  onClose: () => void; 
}) {
  // States for UI management
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'components' | 'code'>('components');
  const [serialVisible, setSerialVisible] = useState(false);
  
  // Toggle functions
  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const toggleSerial = () => setSerialVisible(!serialVisible);
  
  return (
    <AppWindow
      appId={appId}
      title="Universal Emulator"
      icon={EMULATOR_ICON}
      isActive={isActive}
      onClose={onClose}
      width={1200}
      height={800}
      resizable={true}
    >
      {/* Each EmulatorProvider creates an isolated emulator instance */}
      <EmulatorProvider instanceId={`${appId}-${activeTab}`}>
        <div className="flex flex-col w-full h-full bg-background overflow-hidden bg-slate-900 bg-[url('/grid-pattern-dark.png')] bg-repeat">
          {/* App Toolbar with retro gaming style */}
          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-900 to-purple-900 text-white border-b-2 border-cyan-400">
            <div className="flex items-center gap-2">
              <Joystick className="h-5 w-5 text-yellow-300" />
              <span className="font-bold text-green-300">UNIVERSAL</span>
              <span className="font-bold text-cyan-300">EMULATOR</span>
            </div>
            
            <EmulatorControls />
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleSidebar}
                className={`border border-cyan-500 bg-blue-900/50 hover:bg-blue-800 text-cyan-300 ${sidebarVisible ? 'bg-blue-800' : ''}`}
              >
                {sidebarVisible ? <PanelLeft className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleSerial}
                className={`border border-cyan-500 bg-blue-900/50 hover:bg-blue-800 text-cyan-300 ${serialVisible ? 'bg-blue-800' : ''}`}
              >
                <MonitorPlay className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Main Content with flexible layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar - Components or Code */}
            {sidebarVisible && (
              <div className="w-72 bg-slate-800 border-r border-cyan-900 flex flex-col">
                {/* Sidebar Tabs */}
                <div className="flex border-b border-cyan-900">
                  <button 
                    className={`flex-1 p-2 text-xs font-semibold flex items-center justify-center ${sidebarTab === 'components' ? 'bg-blue-800 text-cyan-300' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
                    onClick={() => setSidebarTab('components')}
                  >
                    <CircuitBoard className="h-4 w-4 mr-2" />
                    COMPONENTS
                  </button>
                  <button 
                    className={`flex-1 p-2 text-xs font-semibold flex items-center justify-center ${sidebarTab === 'code' ? 'bg-blue-800 text-cyan-300' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
                    onClick={() => setSidebarTab('code')}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    CODE
                  </button>
                </div>
                
                {/* Sidebar Content */}
                <div className="flex-1 overflow-auto">
                  {sidebarTab === 'components' && (
                    <div className="p-2">
                      <ComponentPalette onAddComponent={() => {}} />
                    </div>
                  )}
                  
                  {sidebarTab === 'code' && (
                    <div className="h-full">
                      <CodeEditor />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Main Circuit Builder Canvas */}
            <div className="flex-1 h-full flex flex-col">
              <CircuitBuilder />
            </div>
          </div>
          
          {/* Bottom Panel: Serial Monitor (Collapsible) */}
          {serialVisible && (
            <div className="h-40 border-t border-cyan-900 bg-slate-800">
              <SerialMonitor />
            </div>
          )}
        </div>
      </EmulatorProvider>
    </AppWindow>
  );
}

// Desktop app metadata for the CraftingTable OS
export const metadata = {
  name: "Universal Emulator",
  description: "Emulate Arduino hardware with real-time circuit simulation",
  icon: EMULATOR_ICON
};