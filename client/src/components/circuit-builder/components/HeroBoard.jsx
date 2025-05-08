import React, { useEffect, useRef, useState } from 'react';
import {
  ReactHeroBoardElement
} from "../lib/inventr-component-lib.es.js";
import Moveable from "react-moveable";
import heroboardImg from '@assets/hero-board.icon.png';

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

  // Create a component data structure that matches what the original code expects
  const componentData = {
    id,
    type: 'heroboard',
    attrs: {
      top: posTop,
      left: posLeft,
      zIndex: 10,
      ledPower: true
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

  // Update position when dragged
  useEffect(() => {
    triggerRedraw();
  }, [pinInfo, posTop, posLeft]);
  
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

  // Handle pin click with position correction for HERO board
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
        
        // Get position information from the click event
        const clientX = e.detail.clientX || 0;
        const clientY = e.detail.clientY || 0;
        
        console.log(`Pin clicked: ${pinId} (${pinType})`);
        
        // Calculate the board's DOM element position
        const targetElement = targetRef.current;
        const componentRect = targetElement ? targetElement.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
        
        // Calculate accurate pin position - CRITICAL FIX FOR HERO BOARD
        // The HERO board internally offsets pins but reports global coordinates
        // We need to convert these to the actual canvas coordinates
        const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
        
        // Calculate the ACTUAL pin position based on the click coordinates
        const pinPosition = {
          x: clientX - canvasRect.left,
          y: clientY - canvasRect.top
        };
        
        // Send another event with the formatted pin ID to match our wire manager
        // Format MUST match the format in CircuitComponent.jsx
        const formattedPinId = `pt-heroboard-${id.replace(/ /g, '')}-${pinId}`;
        
        // Call the parent's onPinConnect handler
        onPinConnect(pinId, pinType, id, pinPosition);
        
        console.log(`Pin ${pinId} (${pinType}) of component ${id} clicked`, pinPosition);
        console.log(`Using pin position: (${pinPosition.x}, ${pinPosition.y})`);
        
        // Create a custom pin click event to trigger the wire manager
        // The critical fix is using the ACTUAL client coordinates here
        const pinClickEvent = new CustomEvent('pinClicked', {
          detail: {
            pinId: formattedPinId,
            pinName: pinId,
            pinType: pinType,
            parentComponentId: id,
            // Using the direct pin position property which our BasicWireManager expects
            pinPosition: {
              x: pinPosition.x,
              y: pinPosition.y
            },
            // Also include the raw client coordinates for fallback
            clientX: clientX,
            clientY: clientY
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
          transform: `translate(${initPosLeft}px, ${initPosTop}px)`,
          zIndex: isDragged ? 99999 : 10,
          outline: isSelected ? '1px solid #3b82f6' : 'none' // Apply a single outline when selected
        }}
        ledPower={true}
      ></ReactHeroBoardElement>
    </>
  );
};

export default HeroBoard;