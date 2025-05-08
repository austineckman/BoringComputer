import React, { useEffect, useRef, useState } from 'react';
import {
  ReactBuzzerComponent
} from "../lib/inventr-component-lib.es.js";
import Moveable from "react-moveable";

// Define MOVE_SETTINGS to match what the original code expects
const MOVE_SETTINGS = {
  DRAGGABLE: true,
  SNAPPABLE: true,
  THROTTLE_DRAG: 0,
  ROTATABLE: true
};

/**
 * Buzzer Component
 * Using the Wokwi implementation from invent-share-master
 */
const Buzzer = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0,
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect,
  hasSignal = false // Default to off
}) => {
  const targetRef = useRef();
  const moveableRef = useRef();
  const oldDataRef = useRef();

  const [buzzerActive, setBuzzerActive] = useState(hasSignal);
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
    type: 'buzzer',
    attrs: {
      rotate: rotationAngle,
      top: posTop,
      left: posLeft,
      zIndex: 10,
      hasSignal: buzzerActive
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

  // No longer need to show/hide component-specific menu

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
    console.log("Buzzer pin clicked", e.detail);
    
    if (onPinConnect) {
      try {
        // Parse pin data from the event
        let pinId, pinType;
        
        // Check if this is data in JSON format (from the Web Component)
        if (e.detail.data && typeof e.detail.data === 'string') {
          // Parse the JSON string to get the pin data
          const pinData = JSON.parse(e.detail.data);
          pinId = pinData.name || 'pin1'; // Default to pin1 if no name is provided
          pinType = 'bidirectional'; // Default type
          
          // Determine pin type if signals are available
          if (pinData.signals && pinData.signals.length > 0) {
            const signal = pinData.signals[0];
            if (signal.type === 'power') {
              pinType = 'power';
            } else if (signal.type === 'ground') {
              pinType = 'ground';
            }
          }
        } else {
          // Use the pin ID and type directly if available
          pinId = e.detail.pinId || 'pin1';
          pinType = e.detail.pinType || 'bidirectional';
        }

        // Get the actual pin element directly
        const pinElement = e.detail.target || e.target;
        let pinPosition;
        
        // Get precise position from the DOM element
        if (pinElement && canvasRef.current) {
          const pinRect = pinElement.getBoundingClientRect();
          const canvasRect = canvasRef.current.getBoundingClientRect();
          
          pinPosition = {
            x: pinRect.left + (pinRect.width / 2) - canvasRect.left,
            y: pinRect.top + (pinRect.height / 2) - canvasRect.top
          };
          
          console.log(`Using pin element position for ${pinId}: (${pinPosition.x}, ${pinPosition.y})`);
        } 
        // Fallback to event coordinates
        else if (e.detail.clientX && e.detail.clientY) {
          const clientX = e.detail.clientX;
          const clientY = e.detail.clientY;
          
          // Calculate position relative to canvas
          const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
          pinPosition = {
            x: clientX - canvasRect.left,
            y: clientY - canvasRect.top
          };
          
          console.log(`Using event coordinates for ${pinId}: (${pinPosition.x}, ${pinPosition.y})`);
        } 
        // Final fallback - use component position + approximated pin offset
        else {
          // Try to find the actual pin element by ID pattern
          const buzzerElement = document.getElementById(id);
          if (buzzerElement) {
            const buzzerRect = buzzerElement.getBoundingClientRect();
            const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
            
            // Apply appropriate offset based on pin name if known
            let offsetX = 0, offsetY = 0;
            
            if (pinId === 'bz1') {
              offsetX = 10;
              offsetY = buzzerRect.height - 15;
            } else if (pinId === 'bz2') {
              offsetX = buzzerRect.width / 2;
              offsetY = buzzerRect.height - 10;
            } else if (pinId === 'bz3') {
              offsetX = buzzerRect.width - 10;
              offsetY = buzzerRect.height - 15;
            }
            
            pinPosition = {
              x: buzzerRect.left + offsetX - canvasRect.left,
              y: buzzerRect.top + offsetY - canvasRect.top
            };
            
            console.log(`Using calculated offset for ${pinId}: (${pinPosition.x}, ${pinPosition.y})`);
          } else {
            // Last resort fallback
            pinPosition = {
              x: posLeft + 20,
              y: posTop + buzzerRect?.height || 100
            };
          }
        }
        
        // Generate formatted pin ID for consistent wire connections
        const formattedPinId = `pt-buzzer-${id}-${pinId}`;
        
        // Create a custom pin click event with the correct position data
        const pinClickEvent = new CustomEvent('pinClicked', {
          detail: {
            id: formattedPinId,
            pinName: pinId,
            pinType: pinType,
            parentId: id,
            pinPosition: pinPosition,
            clientX: pinPosition.x + (canvasRef.current?.getBoundingClientRect()?.left || 0), 
            clientY: pinPosition.y + (canvasRef.current?.getBoundingClientRect()?.top || 0)
          }
        });
        
        // Dispatch the event first, then call the callback
        document.dispatchEvent(pinClickEvent);
        
        console.log(`Buzzer pin ${pinId} (${pinType}) clicked at position:`, pinPosition);
        
        // We don't need to call onPinConnect directly as the wire manager will handle the event
        // onPinConnect(pinId, pinType, id, pinPosition);
      } catch (err) {
        console.error("Error parsing pin data in Buzzer:", err);
        // Error handling fallback just dispatch a basic event
        const defaultPinPosition = {
          x: posLeft + 20,
          y: posTop + 20
        };
        
        // Dispatch a minimal event that the wire manager can handle
        const fallbackEvent = new CustomEvent('pinClicked', {
          detail: {
            id: `pt-buzzer-${id}-bz1`,
            pinName: 'bz1',
            pinType: 'bidirectional',
            parentId: id,
            pinPosition: defaultPinPosition,
            clientX: defaultPinPosition.x + (canvasRef.current?.getBoundingClientRect()?.left || 0),
            clientY: defaultPinPosition.y + (canvasRef.current?.getBoundingClientRect()?.top || 0)
          }
        });
        document.dispatchEvent(fallbackEvent);
      }
    }
  };

  // Context menu creation has been removed - now using centralized Properties panel

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
      
      <ReactBuzzerComponent
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
        hasSignal={buzzerActive}
      ></ReactBuzzerComponent>

      {/* Removed component-specific menu - now using centralized Properties panel */}
    </>
  );
};

export default Buzzer;