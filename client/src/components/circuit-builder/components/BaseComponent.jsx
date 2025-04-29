import { useState, useRef, useEffect } from 'react';
import Moveable from "react-moveable";
import { useDragOrRotate } from '../hooks/useDragOrRotateHandler';
import { triggerRedraw, formatTransform } from '../utils/Utils';

/**
 * BaseComponent serves as the foundation for all circuit components
 * It provides functionality for:
 * - Dragging/moving components
 * - Rotation
 * - Pin connections
 */
const BaseComponent = ({ 
  id,
  type,
  initialX = 100, 
  initialY = 100, 
  initialRotation = 0,
  width = 50,
  height = 50,
  children,
  canvasRef,
  onSelect,
  isSelected,
  onPinConnect,
  componentProps = {}
}) => {
  // Component state
  const [posLeft, setPosLeft] = useState(initialX);
  const [posTop, setPosTop] = useState(initialY);
  const [rotation, setRotation] = useState(initialRotation);
  const componentRef = useRef(null);
  
  // Get the drag/rotate handler
  const onDragOrRotate = useDragOrRotate(setPosTop, setPosLeft, setRotation);
  
  // Update wires when component moves
  useEffect(() => {
    triggerRedraw();
  }, [posLeft, posTop, rotation]);
  
  // Handle component selection
  const handleSelect = (e) => {
    if (onSelect) {
      e.stopPropagation();
      onSelect(id);
    }
  };
  
  return (
    <>
      <div
        ref={componentRef}
        className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          transform: formatTransform(posLeft, posTop, rotation),
          width: `${width}px`,
          height: `${height}px`,
          cursor: 'move',
          zIndex: isSelected ? 10 : 1
        }}
        onClick={handleSelect}
        data-component-id={id}
        data-component-type={type}
      >
        {children}
      </div>
      
      {isSelected && componentRef.current && (
        <Moveable
          target={componentRef.current}
          draggable={true}
          rotatable={true}
          throttleDrag={1}
          throttleRotate={1}
          onDrag={onDragOrRotate}
          onRotate={onDragOrRotate}
          origin={false}
          rotationPosition={"top"}
        />
      )}
    </>
  );
};

export default BaseComponent;