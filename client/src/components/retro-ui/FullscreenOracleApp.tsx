import React, { useState } from 'react';
import { X, Book, Package2, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

// Interface for Lootbox data
interface Lootbox {
  id: string | number;
  name: string;
  description: string;
  rarity: string;
  imagePath?: string;
  type?: string;
}

// Interface for Quest data
interface Quest {
  id: string | number;
  title: string;
  description: string;
  adventureLine: string;
  difficulty: number;
  xpReward: number;
  rewards: {
    id: string;
    type: string;
    quantity: number;
  }[];
  content?: {
    images?: string[];
  };
}

interface FullscreenOracleAppProps {
  onClose: () => void;
}

const FullscreenOracleApp: React.FC<FullscreenOracleAppProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('lootboxes');

  // Fetch lootboxes data
  const { 
    data: lootboxes, 
    isLoading: lootboxesLoading, 
    error: lootboxesError 
  } = useQuery({
    queryKey: ['/api/admin/lootboxes'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fetch quests data
  const { 
    data: quests, 
    isLoading: questsLoading, 
    error: questsError 
  } = useQuery({
    queryKey: ['/api/admin/quests'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'text-gray-200',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400',
      welcome: 'text-teal-400',
      quest: 'text-orange-400',
      event: 'text-pink-400'
    };
    return colors[rarity.toLowerCase()] || 'text-gray-200';
  };

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Book className="h-6 w-6 text-purple-400" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
            The Oracle
          </h1>
        </div>
        <button 
          onClick={onClose}
          className="p-1 bg-gray-700 hover:bg-red-600 rounded-md transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-hidden">
        <Tabs 
          defaultValue="lootboxes" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList className="grid grid-cols-2 mx-4 mt-4">
            <TabsTrigger value="lootboxes" className="flex items-center">
              <Package2 className="mr-2 h-4 w-4" />
              Lootbox Editor
            </TabsTrigger>
            <TabsTrigger value="quests" className="flex items-center">
              <Book className="mr-2 h-4 w-4" />
              Quest Editor
            </TabsTrigger>
          </TabsList>

          {/* Lootboxes Tab */}
          <TabsContent 
            value="lootboxes" 
            className="flex-grow p-4 overflow-auto"
          >
            {lootboxesLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              </div>
            ) : lootboxesError ? (
              <div className="flex flex-col items-center justify-center h-full text-red-400">
                <AlertTriangle className="h-12 w-12 mb-2" />
                <p>Error loading lootboxes</p>
              </div>
            ) : lootboxes && lootboxes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lootboxes.map((lootbox: Lootbox) => (
                  <div 
                    key={lootbox.id} 
                    className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{lootbox.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full bg-gray-700 ${getRarityColor(lootbox.rarity)}`}>
                          {lootbox.rarity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{lootbox.description}</p>
                      {lootbox.imagePath && (
                        <div className="relative w-full h-32 bg-gray-700 rounded overflow-hidden">
                          <img
                            src={lootbox.imagePath}
                            alt={lootbox.name}
                            className="object-contain w-full h-full"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        </div>
                      )}
                      <div className="mt-2 text-sm text-gray-400">
                        ID: {lootbox.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Package2 className="h-12 w-12 mb-2" />
                <p>No lootboxes found</p>
              </div>
            )}
          </TabsContent>

          {/* Quests Tab */}
          <TabsContent 
            value="quests" 
            className="flex-grow p-4 overflow-auto"
          >
            {questsLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              </div>
            ) : questsError ? (
              <div className="flex flex-col items-center justify-center h-full text-red-400">
                <AlertTriangle className="h-12 w-12 mb-2" />
                <p>Error loading quests</p>
              </div>
            ) : quests && quests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quests.map((quest: Quest) => (
                  <div 
                    key={quest.id} 
                    className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{quest.title}</h3>
                        <span className="text-yellow-400 text-sm">
                          {getDifficultyStars(quest.difficulty)}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-blue-300">
                          {quest.adventureLine}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{quest.description}</p>
                      
                      {quest.content?.images && quest.content.images.length > 0 && (
                        <div className="relative w-full h-32 bg-gray-700 rounded overflow-hidden mb-3">
                          <img
                            src={quest.content.images[0]}
                            alt={quest.title}
                            className="object-contain w-full h-full"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        </div>
                      )}
                      
                      <div className="border-t border-gray-700 pt-2 mt-2">
                        <h4 className="text-sm font-semibold mb-1">Rewards:</h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-yellow-300">
                            {quest.xpReward} XP
                          </span>
                          {quest.rewards.map((reward, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 text-xs rounded-full bg-gray-700 text-green-300"
                            >
                              {reward.quantity}x {reward.type}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Book className="h-12 w-12 mb-2" />
                <p>No quests found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FullscreenOracleApp;