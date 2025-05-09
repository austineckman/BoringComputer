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
    
    // Additional common libraries that might be included
    'Wire': '/attached_assets/OLED-U8g2-HERO-1 (2).zip', // Wire is usually included with Arduino core
    'SPI': '/attached_assets/OLED-U8g2-HERO-1 (2).zip'   // SPI is usually included with Arduino core
  };
  
  // Load all libraries on initialization
  useEffect(() => {
    console.log('Starting to load libraries...');
    const loadAllLibraries = async () => {
      for (const [name, path] of Object.entries(supportedLibraries)) {
        try {
          console.log(`Loading library: ${name} from ${path.split('/').pop()}`);
          // Simulate loading the library
          // In a real implementation, we would fetch and parse the actual .zip file
          const libraryContent = {
            name,
            path,
            loaded: true,
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
  
  // Context value
  const contextValue = {
    libraries,
    loadLibrary,
    getLibraryContent,
    isLibraryLoaded,
    loadedLibraries
  };
  
  return (
    <LibraryManagerContext.Provider value={contextValue}>
      {children}
    </LibraryManagerContext.Provider>
  );
};

export default LibraryManagerProvider;