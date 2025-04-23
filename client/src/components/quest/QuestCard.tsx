import React, { useState, useEffect } from "react";
import PixelCard, { PixelCardContent, PixelCardHeader } from "@/components/ui/pixel-card";
import PixelButton from "@/components/ui/pixel-button";
import ResourceItem from "@/components/ui/resource-item";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { themeConfig } from "@/lib/themeConfig";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import AdventureImage from "@/components/adventure/AdventureImage";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Legacy reward interface for backward compatibility
interface QuestReward {
  type: string;
  quantity: number;
}

// Enhanced Loot box reward interface
interface LootBoxReward {
  type: string; // Updated to string to support custom loot box types from database
  id?: string;  // Optional id field for referencing database loot boxes
  quantity: number;
}

// Loot box config from database
interface LootBoxConfig {
  id: string;
  name: string;
  description: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  image: string;
  minRewards: number;
  maxRewards: number;
}

interface QuestCardProps {
  id: string;
  title: string;
  description: string;
  adventureLine: string; // Changed from kitRequired
  difficulty: number;
  rewards: QuestReward[];
  status: "active" | "available" | "completed" | "upcoming" | "locked";
  orderInLine?: number; 
  xpReward?: number;
  lootBoxRewards?: LootBoxReward[]; // New field for loot box rewards
  heroImage?: string; // Hero image field
  content?: {
    images: string[];
    videos: string[];
    codeBlocks: {language: string, code: string}[];
  };
  onStart?: () => void;
  onContinue?: () => void;
}

