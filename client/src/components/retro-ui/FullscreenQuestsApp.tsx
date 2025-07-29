import React, { useState } from 'react';
import { X, ArrowLeft, BookOpen, Award, Loader2, AlertCircle, Star, CheckCircle, Clock, Scroll, Package } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuests } from '@/hooks/useQuests';
import { Quest } from '@shared/schema';
import ActiveQuestScreen from './ActiveQuestScreen';

// Custom Pixel Card Components inspired by React Bits
const PixelCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'completed' | 'locked' | 'selected';
}> = ({ children, className = '', onClick, variant = 'default' }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'completed':
        return 'bg-green-900/30 border-green-400/60 shadow-green-400/20';
      case 'locked':
        return 'bg-gray-900/50 border-gray-600/40 opacity-75';
      case 'selected':
        return 'bg-blue-900/40 border-blue-400/80 shadow-blue-400/30';
      default:
        return 'bg-amber-900/20 border-amber-600/50 hover:border-amber-400/80';
    }
  };

  return (
    <div 
      className={`
        relative border-2 rounded-none transition-all duration-200 cursor-pointer
        shadow-lg hover:shadow-xl transform hover:scale-[1.02]
        ${getVariantClasses()}
        ${className}
      `}
      onClick={onClick}
      style={{
        imageRendering: 'pixelated',
        boxShadow: variant === 'completed' 
          ? '0 0 20px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : variant === 'selected'
          ? '0 0 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      {children}
    </div>
  );
};

const PixelButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const getVariantClasses = () => {
    if (disabled) return 'bg-gray-700 border-gray-600 text-gray-400';
    
    switch (variant) {
      case 'success':
        return 'bg-green-700 hover:bg-green-600 border-green-500 text-white shadow-green-500/30';
      case 'danger':
        return 'bg-red-700 hover:bg-red-600 border-red-500 text-white shadow-red-500/30';
      case 'secondary':
        return 'bg-gray-700 hover:bg-gray-600 border-gray-500 text-white shadow-gray-500/30';
      default:
        return 'bg-blue-700 hover:bg-blue-600 border-blue-500 text-white shadow-blue-500/30';
    }
  };

  return (
    <button
      className={`
        px-4 py-2 border-2 rounded-none font-bold text-sm transition-all duration-200
        ${getVariantClasses()}
        ${disabled ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      style={{
        imageRendering: 'pixelated',
        textShadow: '1px 1px 0 rgba(0, 0, 0, 0.5)'
      }}
    >
      {children}
    </button>
  );
};

// For sounds
declare global {
  interface Window {
    sounds?: {
      click: () => void;
      hover: () => void;
      success: () => void;
      error: () => void;
      reward: () => void;
    };
  }
}

interface FullscreenQuestsAppProps {
  onClose: () => void;
}

const FullscreenQuestsApp: React.FC<FullscreenQuestsAppProps> = ({ onClose }) => {
  const [, navigate] = useLocation();
  const { allQuests, loading: loadingQuests, error: questsError } = useQuests();
  
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  
  return (
    <div className="fixed inset-0 z-50 flex bg-black" style={{ imageRendering: 'pixelated' }}>
      {/* Left Sidebar - Quest List */}
      <div className="w-1/3 border-r-4 border-amber-600/60 bg-gradient-to-b from-amber-900/40 to-amber-950/60 flex flex-col">
        {/* Header */}
        <div className="bg-amber-800/80 border-b-2 border-amber-600/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Scroll className="h-6 w-6 text-amber-200" />
              <h1 className="text-xl font-bold text-amber-100" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.8)' }}>
                Quest Log
              </h1>
            </div>
            <button 
              className="text-amber-200 hover:text-white"
              onClick={() => {
                window.sounds?.click();
                onClose();
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quest Categories */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Category Tabs */}
          <div className="bg-amber-900/60 border-b-2 border-amber-700/40 p-2">
            <div className="flex space-x-1">
              <PixelButton variant="primary" className="text-xs px-3 py-1">
                All Quests
              </PixelButton>
              <PixelButton variant="secondary" className="text-xs px-3 py-1">
                Recommended
              </PixelButton>
              <PixelButton variant="secondary" className="text-xs px-3 py-1">
                Completed
              </PixelButton>
            </div>
          </div>

          {/* Quest List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loadingQuests ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-amber-400 mb-2" />
                <p className="text-amber-300 text-sm">Loading quests...</p>
              </div>
            ) : allQuests && allQuests.length > 0 ? (
              allQuests.map((quest: Quest) => (
                <PixelCard
                  key={quest.id}
                  variant={quest.status === 'completed' ? 'completed' : selectedQuest?.id === quest.id ? 'selected' : 'default'}
                  className="p-3"
                  onClick={() => {
                    window.sounds?.click();
                    setSelectedQuest(quest);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {/* Quest Icon/Avatar */}
                    <div className="w-12 h-12 bg-amber-800/60 border border-amber-600/60 flex items-center justify-center rounded-none">
                      {quest.status === 'completed' ? (
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      ) : (
                        <BookOpen className="h-6 w-6 text-amber-300" />
                      )}
                    </div>
                    
                    {/* Quest Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-sm truncate ${
                        quest.status === 'completed' ? 'text-green-300' : 'text-amber-100'
                      }`} style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.8)' }}>
                        {quest.title}
                      </h3>
                      <p className="text-amber-300/80 text-xs truncate">
                        {quest.adventureLine}
                      </p>
                      
                      {/* Progress Indicator */}
                      {quest.status === 'completed' ? (
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="w-full h-1 bg-green-600 rounded-full"></div>
                          <span className="text-green-400 text-xs font-bold">✓</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="w-full h-1 bg-amber-900/60 rounded-full">
                            <div className="w-0 h-1 bg-amber-400 rounded-full"></div>
                          </div>
                          <Clock className="h-3 w-3 text-amber-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </PixelCard>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <BookOpen className="h-12 w-12 text-amber-600/60 mb-3" />
                <p className="text-amber-300 text-sm text-center">No quests available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Quest Detail */}
      <div className="flex-1 bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col">
        {selectedQuest ? (
          <>
            {/* Quest Header */}
            <div className="bg-amber-800/90 border-b-4 border-amber-600/80 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-amber-100 mb-2" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.8)' }}>
                    {selectedQuest.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-amber-200">
                    <div className="flex items-center space-x-1">
                      <Award className="h-4 w-4" />
                      <span className="text-sm font-medium">{selectedQuest.xpReward} XP</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm">Level {selectedQuest.difficulty}</span>
                    </div>
                    {selectedQuest.status === 'completed' && (
                      <div className="bg-green-600 px-2 py-1 rounded-none text-white text-xs font-bold">
                        COMPLETED
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Quest Portrait/Image */}
                {selectedQuest.heroImage && (
                  <div className="w-24 h-24 border-2 border-amber-600/60 bg-amber-900/40">
                    <img 
                      src={selectedQuest.heroImage} 
                      alt={selectedQuest.title}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quest Content */}
            <div className="flex-1 overflow-auto p-6">
              {/* Quest Description */}
              <PixelCard className="p-6 mb-6 bg-amber-50/80">
                <h2 className="text-lg font-bold text-amber-900 mb-3" style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.8)' }}>
                  Your Task
                </h2>
                <p className="text-amber-800 leading-relaxed">
                  {selectedQuest.description}
                </p>
                {selectedQuest.missionBrief && (
                  <div className="mt-4 p-4 bg-amber-100 border-l-4 border-amber-600">
                    <p className="text-amber-900 text-sm leading-relaxed">
                      {selectedQuest.missionBrief}
                    </p>
                  </div>
                )}
              </PixelCard>

              {/* Level Indicator */}
              <PixelCard className="p-4 mb-6 bg-blue-50/80">
                <div className="text-center">
                  <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-none font-bold">
                    Level {selectedQuest.difficulty}/10
                  </div>
                </div>
              </PixelCard>

              {/* Rewards Section */}
              <PixelCard className="p-6 bg-amber-100/80">
                <h2 className="text-lg font-bold text-amber-900 mb-4" style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.8)' }}>
                  Your Reward
                </h2>
                
                {/* Reward Scroll */}
                <div className="bg-amber-50 border-4 border-amber-600/40 p-4 rounded-none relative">
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-amber-700 border border-amber-600 rounded-full"></div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-700 border border-amber-600 rounded-full"></div>
                  
                  <div className="flex items-center justify-center space-x-8">
                    {/* XP Reward */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-amber-200 border-2 border-amber-600 flex items-center justify-center rounded-none mb-2">
                        <Award className="h-8 w-8 text-amber-700" />
                      </div>
                      <span className="text-amber-900 font-bold">{selectedQuest.xpReward}</span>
                    </div>
                    
                    {/* Gold Reward */}
                    {selectedQuest.goldReward && selectedQuest.goldReward > 0 && (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-200 border-2 border-yellow-600 flex items-center justify-center rounded-none mb-2">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
                        </div>
                        <span className="text-amber-900 font-bold">{selectedQuest.goldReward}</span>
                      </div>
                    )}
                    
                    {/* Item Rewards */}
                    {selectedQuest.itemRewards && selectedQuest.itemRewards.length > 0 && (
                      selectedQuest.itemRewards.slice(0, 3).map((reward, index) => (
                        <div key={index} className="text-center">
                          <div className="w-16 h-16 bg-gray-200 border-2 border-gray-600 flex items-center justify-center rounded-none mb-2">
                            <Package className="h-8 w-8 text-gray-700" />
                          </div>
                          <span className="text-amber-900 font-bold text-xs">{reward.quantity}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </PixelCard>
            </div>

            {/* Action Buttons */}
            <div className="bg-amber-800/90 border-t-4 border-amber-600/80 p-4">
              <div className="flex justify-center space-x-4">
                {selectedQuest.status === 'completed' ? (
                  <PixelButton variant="secondary" disabled className="px-8 py-3">
                    Quest Completed
                  </PixelButton>
                ) : (
                  <PixelButton 
                    variant="success" 
                    className="px-8 py-3 text-lg font-bold"
                    onClick={() => {
                      window.sounds?.click();
                      setActiveQuestId(selectedQuest.id.toString());
                    }}
                  >
                    START QUEST
                  </PixelButton>
                )}
                <PixelButton variant="secondary" className="px-6 py-3">
                  Share Quest
                </PixelButton>
              </div>
            </div>
          </>
        ) : (
          /* No Quest Selected */
          <div className="flex-1 flex items-center justify-center bg-amber-50">
            <div className="text-center">
              <BookOpen className="h-24 w-24 text-amber-400/60 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-amber-700 mb-2">Select a Quest</h2>
              <p className="text-amber-600">Choose a quest from the list to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Active Quest Screen Overlay */}
      {activeQuestId && (
        <div className="absolute inset-0 z-50">
          <ActiveQuestScreen 
            questId={activeQuestId}
            onClose={() => setActiveQuestId(null)}
            onQuestComplete={() => {
              setActiveQuestId(null);
              // Refresh quest data to show completion
            }}
          />
        </div>
      )}

      {/* Loading Screen */}
      {loadingQuests && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-amber-400 mx-auto mb-4" />
            <p className="text-amber-300 text-lg">Loading quest data...</p>
          </div>
        </div>
      )}

      {/* Error Screen */}
      {questsError && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 text-lg">Failed to load quests</p>
            <p className="text-gray-400 text-sm mt-2">Please try refreshing the page</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullscreenQuestsApp;