import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AppWindow } from '../os/AppWindow';
import { CodeEditor } from './emulator/CodeEditor';
import { CircuitBuilder } from './emulator/CircuitBuilder';
import { EmulatorControls } from './emulator/EmulatorControls';
import { SerialMonitor } from './emulator/SerialMonitor';
import { EmulatorProvider } from './emulator/EmulatorContext';

// Desktop app icon for CraftingTable OS
const EMULATOR_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNpcmN1aXQtYm9hcmQiPjxyZWN0IHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgeD0iMyIgeT0iMyIgcng9IjIiIHJ5PSIyIi8+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjIiLz48cGF0aCBkPSJNOS4xNCAxNUg3YTIgMiAwIDAgMSAwLTRoMiIvPjxwYXRoIGQ9Ik0xNSA5aDJhMiAyIDAgMCAxIDIgMnY0TTkuMTQgMTVsNS41Mi0zLjUyTTE1IDE3aDJhMiAyIDAgMSAwIDAtNGgtMSIvPjwvc3ZnPg==';

/**
 * Universal Emulator Desktop App
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
  // State for multiple tabs/windows - not implemented yet but architecture allows for it
  const [activeTab, setActiveTab] = useState(0);
  
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
        <div className="flex flex-col w-full h-full bg-background">
          {/* App Toolbar */}
          <div className="flex items-center justify-between p-2 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">File</Button>
              <Button variant="ghost" size="sm">Edit</Button>
              <Button variant="ghost" size="sm">View</Button>
              <Button variant="ghost" size="sm">Help</Button>
            </div>
            <EmulatorControls />
          </div>
          
          {/* Main Content - Code Editor + Circuit Builder */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel: Code Editor */}
            <div className="w-1/2 border-r h-full flex flex-col">
              <CodeEditor />
            </div>
            
            {/* Right Panel: Circuit Builder */}
            <div className="w-1/2 h-full flex flex-col">
              <CircuitBuilder />
            </div>
          </div>
          
          {/* Bottom Panel: Serial Monitor + Console */}
          <div className="h-40 border-t flex">
            <SerialMonitor />
          </div>
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