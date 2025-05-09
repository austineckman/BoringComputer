import React, { useState, useEffect, createContext, useContext } from 'react';

/**
 * LibraryManagerContext - Context for managing Arduino libraries in the simulator
 */
const LibraryManagerContext = createContext({
  libraries: {},
  loadLibrary: () => {},
  getLibrary: () => null,
  isLibraryLoaded: () => false,
  librariesLoaded: false,
  loadingError: null
});

/**
 * LibraryManagerProvider - Provider component for the LibraryManager context
 * 
 * This component manages the loading and access to Arduino libraries in the simulator.
 * It preloads common libraries and provides an interface for accessing them.
 */
export const LibraryManagerProvider = ({ children }) => {
  // State for loaded libraries
  const [libraries, setLibraries] = useState({});
  const [librariesLoaded, setLibrariesLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);

  // Library definitions - these map to the actual library files
  const libraryDefinitions = {
    // OLED Display via U8g2 library
    'U8g2': {
      path: 'OLED-U8g2-HERO-1',
      files: [
        'U8g2lib.h',
        'U8x8lib.h'
      ],
      name: 'U8g2',
      description: 'U8g2 library for monochrome displays',
      includePath: 'U8g2lib.h',
      classes: ['U8G2', 'U8X8']
    },
    // 7-Segment Display via TM1637 library
    'TM1637Display': {
      path: '7SEG-TM1637-HERO-1',
      files: [
        'TM1637Display.h',
        'TM1637Display.cpp'
      ],
      name: 'TM1637Display',
      description: 'TM1637 7-segment display library',
      includePath: 'TM1637Display.h',
      classes: ['TM1637Display']
    },
    // 4x4 Keypad library
    'Keypad': {
      path: '4x4-Keypad-HERO-1',
      files: [
        'Keypad.h',
        'Keypad.cpp'
      ],
      name: 'Keypad',
      description: 'Keypad matrix input library',
      includePath: 'Keypad.h',
      classes: ['Keypad']
    },
    // Rotary Encoder library
    'BasicEncoder': {
      path: 'BasicEncoder-1.1.4-1',
      files: [
        'BasicEncoder.h',
        'BasicEncoder.cpp'
      ],
      name: 'BasicEncoder',
      description: 'Basic rotary encoder library',
      includePath: 'BasicEncoder.h',
      classes: ['BasicEncoder']
    }
  };

  // Load a single library by name
  const loadLibrary = async (libraryName) => {
    try {
      if (!libraryDefinitions[libraryName]) {
        console.error(`Library ${libraryName} not found in definitions`);
        return false;
      }
      
      const libDef = libraryDefinitions[libraryName];
      console.log(`Loading library: ${libDef.name} from ${libDef.path}`);
      
      // Create a simulated library object that we can use in our simulator
      const library = {
        name: libDef.name,
        description: libDef.description,
        classes: libDef.classes,
        includePath: libDef.includePath,
        methods: {},  // Will be populated based on the library
        isLoaded: true
      };
      
      // Add library-specific method implementations
      if (libraryName === 'U8g2') {
        // Add U8g2 specific methods
        library.methods = {
          // Basic display initialization
          'U8G2.begin': (instance) => {
            console.log(`${instance}.begin() called`);
            return true;
          },
          // Clear the display buffer
          'U8G2.clearBuffer': (instance) => {
            console.log(`${instance}.clearBuffer() called`);
            return true;
          },
          // Send buffer to display
          'U8G2.sendBuffer': (instance) => {
            console.log(`${instance}.sendBuffer() called`);
            return true;
          },
          // Draw text
          'U8G2.drawStr': (instance, x, y, text) => {
            console.log(`${instance}.drawStr(${x}, ${y}, "${text}") called`);
            return true;
          },
          // Set font
          'U8G2.setFont': (instance, font) => {
            console.log(`${instance}.setFont(${font}) called`);
            return true;
          }
        };
      } else if (libraryName === 'TM1637Display') {
        // Add TM1637Display specific methods
        library.methods = {
          // Initialize display
          'TM1637Display.setBrightness': (instance, brightness, on) => {
            console.log(`${instance}.setBrightness(${brightness}, ${on}) called`);
            return true;
          },
          // Display number
          'TM1637Display.showNumberDec': (instance, num, leading, digits, pos) => {
            console.log(`${instance}.showNumberDec(${num}, ${leading}, ${digits}, ${pos}) called`);
            return true;
          },
          // Clear display
          'TM1637Display.clear': (instance) => {
            console.log(`${instance}.clear() called`);
            return true;
          }
        };
      } else if (libraryName === 'Keypad') {
        // Add Keypad specific methods
        library.methods = {
          // Get key
          'Keypad.getKey': (instance) => {
            console.log(`${instance}.getKey() called`);
            // Randomly return a key or NO_KEY to simulate keypad input
            const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#', 'A', 'B', 'C', 'D', 'NO_KEY'];
            const randomIndex = Math.floor(Math.random() * keys.length);
            return keys[randomIndex];
          }
        };
      } else if (libraryName === 'BasicEncoder') {
        // Add BasicEncoder specific methods
        library.methods = {
          // Get encoder position
          'BasicEncoder.getPosition': (instance) => {
            console.log(`${instance}.getPosition() called`);
            // Return a simulated position value
            return Math.floor(Math.random() * 100);
          },
          // Read the encoder
          'BasicEncoder.read': (instance) => {
            console.log(`${instance}.read() called`);
            return Math.floor(Math.random() * 3) - 1; // Return -1, 0, or 1
          }
        };
      }
      
      // Add the library to our state
      setLibraries(prev => ({
        ...prev,
        [libraryName]: library
      }));
      
      console.log(`Library ${libraryName} loaded successfully`);
      return true;
    } catch (error) {
      console.error(`Error loading library ${libraryName}:`, error);
      setLoadingError(`Failed to load library ${libraryName}: ${error.message}`);
      return false;
    }
  };

  // Get a specific library by name
  const getLibrary = (libraryName) => {
    return libraries[libraryName] || null;
  };

  // Check if a library is loaded
  const isLibraryLoaded = (libraryName) => {
    return !!libraries[libraryName]?.isLoaded;
  };

  // Load all libraries on component mount
  useEffect(() => {
    const loadAllLibraries = async () => {
      try {
        console.log('Starting to load libraries...');
        setLoadingError(null);
        
        // Load each library in sequence
        const libraryNames = Object.keys(libraryDefinitions);
        for (const libName of libraryNames) {
          await loadLibrary(libName);
        }
        
        // Mark all libraries as loaded
        setLibrariesLoaded(true);
        console.log('All libraries loaded successfully');
      } catch (error) {
        console.error('Error loading libraries:', error);
        setLoadingError(`Failed to load libraries: ${error.message}`);
      }
    };
    
    loadAllLibraries();
  }, []);

  // Provide the library manager context
  return (
    <LibraryManagerContext.Provider
      value={{
        libraries,
        loadLibrary,
        getLibrary,
        isLibraryLoaded,
        librariesLoaded,
        loadingError
      }}
    >
      {children}
    </LibraryManagerContext.Provider>
  );
};

/**
 * useLibraryManager - Hook to access the LibraryManager context
 */
export const useLibraryManager = () => {
  const context = useContext(LibraryManagerContext);
  if (!context) {
    throw new Error('useLibraryManager must be used within a LibraryManagerProvider');
  }
  return context;
};

/**
 * LibraryManager - Component for managing Arduino libraries
 * This component doesn't render anything visible but provides library management
 * functionality to the simulator.
 */
const LibraryManager = () => {
  const { librariesLoaded, loadingError } = useLibraryManager();

  // Log library status
  useEffect(() => {
    if (librariesLoaded) {
      console.log('LibraryManager: All libraries loaded successfully');
    } else if (loadingError) {
      console.error('LibraryManager: Error loading libraries:', loadingError);
    }
  }, [librariesLoaded, loadingError]);

  // This component doesn't render anything visible
  return null;
};

export default LibraryManager;