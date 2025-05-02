import React, { useRef, useState, useEffect } from 'react';

// Import simulator components
import {
  ReactLEDElement,
  ReactResistorElement,
  ReactRGBLEDElement,
  ReactBuzzerElement,
  ReactPhotocellElement,
  ReactRotaryEncoderElement,
  ReactDipSwitchElement,
  ReactSegmentDisplayElement,
  ReactOLEDElement,
  ReactKeypadElement,
  ReactHeroBoardElement
} from "../lib/inventr-component-lib.es.js";

/**
 * Component Simulator View
 * 
 * Shows a single component in the simulator format with hover tooltips
 * Used in the Component Glossary for educational purposes
 */
const ComponentSimulatorView = ({ component }) => {
  const containerRef = useRef(null);
  const componentRef = useRef(null);
  
  // Get component type from ID
  const getComponentType = (id) => {
    const types = {
      'led': 'led',
      'resistor': 'resistor',
      'rgb-led': 'rgbled',
      'buzzer': 'buzzer',
      'photoresistor': 'photocell',
      'rotary-encoder': 'rotaryencoder',
      'dip-switch': 'dipswitch',
      'segmented-display': 'segmentdisplay',
      'oled-display': 'oled',
      'custom-keypad': 'keypad',
      'hero-board': 'heroboard'
    };
    
    return types[id] || 'led';
  };
  
  // Map component ID to the corresponding React element
  const getComponentElement = (type) => {
    const elements = {
      'led': ReactLEDElement,
      'resistor': ReactResistorElement,
      'rgbled': ReactRGBLEDElement,
      'buzzer': ReactBuzzerElement,
      'photocell': ReactPhotocellElement,
      'rotaryencoder': ReactRotaryEncoderElement,
      'dipswitch': ReactDipSwitchElement,
      'segmentdisplay': ReactSegmentDisplayElement,
      'oled': ReactOLEDElement,
      'keypad': ReactKeypadElement,
      'heroboard': ReactHeroBoardElement
    };
    
    return elements[type] || ReactLEDElement;
  };
  
  // Handle pin hover
  const handlePinHover = (e) => {
    // Forward pin hover event up to document level for PinTooltip to catch
    try {
      // Extract pin information
      const pinDataJson = e.detail.data;
      const pinData = JSON.parse(pinDataJson);
      
      // Create a custom pin hover event similar to what the simulator would use
      const pinHoverEvent = new CustomEvent('pinHover', {
        detail: {
          name: pinData.name,
          type: pinData.type || 'bidirectional',
          description: pinData.description || '',
          componentId: component.id,
          clientX: e.detail.clientX,
          clientY: e.detail.clientY
        }
      });
      
      // Dispatch the event to be captured by the PinTooltip component
      document.dispatchEvent(pinHoverEvent);
    } catch (err) {
      console.error("Error in pin hover:", err);
    }
  };
  
  // Handle pin leave
  const handlePinLeave = () => {
    // Forward pin leave event up to document level
    document.dispatchEvent(new Event('pinLeave'));
  };
  
  // Set up the component element
  useEffect(() => {
    if (component && containerRef.current) {
      // Ensure any previous component is cleaned up
      if (componentRef.current && componentRef.current.parentNode) {
        componentRef.current.parentNode.removeChild(componentRef.current);
      }
      
      try {
        // Get component type and corresponding element
        const type = getComponentType(component.id);
        const ElementClass = getComponentElement(type);
        
        // Create the element
        const element = new ElementClass();
        element.id = `sim-view-${component.id}`;
        element.className = "component-simulator-view";
        element.style.position = "relative";
        element.style.margin = "20px auto";
        
        // Add hover event listeners
        element.addEventListener('pinhover', handlePinHover);
        element.addEventListener('pinleave', handlePinLeave);
        
        // Add specific properties based on component type
        if (type === 'led') {
          // Default LED configuration
          element.color = 'red';
          element.value = 0.5; // Dim glow to show the LED
        } else if (type === 'rgbled') {
          // RGB LED configuration
          element.redValue = 0.3;
          element.greenValue = 0.3;
          element.blueValue = 0.3;
        } else if (type === 'heroboard') {
          // HeroBoard settings
          element.scale = 0.8;
        }
        
        // Set rotation to 0 (default orientation)
        if (element.rotationTransform !== undefined) {
          element.rotationTransform = 0;
        }
        
        // Add component to DOM
        containerRef.current.appendChild(element);
        componentRef.current = element;
        
        // Adjust container size based on component
        setTimeout(() => {
          if (containerRef.current && element.clientHeight) {
            containerRef.current.style.height = `${Math.max(200, element.clientHeight + 40)}px`;
          }
        }, 100);
      } catch (err) {
        console.error("Error creating component simulator view:", err);
      }
    }
    
    // Cleanup when component changes
    return () => {
      if (componentRef.current) {
        componentRef.current.removeEventListener('pinhover', handlePinHover);
        componentRef.current.removeEventListener('pinleave', handlePinLeave);
      }
    };
  }, [component]);
  
  return (
    <div className="component-simulator-view-container">
      <div 
        ref={containerRef} 
        className="relative w-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200"
        style={{ minHeight: "200px" }}
      >
        {!component && (
          <div className="text-gray-400 text-sm">Select a component to view</div>
        )}
      </div>
      
      <div className="text-xs text-center mt-2 text-gray-500">
        Hover over pins to see details
      </div>
    </div>
  );
};

export default ComponentSimulatorView;
