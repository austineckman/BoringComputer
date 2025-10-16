import React, { useEffect, useRef, useState } from 'react';
import {
  ReactSevenSegmentComponent
} from "../lib/inventr-component-lib.es.js";
import Moveable from "react-moveable";
import { createPortal } from "react-dom";
import { useSimulator } from '../simulator/SimulatorContext.jsx';

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
  
  // Update position when initialX/initialY props change
  useEffect(() => {
    setPosTop(initialY);
    setPosLeft(initialX);
    setInitPosTop(initialY);
    setInitPosLeft(initialX);
  }, [initialX, initialY]);
  
  // Simulator integration
  const { componentStates, updateComponentState } = useSimulator();
  const [displayValue, setDisplayValue] = useState("    "); // 4 spaces for blank display
  const [brightness, setBrightness] = useState(7); // Default max brightness
  const [isActive, setIsActive] = useState(false);

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

  // Monitor simulator state for display updates
  useEffect(() => {
    const displayState = componentStates[id];
    if (displayState && displayState.type === 'segmented-display') {
      if (displayState.displayValue !== undefined) {
        setDisplayValue(displayState.displayValue);
        setIsActive(true);
      }
      if (displayState.brightness !== undefined) {
        setBrightness(displayState.brightness);
      }
      
      console.log(`[SegmentedDisplay ${id}] State updated: value="${displayState.displayValue}", brightness=${displayState.brightness}`);
    }
  }, [componentStates, id]);

  // Initialize component state (only once)
  useEffect(() => {
    if (updateComponentState && !componentStates[id]) {
      updateComponentState(id, { 
        displayValue: "    ",
        brightness: 7,
        type: 'segmented-display'
      });
      console.log(`[SegmentedDisplay ${id}] Initialized with 4 digits`);
    }
  }, [id]);

  // Function to format display value for 7-segment style
  const formatDisplayValue = (value) => {
    if (!value) return "    ";
    
    // Convert number to string and pad/truncate to 4 characters
    let formatted = value.toString();
    
    // Handle numbers - pad with leading spaces if needed
    if (!isNaN(value)) {
      formatted = formatted.padStart(4, ' ');
    }
    
    // Truncate to 4 characters if too long
    if (formatted.length > 4) {
      formatted = formatted.substring(0, 4);
    }
    
    // Pad to 4 characters if too short
    formatted = formatted.padEnd(4, ' ');
    
    return formatted;
  };

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

  // Handle pin click - using the exact same approach as HeroBoard
  const handlePinClicked = (e) => {
    console.log("Pin clicked on SegmentedDisplay:", e.detail);
    
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
          pinType = 'bidirectional'; // SegmentedDisplay pins are typically bidirectional
        } else {
          // Fallback to direct properties
          pinId = e.detail.pinId || 'pin1';
          pinType = e.detail.pinType || 'bidirectional';
        }
        
        // Get position information - this is the key fix!
        const clientX = e.detail.clientX || 0;
        const clientY = e.detail.clientY || 0;
        
        console.log(`SegmentedDisplay pin clicked: ${pinId} (${pinType}) at (${clientX}, ${clientY})`);
        
        // Call the parent's onPinConnect handler
        onPinConnect(pinId, pinType, id);
        
        // Send another event with the formatted pin ID to match our wire manager
        const formattedPinId = `pt-segmenteddisplay-${id}-${pinId}`;
        
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
        console.error("Error parsing segmented display pin data:", err);
        // Fallback
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
          zIndex: isDragged ? 99999 : 10,
          filter: isActive ? `brightness(${Math.min(brightness / 7 * 1.5, 2)})` : 'brightness(0.3)'
        }}
        digits={digitCount}
        pins={pinLayout}
      ></ReactSevenSegmentComponent>
      
      {/* Visual display overlay - always visible */}
      <div
        className="absolute pointer-events-none font-mono font-bold text-center"
        style={{
          left: posLeft + 15,
          top: posTop + 25,
          fontSize: '18px',
          color: isActive ? '#ff4400' : '#ff440055',
          textShadow: isActive ? '0 0 8px #ff4400' : 'none',
          letterSpacing: '8px',
          zIndex: 99998,
          filter: isActive ? `brightness(${brightness / 7})` : 'brightness(0.5)',
          fontFamily: 'monospace',
          opacity: isActive ? 1 : 0.5
        }}
      >
        {formatDisplayValue(displayValue)}
      </div>

      {/* Removed component menu - settings now in the properties panel */}
    </>
  );
};

export default SegmentedDisplay;