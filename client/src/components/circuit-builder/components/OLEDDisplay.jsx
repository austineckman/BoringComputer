import React, { useEffect, useRef, useState } from 'react';
import {
  ReactOLEDDisplay
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
 * OLED Display Component
 * Using the Wokwi implementation from invent-share-master
 */
const OLEDDisplay = ({
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
  const [pinInfo, setPinInfo] = useState(false);
  const [isDragged, setIsDragged] = useState(false);
  const [posTop, setPosTop] = useState(initialY);
  const [posLeft, setPosLeft] = useState(initialX);
  const [initPosTop, setInitPosTop] = useState(initialY);
  const [initPosLeft, setInitPosLeft] = useState(initialX);
  const [scale, setScale] = useState(0.7); // Default scale

  // Create a component data structure that matches what the original code expects
  const componentData = {
    id,
    type: 'oled-display',
    attrs: {
      rotate: rotationAngle,
      top: posTop,
      left: posLeft,
      zIndex: 10,
      scale: scale
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
  }, [pinInfo, posTop, posLeft, scale]);

  const onPinInfoChange = (e) => {
    setPinInfo(e.detail);
  }

  // Trigger redraw function similar to the original
  const triggerRedraw = () => {
    // This simulates the original triggerRedraw function
    if (targetRef.current) {
      const newTransform = `translate(${posLeft}px, ${posTop}px) scale(${scale})`;
      targetRef.current.style.transform = newTransform;
    }
  };

  // Rotate the handle by 90 degrees
  const handleRotate = () => {
    setRotationAngle((rotationAngle + 90) % 360);
  };

  // Handle pin click
  const handlePinClicked = (e) => {
    console.log("OLED Display component received pin click:", e.detail);
    
    // Generate a proper pin ID if one doesn't exist
    const pinId = e.detail.pinId || `pin-${id}-${e.detail.index || 'unknown'}`;
    // Default to bidirectional if no pinType specified
    const pinType = e.detail.pinType || 'bidirectional';
    
    if (onPinConnect) {
      onPinConnect(pinId, pinType, id);
      console.log(`Pin ${pinId} (${pinType}) of component ${id} clicked`);
    }
    
    // Also dispatch a global pinClicked event to support wiring
    const clickEvent = new CustomEvent('pinClicked', {
      detail: { 
        id: pinId,
        pinType: pinType, 
        parentId: id,
        element: e.detail.element || e.target
      }
    });
    document.dispatchEvent(clickEvent);
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
      
      <ReactOLEDDisplay
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
          transform: `translate(${initPosLeft}px, ${initPosTop}px) scale(${scale})`,
          zIndex: isDragged ? 99999 : 10
        }}
      ></ReactOLEDDisplay>

      {isComponentMenuShowing && isSelected && createPortal(
        <div className="bg-gray-800 rounded shadow-lg p-2 text-white absolute">
          <div className="mb-3">
            <h3 className="text-sm font-medium mb-2">OLED Display Settings</h3>
            
            <div className="space-y-2">
              <div>
                <label htmlFor="display-scale" className="block text-xs font-medium mb-1">
                  Display Scale: {scale.toFixed(1)}
                </label>
                <input
                  id="display-scale"
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div className="text-xs text-gray-400 italic">
                <p>This is an I2C OLED display (SSD1306)</p>
                <p className="mt-1">Connection:</p>
                <ul className="list-disc pl-4 mt-1">
                  <li>GND: Connect to ground</li>
                  <li>VCC: Connect to 3.3V or 5V</li>
                  <li>SCL: Connect to Arduino SCL pin (A5 on Uno)</li>
                  <li>SDA: Connect to Arduino SDA pin (A4 on Uno)</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleRotate}
              className="p-1 bg-blue-600 rounded hover:bg-blue-700"
              title="Rotate Component"
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

export default OLEDDisplay;