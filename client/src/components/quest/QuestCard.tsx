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
  kitRequired: string;
  difficulty: number;
  rewards: QuestReward[];
  status: "active" | "available" | "completed" | "upcoming" | "locked";
  adventureKit: string;
  onStart?: () => void;
  onContinue?: () => void;
}

const QuestCard = ({
  id,
  title,
  description,
  kitRequired,
  difficulty,
  rewards,
  status,
  adventureKit,
  onStart,
  onContinue
}: QuestCardProps) => {
  const { playSound } = useSoundEffects();
  
  const kit = themeConfig.adventureKits.find(k => k.id === adventureKit) || {
    name: "Unknown Kit",
    icon: "question",
    color: "#777777"
  };

  const handleAction = () => {
    if (status === "active" || status === "available") {
      playSound("complete");
      if (status === "active" && onContinue) {
        onContinue();
      } else if (status === "available" && onStart) {
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
          <PixelButton fullWidth onClick={handleAction}>
            CONTINUE QUEST
          </PixelButton>
        );
      case "available":
        return (
          <PixelButton variant="secondary" fullWidth onClick={handleAction}>
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
    <PixelCard active={status === "active"} interactive={true}>
      {/* Quest Header with Adventure Kit Label */}
      <PixelCardHeader color={status === "active" ? kit.color : "bg-space-light"}>
        <div className="flex items-center">
          <i className={`fas fa-${kit.icon} text-xs mr-2`}></i>
          <span className={`text-xs font-bold ${status === "active" ? "text-space-darkest" : ""}`}>
            {kit.name.toUpperCase()}
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
        
        {/* Required Kit */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-xs text-brand-light/60">Required Kit:</span>
          <span className="text-xs bg-space-dark px-2 py-1 rounded">{kitRequired}</span>
        </div>
        
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
  );
};

export default QuestCard;
