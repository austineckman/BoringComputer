import React, { useEffect, useRef, useState } from 'react';
import {
  ReactRGBLEDComponent
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
 * RGB LED Component
 * Using the Wokwi implementation from invent-share-master
 */
const RGBLED = ({
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
  const [ledRed, setLedRed] = useState(0); // Initial red value (0-1)
  const [ledGreen, setLedGreen] = useState(0); // Initial green value (0-1)
  const [ledBlue, setLedBlue] = useState(0); // Initial blue value (0-1)
  const [commonPin, setCommonPin] = useState('anode'); // 'anode' or 'cathode'
  
  // Initialize from props at component creation
  useEffect(() => {
    // The props values are already destructured in the function signature
    if (typeof ledRed === 'number') {
      setLedRed(ledRed);
    }
    if (typeof ledGreen === 'number') {
      setLedGreen(ledGreen);
    }
    if (typeof ledBlue === 'number') {
      setLedBlue(ledBlue);
    }
    if (typeof commonPin === 'string') {
      setCommonPin(commonPin);
    }
  // Only run on mount - props changes handled below
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle prop updates separately for each value to avoid dependency cycles
  useEffect(() => {
    if (typeof ledRed === 'number') setLedRed(ledRed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledRed]);
  
  useEffect(() => {
    if (typeof ledGreen === 'number') setLedGreen(ledGreen);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledGreen]);
  
  useEffect(() => {
    if (typeof ledBlue === 'number') setLedBlue(ledBlue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledBlue]);
  
  useEffect(() => {
    if (typeof commonPin === 'string') setCommonPin(commonPin);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commonPin]);
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
    type: 'rgbled',
    attrs: {
      rotate: rotationAngle,
      top: posTop,
      left: posLeft,
      zIndex: 10,
      ledRed,
      ledGreen,
      ledBlue,
      commonPin
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

  // Update LED color function
  const updateLEDColor = (color, value) => {
    switch(color) {
      case 'red':
        setLedRed(value);
        break;
      case 'green':
        setLedGreen(value);
        break;
      case 'blue': 
        setLedBlue(value);
        break;
    }
  };

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
      
      <ReactRGBLEDComponent
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
        ledRed={ledRed}
        ledGreen={ledGreen}
        ledBlue={ledBlue}
        controlPin={commonPin}
      ></ReactRGBLEDComponent>

      {/* Removed component menu - settings will be in the properties panel */}
    </>
  );
};

export default RGBLED;