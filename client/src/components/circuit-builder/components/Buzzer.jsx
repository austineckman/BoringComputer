import React, { useEffect, useRef, useState } from 'react';
import {
  ReactBuzzerComponent
} from "../lib/inventr-component-lib.es.js";
import Moveable from "react-moveable";
import { useSimulator } from '../simulator/SimulatorContext.jsx';

// Define MOVE_SETTINGS to match what the original code expects
const MOVE_SETTINGS = {
  DRAGGABLE: true,
  SNAPPABLE: true,
  THROTTLE_DRAG: 0,
  ROTATABLE: true
};

/**
 * Buzzer Component
 * Using the Wokwi implementation from invent-share-master
 */
const Buzzer = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0,
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect,
  hasSignal = false // Default to off
}) => {
  const targetRef = useRef();
  const moveableRef = useRef();
  const oldDataRef = useRef();

  const [buzzerActive, setBuzzerActive] = useState(hasSignal);
  const [rotationAngle, setRotationAngle] = useState(initialRotation);
  const [pinInfo, setPinInfo] = useState([]);
  const [isDragged, setIsDragged] = useState(false);
  const [posTop, setPosTop] = useState(initialY);
  const [posLeft, setPosLeft] = useState(initialX);
  const [initPosTop, setInitPosTop] = useState(initialY);
  const [initPosLeft, setInitPosLeft] = useState(initialX);
  
  // Simulator integration
  const { componentStates } = useSimulator();
  const [currentFrequency, setCurrentFrequency] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Create a component data structure that matches what the original code expects
  const componentData = {
    id,
    type: 'buzzer',
    attrs: {
      rotate: rotationAngle,
      top: posTop,
      left: posLeft,
      zIndex: 10,
      hasSignal: buzzerActive
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

  // No longer need to show/hide component-specific menu

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

  // Monitor simulator state for buzzer activity
  useEffect(() => {
    const buzzerState = componentStates[id];
    if (buzzerState && buzzerState.type === 'buzzer') {
      setIsPlaying(buzzerState.isPlaying || false);
      setCurrentFrequency(buzzerState.frequency || 0);
      setBuzzerActive(buzzerState.isPlaying || false);
      
      console.log(`[Buzzer ${id}] State updated: playing=${buzzerState.isPlaying}, frequency=${buzzerState.frequency}Hz`);
    }
  }, [componentStates, id]);

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
    console.log("Buzzer pin clicked", e.detail);
    
    if (onPinConnect) {
      try {
        // Parse pin data from the event
        let pinId, pinType;
        
        // Check if this is data in JSON format (from the Web Component)
        if (e.detail.data && typeof e.detail.data === 'string') {
          // Parse the JSON string to get the pin data
          const pinData = JSON.parse(e.detail.data);
          pinId = pinData.name || 'pin1'; // Default to pin1 if no name is provided
          pinType = 'bidirectional'; // Default type
          
          // Determine pin type if signals are available
          if (pinData.signals && pinData.signals.length > 0) {
            const signal = pinData.signals[0];
            if (signal.type === 'power') {
              pinType = 'power';
            } else if (signal.type === 'ground') {
              pinType = 'ground';
            }
          }
        } else {
          // Use the pin ID and type directly if available
          pinId = e.detail.pinId || 'pin1';
          pinType = e.detail.pinType || 'bidirectional';
        }

        // Get the actual pin element directly
        const pinElement = e.detail.target || e.target;
        let pinPosition;
        
        // Get precise position from the DOM element
        if (pinElement && canvasRef.current) {
          const pinRect = pinElement.getBoundingClientRect();
          const canvasRect = canvasRef.current.getBoundingClientRect();
          
          pinPosition = {
            x: pinRect.left + (pinRect.width / 2) - canvasRect.left,
            y: pinRect.top + (pinRect.height / 2) - canvasRect.top
          };
          
          console.log(`Using pin element position for ${pinId}: (${pinPosition.x}, ${pinPosition.y})`);
        } 
        // Fallback to event coordinates
        else if (e.detail.clientX && e.detail.clientY) {
          const clientX = e.detail.clientX;
          const clientY = e.detail.clientY;
          
          // Calculate position relative to canvas
          const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
          pinPosition = {
            x: clientX - canvasRect.left,
            y: clientY - canvasRect.top
          };
          
          console.log(`Using event coordinates for ${pinId}: (${pinPosition.x}, ${pinPosition.y})`);
        } 
        // Final fallback - use component position + approximated pin offset
        else {
          // Try to find the actual pin element by ID pattern
          const buzzerElement = document.getElementById(id);
          if (buzzerElement) {
            const buzzerRect = buzzerElement.getBoundingClientRect();
            const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
            
            // Apply appropriate offset based on pin name if known
            let offsetX = 0, offsetY = 0;
            
            if (pinId === 'bz1') {
              offsetX = 10;
              offsetY = buzzerRect.height - 15;
            } else if (pinId === 'bz2') {
              offsetX = buzzerRect.width / 2;
              offsetY = buzzerRect.height - 10;
            } else if (pinId === 'bz3') {
              offsetX = buzzerRect.width - 10;
              offsetY = buzzerRect.height - 15;
            }
            
            pinPosition = {
              x: buzzerRect.left + offsetX - canvasRect.left,
              y: buzzerRect.top + offsetY - canvasRect.top
            };
            
            console.log(`Using calculated offset for ${pinId}: (${pinPosition.x}, ${pinPosition.y})`);
          } else {
            // Last resort fallback
            pinPosition = {
              x: posLeft + 20,
              y: posTop + buzzerRect?.height || 100
            };
          }
        }
        
        // Generate formatted pin ID for consistent wire connections
        const formattedPinId = `pt-buzzer-${id}-${pinId}`;
        
        // Create a custom pin click event with the correct position data
        const pinClickEvent = new CustomEvent('pinClicked', {
          detail: {
            id: formattedPinId,
            pinName: pinId,
            pinType: pinType,
            parentId: id,
            pinPosition: pinPosition,
            clientX: pinPosition.x + (canvasRef.current?.getBoundingClientRect()?.left || 0), 
            clientY: pinPosition.y + (canvasRef.current?.getBoundingClientRect()?.top || 0)
          }
        });
        
        // Dispatch the event first, then call the callback
        document.dispatchEvent(pinClickEvent);
        
        console.log(`Buzzer pin ${pinId} (${pinType}) clicked at position:`, pinPosition);
        
        // We don't need to call onPinConnect directly as the wire manager will handle the event
        // onPinConnect(pinId, pinType, id, pinPosition);
      } catch (err) {
        console.error("Error parsing pin data in Buzzer:", err);
        // Error handling fallback just dispatch a basic event
        const defaultPinPosition = {
          x: posLeft + 20,
          y: posTop + 20
        };
        
        // Dispatch a minimal event that the wire manager can handle
        const fallbackEvent = new CustomEvent('pinClicked', {
          detail: {
            id: `pt-buzzer-${id}-bz1`,
            pinName: 'bz1',
            pinType: 'bidirectional',
            parentId: id,
            pinPosition: defaultPinPosition,
            clientX: defaultPinPosition.x + (canvasRef.current?.getBoundingClientRect()?.left || 0),
            clientY: defaultPinPosition.y + (canvasRef.current?.getBoundingClientRect()?.top || 0)
          }
        });
        document.dispatchEvent(fallbackEvent);
      }
    }
  };

  // Context menu creation has been removed - now using centralized Properties panel

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
      
      <ReactBuzzerComponent
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
        hasSignal={buzzerActive}
      ></ReactBuzzerComponent>

      {/* Visual feedback for tone playing */}
      {isPlaying && (
        <div 
          className="absolute pointer-events-none animate-ping"
          style={{
            left: posLeft + 30,
            top: posTop + 10,
            width: '20px',
            height: '20px',
            backgroundColor: '#f59e0b',
            borderRadius: '50%',
            opacity: 0.6,
            zIndex: 1000
          }}
        />
      )}
      
      {/* Frequency indicator when playing */}
      {isPlaying && currentFrequency > 0 && (
        <div 
          className="absolute pointer-events-none text-xs font-mono text-orange-500 bg-black bg-opacity-60 px-1 rounded"
          style={{
            left: posLeft + 50,
            top: posTop + 5,
            zIndex: 1001
          }}
        >
          {currentFrequency}Hz
        </div>
      )}

      {/* Removed component-specific menu - now using centralized Properties panel */}
    </>
  );
};

// Export wiring guide for the properties panel
export const BuzzerWiringGuide = () => (
  <div className="space-y-3 text-sm">
    <div className="bg-blue-50 p-3 rounded border border-blue-200">
      <h4 className="font-semibold text-blue-800 mb-2">📋 Buzzer Wiring Guide</h4>
      <div className="space-y-2 text-blue-700">
        <div>
          <span className="font-medium">Positive Pin (+):</span> Connect to any digital pin (2-13)
        </div>
        <div>
          <span className="font-medium">Negative Pin (-):</span> Connect to GND
        </div>
      </div>
    </div>
    
    <div className="bg-green-50 p-3 rounded border border-green-200">
      <h4 className="font-semibold text-green-800 mb-2">🔧 Arduino Functions</h4>
      <div className="space-y-2 text-green-700 font-mono text-xs">
        <div>
          <span className="font-semibold">tone(pin, frequency);</span>
          <br />
          <span className="text-green-600">Play continuous tone</span>
        </div>
        <div>
          <span className="font-semibold">tone(pin, frequency, duration);</span>
          <br />
          <span className="text-green-600">Play tone for specific time</span>
        </div>
        <div>
          <span className="font-semibold">noTone(pin);</span>
          <br />
          <span className="text-green-600">Stop playing tone</span>
        </div>
      </div>
    </div>
    
    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
      <h4 className="font-semibold text-yellow-800 mb-2">💡 Example Code</h4>
      <pre className="text-xs font-mono text-yellow-700 whitespace-pre-wrap">
{`int buzzerPin = 8;

void setup() {
  pinMode(buzzerPin, OUTPUT);
}

void loop() {
  tone(buzzerPin, 1000);    // Play 1kHz tone
  delay(500);               // Wait 500ms
  noTone(buzzerPin);        // Stop tone
  delay(500);               // Wait 500ms
}`}
      </pre>
    </div>
    
    <div className="bg-orange-50 p-3 rounded border border-orange-200">
      <h4 className="font-semibold text-orange-800 mb-2">🎵 Common Frequencies</h4>
      <div className="grid grid-cols-2 gap-2 text-xs text-orange-700">
        <div><span className="font-medium">C4:</span> 262Hz</div>
        <div><span className="font-medium">E4:</span> 330Hz</div>
        <div><span className="font-medium">G4:</span> 392Hz</div>
        <div><span className="font-medium">C5:</span> 523Hz</div>
        <div><span className="font-medium">Beep:</span> 1000Hz</div>
        <div><span className="font-medium">Alert:</span> 2000Hz</div>
      </div>
    </div>
    
    <div className="bg-gray-50 p-3 rounded border border-gray-200">
      <h4 className="font-semibold text-gray-800 mb-2">⚡ Simulator Status</h4>
      <div className="text-xs text-gray-700">
        <div>• Orange pulse indicates active tone</div>
        <div>• Frequency display shows current Hz</div>
        <div>• Visual feedback matches tone() calls</div>
      </div>
    </div>
  </div>
);

export default Buzzer;