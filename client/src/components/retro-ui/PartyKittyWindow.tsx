import React from "react";
import partyKittyImage from "@assets/partykitty.png";

interface PartyKittyWindowProps {
  onClose: () => void;
}

const PartyKittyWindow: React.FC<PartyKittyWindowProps> = ({ onClose }) => {
  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-hidden">
      <div className="flex justify-center items-center p-4 flex-1">
        <div className="max-w-md">
          <img 
            src={partyKittyImage} 
            alt="Party Kitty" 
            className="rounded-md border-4 border-orange-500 shadow-glow" 
          />
          
          <div className="mt-4 text-center">
            <h3 className="text-xl font-bold text-orange-400 mb-2">Party Kitty!</h3>
            <p className="text-gray-300">Party Kitty is celebrating with you! Happy crafting adventures!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyKittyWindow;