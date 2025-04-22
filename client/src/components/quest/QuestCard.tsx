import React from "react";
import PixelCard, { PixelCardContent, PixelCardHeader } from "@/components/ui/pixel-card";
import PixelButton from "@/components/ui/pixel-button";
import ResourceItem from "@/components/ui/resource-item";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { themeConfig } from "@/lib/themeConfig";

interface QuestReward {
  type: string;
  quantity: number;
}

interface QuestCardProps {
  id: string;
  title: string;
  description: string;
  adventureLine: string; // Changed from kitRequired
  difficulty: number;
  rewards: QuestReward[];
  status: "active" | "available" | "completed" | "upcoming" | "locked";
  orderInLine?: number; // New field
  xpReward?: number; // New field
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
  onStart,
  onContinue
}: QuestCardProps) => {
  const { playAdventureSound, sounds } = useSoundEffects();
  
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

  // Handle hover on quest card with adventure-specific sound
  const handleHover = () => {
    if (status === "active" || status === "available") {
      // Make sure adventureLine is defined before using it
      if (adventureLine) {
        playAdventureSound(adventureLine);
      } else {
        sounds.hover();
      }
    } else {
      sounds.hover();
    }
  };

  const handleAction = () => {
    if (status === "active" || status === "available") {
      // Play different sounds based on action type
      if (status === "active" && onContinue) {
        sounds.questComplete();
        onContinue();
      } else if (status === "available" && onStart) {
        sounds.questStart();
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

  const statusDisplay = getStatusDisplay();

  return (
    <div 
      onMouseEnter={handleHover}
      className={status === "active" || status === "available" ? "cursor-pointer" : ""}
    >
      <PixelCard active={status === "active"} interactive={true}>
        {/* Quest Header with Adventure Line Label */}
        <PixelCardHeader color={status === "active" ? adventure.color : "bg-space-light"}>
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
          <p className="text-sm text-brand-light/70 mb-4">{description}</p>
          
          {/* XP Reward */}
          {xpReward && (
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xs text-brand-light/60">XP Reward:</span>
              <span className="text-xs bg-brand-orange/20 text-brand-orange px-2 py-1 rounded-full">
                +{xpReward} XP
              </span>
            </div>
          )}
          
          {/* Sequence Info */}
          {typeof orderInLine === 'number' && (
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xs text-brand-light/60">Quest:</span>
              <span className="text-xs bg-space-dark px-2 py-1 rounded">#{orderInLine + 1}</span>
            </div>
          )}
          
          {/* Difficulty Level */}
          <div className="flex items-center space-x-1 mb-4">
            <span className="text-xs text-brand-light/60 mr-2">Difficulty:</span>
            {[1, 2, 3, 4, 5].map((level) => (
              <div 
                key={level}
                className={`w-3 h-3 rounded-full ${level <= difficulty ? "bg-brand-orange" : "bg-space-dark"}`}
              ></div>
            ))}
          </div>
          
          {/* Rewards Preview */}
          <div className="mb-4">
            <span className="text-xs text-brand-light/60 block mb-2">Rewards:</span>
            <div className="flex space-x-2">
              {rewards.map((reward, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col items-center ${status === "upcoming" || status === "locked" ? "opacity-50" : ""}`}
                >
                  <ResourceItem type={reward.type as any} quantity={reward.quantity} size="sm" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Button */}
          {getActionButton()}
        </PixelCardContent>
      </PixelCard>
    </div>
  );
};

export default QuestCard;