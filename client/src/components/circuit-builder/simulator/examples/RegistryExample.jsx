import React, { useEffect, useState } from 'react';
import { getComponentHandler, getRegistryStatus } from '../../registry/ComponentRegistry';
import '../../registry/RegistryInitializer'; // This imports and initializes the registry

/**
 * An example component that shows how to use the component registry
 * This demonstrates how to use the component registry to access handlers
 * for different components while keeping them isolated
 */
const RegistryExample = () => {
  const [registryStatus, setRegistryStatus] = useState({});
  const [ledWiring, setLedWiring] = useState(null);
  const [oledWiring, setOledWiring] = useState(null);
  
  useEffect(() => {
    // Get the current status of the registry
    const status = getRegistryStatus();
    setRegistryStatus(status);
    
    // Example: Test LED wiring handling
    const checkLEDWiring = getComponentHandler('LED', 'checkWiring');
    if (checkLEDWiring) {
      // This would normally use a real LED ID
      const wiringResult = checkLEDWiring('led-example-123');
      setLedWiring(wiringResult);
    }
    
    // Example: Test OLED wiring handling
    const checkOLEDWiring = getComponentHandler('OLED', 'checkWiring');
    if (checkOLEDWiring) {
      // This would normally use a real OLED ID
      const wiringResult = checkOLEDWiring('oled-display-example-123');
      setOledWiring(wiringResult);
    }
  }, []);
  
  return (
    <div className="p-4 bg-gray-100 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Component Registry Example</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold">Registry Status:</h3>
        <pre className="bg-gray-800 text-green-400 p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(registryStatus, null, 2)}
        </pre>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold">LED Wiring Test:</h3>
        <p className="text-sm">
          Result: <span className={ledWiring ? "text-green-600" : "text-red-600"}>
            {ledWiring === null ? "Not tested" : (ledWiring ? "Properly wired" : "Not properly wired")}
          </span>
        </p>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold">OLED Wiring Test:</h3>
        <p className="text-sm">
          Result: <span className={oledWiring ? "text-green-600" : "text-red-600"}>
            {oledWiring === null ? "Not tested" : (oledWiring ? "Properly wired" : "Not properly wired")}
          </span>
        </p>
      </div>
      
      <p className="text-gray-600 text-sm">
        <strong>Note:</strong> This component demonstrates how to use the component registry.
        When using this approach, changes to one component (e.g., OLED) won't affect others (e.g., LED)
        because their handlers are completely separate and can be frozen to a stable version.
      </p>
    </div>
  );
};

export default RegistryExample;