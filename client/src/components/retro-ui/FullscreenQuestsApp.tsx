import React, { useState } from 'react';
import { X, ArrowLeft, BookOpen, Award, Loader2, AlertCircle, Search, Filter, Grid, List } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuests } from '@/hooks/useQuests';
import { useComponentKits } from '@/hooks/useComponentKits';
import { Quest } from '@shared/schema';
import { motion, AnimatePresence } from 'framer-motion';
import ActiveQuestScreen from './ActiveQuestScreen';

// Modern card component with smooth animations
const ModernCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  completed?: boolean;
}> = ({ children, className = '', onClick, selected = false, completed = false }) => {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 cursor-pointer
        ${selected ? 'border-blue-500 shadow-blue-500/20 shadow-xl' : 'border-gray-200 hover:border-gray-300'}
        ${completed ? 'bg-green-50 border-green-300' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
      {completed && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 text-white text-xs">✓</div>
        </div>
      )}
    </motion.div>
  );
};

// Modern button component
const ModernButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false }) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

interface FullscreenQuestsAppProps {
  onClose: () => void;
}

const FullscreenQuestsApp: React.FC<FullscreenQuestsAppProps> = ({ onClose }) => {
  const [, navigate] = useLocation();
  const { kits, loading: loadingKits } = useComponentKits();
  const { allQuests, loading: loadingQuests, error: questsError } = useQuests();
  
  const [selectedKit, setSelectedKit] = useState<string | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'completed'>('all');

  // Get quests for selected kit
  const getQuestsForKit = (kitId: string) => {
    if (!allQuests || allQuests.length === 0) return [];
    
    return allQuests.filter((quest: Quest) => {
      // First check if the quest directly belongs to this kit
      if (quest.kitId === kitId) {
        return true;
      }
      
      // Check if any component from this kit is required for the quest
      const components = (quest as any).componentRequirements || [];
      if (components.length > 0) {
        for (const comp of components) {
          if (comp && comp.kitId === kitId) {
            return true;
          }
        }
      }
      
      return false;
    });
  };

  // Filter quests based on search and status
  const filteredQuests = selectedKit 
    ? getQuestsForKit(selectedKit).filter((quest: Quest) => {
        const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             quest.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || 
                             (filterStatus === 'completed' && quest.status === 'completed') ||
                             (filterStatus === 'available' && quest.status !== 'completed');
        return matchesSearch && matchesStatus;
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Quest Management</h1>
            {selectedKit && (
              <div className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {kits?.find(k => k.id === selectedKit)?.name}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {selectedKit && (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search quests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Quests</option>
                  <option value="available">Available</option>
                  <option value="completed">Completed</option>
                </select>
                
                {/* View Mode Toggle */}
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Back to Kits */}
                <ModernButton
                  variant="outline"
                  onClick={() => {
                    setSelectedKit(null);
                    setSelectedQuest(null);
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Kits
                </ModernButton>
              </>
            )}
            
            {/* Close Button */}
            <ModernButton variant="secondary" onClick={onClose}>
              <X className="h-5 w-5" />
            </ModernButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!selectedKit ? (
            /* Kit Selection View */
            <motion.div
              key="kit-selection"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="h-full overflow-auto p-6"
            >
              <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose a Component Kit</h2>
                  <p className="text-gray-600">Select a component kit to view and manage its quests</p>
                </div>

                {loadingKits ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : kits && kits.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kits.map((kit) => {
                      const kitQuests = getQuestsForKit(kit.id);
                      const totalQuests = kitQuests.length;
                      const completedQuests = kitQuests.filter((q: Quest) => q.status === 'completed').length;
                      
                      return (
                        <ModernCard
                          key={kit.id}
                          onClick={() => setSelectedKit(kit.id)}
                          className="p-6 h-64"
                        >
                          <div className="flex flex-col h-full">
                            {kit.image && (
                              <div className="flex-shrink-0 mb-4">
                                <img 
                                  src={kit.image} 
                                  alt={kit.name}
                                  className="w-full h-24 object-contain rounded-lg"
                                />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{kit.name}</h3>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{kit.description}</p>
                            </div>
                            
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="text-blue-600 font-medium">
                                  {totalQuests} Quest{totalQuests !== 1 ? 's' : ''}
                                </span>
                                <span className="text-green-600 font-medium">
                                  {completedQuests}/{totalQuests} Complete
                                </span>
                              </div>
                              
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500 transition-all duration-300"
                                  style={{ width: totalQuests > 0 ? `${(completedQuests / totalQuests) * 100}%` : '0%' }}
                                />
                              </div>
                            </div>
                          </div>
                        </ModernCard>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Component Kits Found</h3>
                    <p className="text-gray-600">Component kits are required to organize quests.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* Quest List View */
            <motion.div
              key="quest-list"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="h-full overflow-auto p-6"
            >
              <div className="max-w-6xl mx-auto">
                {loadingQuests ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : filteredQuests.length > 0 ? (
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredQuests.map((quest: Quest) => (
                        <ModernCard
                          key={quest.id}
                          selected={selectedQuest?.id === quest.id}
                          completed={quest.status === 'completed'}
                          onClick={() => setSelectedQuest(quest)}
                          className="p-6 h-48"
                        >
                          <div className="flex flex-col h-full">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                {quest.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                                {quest.description}
                              </p>
                              <div className="text-xs text-gray-500">
                                {quest.adventureLine}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                              <div className="flex items-center space-x-3 text-sm">
                                <span className="text-blue-600 font-medium">
                                  {quest.xpReward} XP
                                </span>
                                <span className="text-amber-600">
                                  Level {quest.difficulty}
                                </span>
                              </div>
                              
                              <ModernButton
                                size="sm"
                                variant={quest.status === 'completed' ? 'secondary' : 'primary'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (quest.status !== 'completed') {
                                    setActiveQuestId(quest.id.toString());
                                  }
                                }}
                                disabled={quest.status === 'completed'}
                              >
                                {quest.status === 'completed' ? 'Completed' : 'Start'}
                              </ModernButton>
                            </div>
                          </div>
                        </ModernCard>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredQuests.map((quest: Quest) => (
                        <ModernCard
                          key={quest.id}
                          selected={selectedQuest?.id === quest.id}
                          completed={quest.status === 'completed'}
                          onClick={() => setSelectedQuest(quest)}
                          className="p-6"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {quest.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2">
                                {quest.description}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{quest.adventureLine}</span>
                                <span>{quest.xpReward} XP</span>
                                <span>Level {quest.difficulty}</span>
                              </div>
                            </div>
                            
                            <ModernButton
                              variant={quest.status === 'completed' ? 'secondary' : 'primary'}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (quest.status !== 'completed') {
                                  setActiveQuestId(quest.id.toString());
                                }
                              }}
                              disabled={quest.status === 'completed'}
                            >
                              {quest.status === 'completed' ? 'Completed' : 'Start Quest'}
                            </ModernButton>
                          </div>
                        </ModernCard>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quests Found</h3>
                    <p className="text-gray-600">
                      {searchTerm ? 'Try adjusting your search terms.' : 'No quests available for this kit.'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quest Detail Sidebar */}
      <AnimatePresence>
        {selectedQuest && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-60"
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 pr-4">
                    {selectedQuest.title}
                  </h2>
                  <button
                    onClick={() => setSelectedQuest(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    {selectedQuest.xpReward} XP
                  </span>
                  <span>Level {selectedQuest.difficulty}</span>
                  {selectedQuest.status === 'completed' && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Completed
                    </span>
                  )}
                </div>
              </div>
              
              {/* Sidebar Content */}
              <div className="flex-1 overflow-auto p-6">
                <div className="space-y-6">
                  {selectedQuest.heroImage && (
                    <img 
                      src={selectedQuest.heroImage}
                      alt={selectedQuest.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {selectedQuest.description}
                    </p>
                  </div>
                  
                  {selectedQuest.missionBrief && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Mission Brief</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selectedQuest.missionBrief}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Adventure Line</h3>
                    <p className="text-gray-600 text-sm">{selectedQuest.adventureLine}</p>
                  </div>
                </div>
              </div>
              
              {/* Sidebar Actions */}
              <div className="p-6 border-t border-gray-200">
                <ModernButton
                  variant={selectedQuest.status === 'completed' ? 'secondary' : 'success'}
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    if (selectedQuest.status !== 'completed') {
                      setActiveQuestId(selectedQuest.id.toString());
                    }
                  }}
                  disabled={selectedQuest.status === 'completed'}
                >
                  {selectedQuest.status === 'completed' ? 'Quest Completed' : 'Start Quest'}
                </ModernButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Quest Screen Overlay */}
      {activeQuestId && (
        <div className="absolute inset-0 z-70">
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
      {(loadingQuests || loadingKits) && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading quest data...</p>
          </div>
        </div>
      )}

      {/* Error Screen */}
      {questsError && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg">Failed to load quests</p>
            <p className="text-gray-500 text-sm mt-2">Please try refreshing the page</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullscreenQuestsApp;