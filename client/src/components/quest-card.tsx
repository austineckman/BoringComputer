import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

export interface QuestCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  adventureLine?: string;
  status?: 'active' | 'completed' | 'locked';
  level?: number;
  rewards?: string[];
  kitId?: string;
}

const QuestCard: React.FC<QuestCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  adventureLine,
  status = 'locked',
  level = 1,
  rewards = [],
  kitId
}) => {
  const statusColors = {
    active: 'bg-amber-500',
    completed: 'bg-green-500',
    locked: 'bg-gray-500'
  };

  const statusText = {
    active: 'ACTIVE',
    completed: 'COMPLETED',
    locked: 'LOCKED'
  };

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)' }}
      className="quest-card bg-space-dark rounded-lg overflow-hidden pixel-border border-space-mid"
    >
      <Link href={`/quests/${id}`}>
        <a className="block">
          <div className="relative">
            {/* Quest image */}
            <div className="h-40 bg-gray-700 overflow-hidden">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="w-full h-full object-cover"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-pixel">
                  NO IMAGE
                </div>
              )}
            </div>

            {/* Quest status badge */}
            <div className={`absolute top-3 right-3 px-2 py-1 rounded-sm text-xs font-bold ${statusColors[status]}`}>
              {statusText[status]}
            </div>

            {/* Level indicator */}
            <div className="absolute top-3 left-3 h-6 w-6 rounded-full bg-space-darkest flex items-center justify-center">
              <span className="text-xs font-bold text-brand-yellow">LV{level}</span>
            </div>
          </div>

          <div className="p-4">
            {adventureLine && (
              <div className="text-xs text-brand-orange mb-1 font-medium">{adventureLine}</div>
            )}
            
            <h3 className="text-brand-light font-pixel text-lg mb-2 line-clamp-1">{title}</h3>
            
            <p className="text-brand-light/70 text-sm mb-3 line-clamp-2">
              {description}
            </p>

            {rewards.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-brand-light/50 mb-1">REWARDS:</div>
                <div className="flex flex-wrap gap-2">
                  {rewards.map((reward, index) => (
                    <div 
                      key={index}
                      className="px-2 py-1 text-xs bg-space-mid rounded-sm text-brand-light/80"
                    >
                      {reward}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </a>
      </Link>
    </motion.div>
  );
};

export default QuestCard;