const QuestCard = ({
  id,
  title,
  description,
  adventureLine,
  difficulty,
  rewards,
  status,
  orderInLine,
  xpReward,
  lootBoxRewards,
  heroImage,
  content,
  onStart,
  onContinue
}: QuestCardProps) => {
  const { sounds } = useSoundEffects();
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch loot box configs for images and metadata
  const { data: lootBoxConfigs, isLoading: isLoadingLootBoxes } = useQuery({
    queryKey: ['/api/admin/lootboxes'],
    refetchOnWindowFocus: false,
  });
  
  // Fetch item database for resource item details
  const { data: itemsData, isLoading: isLoadingItems } = useQuery({
    queryKey: ['/api/admin/items'],
    refetchOnWindowFocus: false,
  });
  
  // Truncate description for card view
  const maxLength = 100;
  const isTruncated = description.length > maxLength && !isExpanded;
  const displayDescription = isTruncated
    ? description.slice(0, maxLength) + '...'
    : description;
  
  // Get adventure line info from config
  const adventure = adventureLine ? 
    (themeConfig.adventureLines.find(a => a.id === adventureLine) || {
      name: adventureLine.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: "rocket",
      color: "#777777"
    })
    : {
      name: "Adventure",
      icon: "rocket",
      color: "#777777"
    };

  // Handle hover on quest card with sound
  const handleHover = () => {
    sounds.hover?.();
  };

  const handleAction = () => {
    if (status === "active" || status === "available") {
      // Play different sounds based on action type
      if (status === "active" && onContinue) {
        sounds.questComplete?.();
        onContinue();
      } else if (status === "available" && onStart) {
        sounds.questStart?.();
        onStart();
      }
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case "active":
        return { text: "ACTIVE", color: "bg-space-darkest text-brand-orange" };
      case "available":
        return { text: "AVAILABLE", color: "bg-space-darkest text-green-400" };
      case "completed":
        return { text: "COMPLETED", color: "bg-space-darkest text-brand-light" };
      case "upcoming":
        return { text: "UPCOMING", color: "bg-space-darkest text-yellow-400" };
      case "locked":
        return { text: "LOCKED", color: "bg-space-darkest text-gray-400" };
      default:
        return { text: "UNKNOWN", color: "bg-space-darkest text-gray-400" };
    }
  };

  const getActionButton = () => {
    switch (status) {
      case "active":
        return (
          <PixelButton soundEffect="quest" fullWidth onClick={handleAction}>
            CONTINUE QUEST
          </PixelButton>
        );
      case "available":
        return (
          <PixelButton variant="secondary" soundEffect="quest" fullWidth onClick={handleAction}>
            START QUEST
          </PixelButton>
        );
      case "completed":
        return (
          <PixelButton variant="accent" fullWidth disabled>
            COMPLETED
          </PixelButton>
        );
      case "upcoming":
      case "locked":
      default:
        return (
          <PixelButton variant="disabled" fullWidth disabled>
            {status === "upcoming" ? "UNLOCKS AFTER CURRENT QUEST" : "LOCKED"}
          </PixelButton>
        );
    }
  };

  // Get color for loot box or item tier
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-400 bg-gray-400/10 text-gray-300";
      case "uncommon":
        return "border-green-500 bg-green-500/10 text-green-400";
      case "rare":
        return "border-blue-500 bg-blue-500/10 text-blue-400";
      case "epic":
        return "border-purple-500 bg-purple-500/10 text-purple-400";
      case "legendary":
        return "border-yellow-500 bg-yellow-500/10 text-yellow-400";
      default:
        return "border-gray-500 bg-gray-500/10 text-gray-400";
    }
  };
  
  // Helper function to find item data by id
  const getItemData = (id: string) => {
    return itemsData?.find(item => item.id === id);
  }
  
  // Helper function to find loot box data by id or type
  const getLootBoxData = (id: string, type: string) => {
    return lootBoxConfigs?.find(config => 
      config.id === id || config.id === type
    );
  };
  
  // Helper function to format item name
  const formatItemName = (name: string) => {
    // Handle both hyphenated names (e.g., "circuit-board") and regular names (e.g., "copper")
    return name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const statusDisplay = getStatusDisplay();

  // Wrap the content
  const cardContent = (
    <PixelCard active={status === "active"} interactive={true}>
      {/* Adventure Line Banner (only shown when no hero image) */}
      {!heroImage && adventure.id && (
        <div className="h-24 w-full overflow-hidden">
          <AdventureImage 
            adventureId={adventure.id}
            alt={adventure.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Quest Header with Adventure Line Label */}
      <PixelCardHeader 
        color={status === "active" ? adventure.color : "bg-space-light"}
        heroImage={heroImage}
      >
        <div className="flex items-center">
          <i className={`fas fa-${adventure.icon} text-xs mr-2`}></i>
          <span className={`text-xs font-bold ${status === "active" ? "text-space-darkest" : ""}`}>
            {adventure.name.toUpperCase()}
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs ${statusDisplay.color}`}>
          {statusDisplay.text}
        </span>
      </PixelCardHeader>
      
      {/* Quest Content */}
      <PixelCardContent>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <div className="relative">
          <p className="text-sm text-brand-light/70 mb-4">{displayDescription}</p>
          {isTruncated && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExpanded(true);
              }}
              className="flex items-center text-xs text-brand-orange hover:text-brand-yellow"
            >
              View more <ChevronDown className="ml-1 w-3 h-3" />
            </button>
          )}
          {isExpanded && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="flex items-center text-xs text-brand-orange hover:text-brand-yellow"
            >
              Show less <ChevronUp className="ml-1 w-3 h-3" />
            </button>
          )}
        </div>
        
        {/* XP Reward */}
        {xpReward && (
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xs text-brand-light/60">XP Reward:</span>
            <span className="text-xs bg-brand-orange/20 text-brand-orange px-2 py-1 rounded-full">
              +{xpReward} XP
            </span>
          </div>
        )}
        
        {/* Removing quest number and difficulty level as requested */}
        
        {/* Rewards Section - Unified display for both loot box and resource rewards */}
        {lootBoxRewards && lootBoxRewards.length > 0 ? (
          <div className="mb-4">
            <span className="text-xs text-brand-light/60 block mb-2">Rewards:</span>
            <div className="flex flex-wrap gap-2">
              {lootBoxRewards.map((lootBox, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col items-center ${status === "upcoming" || status === "locked" ? "opacity-50" : ""}`}
                >
                  {/* Show loot box icon and include rarity coloring */}
                  <div className={`relative p-1 rounded-md ${
                    getRarityColor(getLootBoxData(lootBox.id || '', lootBox.type)?.rarity || 'common')
                  }`}>
                    {isLoadingLootBoxes ? (
                      <div className="w-8 h-8 animate-pulse rounded bg-space-light/20" />
                    ) : (
                      <img 
                        src={getLootBoxData(lootBox.id || '', lootBox.type)?.image || '/assets/loot crate.png'}
                        alt={`${getLootBoxData(lootBox.id || '', lootBox.type)?.name || lootBox.type} Loot Box`}
                        className="w-8 h-8 object-contain"
                      />
                    )}
                    {lootBox.quantity > 1 && (
                      <span className="absolute bottom-0 right-0 bg-brand-orange/80 text-white text-xs rounded px-1">
                        x{lootBox.quantity}
                      </span>
                    )}
                  </div>
                  <span className="text-xs mt-1 text-center">
                    {/* Use the name from config if available */}
                    {isLoadingLootBoxes 
                      ? formatItemName(lootBox.type)
                      : getLootBoxData(lootBox.id || '', lootBox.type)?.name || 
                        formatItemName(lootBox.type)
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : rewards && rewards.length > 0 ? (
          /* Legacy Resource Rewards */
          <div className="mb-4">
            <span className="text-xs text-brand-light/60 block mb-2">Rewards:</span>
            <div className="flex flex-wrap gap-2">
              {rewards.map((reward, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col items-center ${status === "upcoming" || status === "locked" ? "opacity-50" : ""}`}
                >
                  {isLoadingItems ? (
                    <div className="w-8 h-8 animate-pulse rounded bg-space-light/20" />
                  ) : (
                    <div className={`relative p-1 rounded-md ${
                      getRarityColor(getItemData(reward.type)?.rarity || 'common')
                    }`}>
                      <img 
                        src={getItemData(reward.type)?.imagePath || `/assets/${reward.type}.png`}
                        alt={getItemData(reward.type)?.name || reward.type}
                        className="w-8 h-8 object-contain"
                      />
                      {reward.quantity > 1 && (
                        <span className="absolute bottom-0 right-0 bg-brand-orange/80 text-white text-xs rounded px-1">
                          x{reward.quantity}
                        </span>
                      )}
                    </div>
                  )}
                  <span className="text-xs mt-1 text-center">
                    {isLoadingItems 
                      ? formatItemName(reward.type)
                      : getItemData(reward.type)?.name || formatItemName(reward.type)
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        
        {/* Action Button */}
        {getActionButton()}
      </PixelCardContent>
    </PixelCard>
  );

  return (
    <div onMouseEnter={handleHover} className={status === "active" || status === "available" ? "cursor-pointer" : ""}>
      <Link href={`/quests/${id}`}>
        {cardContent}
      </Link>
    </div>
  );
};

export default QuestCard;