import React from 'react';
import { X } from 'lucide-react';
import { UniversalEmulator } from '../desktop/UniversalEmulator';

/**
 * Fullscreen Universal Emulator App Component
 * 
 * A container for the Universal Emulator to be displayed in fullscreen mode
 * as part of the CraftingTable OS desktop environment
 */
interface FullscreenUniversalEmulatorAppProps {
  onClose: () => void;
}

const FullscreenUniversalEmulatorApp: React.FC<FullscreenUniversalEmulatorAppProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      {/* App header bar */}
      <div className="flex items-center justify-between p-1 bg-gradient-to-r from-blue-800 to-blue-600">
        <div className="flex items-center space-x-2 pl-2">
          <img 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNpcmN1aXQtYm9hcmQiPjxyZWN0IHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgeD0iMyIgeT0iMyIgcng9IjIiIHJ5PSIyIi8+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjIiLz48cGF0aCBkPSJNOS4xNCAxNUg3YTIgMiAwIDAgMSAwLTRoMiIvPjxwYXRoIGQ9Ik0xNSA5aDJhMiAyIDAgMCAxIDIgMnY0TTkuMTQgMTVsNS41Mi0zLjUyTTE1IDE3aDJhMiAyIDAgMSAwIDAtNGgtMSIvPjwvc3ZnPg==" 
            alt="Universal Emulator Icon" 
            className="w-6 h-6 text-white" 
          />
          <h1 className="text-lg font-bold">Universal Emulator</h1>
        </div>
        
        <button 
          onClick={onClose} 
          className="flex items-center justify-center w-8 h-8 hover:bg-red-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      
      {/* App content container */}
      <div className="flex-1 overflow-hidden">
        <UniversalEmulator 
          appId="universal-emulator" 
          isActive={true} 
          onClose={onClose} 
        />
      </div>
    </div>
  );
};

export default FullscreenUniversalEmulatorApp;