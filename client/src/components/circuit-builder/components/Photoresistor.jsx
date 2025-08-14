import React, { useEffect, useRef, useState } from 'react';
import {
  ReactPhotoresistor
} from "../lib/inventr-component-lib.es.js";
import Moveable from "react-moveable";
import { createPortal } from "react-dom";
import { useSimulator } from '../simulator/SimulatorContext.jsx';

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

  // Get simulator context for state management
  // @ts-ignore - updateComponentState comes from context
  const { updateComponentState } = useSimulator();

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

  // Initialize photoresistor state in simulator when component mounts
  useEffect(() => {
    if (updateComponentState) {
      const analogValue = Math.round((lightValue / 100) * 1023); // Convert 0-100% to 0-1023 analog range
      updateComponentState(id, { 
        lightLevel: analogValue,
        lightPercentage: lightValue,
        type: 'photoresistor'
      });
      console.log(`Photoresistor ${id}: Initialized simulator state with lightLevel=${analogValue} (${lightValue}%)`);
    }
  }, []); // Run once on mount

  // Update light value and sync with simulator
  const updateLightValue = (newValue) => {
    setLightValue(newValue);
    
    if (updateComponentState) {
      const analogValue = Math.round((newValue / 100) * 1023); // Convert 0-100% to 0-1023 analog range
      updateComponentState(id, { 
        lightLevel: analogValue,
        lightPercentage: newValue,
        type: 'photoresistor'
      });
      console.log(`Photoresistor ${id}: Real-time update - lightLevel=${analogValue} (${newValue}%)`);
    }
  };

  // Real-time update whenever lightValue changes
  useEffect(() => {
    if (updateComponentState) {
      const analogValue = Math.round((lightValue / 100) * 1023);
      updateComponentState(id, { 
        lightLevel: analogValue,
        lightPercentage: lightValue,
        type: 'photoresistor'
      });
    }
  }, [lightValue, updateComponentState, id]);

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
        } else {
          // Fallback if no clientX/clientY - should rarely happen
          console.warn('No clientX/clientY coordinates available for photoresistor pin');
          const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
          pinPosition = {
            x: 100, // Fallback position
            y: 100
          };
        }
        
        // Call the parent's onPinConnect handler
        onPinConnect(pinId, pinType, id);
        
        // Send another event with the formatted pin ID to match our wire manager
        // Use the exact same format as the HeroBoard component
        const formattedPinId = `pt-photoresistor-${id}-${pinId}`;
        
        // Create a custom pin click event to trigger the wire manager
        // Use the EXACT same event structure as the HeroBoard component
        const pinClickEvent = new CustomEvent('pinClicked', {
          detail: {
            id: formattedPinId,
            pinData: e.detail.data,
            pinType: pinType,
            parentId: id,
            clientX,
            clientY
          }
        });
        
        // Dispatch the event to be captured by the wire manager
        document.dispatchEvent(pinClickEvent);
        console.log(`Photoresistor pin ${pinId} (${pinType}) of component ${id} clicked at position (${clientX}, ${clientY})`);
        
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

      {/* Light Level Control Panel */}
      {isSelected && (
        <>
          {createPortal(
            <div
              className="fixed bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl z-50"
              style={{
                left: `${posLeft + 50}px`,
                top: `${posTop - 20}px`,
                minWidth: '200px'
              }}
            >
              <div className="text-white text-sm font-bold mb-2">
                Photoresistor Settings
              </div>
              <div className="text-gray-300 text-xs mb-2">
                Light Level: {lightValue}%
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={lightValue}
                onChange={(e) => updateLightValue(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #1f2937 0%, #fbbf24 ${lightValue}%, #1f2937 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Dark</span>
                <span>Bright</span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Analog Value: {Math.round((lightValue / 100) * 1023)}
              </div>
            </div>,
            document.getElementById('component-context-menu') || document.body
          )}
        </>
      )}
    </>
  );
};

export default Photoresistor;