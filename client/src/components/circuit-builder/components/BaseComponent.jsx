import { useState, useRef, useEffect } from 'react';
import { triggerRedraw, formatTransform } from '../utils/Utils';

/**
 * BaseComponent serves as the foundation for all circuit components
 * It provides functionality for:
 * - Dragging/moving components (rotation removed per user request)
 * - Pin connections
 */
const BaseComponent = ({ 
  id,
  type,
  initialX = 100, 
  initialY = 100, 
  initialRotation = 0, // Keep for backward compatibility, but don't use
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const componentRef = useRef(null);
  
  // Update wires when component moves
  useEffect(() => {
    triggerRedraw();
  }, [posLeft, posTop]);
  
  // Handle component selection
  const handleSelect = (e) => {
    if (onSelect) {
      e.stopPropagation();
      onSelect(id);
    }
  };
  
  // Setup dragging functionality
  useEffect(() => {
    const component = componentRef.current;
    if (!component) return;
    
    const handleMouseDown = (e) => {
      if (e.button !== 0) return; // Only handle left mouse button
      
      e.stopPropagation();
      
      // Select component on mousedown
      handleSelect(e);
      
      // Store the offset from the component's origin
      const rect = component.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      
      setIsDragging(true);
    };
    
    component.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      component.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleSelect, id]);
  
  // Handle mouse move and up events for dragging
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e) => {
      if (!isDragging || !canvasRef.current) return;
      
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      // Calculate new position relative to canvas
      const newLeft = e.clientX - canvasRect.left - dragOffset.x;
      const newTop = e.clientY - canvasRect.top - dragOffset.y;
      
      // Update position
      setPosLeft(newLeft);
      setPosTop(newTop);
      
      // Trigger wire redraw
      triggerRedraw();
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, canvasRef]);
  
  return (
    <div
      ref={componentRef}
      className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: `${posLeft}px`,
        top: `${posTop}px`,
        width: `${width}px`,
        height: `${height}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isSelected ? 10 : 1,
        userSelect: 'none'
      }}
      onClick={handleSelect}
      data-component-id={id}
      data-component-type={type}
    >
      {children}
    </div>
  );
};

export default BaseComponent;