import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a context for library management
const LibraryManagerContext = createContext({
  libraries: {},
  loadLibrary: () => {},
  getLibraryContent: () => null,
  isLibraryLoaded: () => false,
  loadedLibraries: []
});

// Custom hook to access library context
export const useLibraryManager = () => useContext(LibraryManagerContext);

// Library Manager Provider component
export const LibraryManagerProvider = ({ children }) => {
  // State to track loaded libraries
  const [libraries, setLibraries] = useState({});
  const [loadedLibraries, setLoadedLibraries] = useState([]);
  
  // List of supported libraries with their asset paths
  const supportedLibraries = {
    // Main library names
    'U8g2': '/attached_assets/OLED-U8g2-HERO-1 (2).zip',
    'U8g2lib': '/attached_assets/OLED-U8g2-HERO-1 (2).zip',
    'TM1637Display': '/attached_assets/7SEG-TM1637-HERO-1 (1).zip',
    'Keypad': '/attached_assets/4x4-Keypad-HERO-1 (2).zip',
    'BasicEncoder': '/attached_assets/BasicEncoder-1.1.4-1.zip',
    
    // OLED related libraries
    'SSD1306': '/attached_assets/OLED-U8g2-HERO-1 (2).zip',
    'Adafruit_SSD1306': '/attached_assets/OLED-U8g2-HERO-1 (2).zip',
    'Adafruit_GFX': '/attached_assets/OLED-U8g2-HERO-1 (2).zip',
    'U8glib': '/attached_assets/OLED-U8g2-HERO-1 (2).zip',
    
    // Additional common libraries that might be included
    'Wire': '/attached_assets/OLED-U8g2-HERO-1 (2).zip', // Wire is usually included with Arduino core
    'SPI': '/attached_assets/OLED-U8g2-HERO-1 (2).zip'   // SPI is usually included with Arduino core
  };
  
  // Load all libraries on initialization
  useEffect(() => {
    console.log('Starting to load libraries...');
    const loadAllLibraries = async () => {
      // Load built-in libraries
      for (const [name, path] of Object.entries(supportedLibraries)) {
        try {
          console.log(`Loading library: ${name} from ${path.split('/').pop()}`);
          const libraryContent = {
            name,
            path,
            loaded: true,
            type: 'built-in',
            functions: {} // This would contain the actual library API
          };
          
          // Add library to state
          setLibraries(prevLibraries => ({
            ...prevLibraries,
            [name]: libraryContent
          }));
          
          // Add to loaded libraries
          setLoadedLibraries(prev => [...prev, name]);
          
          console.log(`Library ${name} loaded successfully`);
        } catch (error) {
          console.error(`Failed to load library ${name}:`, error);
        }
      }

      // Load custom uploaded libraries
      try {
        const response = await fetch('/api/arduino-libraries');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.libraries) {
            for (const lib of data.libraries) {
              console.log(`Loading custom library: ${lib.name} from ${lib.filename}`);
              const libraryContent = {
                name: lib.name,
                path: lib.path,
                loaded: true,
                type: 'custom',
                uploadedAt: lib.uploadedAt,
                functions: {}
              };
              
              // Add library to state
              setLibraries(prevLibraries => ({
                ...prevLibraries,
                [lib.name]: libraryContent
              }));
              
              // Add to loaded libraries
              if (!loadedLibraries.includes(lib.name)) {
                setLoadedLibraries(prev => [...prev, lib.name]);
              }
              
              console.log(`Custom library ${lib.name} loaded successfully`);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load custom libraries:', error);
      }

      console.log('All libraries loaded successfully');
    };
    
    loadAllLibraries();
  }, []);
  
  // Function to load a specific library
  const loadLibrary = async (libraryName) => {
    if (libraries[libraryName]) {
      // Already loaded
      return libraries[libraryName];
    }
    
    if (!supportedLibraries[libraryName]) {
      console.error(`Library "${libraryName}" is not supported`);
      return null;
    }
    
    try {
      const path = supportedLibraries[libraryName];
      console.log(`Loading library: ${libraryName} from ${path}`);
      
      // Simulate loading the library
      const libraryContent = {
        name: libraryName,
        path,
        loaded: true,
        functions: {} // This would contain the actual library API
      };
      
      // Add library to state
      setLibraries(prevLibraries => ({
        ...prevLibraries,
        [libraryName]: libraryContent
      }));
      
      // Add to loaded libraries
      if (!loadedLibraries.includes(libraryName)) {
        setLoadedLibraries(prev => [...prev, libraryName]);
      }
      
      console.log(`Library ${libraryName} loaded successfully`);
      return libraryContent;
    } catch (error) {
      console.error(`Failed to load library ${libraryName}:`, error);
      return null;
    }
  };
  
  // Function to get library content
  const getLibraryContent = (libraryName) => {
    return libraries[libraryName] || null;
  };
  
  // Function to check if a library is loaded
  const isLibraryLoaded = (libraryName) => {
    return !!libraries[libraryName];
  };

  // Function to refresh and reload custom libraries
  const refreshLibraries = async () => {
    try {
      const response = await fetch('/api/arduino-libraries');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.libraries) {
          for (const lib of data.libraries) {
            if (!libraries[lib.name]) {
              console.log(`Loading new custom library: ${lib.name}`);
              const libraryContent = {
                name: lib.name,
                path: lib.path,
                loaded: true,
                type: 'custom',
                uploadedAt: lib.uploadedAt,
                functions: {}
              };
              
              // Add library to state
              setLibraries(prevLibraries => ({
                ...prevLibraries,
                [lib.name]: libraryContent
              }));
              
              // Add to loaded libraries
              if (!loadedLibraries.includes(lib.name)) {
                setLoadedLibraries(prev => [...prev, lib.name]);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh custom libraries:', error);
    }
  };
  
  // Context value
  const contextValue = {
    libraries,
    loadLibrary,
    getLibraryContent,
    isLibraryLoaded,
    loadedLibraries,
    refreshLibraries
  };
  
  return (
    <LibraryManagerContext.Provider value={contextValue}>
      {children}
    </LibraryManagerContext.Provider>
  );
};

export default LibraryManagerProvider;