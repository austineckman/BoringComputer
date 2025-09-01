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
  
  // Web Audio API for sound generation
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

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

  // Initialize Web Audio API
  useEffect(() => {
    const initAudio = () => {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        gainNodeRef.current.gain.value = 0.1; // Low volume to avoid ear damage
        console.log(`[Buzzer ${id}] Audio context initialized`);
      } catch (error) {
        console.warn(`[Buzzer ${id}] Web Audio API not supported:`, error);
      }
    };

    initAudio();

    // Cleanup on unmount
    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch (e) {
          // Oscillator may already be stopped
        }
        oscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [id]);

  // Monitor simulator state for buzzer activity and control audio
  useEffect(() => {
    const buzzerState = componentStates[id];
    if (buzzerState && buzzerState.type === 'buzzer') {
      const newIsPlaying = buzzerState.isPlaying || false;
      const newFrequency = buzzerState.frequency || 0;
      
      setIsPlaying(newIsPlaying);
      setCurrentFrequency(newFrequency);
      setBuzzerActive(newIsPlaying);
      
      // Control audio based on state
      if (newIsPlaying && newFrequency > 0) {
        const duration = buzzerState.duration || 0; // Get duration if specified
        startTone(newFrequency, duration);
      } else {
        stopTone();
      }
      
      console.log(`[Buzzer ${id}] State updated: playing=${newIsPlaying}, frequency=${newFrequency}Hz`);
    }
  }, [componentStates, id]);

  // Function to start playing a tone
  const startTone = (frequency, duration) => {
    if (!audioContextRef.current) return;

    try {
      // Stop any existing oscillator
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }

      // Resume audio context if suspended (required by browsers)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Create new oscillator
      oscillatorRef.current = audioContextRef.current.createOscillator();
      oscillatorRef.current.connect(gainNodeRef.current);
      
      // Set frequency and waveform
      oscillatorRef.current.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillatorRef.current.type = 'square'; // Square wave for buzzer-like sound
      
      // Start the tone
      oscillatorRef.current.start();
      
      // If duration is specified, stop after the duration
      if (duration && duration > 0) {
        setTimeout(() => {
          stopTone();
        }, duration);
        console.log(`[Buzzer ${id}] Started tone at ${frequency}Hz for ${duration}ms`);
      } else {
        console.log(`[Buzzer ${id}] Started continuous tone at ${frequency}Hz`);
      }
    } catch (error) {
      console.warn(`[Buzzer ${id}] Error starting tone:`, error);
    }
  };

  // Function to stop the tone
  const stopTone = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
        console.log(`[Buzzer ${id}] Stopped tone`);
      } catch (error) {
        console.warn(`[Buzzer ${id}] Error stopping tone:`, error);
      }
    }
  };

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

        let pinPosition;
        
        // Priority 1: Use coordinates from the event detail
        if (e.detail.x !== undefined && e.detail.y !== undefined) {
          const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
          pinPosition = {
            x: e.detail.x - canvasRect.left,
            y: e.detail.y - canvasRect.top
          };
          console.log(`Using event detail coordinates for ${pinId}: (${pinPosition.x}, ${pinPosition.y})`);
        }
        // Priority 2: Use event clientX/clientY if available
        else if (e.detail.clientX !== undefined && e.detail.clientY !== undefined) {
          const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
          pinPosition = {
            x: e.detail.clientX - canvasRect.left,
            y: e.detail.clientY - canvasRect.top
          };
          console.log(`Using event client coordinates for ${pinId}: (${pinPosition.x}, ${pinPosition.y})`);
        }
        // Priority 3: Try to find the pin element in the DOM
        else {
          const buzzerElement = targetRef.current;
          if (buzzerElement && canvasRef.current) {
            const buzzerRect = buzzerElement.getBoundingClientRect();
            const canvasRect = canvasRef.current.getBoundingClientRect();
            
            // Calculate pin positions based on buzzer position and standard pin layout
            // Standard buzzer pins: left pin (negative) and right pin (positive)
            let offsetX = 0, offsetY = 0;
            
            // Buzzer typically has pins at the bottom
            if (pinId === 'neg' || pinId === 'bz1' || pinId === '1') {
              // Left/negative pin
              offsetX = buzzerRect.width * 0.25;
              offsetY = buzzerRect.height * 0.85;
            } else if (pinId === 'pos' || pinId === 'bz2' || pinId === '2') {
              // Right/positive pin
              offsetX = buzzerRect.width * 0.75;
              offsetY = buzzerRect.height * 0.85;
            } else {
              // Default to center bottom
              offsetX = buzzerRect.width * 0.5;
              offsetY = buzzerRect.height * 0.85;
            }
            
            pinPosition = {
              x: buzzerRect.left + offsetX - canvasRect.left,
              y: buzzerRect.top + offsetY - canvasRect.top
            };
            
            console.log(`Using calculated pin position for ${pinId}: (${pinPosition.x}, ${pinPosition.y}) with offsets (${offsetX}, ${offsetY})`);
          } else {
            // Last resort fallback
            pinPosition = {
              x: posLeft + 30,
              y: posTop + 40
            };
            console.log(`Using fallback position for ${pinId}: (${pinPosition.x}, ${pinPosition.y})`);
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
          zIndex: isDragged ? 99999 : 10,
          filter: isPlaying ? 'drop-shadow(0 0 8px #ffaa00) brightness(1.3)' : 'none',
          transition: 'filter 0.2s ease-in-out'
        }}
        hasSignal={buzzerActive}
      ></ReactBuzzerComponent>

      {/* Visual feedback for tone playing */}
      {isPlaying && (
        <div 
          className="absolute pointer-events-none"
          style={{
            left: posLeft + 30,
            top: posTop + 10,
            width: '20px',
            height: '20px',
            backgroundColor: '#ffaa00',
            borderRadius: '50%',
            opacity: 0.8,
            zIndex: 1000,
            animation: 'buzzer-pulse 0.3s ease-in-out infinite alternate',
            boxShadow: '0 0 10px #ffaa00'
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