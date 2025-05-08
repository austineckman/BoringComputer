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
      
      // Dispatch component moved event to update wire positions
      const event = new CustomEvent('componentMovedFinal', {
        detail: {
          componentId: id,
          x: posLeft,
          y: posTop,
          // We could include pin positions here if needed
        }
      });
      document.dispatchEvent(event);
    }
  }, [id, isDragged, posLeft, posTop]);

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

  // Handle pin click
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
        
        // Calculate accurate pin position
        const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
        const pinPosition = {
          x: clientX - canvasRect.left,
          y: clientY - canvasRect.top
        };
        
        // Send another event with the formatted pin ID to match our wire manager
        // Format MUST match the format in CircuitComponent.jsx
        const formattedPinId = `pt-heroboard-${id.replace(/ /g, '')}-${pinId}`;
        
        // Call the parent's onPinConnect handler with the position
        onPinConnect(pinId, pinType, id, pinPosition);
        
        // Create a comprehensive pin position data object
        const pinPositionData = {
          x: pinPosition.x,
          y: pinPosition.y,
          origComponentX: isNaN(parseInt(pinPosition.origComponentX)) ? 0 : parseInt(pinPosition.origComponentX),
          origComponentY: isNaN(parseInt(pinPosition.origComponentY)) ? 0 : parseInt(pinPosition.origComponentY),
          pinId: pinId,
          componentId: id,
          formattedId: formattedPinId,
          type: pinType,
          timestamp: Date.now()
        };
        
        // Create a custom pin click event to trigger the wire manager
        const pinClickEvent = new CustomEvent('pinClicked', {
          detail: {
            id: formattedPinId,
            pinData: JSON.stringify(pinPositionData),
            pinType: pinType,
            parentId: id,
            clientX: pinPosition.x,
            clientY: pinPosition.y
          }
        });
        
        // Dispatch the event to be captured by the SimpleWireManager
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