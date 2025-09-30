import React, { useEffect, useRef, useState } from 'react';
import {
  ReactHeroBoardElement
} from "../lib/inventr-component-lib.es.js";
import Moveable from "react-moveable";
import { useSimulator } from '../simulator/SimulatorContext';

// Define MOVE_SETTINGS to match what the original code expects
const MOVE_SETTINGS = {
  DRAGGABLE: true,
  SNAPPABLE: true,
  THROTTLE_DRAG: 0,
  ROTATABLE: true
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
  const { isRunning, componentStates } = useSimulator();

  // Create a component data structure that matches what the original code expects
  const componentData = {
    id,
    type: 'heroboard',
    attrs: {
      top: posTop,
      left: posLeft,
      zIndex: 10,
      ledPower: isRunning // Power LED only lit when simulation is running
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
      if (event.detail.pin === 13 || event.detail.pin === '13') {
        const newState = !!event.detail.value;
        setPin13State(newState);
        console.log(`[HeroBoard ${id}] Pin 13 state changed via global event to ${newState ? 'HIGH' : 'LOW'}`);
      }
    };

    // Listen for both event types
    document.addEventListener('arduinoPinChange', handleArduinoPinChange);
    document.addEventListener('pinStateChanged', handleArduinoPinChange);
    
    return () => {
      document.removeEventListener('arduinoPinChange', handleArduinoPinChange);
      document.removeEventListener('pinStateChanged', handleArduinoPinChange);
    };
  }, [id]);

  // Track pin states from the emulator signals - responsive to ALL pins
  useEffect(() => {
    if (!componentStates || !isRunning) {
      // Reset pin 13 when not running
      setPin13State(false);
      return;
    }

    // Check multiple possible sources for pin 13 state
    let pin13Found = false;
    let pin13Value = false;

    // 1. Check this specific board's state
    const myBoardState = componentStates[id];
    if (myBoardState) {
      // Check direct pin13 property
      if (myBoardState.pin13 !== undefined) {
        pin13Value = !!myBoardState.pin13;
        pin13Found = true;
        console.log(`[HeroBoard ${id}] Pin 13 from direct property: ${pin13Value ? 'HIGH' : 'LOW'}`);
      }
      // Check onboardLED property
      else if (myBoardState.onboardLED !== undefined) {
        pin13Value = !!myBoardState.onboardLED;
        pin13Found = true;
        console.log(`[HeroBoard ${id}] Pin 13 from onboardLED: ${pin13Value ? 'HIGH' : 'LOW'}`);
      }
      // Check pins['13'] 
      else if (myBoardState.pins && myBoardState.pins['13'] !== undefined) {
        pin13Value = !!myBoardState.pins['13'];
        pin13Found = true;
        console.log(`[HeroBoard ${id}] Pin 13 from pins object: ${pin13Value ? 'HIGH' : 'LOW'}`);
      }
    }

    // 2. Fallback: check any heroboard state
    if (!pin13Found) {
      const allHeroboardKeys = Object.keys(componentStates).filter(key => 
        key.includes('heroboard') || key.includes('arduino')
      );

      for (const key of allHeroboardKeys) {
        const boardState = componentStates[key];
        if (boardState && (boardState.pin13 !== undefined || boardState.onboardLED !== undefined || 
                          (boardState.pins && boardState.pins['13'] !== undefined))) {
          pin13Value = !!(boardState.pin13 || boardState.onboardLED || boardState.pins?.['13']);
          pin13Found = true;
          console.log(`[HeroBoard ${id}] Pin 13 from fallback ${key}: ${pin13Value ? 'HIGH' : 'LOW'}`);
          break;
        }
      }
    }

    // Update the pin 13 state if we found it
    if (pin13Found) {
      setPin13State(pin13Value);
    }
  }, [componentStates, id, isRunning]);

  // Notify about component movement for wire position updates
  useEffect(() => {
    // After drag, notify the Canvas about our new position
    if (!isDragged && posLeft !== undefined && posTop !== undefined) {
      // Only notify once the drag is complete
      console.log(`HeroBoard ${id} moved to ${posLeft}, ${posTop}`);

      // Get all pin elements for this component
      const heroboardPins = [...document.querySelectorAll(`[id^="pt-heroboard-${id}-"]`)];
      const pinPositions = {};

      // The offset correction for HERO board pins - critical fix
      // This offset accounts for the discrepancy between the web component's
      // internal pin positioning and our DOM/canvas coordinate system
      const OFFSET_CORRECTION_X = 256; // Experimentally determined for HERO board 
      const OFFSET_CORRECTION_Y = 304; // Experimentally determined for HERO board

      // Calculate updated pin positions
      heroboardPins.forEach(pinElement => {
        if (pinElement && pinElement.id) {
          const rect = pinElement.getBoundingClientRect();
          const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };

          // Apply the offset correction specifically for HERO board
          pinPositions[pinElement.id] = {
            x: rect.left + rect.width/2 - canvasRect.left + OFFSET_CORRECTION_X,
            y: rect.top + rect.height/2 - canvasRect.top + OFFSET_CORRECTION_Y
          };
        }
      });

      // Dispatch component moved event to update wire positions
      const event = new CustomEvent('componentMovedFinal', {
        detail: {
          componentId: id,
          x: posLeft,
          y: posTop,
          pinPositions: pinPositions, // Include accurate pin positions
          isCorrected: true, // Flag to indicate these coordinates are already corrected
        }
      });
      document.dispatchEvent(event);
    }
  }, [id, isDragged, posLeft, posTop, canvasRef]);

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
          ledPower={isRunning} // Power LED only on when simulation is running
          >
        </ReactHeroBoardElement>

        {/* Onboard LED indicator for pin 13 */}
        {isRunning && (
          <div
            style={{
              position: 'absolute',
              top: '45%',
              right: '15%',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: pin13State ? '#ff0000' : '#330000',
              boxShadow: pin13State ? '0 0 10px #ff0000' : 'none',
              transition: 'all 0.1s ease',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
            title={`Onboard LED (Pin 13): ${pin13State ? 'ON' : 'OFF'}`}
          />
        )}
      </div>
    </>
  );
};

export default HeroBoard;