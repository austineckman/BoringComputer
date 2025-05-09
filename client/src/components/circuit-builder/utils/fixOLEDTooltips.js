/**
 * OLED Display Tooltip Fix
 * 
 * This utility specifically addresses the tooltip labeling issue with OLED displays
 * where the tooltip labels don't match the actual pin functions.
 * 
 * The correct mapping should be:
 * - Pin 1: GND (incorrectly labeled as VCC)
 * - Pin 2: VCC (incorrectly labeled as GND)
 * - Pin 3: SCL (incorrectly labeled as SCK)
 * - Pin 4: SDA (correctly labeled)
 */

/**
 * Initializes the OLED tooltip fix
 * This function locates OLED components in the DOM and corrects their pin tooltip labels
 */
function initOLEDTooltipFix() {
  console.log("Running OLED tooltip fix...");

  // Function to check for OLEDs and fix their tooltips
  const checkForOLEDs = () => {
    // Find all OLED display components
    const oledDisplays = document.querySelectorAll('[id^="oled-display-"]');
    if (oledDisplays.length === 0) {
      console.log("No OLED displays found yet. Will keep checking.");
      return false;
    }

    console.log(`Found ${oledDisplays.length} OLED displays to fix tooltips for`);
    
    // Process each OLED display
    oledDisplays.forEach(display => {
      // First try to find tooltip elements using data-tooltip attribute
      const dataTooltips = display.querySelectorAll('[data-tooltip]');
      
      // Then try to find tooltip elements using title attribute
      const titleTooltips = display.querySelectorAll('[title]');
      
      // Combine both sets of tooltips (using a Set to avoid duplicates)
      const tooltipSet = new Set([...dataTooltips, ...titleTooltips]);
      const tooltips = Array.from(tooltipSet);
      
      if (!tooltips || tooltips.length === 0) {
        // If we can't find tooltips yet, try looking inside shadow DOM if it exists
        if (display.shadowRoot) {
          const shadowTooltips = display.shadowRoot.querySelectorAll('[data-tooltip], [title]');
          if (shadowTooltips.length > 0) {
            console.log(`Found ${shadowTooltips.length} tooltips in shadow DOM of ${display.id}`);
            
            // Process shadow DOM tooltips
            shadowTooltips.forEach((tooltip, index) => {
              fixTooltip(tooltip, index);
            });
            
            return true;
          }
        }
        
        console.log(`No tooltips found in OLED ${display.id}`);
        return false;
      }

      console.log(`Found ${tooltips.length} tooltips in ${display.id}`);
      
      // Process each tooltip
      tooltips.forEach((tooltip, index) => {
        fixTooltip(tooltip, index);
      });
      
      console.log(`OLED ${display.id} tooltips have been corrected.`);
    });
    
    return oledDisplays.length > 0;
  };
  
  // Helper function to fix a single tooltip element
  const fixTooltip = (tooltipElement, index) => {
    // Try data-tooltip attribute first
    let currentTooltip = tooltipElement.getAttribute('data-tooltip');
    let usingDataTooltip = true;
    
    // If not found, try title attribute
    if (!currentTooltip) {
      currentTooltip = tooltipElement.getAttribute('title');
      usingDataTooltip = false;
    }
    
    // Skip if no tooltip text found
    if (!currentTooltip) return;
    
    // Store original for logging
    const originalTooltip = currentTooltip;
    
    // Apply fixes based on pin position
    let newTooltip = currentTooltip;
    
    if (index === 0 && currentTooltip.toUpperCase() === "VCC") {
      newTooltip = "GND";
    }
    else if (index === 1 && currentTooltip.toUpperCase() === "GND") {
      newTooltip = "VCC";
    }
    else if (index === 2 && currentTooltip.toUpperCase() === "SCK") {
      newTooltip = "SCL";
    }
    // SDA is already correct
    
    // Only update if we have a new value
    if (newTooltip !== currentTooltip) {
      // Update the appropriate attribute
      if (usingDataTooltip) {
        tooltipElement.setAttribute('data-tooltip', newTooltip);
      } else {
        tooltipElement.setAttribute('title', newTooltip);
      }
      
      console.log(`Fixed tooltip ${index}: ${originalTooltip} → ${newTooltip}`);
    }
  };
  
  // Function to search for tooltips within inventr components
  const searchInventrComponents = () => {
    const inventrComponents = document.querySelectorAll('inventr-oled-display');
    if (inventrComponents.length === 0) return false;
    
    console.log(`Found ${inventrComponents.length} inventr-oled-display components`);
    
    inventrComponents.forEach(component => {
      // Check for shadow root
      if (component.shadowRoot) {
        const shadowTooltips = component.shadowRoot.querySelectorAll('[data-tooltip], [title]');
        
        if (shadowTooltips.length > 0) {
          console.log(`Found ${shadowTooltips.length} shadow DOM tooltips in ${component.id || 'unnamed component'}`);
          
          shadowTooltips.forEach((tooltip, index) => {
            fixTooltip(tooltip, index);
          });
        }
      }
    });
    
    return inventrComponents.length > 0;
  };
  
  // Try fixing tooltips immediately
  let foundOLEDs = checkForOLEDs();
  
  // Also try inventr components
  const foundInventr = searchInventrComponents();
  
  foundOLEDs = foundOLEDs || foundInventr;
  
  // Set up an interval to keep checking for new OLEDs
  if (!foundOLEDs) {
    console.log("Setting up OLED detection timer...");
    const oledCheckTimer = setInterval(() => {
      const found = checkForOLEDs() || searchInventrComponents();
      if (found) {
        console.log("Successfully fixed OLED tooltips, clearing timer");
        clearInterval(oledCheckTimer);
      }
    }, 1000);
    
    // Clear after 30 seconds regardless to avoid memory leaks
    setTimeout(() => {
      clearInterval(oledCheckTimer);
      console.log("OLED tooltip fix timer cleared after timeout");
    }, 30000);
  }
  
  // Set up a mutation observer to detect when new OLEDs are added
  const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;
    
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any of the added nodes might be or contain an OLED
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          
          // Check if the node is an OLED component or contains one
          if (node.id?.includes('oled-display-') || 
              node.tagName?.toLowerCase() === 'inventr-oled-display' ||
              node.querySelector?.('[id^="oled-display-"], inventr-oled-display')) {
            shouldCheck = true;
            break;
          }
        }
        
        if (shouldCheck) break;
      }
    }
    
    if (shouldCheck) {
      console.log("New potential OLED component detected");
      setTimeout(() => {
        checkForOLEDs();
        searchInventrComponents();
      }, 100);
    }
  });
  
  // Start observing the document for OLED additions
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  console.log("OLED tooltip fix installed with mutation observer");
  
  return {
    check: () => {
      checkForOLEDs();
      searchInventrComponents();
    }
  };
}

// Export the function
export default initOLEDTooltipFix;