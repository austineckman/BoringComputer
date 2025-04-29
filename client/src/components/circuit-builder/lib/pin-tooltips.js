/**
 * Pin Tooltip enhancer
 * This script enhances the title attribute tooltips for pins in the circuit components
 * It extracts the title content from SVG title elements and adds it as a title attribute
 * for better browser tooltip support
 */

// Run the enhancement when DOM is loaded
document.addEventListener('DOMContentLoaded', enhancePinTooltips);

// Also run when components are dynamically added
document.addEventListener('componentAdded', enhancePinTooltips);

function enhancePinTooltips() {
  // Set a timeout to ensure all SVG elements are fully rendered
  setTimeout(() => {
    // Find all pin-target circles
    const pinTargets = document.querySelectorAll('.pin-target');
    
    pinTargets.forEach(pinTarget => {
      // Find the title element inside the pin-target
      const titleElement = pinTarget.querySelector('title');
      
      if (titleElement && titleElement.textContent) {
        // Add the title text as an attribute for better browser tooltip support
        pinTarget.setAttribute('title', titleElement.textContent);
        
        // Add a data attribute for custom styling
        pinTarget.setAttribute('data-pin-name', titleElement.textContent);
      }
    });
    
    console.log(`Enhanced tooltips for ${pinTargets.length} pins`);
  }, 500);
}

// Re-apply tooltips when a component is selected
document.addEventListener('componentSelected', () => {
  enhancePinTooltips();
});