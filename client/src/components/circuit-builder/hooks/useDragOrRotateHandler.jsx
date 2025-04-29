import { useState } from 'react';
import { getTranslate, triggerRedraw } from '../utils/Utils';

/**
 * Hook for handling drag and rotate operations of components
 * @param {Function} setPosTop - Function to set the top position of a component
 * @param {Function} setPosLeft - Function to set the left position of a component
 * @param {Function} setRotation - Optional function to set the rotation of a component
 * @returns {Function} - Event handler for drag/rotate events
 */
export const useDragOrRotate = (setPosTop, setPosLeft, setRotation = null) => {
  const onDragOrRotate = (e) => {
    // Update component transform style
    e.target.style.transform = e.transform;
    
    // Extract translation values
    const translation = getTranslate(e.transform);
    setPosLeft(translation[0]);
    setPosTop(translation[1]);
    
    // Extract rotation if setRotation is provided
    if (setRotation && e.rotate !== undefined) {
      setRotation(e.rotate);
    }
    
    // Trigger redraw to update wires
    triggerRedraw();
  };

  return onDragOrRotate;
};

export default useDragOrRotate;