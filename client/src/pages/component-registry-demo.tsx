import React, { useState } from 'react';
import RegistryExample from '@/components/circuit-builder/simulator/examples/RegistryExample';
import { 
  unfreezeForDevelopment, 
  initializeRegistry,
  getRegistryStatus 
} from '@/components/circuit-builder/registry/RegistryInitializer';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, ShieldAlert, Info } from "lucide-react";

/**
 * Demo page for the Component Registry system
 * This page demonstrates how the registry system works to prevent
 * components from interfering with each other
 */
const ComponentRegistryDemo = () => {
  const [status, setStatus] = useState(getRegistryStatus());
  const [selectedComponent, setSelectedComponent] = useState('');
  const [message, setMessage] = useState('');
  
  // Handle freezing a component
  const handleFreeze = () => {
    if (!selectedComponent) {
      setMessage('Please select a component first');
      return;
    }
    
    initializeRegistry();
    setStatus(getRegistryStatus());
    setMessage(`Component ${selectedComponent} is now frozen`);
  };
  
  // Handle unfreezing a component for development
  const handleUnfreeze = () => {
    if (!selectedComponent) {
      setMessage('Please select a component first');
      return;
    }
    
    const newStatus = unfreezeForDevelopment(selectedComponent);
    setStatus(newStatus);
    setMessage(`Component ${selectedComponent} is now unfrozen for development`);
  };
  
  // Get list of component types from the status
  const componentTypes = Object.keys(status);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Component Registry System</h1>
      <p className="mb-6">
        This demo shows how our Component Registry system prevents components from
        interfering with each other. When a component is "frozen", its handlers are locked
        to a specific version, ensuring that changes to other components won't affect it.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Component Status</CardTitle>
            <CardDescription>
              Current state of components in the registry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {componentTypes.map((type) => (
                <div key={type} className="p-3 bg-gray-100 rounded">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{type}</h3>
                    {status[type].isFrozen ? (
                      <div className="flex items-center text-green-600">
                        <ShieldCheck className="w-4 h-4 mr-1" />
                        <span className="text-xs">Frozen</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-600">
                        <ShieldAlert className="w-4 h-4 mr-1" />
                        <span className="text-xs">Unlocked</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Version: {status[type].currentVersion}</p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Handlers:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {status[type].handlers.map((handler) => (
                        <span 
                          key={handler} 
                          className="px-2 py-1 bg-gray-200 rounded-full text-xs"
                        >
                          {handler}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Component Manager</CardTitle>
            <CardDescription>
              Freeze or unfreeze components to control their behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Component</label>
                <Select 
                  value={selectedComponent} 
                  onValueChange={setSelectedComponent}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select component" />
                  </SelectTrigger>
                  <SelectContent>
                    {componentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleFreeze}
                  className="flex-1"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Freeze
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleUnfreeze}
                  className="flex-1"
                >
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Unfreeze
                </Button>
              </div>
              
              {message && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Status</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Separator className="my-6" />
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Registry Usage Example</h2>
        <RegistryExample />
      </div>
    </div>
  );
};

export default ComponentRegistryDemo;