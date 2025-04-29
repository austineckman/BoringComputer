import React, { useEffect, useRef, useState } from 'react';
import {
  ReactHeroBoardElement
} from "../lib/inventr-component-lib.es.js";
import Moveable from "react-moveable";
import { createPortal } from "react-dom";
import heroboardImg from '@assets/hero-board.icon.png';

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
 */
const HeroBoard = ({
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
  const componentContextRef = useRef(null);

  const [isComponentMenuShowing, setIsComponentMenuShowing] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(initialRotation);
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
      rotate: rotationAngle,
      top: posTop,
      left: posLeft,
      zIndex: 10,
      ledPower: true
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
    console.log("HeroBoard component received pin click:", e.detail);
    
    // Extract pin information from the event
    // For HeroBoard, the pins come in a different format
    let pinData = e.detail;
    let pinId, pinElement, pinType;
    
    // Check if it's the JSON format that the HeroBoard component sends
    if (pinData.data && typeof pinData.data === 'string') {
      try {
        // Parse data to get pin information
        const parsedData = JSON.parse(pinData.data);
        const pinName = parsedData.name;
        
        // Generate a unique pin ID
        pinId = `pin-${id}-${pinName}`;
        
        // Determine pin type from signals
        pinType = 'bidirectional';
        if (parsedData.signals) {
          // Check for specific signal types
          const hasAnalog = parsedData.signals.some(s => s.type === 'analog');
          const hasI2C = parsedData.signals.some(s => s.type === 'i2c');
          const hasPower = parsedData.signals.some(s => s.type === 'power');
          
          if (hasPower) {
            pinType = parsedData.name.includes('GND') ? 'input' : 'output';
          } else if (hasI2C || hasAnalog) {
            pinType = 'bidirectional';
          }
        }
        
        // Set the element - for HeroBoard, we need to use the event target
        // or find the element by ID using the ID from the pinData
        pinElement = e.target;
        
        // If we didn't get a direct element reference from the event but have a pin ID
        if (!pinElement && pinData.id) {
          // Try to find the element by its ID
          const potentialElement = document.getElementById(pinData.id);
          if (potentialElement) {
            pinElement = potentialElement;
            console.log("Found pin element by ID:", pinData.id);
          } else {
            // Create a mock element with position data
            console.log("Creating virtual pin element with position data");
            pinElement = document.createElement('div');
            pinElement.style.position = 'absolute';
            
            // Use the x and y coordinates from the parsed data and adjust for parent position
            const boardElement = targetRef.current;
            if (boardElement && parsedData.x && parsedData.y) {
              const boardRect = boardElement.getBoundingClientRect();
              
              // Set data attributes for pin identification
              pinElement.dataset.pinId = pinId;
              pinElement.dataset.pinType = pinType;
              pinElement.dataset.parentId = id;
              
              // Position the element - we'll use this for wire drawing
              document.body.appendChild(pinElement);
              
              // Get transform of parent element to apply to pin position
              const transform = getComputedStyle(boardElement).transform;
              const matrix = new DOMMatrix(transform);
              
              // Calculate position based on board's position and pin's relative position
              const left = boardRect.left + parsedData.x;
              const top = boardRect.top + parsedData.y;
              
              // Apply position to the element
              pinElement.style.left = `${left}px`;
              pinElement.style.top = `${top}px`;
              pinElement.style.width = '10px';
              pinElement.style.height = '10px';
              
              // Add cleanup to remove this element later
              setTimeout(() => {
                if (document.body.contains(pinElement)) {
                  document.body.removeChild(pinElement);
                }
              }, 100);
            }
          }
        }
        
        // Call the onPinConnect callback if provided
        if (onPinConnect) {
          onPinConnect(pinId, pinType, id);
        }
        
        // Dispatch the pin clicked event with the properly formatted data
        setTimeout(() => {
          const clickEvent = new CustomEvent('pinClicked', {
            detail: { 
              id: pinId,
              pinType: pinType,
              parentId: id,
              element: pinElement,
              label: parsedData.name
            }
          });
          
          console.log("HeroBoard dispatching pinClicked event:", clickEvent.detail);
          document.dispatchEvent(clickEvent);
        }, 10);
      } catch (error) {
        console.error("Error parsing HeroBoard pin data:", error);
      }
    } else {
      // If it's not the JSON format, handle as normal
      if (onPinConnect) {
        const pinId = e.detail.pinId;
        const pinType = e.detail.pinType;
        onPinConnect(pinId, pinType, id);
      }
      
      // Dispatch a global pinClicked event
      setTimeout(() => {
        const clickEvent = new CustomEvent('pinClicked', {
          detail: { 
            id: e.detail.pinId,
            pinType: e.detail.pinType || 'bidirectional', 
            parentId: id,
            element: e.detail.element || e.target
          }
        });
        
        console.log("HeroBoard dispatching standard pinClicked event:", clickEvent.detail);
        document.dispatchEvent(clickEvent);
      }, 10);
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
      
      <ReactHeroBoardElement
        id={id}
        className="min-w-min cursor-pointer absolute"
        ref={targetRef}
        isDragged={isDragged}
        onPinClicked={handlePinClicked}
        onPininfoChange={(e) => onPinInfoChange(e)}
        isActive={isSelected}
        rotationTransform={rotationAngle}
        onMouseDown={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect(id);
        }}
        style={{
          transform: `translate(${initPosLeft}px, ${initPosTop}px)`,
          zIndex: isDragged ? 99999 : 10
        }}
        ledPower={true}
      ></ReactHeroBoardElement>

      {isComponentMenuShowing && isSelected && createPortal(
        <div className="bg-gray-800 rounded shadow-lg p-2 text-white absolute">
          <div className="flex gap-2">
            <button
              onClick={handleRotate}
              className="p-1 bg-blue-600 rounded hover:bg-blue-700"
              title="Rotate"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
              </svg>
            </button>
            
            <button
              onClick={() => {
                if (onSelect) onSelect(null);
                const customEvent = new CustomEvent('deleteComponent', {
                  detail: { id }
                });
                document.dispatchEvent(customEvent);
              }}
              className="p-1 bg-red-600 rounded hover:bg-red-700"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
              </svg>
            </button>
          </div>
        </div>,
        document.querySelector('#component-context-menu')
      )}
    </>
  );
};

export default HeroBoard;