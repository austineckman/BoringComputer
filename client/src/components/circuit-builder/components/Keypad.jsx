import React, { useEffect, useRef, useState } from 'react';
import {
  ReactCustomKeypadComponent
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
 * Keypad Component
 * Using the Wokwi implementation from invent-share-master
 */
const Keypad = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0,
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect
}) => {
  const targetRef = useRef();
  const moveableRef = useRef();
  const oldDataRef = useRef();

  const [isComponentMenuShowing, setIsComponentMenuShowing] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(initialRotation);
  const [pinInfo, setPinInfo] = useState([]);
  const [isDragged, setIsDragged] = useState(false);
  const [posTop, setPosTop] = useState(initialY);
  const [posLeft, setPosLeft] = useState(initialX);
  const [initPosTop, setInitPosTop] = useState(initialY);
  const [initPosLeft, setInitPosLeft] = useState(initialX);

  // Create a component data structure that matches what the original code expects
  const componentData = {
    id,
    type: 'custom-keypad',
    attrs: {
      rotate: rotationAngle,
      top: posTop,
      left: posLeft,
      zIndex: 10
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

  // Handle pin click with precise positioning
  const handlePinClicked = (e) => {
    if (onPinConnect) {
      let pinId = e.detail.pinId || e.detail.pin;
      let pinType = e.detail.pinType || 'bidirectional';
      let pinName = e.detail.pinName || pinId;
      
      // Log event details for debugging
      console.log('Keypad pin click event detail:', e.detail);
      console.log('Full keypad event object:', e);
      
      try {
        let pinPosition;
        
        // Priority 1: Try to get mouse coordinates from the original event
        let mouseX, mouseY;
        
        // Check if we can access the original mouse event
        if (e.detail.originalEvent) {
          mouseX = e.detail.originalEvent.clientX;
          mouseY = e.detail.originalEvent.clientY;
          console.log('Found original event coordinates:', mouseX, mouseY);
        } else if (e.detail.clientX !== undefined && e.detail.clientY !== undefined) {
          mouseX = e.detail.clientX;
          mouseY = e.detail.clientY;
          console.log('Using event detail client coordinates:', mouseX, mouseY);
        } else if (e.detail.x !== undefined && e.detail.y !== undefined) {
          // Try converting from local coordinates to global
          const keypadElement = targetRef.current;
          if (keypadElement) {
            const rect = keypadElement.getBoundingClientRect();
            mouseX = rect.left + e.detail.x;
            mouseY = rect.top + e.detail.y;
            console.log('Converted local coordinates to global:', mouseX, mouseY);
          }
        }
        
        // If we have mouse coordinates, use them directly
        if (mouseX !== undefined && mouseY !== undefined) {
          const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
          pinPosition = {
            x: mouseX - canvasRect.left,
            y: mouseY - canvasRect.top
          };
          console.log(`Using mouse coordinates for ${pinId}: (${pinPosition.x}, ${pinPosition.y})`);
        }
        // Priority 2: Use the exact same positioning system as the visual pin dots
        else {
          const keypadElement = targetRef.current;
          if (keypadElement && canvasRef.current) {
            const keypadRect = keypadElement.getBoundingClientRect();
            const canvasRect = canvasRef.current.getBoundingClientRect();
            
            // Get the component's position and dimensions like CircuitComponent does
            const componentPosition = {
              x: keypadRect.left - canvasRect.left,
              y: keypadRect.top - canvasRect.top
            };
            const componentWidth = keypadRect.width;
            const componentHeight = keypadRect.height;
            
            // Define keypad pin positions relative to component
            // Keypad has 8 pins arranged in specific positions
            let pinRelativeX = 0.5, pinRelativeY = 0.5;
            
            // Debug: Log available pin information
            console.log(`Processing keypad pin: ${pinId}, component dimensions: ${componentWidth}x${componentHeight}`);
            console.log(`Component rect:`, keypadRect);
            console.log(`Canvas rect:`, canvasRect);
            
            // Standard 4x4 keypad pin layout (8 pins total)
            // Based on actual keypad component layout - pins are closer to center
            const normalizedRotation = rotationAngle % 360;
            
            if (normalizedRotation === 0) {
              // Standard orientation - adjust positions to match actual visual pins
              if (pinId === 'R1' || pinId === '1' || pinId === 'row1') {
                pinRelativeX = 0.25; pinRelativeY = 0.15; // Top row, pin 1
              } else if (pinId === 'R2' || pinId === '2' || pinId === 'row2') {
                pinRelativeX = 0.42; pinRelativeY = 0.15; // Top row, pin 2
              } else if (pinId === 'R3' || pinId === '3' || pinId === 'row3') {
                pinRelativeX = 0.58; pinRelativeY = 0.15; // Top row, pin 3
              } else if (pinId === 'R4' || pinId === '4' || pinId === 'row4') {
                pinRelativeX = 0.75; pinRelativeY = 0.15; // Top row, pin 4
              } else if (pinId === 'C1' || pinId === '5' || pinId === 'col1') {
                pinRelativeX = 0.25; pinRelativeY = 0.85; // Bottom row, pin 5
              } else if (pinId === 'C2' || pinId === '6' || pinId === 'col2') {
                pinRelativeX = 0.42; pinRelativeY = 0.85; // Bottom row, pin 6
              } else if (pinId === 'C3' || pinId === '7' || pinId === 'col3') {
                pinRelativeX = 0.58; pinRelativeY = 0.85; // Bottom row, pin 7
              } else if (pinId === 'C4' || pinId === '8' || pinId === 'col4') {
                pinRelativeX = 0.75; pinRelativeY = 0.85; // Bottom row, pin 8
              }
            } else if (normalizedRotation === 90) {
              // Rotated 90 degrees - pins move to right and left edges
              if (pinId === 'R1' || pinId === '1' || pinId === 'row1') {
                pinRelativeX = 0.85; pinRelativeY = 0.25; // Right edge, pin 1
              } else if (pinId === 'R2' || pinId === '2' || pinId === 'row2') {
                pinRelativeX = 0.85; pinRelativeY = 0.42; // Right edge, pin 2
              } else if (pinId === 'R3' || pinId === '3' || pinId === 'row3') {
                pinRelativeX = 0.85; pinRelativeY = 0.58; // Right edge, pin 3
              } else if (pinId === 'R4' || pinId === '4' || pinId === 'row4') {
                pinRelativeX = 0.85; pinRelativeY = 0.75; // Right edge, pin 4
              } else if (pinId === 'C1' || pinId === '5' || pinId === 'col1') {
                pinRelativeX = 0.15; pinRelativeY = 0.25; // Left edge, pin 5
              } else if (pinId === 'C2' || pinId === '6' || pinId === 'col2') {
                pinRelativeX = 0.15; pinRelativeY = 0.42; // Left edge, pin 6
              } else if (pinId === 'C3' || pinId === '7' || pinId === 'col3') {
                pinRelativeX = 0.15; pinRelativeY = 0.58; // Left edge, pin 7
              } else if (pinId === 'C4' || pinId === '8' || pinId === 'col4') {
                pinRelativeX = 0.15; pinRelativeY = 0.75; // Left edge, pin 8
              }
            } else if (normalizedRotation === 180) {
              // Rotated 180 degrees - pins flip to opposite positions
              if (pinId === 'R1' || pinId === '1' || pinId === 'row1') {
                pinRelativeX = 0.75; pinRelativeY = 0.85; // Bottom row, pin 4 position
              } else if (pinId === 'R2' || pinId === '2' || pinId === 'row2') {
                pinRelativeX = 0.58; pinRelativeY = 0.85; // Bottom row, pin 3 position
              } else if (pinId === 'R3' || pinId === '3' || pinId === 'row3') {
                pinRelativeX = 0.42; pinRelativeY = 0.85; // Bottom row, pin 2 position
              } else if (pinId === 'R4' || pinId === '4' || pinId === 'row4') {
                pinRelativeX = 0.25; pinRelativeY = 0.85; // Bottom row, pin 1 position
              } else if (pinId === 'C1' || pinId === '5' || pinId === 'col1') {
                pinRelativeX = 0.75; pinRelativeY = 0.15; // Top row, pin 4 position
              } else if (pinId === 'C2' || pinId === '6' || pinId === 'col2') {
                pinRelativeX = 0.58; pinRelativeY = 0.15; // Top row, pin 3 position
              } else if (pinId === 'C3' || pinId === '7' || pinId === 'col3') {
                pinRelativeX = 0.42; pinRelativeY = 0.15; // Top row, pin 2 position
              } else if (pinId === 'C4' || pinId === '8' || pinId === 'col4') {
                pinRelativeX = 0.25; pinRelativeY = 0.15; // Top row, pin 1 position
              }
            } else if (normalizedRotation === 270) {
              // Rotated 270 degrees - pins move to left and right edges (opposite of 90)
              if (pinId === 'R1' || pinId === '1' || pinId === 'row1') {
                pinRelativeX = 0.15; pinRelativeY = 0.75; // Left edge, pin 4 position
              } else if (pinId === 'R2' || pinId === '2' || pinId === 'row2') {
                pinRelativeX = 0.15; pinRelativeY = 0.58; // Left edge, pin 3 position
              } else if (pinId === 'R3' || pinId === '3' || pinId === 'row3') {
                pinRelativeX = 0.15; pinRelativeY = 0.42; // Left edge, pin 2 position
              } else if (pinId === 'R4' || pinId === '4' || pinId === 'row4') {
                pinRelativeX = 0.15; pinRelativeY = 0.25; // Left edge, pin 1 position
              } else if (pinId === 'C1' || pinId === '5' || pinId === 'col1') {
                pinRelativeX = 0.85; pinRelativeY = 0.75; // Right edge, pin 4 position
              } else if (pinId === 'C2' || pinId === '6' || pinId === 'col2') {
                pinRelativeX = 0.85; pinRelativeY = 0.58; // Right edge, pin 3 position
              } else if (pinId === 'C3' || pinId === '7' || pinId === 'col3') {
                pinRelativeX = 0.85; pinRelativeY = 0.42; // Right edge, pin 2 position
              } else if (pinId === 'C4' || pinId === '8' || pinId === 'col4') {
                pinRelativeX = 0.85; pinRelativeY = 0.25; // Right edge, pin 1 position
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
              x: posLeft + 30,
              y: posTop + 30
            };
            console.log(`Using fallback position for ${pinId}: (${pinPosition.x}, ${pinPosition.y})`);
          }
        }
        
        // Call the pin connection handler with the calculated position
        onPinConnect(pinId, pinType, id, pinPosition, pinName);
        console.log(`Keypad pin ${pinId} (${pinType}) of component ${id} clicked at position (${pinPosition.x}, ${pinPosition.y})`);
        
      } catch (error) {
        console.error('Error handling keypad pin click:', error);
        // Fallback call without position
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
      
      <ReactCustomKeypadComponent
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
      ></ReactCustomKeypadComponent>

      {/* Removed component menu - settings now in the properties panel */}
    </>
  );
};

export default Keypad;