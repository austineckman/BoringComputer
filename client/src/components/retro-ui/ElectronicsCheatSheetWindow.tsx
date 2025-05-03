import React, { useState } from 'react';
import { X, Minimize2, Book, FileText, Cpu, Zap, FileSpreadsheet, Calculator, Search, Sparkles, AlertTriangle, CheckCircle2, ThumbsUp, Info } from 'lucide-react';
import gizboImage from '@assets/gizbo.png';

interface ElectronicsCheatSheetWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
}

const ElectronicsCheatSheetWindow: React.FC<ElectronicsCheatSheetWindowProps> = ({
  onClose,
  onMinimize,
  isActive,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  
  // Collection of electronic formulas
  const formulas = [
    {
      title: "Ohm's Law",
      formula: "V = I × R",
      description: "The relationship between voltage (V), current (I), and resistance (R)",
      variations: [
        { formula: "I = V ÷ R", description: "Finding current" },
        { formula: "R = V ÷ I", description: "Finding resistance" }
      ],
      notes: "Example: If V = 12V and R = 6Ω, then I = 2A"
    }
  ];
  
  return (
    <div className={`p-0 rounded-lg overflow-hidden shadow-lg flex flex-col h-full ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Title bar */}
      <div className="bg-blue-500 text-white p-2 flex justify-between items-center">
        <div className="flex items-center">
          <FileSpreadsheet className="w-5 h-5 mr-2" />
          <h2 className="text-lg font-semibold">Electronics Cheat Sheets</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onMinimize}
            className="p-1 hover:bg-blue-400 rounded"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-400 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
        <div className="flex-1 overflow-auto p-4">
          <h2>Electronics Cheat Sheets Content</h2>
          <p>This window contains formulas, pin mappings, and other electronics reference materials.</p>
        </div>
      </div>
    </div>
  );
};

export default ElectronicsCheatSheetWindow;