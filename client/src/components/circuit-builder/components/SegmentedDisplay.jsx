import React, { useEffect, useRef, useState } from 'react';
import {
  ReactSevenSegmentComponent
} from "../lib/inventr-component-lib.es.js";
import Moveable from "react-moveable";
import { createPortal } from "react-dom";

// Define MOVE_SETTINGS to match what the original code expects
const MOVE_SETTINGS = {
  DRAGGABLE: true,
  SNAPPABLE: true,
  THROTTLE_DRAG: 0,
  ROTATABLE: false // Note: Seven Segment displays typically don't rotate
};

/**
 * Segmented Display Component (7-segment display)
 * Using the Wokwi implementation from invent-share-master
 */
const SegmentedDisplay = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0,
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect,
  digits = 4,
  pins = "side"
}) => {
  const targetRef = useRef();
  const moveableRef = useRef();
  const oldDataRef = useRef();

  const [isComponentMenuShowing, setIsComponentMenuShowing] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(initialRotation);
  const [pinInfo, setPinInfo] = useState();
  const [isDragged, setIsDragged] = useState(false);
  const [posTop, setPosTop] = useState(initialY);
  const [posLeft, setPosLeft] = useState(initialX);
  const [initPosTop, setInitPosTop] = useState(initialY);
  const [initPosLeft, setInitPosLeft] = useState(initialX);
  const [digitCount, setDigitCount] = useState(digits);
  const [pinLayout, setPinLayout] = useState(pins);

  // Create a component data structure that matches what the original code expects
  const componentData = {
    id,
    type: 'segmented-display',
    attrs: {
      rotate: rotationAngle,
      top: posTop,
      left: posLeft,
      zIndex: 10,
      digits: digitCount,
      pins: pinLayout
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

  // Rotate component when rotation angle is changed (if needed)
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
      const newTransform = `translate(${posLeft}px, ${posTop}px) rotate(${rotationAngle}deg)`;
      targetRef.current.style.transform = newTransform;
    }
  };

  // Rotate the handle by 90 degrees (if needed)
  const handleRotate = () => {
    setRotationAngle((rotationAngle + 90) % 360);
  };

  // Handle pin click
  const handlePinClicked = (e) => {
    if (onPinConnect) {
      const pinId = e.detail.pinId;
      const pinType = e.detail.pinType;
      onPinConnect(pinId, pinType, id);
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
      
      <ReactSevenSegmentComponent
        id={id}
        className="min-w-min cursor-pointer absolute"
        ref={targetRef}
        isActive={isSelected}
        isDragged={isDragged}
        onPinClicked={handlePinClicked}
        onPininfoChange={(e) => onPinInfoChange(e)}
        onMouseDown={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect(id);
        }}
        style={{
          transform: `translate(${initPosLeft}px, ${initPosTop}px) rotate(${rotationAngle}deg)`,
          zIndex: isDragged ? 99999 : 10
        }}
        digits={digitCount}
        pins={pinLayout}
      ></ReactSevenSegmentComponent>

      {isComponentMenuShowing && isSelected && createPortal(
        <div className="bg-gray-800 rounded shadow-lg p-2 text-white absolute">
          <div className="mb-3">
            <h3 className="text-sm font-medium mb-2">7-Segment Display Settings</h3>
            
            <div className="space-y-2">
              <div>
                <label htmlFor="digit-count" className="block text-xs font-medium mb-1">
                  Number of Digits
                </label>
                <select
                  id="digit-count"
                  value={digitCount}
                  onChange={(e) => setDigitCount(parseInt(e.target.value))}
                  className="w-full text-sm rounded p-1 text-black"
                >
                  <option value="1">1 Digit</option>
                  <option value="2">2 Digits</option>
                  <option value="4">4 Digits</option>
                  <option value="8">8 Digits</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="pin-layout" className="block text-xs font-medium mb-1">
                  Pin Layout
                </label>
                <select
                  id="pin-layout"
                  value={pinLayout}
                  onChange={(e) => setPinLayout(e.target.value)}
                  className="w-full text-sm rounded p-1 text-black"
                >
                  <option value="side">Side Pins</option>
                  <option value="bottom">Bottom Pins</option>
                </select>
              </div>
              
              <div className="mt-2 text-xs text-gray-400 italic">
                Note: The 7-segment display is controlled by the signal from connected pins.
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
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

export default SegmentedDisplay;