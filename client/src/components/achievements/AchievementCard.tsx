import React from "react";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
}

const AchievementCard = ({
  id,
  name,
  description,
  icon,
  tier,
  unlocked,
  progress,
  total
}: AchievementCardProps) => {
  const tierColor = 
    tier === 'apprentice' ? '#44A0FF' :
    tier === 'journeyman' ? '#00C781' :
    tier === 'master' ? '#FF9300' :
    tier === 'archmage' ? '#FF5B00' :
    '#888888';

  return (
    <div className={cn(
      "bg-space-dark rounded-lg p-3 flex flex-col items-center text-center",
      !unlocked && "opacity-50"
    )}>
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
        style={{ backgroundColor: unlocked ? `${tierColor}20` : 'rgba(120, 120, 120, 0.2)' }}
      >
        {unlocked ? (
          <i className={`fas fa-${icon} text-xl`} style={{ color: tierColor }}></i>
        ) : (
          <i className="fas fa-lock text-gray-500 text-xl"></i>
        )}
      </div>
      <h4 className="text-sm font-bold mb-1">{name}</h4>
      <p className="text-xs text-brand-light/60">{description}</p>
      
      {/* Progress bar for achievements in progress */}
      {progress !== undefined && total !== undefined && (
        <div className="w-full mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>{progress}/{total}</span>
            <span>{Math.round((progress / total) * 100)}%</span>
          </div>
          <div className="h-1 bg-space-mid rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full" 
              style={{ 
                width: `${(progress / total) * 100}%`,
                backgroundColor: tierColor
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementCard;
