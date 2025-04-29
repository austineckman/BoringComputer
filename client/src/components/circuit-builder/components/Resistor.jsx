import React, { useEffect, useRef, useState } from 'react';
import {
  ReactResistorComponent
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

// Introduced constants for resistor units
const RESISTOR_UNITS = {
  OHM: 'ohm',
  KILOHM: 'kilohm',
  MEGAOHM: 'megaohm'
};

/**
 * Resistor Component
 * Using the Wokwi implementation from invent-share-master
 */
const Resistor = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0,
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect,
  value = '220Ω' // Default resistance value
}) => {
  const targetRef = useRef();
  const moveableRef = useRef();
  const oldDataRef = useRef();

  // Parse the initial value
  const initialValueNum = parseInt(value.replace(/[^\d]/g, ''));

  const [isComponentMenuShowing, setIsComponentMenuShowing] = useState(false);
  const [resistorValue, setResistorValue] = useState(initialValueNum / 1000); // In ohms for the component
  const [inputResistorValue, setInputResistorValue] = useState(initialValueNum); // For display/input
  const [resistorValueUnit, setResistorValueUnit] = useState(RESISTOR_UNITS.KILOHM);
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
    type: 'resistor',
    attrs: {
      rotate: rotationAngle,
      top: posTop,
      left: posLeft,
      zIndex: 10,
      value: resistorValue
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

  // Update resistance value when input or units change
  useEffect(() => {
    calculateResistorValue(inputResistorValue, resistorValueUnit);
  }, [inputResistorValue, resistorValueUnit]);

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

  // Calculate and set resistor value based on value and unit
  const calculateResistorValue = (newValue, unitType) => {
    switch (unitType) {
      case RESISTOR_UNITS.OHM:
        setResistorValue(newValue);
        break;
      case RESISTOR_UNITS.KILOHM:
        setResistorValue(newValue / 1000);
        break;
      case RESISTOR_UNITS.MEGAOHM:
        setResistorValue(newValue / 1000000);
        break;
    }
  };

  // Rotate the handle by 90 degrees
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

  // Sets the resistor value unit
  const onResistorUnitsChange = (newVal) => {
    setResistorValueUnit(newVal);
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
      
      <ReactResistorComponent
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
        value={resistorValue}
      ></ReactResistorComponent>

      {isComponentMenuShowing && isSelected && createPortal(
        <div className="bg-gray-800 rounded shadow-lg p-2 text-white absolute">
          <div className="mb-3">
            <div className="flex items-end gap-2">
              <div>
                <label htmlFor="resistor-value" className="block text-sm font-medium mb-1">
                  Value
                </label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={inputResistorValue}
                  onChange={(e) => setInputResistorValue(e.target.value)}
                  className="w-24 px-2 py-1 text-black rounded border-0"
                />
              </div>
              
              <div>
                <label htmlFor="resistor-units" className="block text-sm font-medium mb-1">
                  Units
                </label>
                <select
                  value={resistorValueUnit}
                  onChange={(e) => onResistorUnitsChange(e.target.value)}
                  className="w-24 px-2 py-1 text-black rounded border-0"
                >
                  <option value="ohm">Ω</option>
                  <option value="kilohm">KΩ</option>
                  <option value="megaohm">MΩ</option>
                </select>
              </div>
            </div>
          </div>
          
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

export default Resistor;