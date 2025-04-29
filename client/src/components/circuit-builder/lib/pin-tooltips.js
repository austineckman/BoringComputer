/**
 * Pin Tooltip enhancer for circuit components
 * Applies styles and behavior to make Web Components with SVG pins show tooltips on hover
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
let customElements = new Set();

// Event handlers for custom tooltips
function handlePinMouseOver(event) {
  const pin = event.target;
  const pinName = pin.getAttribute('data-pin-name') || 
                  pin.querySelector('title')?.textContent || 
                  pin.getAttribute('title') || 
                  pin.getAttribute('id')?.split('-').pop() || 
                  'Pin';
  
  // Create tooltip data
  const tooltipData = {
    name: pinName,
    element: pin,
    clientX: event.clientX,
    clientY: event.clientY
  };
  
  // Try to get additional data if available
  const dataValue = pin.getAttribute('data-value');
  if (dataValue) {
    try {
      const data = JSON.parse(dataValue);
      if (data) {
        tooltipData.pinType = data.type || 'unknown';
        if (data.signals && data.signals.length > 0) {
          tooltipData.signal = data.signals[0].signal;
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }

  // Dispatch a custom event for the tooltip component
  document.dispatchEvent(new CustomEvent('pinHover', { 
    detail: tooltipData 
  }));
}

function handlePinMouseOut() {
  // Hide the tooltip
  document.dispatchEvent(new CustomEvent('pinLeave'));
}

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
    
    // Watch for components being added to the DOM
    setupMutationObserver();
    
    // Add more CSS to the page for tooltip enhancement
    injectStyles();
    
    if (config.debug) {
      console.log('Pin tooltip enhancement initialized');
    }
  }, config.initDelay);
}

/**
 * Set up a MutationObserver to watch for new components
 */
function setupMutationObserver() {
  // Create an observer instance linked to a callback function
  const observer = new MutationObserver((mutationsList) => {
    // Check if any new custom elements were added
    let shouldScan = false;
    
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const customElementCandidates = node.tagName.includes('-') ? 
                [node] : Array.from(node.querySelectorAll('*[id^="component-"]'));
                
            if (customElementCandidates.length > 0) {
              shouldScan = true;
              break;
            }
          }
        }
      }
    }
    
    if (shouldScan) {
      setTimeout(enhancePins, 100);
    }
  });
  
  // Start observing the document body for added nodes
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Scan the DOM for pins and enhance them
 */
function enhancePins() {
  // Find all shadow roots from web components
  const shadowRoots = [];
  
  // Find circuit-builder related web components
  const customElementTags = [
    'inventr-heroboard',
    'inventr-led',
    'inventr-rgb-led',
    'inventr-resistor',
    'inventr-photoresistor',
    'inventr-buzzer',
    'inventr-rotary-encoder',
    'inventr-dip-switch',
    'inventr-segmented-display',
    'inventr-keypad',
    'inventr-oled-display',
  ];
  
  // Search for custom elements by ID pattern 
  document.querySelectorAll('*[id^="component-"]').forEach(component => {
    if (!componentsScanned.has(component)) {
      componentsScanned.add(component);
      scanForPins(component);
    }
  });
  
  // Search for web components
  customElementTags.forEach(tag => {
    document.querySelectorAll(tag).forEach(component => {
      if (!customElements.has(component)) {
        customElements.add(component);
        if (component.shadowRoot) {
          shadowRoots.push(component.shadowRoot);
        }
      }
    });
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
  // Find all circle elements - these are likely pin candidates
  const possiblePins = [
    ...Array.from(element.querySelectorAll('circle')),  // Standard SVG circles
    ...Array.from(element.querySelectorAll('.pin-target')),  // Elements explicitly marked as pins
    ...Array.from(element.querySelectorAll('[data-value]')),  // Elements with data-value attribute
    ...Array.from(element.querySelectorAll('[id^="pt-"]'))   // Elements with pin-type IDs
  ];
  
  // Process each potential pin
  possiblePins.forEach(pin => {
    // Skip already enhanced pins
    if (pinTargets.has(pin)) return;
    
    // Try different approaches to get pin name
    
    // 1. Check for title element inside the pin
    const titleElement = pin.querySelector('title');
    
    // 2. Check for title attribute
    const titleAttribute = pin.getAttribute('title');
    
    // 3. Check for data-value attribute (common in web components)
    const dataValue = pin.getAttribute('data-value');
    
    // 4. Check ID for pin information
    const id = pin.getAttribute('id') || '';
    const idParts = id.split('-');
    const idBasedName = idParts.length > 2 ? idParts[idParts.length - 1] : '';
    
    // Determine pin name from above sources
    let pinName = '';
    
    if (titleElement && titleElement.textContent) {
      pinName = titleElement.textContent;
    } else if (titleAttribute) {
      pinName = titleAttribute;
    } else if (dataValue) {
      try {
        // Try to parse data-value as JSON
        const data = JSON.parse(dataValue);
        pinName = data.name || data.id || data.label || '';
      } catch (e) {
        // Not JSON, use as is
        pinName = dataValue;
      }
    } else if (idBasedName) {
      pinName = idBasedName;
    }
    
    // Only enhance if we found a name
    if (pinName) {
      // Add to tracked pins
      pinTargets.add(pin);
      
      // Store the pin name for later tooltip usage
      pin.setAttribute('data-pin-name', pinName);
      
      // Add styling classes
      pin.classList.add('enhanced-pin');
      
      // Make pins more interactive
      pin.style.cursor = 'pointer';
      
      // Add event listeners for custom tooltips
      // First, remove any existing listeners to avoid duplicates
      pin.removeEventListener('mouseover', handlePinMouseOver);
      pin.removeEventListener('mouseout', handlePinMouseOut);
      
      // Now add the listeners
      pin.addEventListener('mouseover', handlePinMouseOver);
      pin.addEventListener('mouseout', handlePinMouseOut);
      
      // For debugging
      if (config.debug) {
        console.log(`Enhanced pin: ${pinName}`);
      }
    }
  });
  
  // Look for SVG <g> elements with circles - these might be pin groups
  const pinGroups = element.querySelectorAll('g');
  pinGroups.forEach(group => {
    // Only consider groups with pins inside
    const hasCircles = group.querySelector('circle') !== null;
    if (hasCircles) {
      // Check if these are pins
      const title = group.querySelector('title') || group.getAttribute('title');
      if (title) {
        const pinName = typeof title === 'string' ? title : title.textContent;
        // Look for circles inside this group
        const circles = group.querySelectorAll('circle');
        circles.forEach(circle => {
          // Skip enhanced pins
          if (pinTargets.has(circle)) return;
          
          // Add to tracked pins
          pinTargets.add(circle);
          
          // Set title attribute for browser tooltip
          if (!circle.hasAttribute('title')) {
            circle.setAttribute('title', pinName);
          }
          
          // Add styling classes  
          circle.classList.add('enhanced-pin');
          
          // Make pins more interactive
          circle.style.cursor = 'pointer';
          
          // For debugging
          if (config.debug) {
            console.log(`Enhanced pin in group: ${pinName}`);
          }
        });
      }
    }
  });
  
  // Handle web component pins
  const pinElements = element.querySelectorAll('[class*="pin"]:not(.enhanced-pin)');
  pinElements.forEach(pin => {
    if (pinTargets.has(pin)) return;
    
    // Try to determine pin name
    let pinName = '';
    if (pin.getAttribute('title')) {
      pinName = pin.getAttribute('title');
    } else if (pin.getAttribute('id') && pin.getAttribute('id').includes('-')) {
      const idParts = pin.getAttribute('id').split('-');
      pinName = idParts[idParts.length - 1];
    }
    
    if (pinName) {
      // Add to tracked pins
      pinTargets.add(pin);
      
      // Set title attribute for browser tooltip
      pin.setAttribute('title', pinName);
      
      // Add styling classes
      pin.classList.add('enhanced-pin');
      
      // For debugging
      if (config.debug) {
        console.log(`Enhanced web component pin: ${pinName}`);
      }
    }
  });
  
  // Try to find any @click elements with 'pin' in attributes
  const clickablePins = element.querySelectorAll('[data-pin], [pin], [pin-id], [pinId]');
  clickablePins.forEach(pin => {
    if (pinTargets.has(pin)) return;
    
    // Try to extract pin name
    let pinName = pin.getAttribute('data-pin') || 
                 pin.getAttribute('pin') || 
                 pin.getAttribute('pin-id') || 
                 pin.getAttribute('pinId');
                 
    if (pinName) {
      // Add to tracked pins
      pinTargets.add(pin);
      
      // Set title attribute for browser tooltip
      pin.setAttribute('title', pinName);
      
      // Add styling classes
      pin.classList.add('enhanced-pin');
      
      // For debugging
      if (config.debug) {
        console.log(`Enhanced clickable pin: ${pinName}`);
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
    
    /* Make sure tooltips are visible */
    svg title {
      stroke: none;
      fill: transparent;
      pointer-events: none;
    }
  `;
  
  // Add to the document head
  document.head.appendChild(style);
}