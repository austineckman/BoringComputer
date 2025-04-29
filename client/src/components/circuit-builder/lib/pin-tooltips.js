/**
 * Pin Tooltip enhancer for circuit components
 * Applies styles and behavior to make SVG <title> elements work better as tooltips
 */

// Configuration object
const config = {
  initDelay: 300,          // Initial delay before enhancing pins (ms)
  pollInterval: 1000,      // Interval to check for new components (ms)
  updateInterval: 250,     // How often to update pin appearance (ms)
  debug: true             // Enable console logging for debugging
};

// Pin enhancement state
let enhancementActive = false;
let pinTargets = new Set();
let componentsScanned = new Set();

// Run the enhancement when DOM is loaded
document.addEventListener('DOMContentLoaded', initPinEnhancement);

/**
 * Initialize pin enhancements with a delay
 * to ensure all custom components are loaded
 */
function initPinEnhancement() {
  // Don't initialize twice
  if (enhancementActive) return;
  
  // Mark as active
  enhancementActive = true;
  
  // Initial delay to let components render
  setTimeout(() => {
    // Do initial scan
    enhancePins();
    
    // Set up interval to scan for new components
    setInterval(enhancePins, config.pollInterval);
    
    // Listen for component selection
    document.addEventListener('click', (e) => {
      // Small delay to let component selection happen
      setTimeout(enhancePins, 50);
    });
    
    // Add more CSS to the page for tooltip enhancement
    injectStyles();
    
    if (config.debug) {
      console.log('Pin tooltip enhancement initialized');
    }
  }, config.initDelay);
}

/**
 * Scan the DOM for pins and enhance them
 */
function enhancePins() {
  // Find all shadow roots from web components
  const shadowRoots = [];
  document.querySelectorAll('*').forEach(el => {
    if (el.shadowRoot) {
      shadowRoots.push(el.shadowRoot);
    }
  });
  
  // Find all circuit components in the main document
  const components = document.querySelectorAll('.circuit-component');
  components.forEach(component => {
    if (!componentsScanned.has(component)) {
      componentsScanned.add(component);
      scanForPins(component);
    }
  });
  
  // Also look for pins in shadow roots
  shadowRoots.forEach(root => {
    scanForPins(root);
  });
}

/**
 * Scan an element for pins that need enhancement
 */
function scanForPins(element) {
  // Look for all SVG circles with a title
  const circles = element.querySelectorAll('circle');
  circles.forEach(circle => {
    // Skip already enhanced pins
    if (pinTargets.has(circle)) return;
    
    // Look for title element
    const title = circle.querySelector('title');
    if (title && title.textContent) {
      // Add to our set of known pins
      pinTargets.add(circle);
      
      // Add classes for styling
      circle.classList.add('enhanced-pin');
      
      // Make pins more interactive
      circle.style.cursor = 'pointer';
      
      // For debugging
      if (config.debug) {
        console.log(`Enhanced pin: ${title.textContent}`);
      }
    }
  });
  
  // Also look for .pin-target elements which specifically have pin functionality
  const pinTargetElements = element.querySelectorAll('.pin-target');
  pinTargetElements.forEach(pin => {
    // Skip already enhanced pins
    if (pinTargets.has(pin)) return;
    
    // Look for title element or attribute
    const title = pin.querySelector('title') || pin.getAttribute('title');
    const pinName = title ? (typeof title === 'string' ? title : title.textContent) : '';
    
    if (pinName) {
      // Add to our set of known pins
      pinTargets.add(pin);
      
      // Ensure it has a title attribute for native tooltips
      if (!pin.hasAttribute('title') && typeof title !== 'string') {
        pin.setAttribute('title', pinName);
      }
      
      // Add classes for styling
      pin.classList.add('enhanced-pin');
      
      // Make pins more interactive
      pin.style.cursor = 'pointer';
      
      // For debugging
      if (config.debug) {
        console.log(`Enhanced pin target: ${pinName}`);
      }
    }
  });
}

/**
 * Add custom styles to enhance tooltip appearance
 */
function injectStyles() {
  // Create a style element
  const style = document.createElement('style');
  style.textContent = `
    /* Enhanced pins */
    .enhanced-pin, .pin-target {
      r: 4px !important;
      fill: rgba(100, 150, 255, 0.2) !important;
      stroke: rgba(100, 150, 255, 0.6) !important;
      stroke-width: 1px !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
    }
    
    /* Hover effect */
    .enhanced-pin:hover, .pin-target:hover {
      r: 6px !important;
      fill: rgba(100, 150, 255, 0.4) !important;
      stroke: rgba(100, 150, 255, 1) !important;
      stroke-width: 2px !important;
      filter: drop-shadow(0 0 3px rgba(100, 150, 255, 0.8));
    }
  `;
  
  // Add to the document head
  document.head.appendChild(style);
}