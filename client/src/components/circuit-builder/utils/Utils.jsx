/**
 * Utility functions for circuit components
 */

// Extract the translate values from a transform string
export function getTranslate(transformStr) {
  // Extract translate values from the transform string (e.g. "translate(100px, 200px) rotate(45deg)")
  const match = transformStr.match(/translate\((\d+(?:\.\d+)?)px, (\d+(?:\.\d+)?)px\)/);
  if (match) {
    return [parseFloat(match[1]), parseFloat(match[2])];
  }
  return [0, 0];
}

// Trigger a redraw for the canvas/wires
export function triggerRedraw() {
  // Create a custom event that can be listened to by components
  const event = new CustomEvent('redrawWires', { detail: {} });
  document.dispatchEvent(event);
}

// Get the position of an element relative to its parent
export function getRelativePosition(element, parent) {
  const parentRect = parent.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  
  return {
    top: elementRect.top - parentRect.top,
    left: elementRect.left - parentRect.left
  };
}

// Calculate pin positions based on component position and rotation
export function calculatePinPosition(componentPosition, pinOffset, rotation = 0) {
  // Convert rotation to radians
  const rad = rotation * Math.PI / 180;
  
  // Calculate the rotated position
  const x = pinOffset.x * Math.cos(rad) - pinOffset.y * Math.sin(rad);
  const y = pinOffset.x * Math.sin(rad) + pinOffset.y * Math.cos(rad);
  
  return {
    x: componentPosition.x + x,
    y: componentPosition.y + y
  };
}

// Format a CSS transform string
export function formatTransform(x, y, rotation = 0) {
  return `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
}

// Generate a unique ID
export function generateId(prefix = 'component') {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
}