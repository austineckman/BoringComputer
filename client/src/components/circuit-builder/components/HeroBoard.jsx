import React, { useEffect, useRef, useState } from 'react';
import {
  ReactHeroBoardElement
} from "../lib/inventr-component-lib.es.js";
import Moveable from "react-moveable";
import heroboardImg from '@assets/hero-board.icon.png';
import { useSimulator } from "../simulator/SimulatorContext";

// Define MOVE_SETTINGS - remove rotation
const MOVE_SETTINGS = {
  DRAGGABLE: true,
  SNAPPABLE: true,
  THROTTLE_DRAG: 0,
  ROTATABLE: false // Disable rotation
};

/**
 * HeroBoard Component (Arduino UNO R3 compatible)
 * Using the Wokwi implementation from invent-share-master
 * Rotation functionality removed for simplicity
 */
const HeroBoard = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0, // Kept for compatibility but not used
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect
}) => {
  const targetRef = useRef();
  const moveableRef = useRef();
  const [isDragged, setIsDragged] = useState(false);
  const [posTop, setPosTop] = useState(initialY);
  const [posLeft, setPosLeft] = useState(initialX);
  const [initPosTop, setInitPosTop] = useState(initialY);
  const [initPosLeft, setInitPosLeft] = useState(initialX);
  const [pinInfo, setPinInfo] = useState();
  const [pin13State, setPin13State] = useState(false); // Track the state of pin 13

  // Access simulator context for simulation state
  const { isRunning: isSimulationRunning, componentStates } = useSimulator();
  
  // Create a component data structure that matches what the original code expects
  const componentData = {
    id,
    type: 'heroboard',
    attrs: {
      top: posTop,
      left: posLeft,
      zIndex: 10,
      ledPower: isSimulationRunning // Power LED only lit when simulation is running
    }
  };

  // Handle drag only (rotation removed)
  const onDrag = ({ target, beforeTranslate }) => {
    if (beforeTranslate) {
      const [x, y] = beforeTranslate;
      setPosTop(y);
      setPosLeft(x);
    }
  };

  // NOTE: Removed problematic useEffect that was causing infinite re-renders
  // Position updates are now handled by React state and CSS transforms directly
  
  // Listen for global Arduino pin changes as fallback
  useEffect(() => {
    const handleArduinoPinChange = (event) => {
      if (event.detail.pin === 13) {
        setPin13State(event.detail.value);
        console.log(`[HeroBoard ${id}] Pin 13 state changed via global event to ${event.detail.value ? 'HIGH' : 'LOW'}`);
      }
    };

    document.addEventListener('arduinoPinChange', handleArduinoPinChange);
    return () => document.removeEventListener('arduinoPinChange', handleArduinoPinChange);
  }, [id]);

  // Track pin states from the emulator signals - responsive to ALL pins
  useEffect(() => {
    // This effect listens for pin state changes from the emulator
    // and updates the HeroBoard display accordingly
    if (!componentStates) return;
    
    // More robust lookup for this board or fallbacks
    const boardKeys = Object.keys(componentStates).filter(key => 
      key === id || 
      key === 'heroboard' || 
      key.startsWith('heroboard-') ||
      key.includes('arduino')
    );
    
    // No relevant board state found
    if (boardKeys.length === 0) return;
    
    // Use this board's state or the first fallback
    const stateKey = boardKeys[0];
    const boardState = componentStates[stateKey];
    
    if (boardState) {
      // Check both formats: direct pin13 property or nested in pins object
      
      // 1. Check direct pin13 property (from SimulatorContext's guaranteed blink)
      if (boardState.pin13 !== undefined) {
        setPin13State(!!boardState.pin13);
        console.log(`[HeroBoard ${id}] Pin 13 state changed to ${boardState.pin13 ? 'HIGH' : 'LOW'} (direct)`);
      }
      
      // 2. Check pins['13'] for backward compatibility with other code
      else if (boardState.pins && boardState.pins['13'] !== undefined) {
        // Handle cases where pin state might be object or boolean
        const isHigh = typeof boardState.pins['13'] === 'object' 
          ? boardState.pins['13'].isHigh 
          : !!boardState.pins['13'];
          
        setPin13State(isHigh);
        console.log(`[HeroBoard ${id}] Pin 13 state changed to ${isHigh ? 'HIGH' : 'LOW'} (pins obj)`);
      }
      
      // No need to log anything when pin state is missing
      // The hardware emulator is driving pin updates now, so we don't need fallbacks
    }
  }, [componentStates, id]);
  
  // Dispatch component moved event when position changes
  useEffect(() => {
    if (posLeft !== undefined && posTop !== undefined) {
      // Dispatch event to notify wire manager
      const event = new CustomEvent('componentMoved', {
        detail: {
          componentId: id,
          x: posLeft,
          y: posTop
        }
      });
      document.dispatchEvent(event);
    }
  }, [id, posLeft, posTop]);

  const onPinInfoChange = (e) => {
    setPinInfo(e.detail);
  }

  // Trigger redraw function to update position
  const triggerRedraw = () => {
    if (targetRef.current) {
      const newTransform = `translate(${posLeft}px, ${posTop}px)`;
      targetRef.current.style.transform = newTransform;
    }
  };

  // Handle pin click - identical to the LED component approach
  const handlePinClicked = (e) => {
    console.log("Pin clicked on HeroBoard:", e.detail);
    
    // Extract pin information from the event
    if (onPinConnect) {
      try {
        // The data is a JSON string inside the detail object
        const pinDataJson = e.detail.data;
        const pinData = JSON.parse(pinDataJson);
        
        // Get pin ID and type from the parsed data
        const pinId = pinData.name;
        // Determine pin type based on signals if available
        let pinType = 'bidirectional';
        if (pinData.signals && pinData.signals.length > 0) {
          const signal = pinData.signals[0];
          if (signal.type === 'power') {
            pinType = 'power';
          } else if (signal.type === 'spi' || signal.type === 'i2c') {
            pinType = 'digital';
          } else if (signal.type === 'analog') {
            pinType = 'analog';
          }
        }
        
        // Get position information
        const clientX = e.detail.clientX || 0;
        const clientY = e.detail.clientY || 0;
        
        console.log(`Pin clicked: ${pinId} (${pinType})`);
        
        // Call the parent's onPinConnect handler
        onPinConnect(pinId, pinType, id);
        
        // Send another event with the formatted pin ID to match our wire manager
        // Use the exact same format as the LED component
        const formattedPinId = `pt-heroboard-${id}-${pinId}`;
        
        // Create a custom pin click event to trigger the wire manager
        // Use the EXACT same event structure as the LED component
        const pinClickEvent = new CustomEvent('pinClicked', {
          detail: {
            id: formattedPinId,
            pinData: pinDataJson,
            pinType: pinType,
            parentId: id,
            clientX,
            clientY
          }
        });
        
        // Dispatch the event to be captured by the wire manager
        document.dispatchEvent(pinClickEvent);
      } catch (err) {
        console.error("Error parsing pin data:", err);
      }
    }
  };

  return (
    <>
      {isSelected && (
        <Moveable
          ref={moveableRef}
          target={targetRef}
          draggable={MOVE_SETTINGS.DRAGGABLE}
          snappable={MOVE_SETTINGS.SNAPPABLE}
          throttleDrag={MOVE_SETTINGS.THROTTLE_DRAG}
          rotatable={false} // Explicitly set to false to prevent rotation
          hideDefaultLines={true} // Hide the default selection lines
          className="moveable-no-border" // Add custom class for styling
          onDrag={onDrag}
          onDragStart={() => setIsDragged(true)}
          onDragEnd={() => setIsDragged(false)}
        ></Moveable>
      )}
      
      <div className="relative">
        <ReactHeroBoardElement
          id={id}
          className="min-w-min cursor-pointer absolute"
          ref={targetRef}
          isDragged={isDragged}
          onPinClicked={handlePinClicked}
          onPininfoChange={(e) => onPinInfoChange(e)}
          isActive={false} // Remove the active state to prevent blue outline
          rotationTransform={0} // Fixed to 0 degrees - no rotation
          onMouseDown={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect(id);
          }}
          style={{
            transform: `translate(${posLeft}px, ${posTop}px)`,
            zIndex: isDragged ? 99999 : 10,
            outline: isSelected ? '1px solid #3b82f6' : 'none' // Apply a single outline when selected
          }}
          ledPower={isSimulationRunning} // Power LED only on when simulation is running
        ></ReactHeroBoardElement>
        
        {/* Power LED removed - we'll only use the built-in pin 13 LED */}
        
        {/* Built-in RED LED for pin 13 - using CSS class for better compatibility */}
        <div 
          className={`heroboard-pin13-led absolute ${pin13State ? 'pin13-on' : ''}`}
          style={{
            // Always visible during simulation, but with lower opacity when off
            opacity: 1, // Always fully visible for testing 
            backgroundColor: pin13State ? '#ff3300' : '#330000', // Darker red when off
            boxShadow: pin13State ? '0 0 12px 5px rgba(255, 0, 0, 0.8)' : 'none', // Glow only when on
            animation: pin13State ? 'pulse 1s infinite alternate ease-in-out' : 'none',
            top: `${posTop + 43}px`, 
            left: `${posLeft + 107}px`,
            zIndex: 1000, // Higher z-index to ensure visibility
            width: '10px', 
            height: '10px',
            // Add a border to make it more visible when off
            border: '1px solid #661100'
          }}
        />
        
        {/* Debug indicator for Pin 13 state */}
        <div
          style={{
            position: 'absolute',
            top: `${posTop + 60}px`,
            left: `${posLeft + 105}px`,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: pin13State ? '#ff3300' : '#aaaaaa',
            fontSize: '8px',
            padding: '1px 3px',
            borderRadius: '2px',
            fontFamily: 'monospace',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          13: {pin13State ? 'HIGH' : 'LOW'}
        </div>
      </div>
    </>
  );
};

export default HeroBoard;