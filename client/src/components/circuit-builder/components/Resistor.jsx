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

      {/* Removed component menu - settings now in the properties panel */}
    </>
  );
};

export default Resistor;