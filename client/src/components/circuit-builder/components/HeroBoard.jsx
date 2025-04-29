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
          }
        }
        
        console.log(`Pin clicked: ${pinId} (${pinType})`);
        
        // Call the parent's onPinConnect handler
        onPinConnect(pinId, pinType, id);
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