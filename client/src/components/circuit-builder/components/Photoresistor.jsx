import React, { useEffect, useRef, useState } from 'react';
import {
  ReactPhotoresistor
} from "../lib/inventr-component-lib.es.js";
import Moveable from "react-moveable";
import { createPortal } from "react-dom";

// Define MOVE_SETTINGS to match what the original code expects
const MOVE_SETTINGS = {
  DRAGGABLE: true,
  SNAPPABLE: true,
  THROTTLE_DRAG: 0,
  ROTATABLE: true
};

/**
 * Photoresistor Component
 * Using the Wokwi implementation from invent-share-master
 * 
 * A light-sensitive resistor (LDR) with:
 * - Two connection pins
 * - Variable resistance based on light intensity
 * - Works with analog input pins
 */
const Photoresistor = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0,
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect,
  lightLevel = 50 // Default light level (0-100)
}) => {
  const targetRef = useRef();
  const moveableRef = useRef();
  const oldDataRef = useRef();

  const [isComponentMenuShowing, setIsComponentMenuShowing] = useState(false);
  const [lightValue, setLightValue] = useState(lightLevel);
  const [rotationAngle, setRotationAngle] = useState(initialRotation);
  const [pinInfo, setPinInfo] = useState();
  const [isDragged, setIsDragged] = useState(false);
  const [posTop, setPosTop] = useState(initialY);
  const [posLeft, setPosLeft] = useState(initialX);
  const [initPosTop, setInitPosTop] = useState(initialY);
  const [initPosLeft, setInitPosLeft] = useState(initialX);

  // Create a component data structure that matches what the original code expects
  const componentData = {
    id,
    type: 'photoresistor',
    attrs: {
      rotate: rotationAngle,
      top: posTop,
      left: posLeft,
      zIndex: 10,
      value: lightValue
    }
  };

  // Handle drag or rotate
  const onDragOrRotate = ({ target, beforeTranslate, beforeRotate }) => {
    if (beforeTranslate) {
      const [x, y] = beforeTranslate;
      setPosTop(y);
      setPosLeft(x);
    }
    
    if (beforeRotate !== undefined) {
      setRotationAngle(beforeRotate);
    }
  };

  // Show menu when selected
  useEffect(() => {
    setIsComponentMenuShowing(isSelected);
  }, [isSelected]);

  // Rotate component when rotation angle is changed
  useEffect(() => {
    if (moveableRef.current) {
      moveableRef.current.request("rotatable", { rotate: rotationAngle }, true);
      triggerRedraw();
    }
  }, [moveableRef.current, rotationAngle]);

  // Update position when dragged
  useEffect(() => {
    triggerRedraw();
  }, [pinInfo, posTop, posLeft]);

  const onPinInfoChange = (e) => {
    setPinInfo(e.detail);
  }

  // Trigger redraw function similar to the original
  const triggerRedraw = () => {
    // This simulates the original triggerRedraw function
    if (targetRef.current) {
      const newTransform = `translate(${posLeft}px, ${posTop}px)`;
      targetRef.current.style.transform = newTransform;
    }
  };

  // Rotate the handle by 90 degrees
  const handleRotate = () => {
    setRotationAngle((rotationAngle + 90) % 360);
  };

  // Handle pin click
  const handlePinClicked = (e) => {
    console.log("Photoresistor pin clicked", e.detail);
    
    if (onPinConnect) {
      try {
        // Parse pin data from the event
        let pinId, pinType;
        
        // Check if this is data in JSON format (from the Web Component)
        if (e.detail.data && typeof e.detail.data === 'string') {
          // Parse the JSON string to get the pin data
          const pinData = JSON.parse(e.detail.data);
          pinId = pinData.name || 'pin1'; // Default to pin1 if no name is provided
          pinType = 'bidirectional'; // Photoresistors are bidirectional
        } else {
          // Use the pin ID and type directly if available
          pinId = e.detail.pinId || 'pin1';
          pinType = e.detail.pinType || 'bidirectional';
        }

        let pinPosition;
        
        console.log('Pin click event detail:', e.detail);
        console.log('Full event object:', e);
        
        // Use direct client coordinates like HeroBoard (this is the key fix!)
        const clientX = e.detail.clientX || 0;
        const clientY = e.detail.clientY || 0;
        
        if (clientX && clientY) {
          const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
          pinPosition = {
            x: clientX - canvasRect.left,
            y: clientY - canvasRect.top
          };
          console.log(`Using direct client coordinates for ${pinId}: (${pinPosition.x}, ${pinPosition.y}) from (${clientX}, ${clientY})`);
        }
        // Priority 3: Use the exact same positioning system as the visual pin dots
        else {
          const photoresistorElement = targetRef.current;
          if (photoresistorElement && canvasRef.current) {
            const photoresistorRect = photoresistorElement.getBoundingClientRect();
            const canvasRect = canvasRef.current.getBoundingClientRect();
            
            // Get the component's position and dimensions like CircuitComponent does
            const componentPosition = {
              x: photoresistorRect.left - canvasRect.left,
              y: photoresistorRect.top - canvasRect.top
            };
            const componentWidth = photoresistorRect.width;
            const componentHeight = photoresistorRect.height;
            
            // Define pin positions relative to component like CircuitComponent
            // These percentages match the visual pin dots system
            let pinRelativeX = 0.5, pinRelativeY = 0.5;
            
            // Standard photoresistor pin layout based on rotation
            const normalizedRotation = rotationAngle % 360;
            
            if (normalizedRotation === 0) {
              // Horizontal orientation - pins on ends
              if (pinId === 'pin1' || pinId === 'A' || pinId === '1') {
                pinRelativeX = 0.1; // Left pin
                pinRelativeY = 0.5; // Center vertically
              } else {
                pinRelativeX = 0.9; // Right pin
                pinRelativeY = 0.5; // Center vertically
              }
            } else if (normalizedRotation === 90) {
              // Vertical orientation - pins on top/bottom
              if (pinId === 'pin1' || pinId === 'A' || pinId === '1') {
                pinRelativeX = 0.5; // Center horizontally
                pinRelativeY = 0.1; // Top pin
              } else {
                pinRelativeX = 0.5; // Center horizontally
                pinRelativeY = 0.9; // Bottom pin
              }
            } else if (normalizedRotation === 180) {
              // Horizontal flipped
              if (pinId === 'pin1' || pinId === 'A' || pinId === '1') {
                pinRelativeX = 0.9; // Right pin
                pinRelativeY = 0.5; // Center vertically
              } else {
                pinRelativeX = 0.1; // Left pin
                pinRelativeY = 0.5; // Center vertically
              }
            } else if (normalizedRotation === 270) {
              // Vertical flipped
              if (pinId === 'pin1' || pinId === 'A' || pinId === '1') {
                pinRelativeX = 0.5; // Center horizontally
                pinRelativeY = 0.9; // Bottom pin
              } else {
                pinRelativeX = 0.5; // Center horizontally
                pinRelativeY = 0.1; // Top pin
              }
            }
            
            // Calculate final position using the same method as CircuitComponent
            const pinAbsoluteX = componentPosition.x + (pinRelativeX * componentWidth);
            const pinAbsoluteY = componentPosition.y + (pinRelativeY * componentHeight);
            
            pinPosition = {
              x: pinAbsoluteX,
              y: pinAbsoluteY
            };
            
            console.log(`Using CircuitComponent-style pin position for ${pinId} at rotation ${normalizedRotation}°: (${pinPosition.x}, ${pinPosition.y}) - relative: (${pinRelativeX}, ${pinRelativeY})`);
          } else {
            // Last resort fallback
            pinPosition = {
              x: posLeft + 18,
              y: posTop + 18
            };
            console.log(`Using fallback position for ${pinId}: (${pinPosition.x}, ${pinPosition.y})`);
          }
        }
        
        // Generate formatted pin ID for consistent wire connections
        const formattedPinId = `pt-photoresistor-${id}-${pinId}`;
        
        // Create a custom pin click event with the correct position data
        const pinClickEvent = new CustomEvent('pinClicked', {
          detail: {
            id: formattedPinId,
            pinName: pinId,
            componentId: id,
            componentType: 'photoresistor',
            pinType: pinType,
            position: pinPosition,
            x: pinPosition.x,
            y: pinPosition.y
          }
        });
        
        // Call the onPinConnect callback with enhanced data
        onPinConnect(
          formattedPinId,
          pinType,
          id,
          pinPosition,
          pinClickEvent
        );
        
      } catch (error) {
        console.error('Error handling photoresistor pin click:', error);
        
        // Fallback to original behavior
        const pinId = e.detail.pinId || 'pin1';
        const pinType = e.detail.pinType || 'bidirectional';
        onPinConnect(pinId, pinType, id);
      }
    }
  };

  // Create context menu portal target if it doesn't exist
  useEffect(() => {
    if (!document.querySelector('#component-context-menu')) {
      const menuDiv = document.createElement('div');
      menuDiv.id = 'component-context-menu';
      menuDiv.style.position = 'absolute';
      menuDiv.style.zIndex = '9999';
      document.body.appendChild(menuDiv);
    }
  }, []);

  return (
    <>
      {isSelected && (
        <Moveable
          ref={moveableRef}
          target={targetRef}
          draggable={MOVE_SETTINGS.DRAGGABLE}
          snappable={MOVE_SETTINGS.SNAPPABLE}
          throttleDrag={MOVE_SETTINGS.THROTTLE_DRAG}
          rotatable={MOVE_SETTINGS.ROTATABLE}
          onDrag={onDragOrRotate}
          onRotate={onDragOrRotate}
          onDragStart={() => setIsDragged(true)}
          onDragEnd={() => setIsDragged(false)}
        ></Moveable>
      )}
      
      <ReactPhotoresistor
        id={id}
        className="min-w-min cursor-pointer absolute"
        ref={targetRef}
        isActive={isSelected}
        isDragged={isDragged}
        onPinClicked={handlePinClicked}
        onPininfoChange={(e) => onPinInfoChange(e)}
        rotationTransform={rotationAngle}
        onMouseDown={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect(id);
        }}
        style={{
          transform: `translate(${initPosLeft}px, ${initPosTop}px)`,
          zIndex: isDragged ? 99999 : 10
        }}
        value={lightValue}
        width="36px"
      ></ReactPhotoresistor>

      {/* Removed component menu - settings now in the properties panel */}
    </>
  );
};

export default Photoresistor;