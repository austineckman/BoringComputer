import React, { useEffect, useRef, useState } from 'react';
import {
  ReactRotaryEncoder
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
 * Rotary Encoder Component
 * Using the Wokwi implementation from invent-share-master
 */
const RotaryEncoder = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0,
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect,
  stepSize = 1 // Default step size
}) => {
  const targetRef = useRef();
  const moveableRef = useRef();
  const oldDataRef = useRef();

  const [isComponentMenuShowing, setIsComponentMenuShowing] = useState(false);
  const [rotEncoderAngle, setRotEncoderAngle] = useState(0); // Initial encoder angle
  const [rotationAngle, setRotationAngle] = useState(initialRotation);
  const [pinInfo, setPinInfo] = useState();
  const [isDragged, setIsDragged] = useState(false);
  const [posTop, setPosTop] = useState(initialY);
  const [posLeft, setPosLeft] = useState(initialX);
  const [initPosTop, setInitPosTop] = useState(initialY);
  const [initPosLeft, setInitPosLeft] = useState(initialX);
  const [encoderStepSize, setEncoderStepSize] = useState(stepSize);

  // Create a component data structure that matches what the original code expects
  const componentData = {
    id,
    type: 'rotary-encoder',
    attrs: {
      rotate: rotationAngle,
      top: posTop,
      left: posLeft,
      zIndex: 10,
      angle: rotEncoderAngle,
      stepSize: encoderStepSize
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

  // Handle encoder rotation clockwise
  const handleRotateCW = () => {
    setRotEncoderAngle(rotEncoderAngle + parseInt(encoderStepSize));
  };

  // Handle encoder rotation counter-clockwise
  const handleRotateCCW = () => {
    setRotEncoderAngle(rotEncoderAngle - parseInt(encoderStepSize));
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
      
      <ReactRotaryEncoder
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
        rotateCw={handleRotateCW}
        rotateCCw={handleRotateCCW}
        angle={rotEncoderAngle}
      ></ReactRotaryEncoder>

      {isComponentMenuShowing && isSelected && createPortal(
        <div className="bg-gray-800 rounded shadow-lg p-2 text-white absolute">
          <div className="mb-3">
            <h3 className="text-sm font-medium mb-2">Rotary Encoder Settings</h3>
            
            <div className="space-y-2">
              <div>
                <label htmlFor="encoder-angle" className="block text-xs font-medium mb-1">
                  Current Angle: {rotEncoderAngle}°
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleRotateCCW}
                    className="p-1 bg-blue-600 rounded hover:bg-blue-700 flex-1"
                  >
                    ⟲ CCW
                  </button>
                  <button
                    onClick={handleRotateCW}
                    className="p-1 bg-blue-600 rounded hover:bg-blue-700 flex-1"
                  >
                    ⟳ CW
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="step-size" className="block text-xs font-medium mb-1">
                  Step Size
                </label>
                <select
                  id="step-size"
                  value={encoderStepSize}
                  onChange={(e) => setEncoderStepSize(e.target.value)}
                  className="w-full text-sm rounded p-1 text-black"
                >
                  <option value="1">1° (Fine)</option>
                  <option value="5">5° (Medium)</option>
                  <option value="10">10° (Coarse)</option>
                  <option value="15">15° (Very Coarse)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="manual-angle" className="block text-xs font-medium mb-1">
                  Manual Angle Setting
                </label>
                <input
                  type="number"
                  id="manual-angle"
                  min="0"
                  max="360"
                  step={encoderStepSize}
                  value={rotEncoderAngle}
                  onChange={(e) => setRotEncoderAngle(parseInt(e.target.value) || 0)}
                  className="w-full text-sm rounded p-1 text-black"
                />
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

export default RotaryEncoder;