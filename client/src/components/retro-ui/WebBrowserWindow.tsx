import React, { useState, useEffect } from "react";
import { RefreshCw, ArrowLeft, ArrowRight, Home, X, Star, StarOff } from "lucide-react";

interface WebBrowserWindowProps {
  initialUrl: string;
  title?: string;
  width?: number;
  height?: number;
  homePage?: string;
}

const WebBrowserWindow: React.FC<WebBrowserWindowProps> = ({
  initialUrl,
  title = "Web Browser",
  width = 800,
  height = 600,
  homePage = "https://craftingtable.com",
}) => {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyPosition, setHistoryPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  
  // Load favorites from localStorage on component mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('browser_favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  }, []);
  
  // Close favorites dropdown when clicking outside
  useEffect(() => {
    if (!showFavorites) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Close if click is outside the favorites menu
      if (!target.closest('.favorites-menu') && !target.closest('.favorites-button')) {
        setShowFavorites(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFavorites]);

  const navigate = (url: string) => {
    // Validate URL
    let processedUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      processedUrl = `https://${url}`;
    }
    
    setIsLoading(true);
    
    // Update history
    if (currentUrl !== processedUrl) {
      // Truncate forward history if we're navigating from a back position
      const newHistory = history.slice(0, historyPosition + 1);
      setHistory([...newHistory, processedUrl]);
      setHistoryPosition(newHistory.length);
    }
    
    setCurrentUrl(processedUrl);
    setUrlInput(processedUrl);
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(urlInput);
  };

  const goBack = () => {
    if (historyPosition > 0) {
      const newPosition = historyPosition - 1;
      setHistoryPosition(newPosition);
      setCurrentUrl(history[newPosition]);
      setUrlInput(history[newPosition]);
    }
  };

  const goForward = () => {
    if (historyPosition < history.length - 1) {
      const newPosition = historyPosition + 1;
      setHistoryPosition(newPosition);
      setCurrentUrl(history[newPosition]);
      setUrlInput(history[newPosition]);
    }
  };

  const goHome = () => {
    navigate(homePage);
  };
  
  const toggleFavorite = () => {
    const isFavorite = favorites.includes(currentUrl);
    let newFavorites: string[];
    
    if (isFavorite) {
      // Remove from favorites
      newFavorites = favorites.filter(url => url !== currentUrl);
    } else {
      // Add to favorites
      newFavorites = [...favorites, currentUrl];
    }
    
    // Update state and save to localStorage
    setFavorites(newFavorites);
    try {
      localStorage.setItem('browser_favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  };
  
  const isFavorite = favorites.includes(currentUrl);

  return (
    <div className="flex flex-col bg-white w-full h-full">
      {/* Browser chrome */}
      <div className="bg-gray-200 p-2 border-b border-gray-300 flex items-center space-x-2">
        <button
          onClick={goBack}
          disabled={historyPosition === 0}
          className={`p-1 rounded ${
            historyPosition === 0 ? "text-gray-400" : "hover:bg-gray-300"
          }`}
          title="Back"
        >
          <ArrowLeft size={16} />
        </button>
        
        <button
          onClick={goForward}
          disabled={historyPosition >= history.length - 1}
          className={`p-1 rounded ${
            historyPosition >= history.length - 1 ? "text-gray-400" : "hover:bg-gray-300"
          }`}
          title="Forward"
        >
          <ArrowRight size={16} />
        </button>
        
        <button
          onClick={goHome}
          className="p-1 rounded hover:bg-gray-300"
          title="Home"
        >
          <Home size={16} />
        </button>
        
        <button
          onClick={() => navigate(currentUrl)}
          className={`p-1 rounded hover:bg-gray-300 ${isLoading ? "animate-spin" : ""}`}
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
        
        <button
          onClick={toggleFavorite}
          className="p-1 rounded hover:bg-gray-300"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? <Star size={16} className="text-yellow-500 fill-yellow-500" /> : <StarOff size={16} />}
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className="favorites-button p-1 rounded hover:bg-gray-300 flex items-center"
            title="Favorites"
          >
            <span className="text-xs mr-1">Favorites</span>
            <Star size={14} className="text-yellow-500" />
          </button>
          
          {showFavorites && (
            <div className="favorites-menu absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded shadow-lg z-20 max-h-60 overflow-y-auto">
              <div className="p-2 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                <span className="font-medium text-sm">Bookmarks</span>
                {favorites.length > 0 && (
                  <span className="text-xs text-gray-500">{favorites.length} saved</span>
                )}
              </div>
              
              {favorites.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  <div className="mb-2">
                    <Star size={24} className="mx-auto text-gray-300" />
                  </div>
                  <p>No favorites yet</p>
                  <p className="text-xs mt-1">Click the star icon to add the current page</p>
                </div>
              ) : (
                <ul>
                  {favorites.map((url, index) => (
                    <li key={index} className="border-b border-gray-200 last:border-0 group">
                      <div className="flex items-center">
                        <button
                          onClick={() => {
                            navigate(url);
                            setShowFavorites(false);
                          }}
                          className="flex-grow text-left p-2 hover:bg-blue-50 text-sm flex items-center"
                        >
                          <Star size={12} className="text-yellow-500 fill-yellow-500 mr-2" />
                          <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
                        </button>
                        <button 
                          onClick={() => {
                            const newFavorites = favorites.filter(u => u !== url);
                            setFavorites(newFavorites);
                            localStorage.setItem('browser_favorites', JSON.stringify(newFavorites));
                          }}
                          className="invisible group-hover:visible p-1 mr-1 text-gray-400 hover:text-red-500"
                          title="Remove"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        
        <form onSubmit={handleUrlSubmit} className="flex-1">
          <div className="flex items-center bg-white rounded border border-gray-400 focus-within:border-blue-500 px-2">
            <span className="text-gray-500 text-xs">https://</span>
            <input
              type="text"
              value={urlInput.replace(/^https?:\/\//, '')}
              onChange={(e) => setUrlInput(e.target.value.includes('://') ? e.target.value : `https://${e.target.value}`)}
              className="w-full px-1 py-1 focus:outline-none"
              placeholder="Enter website URL..."
            />
          </div>
        </form>
      </div>
      
      {/* Browser content */}
      <div className="flex-1 bg-white relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            <div className="flex flex-col items-center">
              <RefreshCw size={32} className="animate-spin text-blue-500 mb-2" />
              <span className="text-blue-700 font-medium">Loading...</span>
            </div>
          </div>
        )}
        
        <iframe
          src={currentUrl}
          title={title}
          width="100%"
          height="100%"
          className="border-none"
          sandbox="allow-scripts allow-same-origin allow-forms"
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
        />
      </div>
      
      {/* Status bar */}
      <div className="bg-gray-200 p-1 border-t border-gray-300 text-xs text-gray-600">
        {isLoading ? "Loading..." : currentUrl}
      </div>
    </div>
  );
};

export default WebBrowserWindow;