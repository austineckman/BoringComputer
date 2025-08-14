import React, { useEffect, useRef, useState } from 'react';
import {
  ReactDipSwitch3Component
} from "../lib/inventr-component-lib.es.js";
import Moveable from "react-moveable";
import { createPortal } from "react-dom";
import { useSimulator } from '../simulator/SimulatorContext';

// Define MOVE_SETTINGS to match what the original code expects
const MOVE_SETTINGS = {
  DRAGGABLE: true,
  SNAPPABLE: true,
  THROTTLE_DRAG: 0,
  ROTATABLE: true
};

/**
 * DipSwitch Component
 * Using the Wokwi implementation from invent-share-master
 */
const DipSwitch = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0,
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect,
  initialValue = [false, false, false]
}) => {
  const { updateComponentState } = useSimulator();
  const targetRef = useRef();
  const moveableRef = useRef();
  const oldDataRef = useRef();

  const [isComponentMenuShowing, setIsComponentMenuShowing] = useState(false);
  const [value, setValue] = useState(initialValue);
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
    type: 'dip-switch-3',
    attrs: {
      rotate: rotationAngle,
      top: posTop,
      left: posLeft,
      zIndex: 10,
      value: value
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
    // Keep initial positions in sync with current positions for consistent wiring
    setInitPosTop(posTop);
    setInitPosLeft(posLeft);
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

  // Handle pin click - using the exact same approach as HeroBoard
  const handlePinClicked = (e) => {
    console.log("Pin clicked on DipSwitch:", e.detail);
    
    // Extract pin information from the event
    if (onPinConnect) {
      try {
        // Parse the pin data like HeroBoard does
        let pinId, pinType;
        
        if (e.detail.data && typeof e.detail.data === 'string') {
          // Parse the JSON string to get the pin data
          const pinDataJson = e.detail.data;
          const pinData = JSON.parse(pinDataJson);
          
          // Get pin ID from parsed data
          pinId = pinData.name;
          pinType = 'bidirectional'; // DipSwitch pins are typically bidirectional
        } else {
          // Fallback to direct properties
          pinId = e.detail.pinId || 'pin1';
          pinType = e.detail.pinType || 'bidirectional';
        }
        
        // Get position information - this is the key fix!
        const clientX = e.detail.clientX || 0;
        const clientY = e.detail.clientY || 0;
        
        console.log(`DipSwitch pin clicked: ${pinId} (${pinType}) at (${clientX}, ${clientY})`);
        
        // Call the parent's onPinConnect handler
        onPinConnect(pinId, pinType, id);
        
        // Send another event with the formatted pin ID to match our wire manager
        const formattedPinId = `pt-dipswitch-${id}-${pinId}`;
        
        // Create a custom pin click event to trigger the wire manager
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
      } catch (err) {
        console.error("Error parsing dip switch pin data:", err);
        // Fallback
        const pinId = e.detail.pinId || 'pin1';
        const pinType = e.detail.pinType || 'bidirectional';
        onPinConnect(pinId, pinType, id);
      }
    }
  };

  // Toggle a switch value
  const toggleSwitch = (index) => {
    const newValue = [...value];
    newValue[index] = !newValue[index];
    setValue(newValue);
    
    // Update simulator state so digitalRead can access switch states
    if (updateComponentState) {
      updateComponentState(id, { 
        value: newValue,
        type: 'dip-switch-3'
      });
      console.log(`DipSwitch ${id}: Updated simulator state with value:`, newValue);
    }
  };

  // Initialize simulator state when component is created
  useEffect(() => {
    if (updateComponentState) {
      updateComponentState(id, { 
        value: value,
        type: 'dip-switch-3'
      });
      console.log(`DipSwitch ${id}: Initialized simulator state with value:`, value);
    }
  }, []); // Run once on mount

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
      
      <ReactDipSwitch3Component
        id={id}
        value={value}
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
        onClick={(e) => {
          // Handle switch toggle clicks
          e.stopPropagation();
          // For now, toggle the first switch when clicked anywhere on the component
          // This can be enhanced to detect which specific switch was clicked
          toggleSwitch(0);
        }}
        style={{
          transform: `translate(${posLeft}px, ${posTop}px)`,
          zIndex: isDragged ? 99999 : 10
        }}
      ></ReactDipSwitch3Component>

      {/* Removed component menu - settings now in the properties panel */}
    </>
  );
};

export default DipSwitch;