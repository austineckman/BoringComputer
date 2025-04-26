import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Search, Filter, ExternalLink, MapPin, Package, Users, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import styles from './RetroUI.module.css';

// Import images
import bagbkgPath from '@assets/bagbkg.png';

interface Component {
  id: number;
  name: string; 
  description: string;
  imagePath: string | null;
  kitId: string;
}

interface ComponentKit {
  id: string;
  name: string;
  description: string;
  imagePath: string | null;
  category: string;
  difficulty: string;
  components?: Component[];
  quests?: Quest[];
}

interface Quest {
  id: string;
  title: string;
  description: string;
  missionBrief?: string | null;
  adventureLine: string;
  difficulty: number;
  orderInLine: number;
  xpReward: number;
  status?: 'locked' | 'available' | 'completed' | 'in-progress';
  kitId?: string | null;
  componentRequirements?: {
    id: number;
    questId: number;
    componentId: number;
    quantity: number;
    component: Component;
  }[];
  kit?: ComponentKit | null;
}

interface QuestAppRedesignedProps {
  onClose: () => void;
}

const QuestAppRedesigned: React.FC<QuestAppRedesignedProps> = ({ onClose }) => {
  const [selectedKitId, setSelectedKitId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Fetch all component kits
  const { data: kits, isLoading: isLoadingKits } = useQuery<ComponentKit[]>({
    queryKey: ['/api/kits'],
  });

  // Fetch all quests
  const { data: questsData, isLoading: isLoadingQuests } = useQuery<{ questsByAdventureLine: Record<string, Quest[]>, allQuests: Quest[] }>({
    queryKey: ['/api/quests'],
  });

  // Fetch quests for selected kit
  const { data: kitQuests, isLoading: isLoadingKitQuests } = useQuery<Quest[]>({
    queryKey: ['/api/kits', selectedKitId, 'quests'],
    enabled: !!selectedKitId,
  });

  // Get the selected kit details
  const selectedKit = kits?.find(kit => kit.id === selectedKitId);

  // Function to determine which quests to display based on filter state
  const getDisplayedQuests = (): Quest[] => {
    if (selectedKitId && kitQuests?.length) {
      console.log('Filtering by kit ID:', selectedKitId);
      console.log('Selected kit details:', selectedKit);
      
      const questsWithComponents = kitQuests.filter(quest => 
        quest.componentRequirements?.length && quest.componentRequirements.length > 0);
      
      const questsWithDirectKitMatch = kitQuests.filter(quest => 
        quest.kitId === selectedKitId);
      
      console.log(`Found ${questsWithComponents.length} quests with components and ${questsWithDirectKitMatch.length} with direct kit match`);
      
      if (questsWithComponents.length === 0 && questsWithDirectKitMatch.length === 0) {
        console.log(`No quests found for kit ${selectedKitId}. Showing all quests with components (${questsData?.allQuests.filter(q => q.componentRequirements?.length).length || 0})`);
        return questsData?.allQuests.filter(q => q.componentRequirements?.length) || [];
      }
      
      // Combine both lists without duplicates
      const combinedQuestIds = new Set();
      const combinedQuests: Quest[] = [];
      
      [...(questsWithComponents || []), ...(questsWithDirectKitMatch || [])].forEach(quest => {
        if (!combinedQuestIds.has(quest.id)) {
          combinedQuestIds.add(quest.id);
          combinedQuests.push(quest);
        }
      });
      
      // Sort by adventure line and order
      combinedQuests.sort((a, b) => {
        if (a.adventureLine !== b.adventureLine) {
          return a.adventureLine.localeCompare(b.adventureLine);
        }
        return a.orderInLine - b.orderInLine;
      });
      
      console.log(`After filtering by kit ${selectedKitId}, ${combinedQuests.length} quests remain`);
      return combinedQuests;
    }
    
    // Default: show all quests
    return questsData?.allQuests || [];
  };

  // Apply search filtering
  const filteredQuests = getDisplayedQuests().filter(quest => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      quest.title.toLowerCase().includes(query) ||
      quest.description.toLowerCase().includes(query) ||
      (quest.missionBrief && quest.missionBrief.toLowerCase().includes(query))
    );
  });

  // Get adventure lines for displaying in different sections
  const adventureLines = [...new Set(filteredQuests.map(q => q.adventureLine))];

  // Select the first kit if none is selected
  useEffect(() => {
    if (!selectedKitId && kits && kits.length > 0) {
      setSelectedKitId(kits[0].id);
    }
  }, [kits, selectedKitId]);

  // Click on a quest to view details
  const handleQuestClick = (quest: Quest) => {
    if (quest.status === 'locked') {
      toast({
        title: "Quest Locked",
        description: "You need to complete previous quests to unlock this one.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Quest Selected",
      description: `${quest.title} selected. Details will appear here.`,
    });
    
    // In a real implementation, you'd show detailed quest information
  };

  // Play a sound when switching kits if window.sounds is available
  const playKitSelectSound = () => {
    if ((window as any).sounds?.click) {
      (window as any).sounds.click();
    }
  };

  return (
    <div className={styles.fullscreenApp}>
      {/* Header */}
      <div className={styles.appHeader}>
        <h1>Quest Explorer</h1>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>
      </div>
      
      {/* Search and filters */}
      <div className={styles.searchContainer}>
        <div className={styles.searchInputWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search quests..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className={styles.filterContainer}>
          <Filter size={18} />
          <span>Kit:</span>
          <select
            className={styles.kitSelector}
            value={selectedKitId || ''}
            onChange={(e) => {
              setSelectedKitId(e.target.value);
              playKitSelectSound();
            }}
          >
            <option value="">All Kits</option>
            {kits?.map(kit => (
              <option key={kit.id} value={kit.id}>
                {kit.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Selected kit information */}
      {selectedKit && (
        <div className={styles.selectedKitInfo}>
          <div className={styles.kitImageContainer}>
            {selectedKit.imagePath ? (
              <img
                src={selectedKit.imagePath}
                alt={selectedKit.name}
                className={styles.kitImage}
              />
            ) : (
              <div className={styles.kitImagePlaceholder}>
                <Package size={40} />
              </div>
            )}
          </div>
          
          <div className={styles.kitDetails}>
            <h2>{selectedKit.name}</h2>
            <p className={styles.kitDescription}>{selectedKit.description}</p>
            <div className={styles.kitMeta}>
              <span className={styles.kitDifficulty}>
                <Zap size={16} /> {selectedKit.difficulty}
              </span>
              <span className={styles.kitCategory}>
                <MapPin size={16} /> {selectedKit.category}
              </span>
              <span className={styles.kitComponentCount}>
                <Users size={16} /> {selectedKit.components?.length || 0} components
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content - Quests */}
      <div className={styles.questsContainer}>
        {isLoadingQuests || isLoadingKits || (selectedKitId && isLoadingKitQuests) ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading quests...</p>
          </div>
        ) : filteredQuests.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={48} />
            <h3>No Quests Found</h3>
            <p>Try changing your search or selecting a different kit</p>
          </div>
        ) : (
          <div className={styles.questsList}>
            {adventureLines.map(line => (
              <div key={line} className={styles.adventureLine}>
                <h2 className={styles.adventureLineTitle}>{line}</h2>
                
                <div className={styles.questsGrid}>
                  {filteredQuests
                    .filter(q => q.adventureLine === line)
                    .sort((a, b) => a.orderInLine - b.orderInLine)
                    .map(quest => (
                      <div
                        key={quest.id}
                        className={`${styles.questCard} ${styles[`status-${quest.status || 'available'}`]}`}
                        onClick={() => handleQuestClick(quest)}
                      >
                        <div className={styles.questHeader}>
                          <h3>{quest.title}</h3>
                          <span className={styles.questDifficulty}>
                            {Array(quest.difficulty).fill(0).map((_, i) => (
                              <Zap key={i} size={12} />
                            ))}
                          </span>
                        </div>
                        
                        <p className={styles.questDescription}>{quest.description}</p>
                        
                        {quest.missionBrief && (
                          <p className={styles.questMissionBrief}>{quest.missionBrief}</p>
                        )}
                        
                        <div className={styles.questMeta}>
                          <span className={styles.questXp}>
                            <Zap size={14} /> {quest.xpReward} XP
                          </span>
                          
                          {quest.componentRequirements && quest.componentRequirements.length > 0 && (
                            <div className={styles.componentRequirements}>
                              <h4>Required Components:</h4>
                              <ul>
                                {quest.componentRequirements.map(cr => (
                                  <li key={cr.id}>
                                    {cr.component.name} {cr.quantity > 1 ? `x${cr.quantity}` : ''}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div className={styles.questActions}>
                          <button className={styles.questButton}>
                            {quest.status === 'completed' ? 'Replay' : quest.status === 'in-progress' ? 'Continue' : 'Start'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className={styles.appFooter}>
        <span>Quests Available: {filteredQuests.length}</span>
        <a href="/help" target="_blank" className={styles.helpLink}>
          <ExternalLink size={14} /> Help Center
        </a>
      </div>
    </div>
  );
};

export default QuestAppRedesigned;