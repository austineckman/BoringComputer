/**
 * Fix OLED Display Component Pin Tooltips
 * This script patches the tooltip labels for the OLED display
 * to match the correct pin order: GND, VCC, SCL, SDA
 */

// Run this as soon as possible when the component is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the fix function
  initOLEDTooltipFix();
});

function initOLEDTooltipFix() {
  console.log('Pin tooltip enhancement initialized');
  
  // Create a MutationObserver to watch for OLED components being added to the DOM
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Look for any svg in OLED components
            const oledComponents = node.querySelectorAll('oled-display-component');
            if (oledComponents.length > 0) {
              fixOLEDPinTooltips();
            }
            
            // Also check for svg elements that might be part of OLED components
            const svgElements = node.querySelectorAll('svg');
            if (svgElements.length > 0) {
              setTimeout(fixOLEDPinTooltips, 100); // Small delay to ensure all elements are rendered
            }
          }
        }
      }
    }
  });
  
  // Start observing the entire document
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also run once on page load
  setTimeout(fixOLEDPinTooltips, 500);
}

function fixOLEDPinTooltips() {
  // Find all OLED component SVGs in the document
  const oledComponents = document.querySelectorAll('oled-display-component');
  
  oledComponents.forEach(component => {
    // Find all pin circles within this component
    const pinCircles = component.querySelectorAll('circle.pin-target');
    
    // Create a mapping from current tooltip to correct tooltip
    const correctLabels = {
      'VCC': 'GND',   // Left-most pin should be GND
      'GND': 'VCC',   // Second pin should be VCC
      'SCK': 'SCL',   // Third pin should be SCL
      // SDA is already correct
    };
    
    // Fix each pin tooltip
    pinCircles.forEach(circle => {
      const titleElement = circle.querySelector('title');
      if (titleElement) {
        const currentText = titleElement.textContent.trim();
        
        // Check if this tooltip needs correction
        if (correctLabels[currentText]) {
          // Update to the correct label
          titleElement.textContent = correctLabels[currentText];
          console.log(`Fixed OLED pin tooltip: ${currentText} → ${correctLabels[currentText]}`);
        }
      }
    });
  });
}

export default initOLEDTooltipFix;