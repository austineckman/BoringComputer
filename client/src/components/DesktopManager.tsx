import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { UniversalEmulator, metadata as emulatorMetadata } from './desktop/UniversalEmulator';

// Desktop application registry
interface AppMeta {
  name: string;
  description: string;
  icon: string;
}

interface DesktopApp {
  id: string;
  meta: AppMeta;
  component: React.ComponentType<{
    appId: string;
    isActive: boolean;
    onClose: () => void;
  }>;
}

// Available desktop apps
const DESKTOP_APPS: DesktopApp[] = [
  {
    id: 'universal-emulator',
    meta: emulatorMetadata,
    component: UniversalEmulator
  }
];

/**
 * Desktop Manager Component
 * 
 * Manages the desktop environment and running applications
 */
export function DesktopManager() {
  const [runningApps, setRunningApps] = useState<string[]>([]);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  
  // Launch an application
  const launchApp = (appId: string) => {
    if (!runningApps.includes(appId)) {
      setRunningApps([...runningApps, appId]);
    }
    setActiveApp(appId);
  };
  
  // Close an application
  const closeApp = (appId: string) => {
    setRunningApps(runningApps.filter(id => id !== appId));
    if (activeApp === appId) {
      setActiveApp(runningApps.filter(id => id !== appId)[0] || null);
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-slate-900 bg-opacity-90 text-white">
      {/* Desktop */}
      <div className="flex-1 overflow-hidden p-4 relative">
        {/* Desktop Icons */}
        <div className="grid grid-cols-6 gap-4">
          {DESKTOP_APPS.map(app => (
            <div
              key={app.id}
              className="flex flex-col items-center justify-center gap-2 p-2 hover:bg-white/10 rounded-md cursor-pointer"
              onClick={() => launchApp(app.id)}
            >
              <img
                src={app.meta.icon}
                alt={app.meta.name}
                className="w-16 h-16 object-contain"
              />
              <div className="text-center text-sm">{app.meta.name}</div>
            </div>
          ))}
        </div>
        
        {/* Running Applications */}
        {runningApps.map(appId => {
          const app = DESKTOP_APPS.find(a => a.id === appId);
          if (!app) return null;
          
          const AppComponent = app.component;
          
          return (
            <AppComponent
              key={appId}
              appId={appId}
              isActive={activeApp === appId}
              onClose={() => closeApp(appId)}
            />
          );
        })}
      </div>
      
      {/* Taskbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
        <div className="flex gap-2">
          {/* Start Button */}
          <Button variant="outline">
            Start
          </Button>
          
          {/* Running App Indicators */}
          <div className="flex gap-1">
            {runningApps.map(appId => {
              const app = DESKTOP_APPS.find(a => a.id === appId);
              if (!app) return null;
              
              return (
                <Button
                  key={appId}
                  variant={activeApp === appId ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setActiveApp(appId)}
                >
                  <img
                    src={app.meta.icon}
                    alt={app.meta.name}
                    className="w-4 h-4"
                  />
                  <span>{app.meta.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
        
        {/* System Tray */}
        <div className="flex items-center gap-2 text-sm">
          <div>{new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
}