import React, { useState } from "react";
import { RefreshCw, ArrowLeft, ArrowRight, Home, X } from "lucide-react";

interface WebBrowserWindowProps {
  initialUrl: string;
  title?: string;
  width?: number;
  height?: number;
}

const WebBrowserWindow: React.FC<WebBrowserWindowProps> = ({
  initialUrl,
  title = "Web Browser",
  width = 800,
  height = 600,
}) => {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyPosition, setHistoryPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
    navigate(initialUrl);
  };

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
        
        <form onSubmit={handleUrlSubmit} className="flex-1">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full px-3 py-1 rounded border border-gray-400 focus:outline-none focus:border-blue-500"
          />
        </form>
      </div>
      
      {/* Browser content */}
      <div className="flex-1 bg-white">
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