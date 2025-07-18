import React, { useState } from 'react';
import { CheckCircle, X, Trophy, Coins, Gift, Star } from 'lucide-react';

interface QuestCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
}

interface QuestRewardsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReturnToQuests?: () => void;
  rewards: {
    questTitle?: string;
    xpAwarded: number;
    goldAwarded: number;
    itemsAwarded: Array<{ type: string; id: string; quantity: number; name?: string }>;
    newXp: number;
    newGold: number;
    alreadyCompleted?: boolean;
  };
}

export const QuestCompletionConfirmDialog: React.FC<QuestCompletionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isPending = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-gray-800 border-4 border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
        {/* Retro border styling */}
        <div className="absolute inset-0 border-2 border-t-gray-400 border-l-gray-400 border-r-gray-700 border-b-gray-700 rounded-lg pointer-events-none"></div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          disabled={isPending}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-xl font-bold text-white">Complete Quest?</h2>
          
          <p className="text-gray-300">
            Have you finished your work and achieved the expected result shown in the tutorial?
          </p>
          
          <div className="flex space-x-4 pt-4">
            <button
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white rounded-md border-2 border-t-gray-400 border-l-gray-400 border-r-gray-700 border-b-gray-700"
            >
              Not Yet
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-md border-2 border-t-green-400 border-l-green-400 border-r-green-800 border-b-green-800 flex items-center justify-center space-x-2"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  <span>Yes, Complete!</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const QuestRewardsDialog: React.FC<QuestRewardsDialogProps> = ({
  isOpen,
  onClose,
  onReturnToQuests,
  rewards
}) => {
  if (!isOpen) return null;
  
  console.log('QuestRewardsDialog rewards data:', rewards);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-gray-800 border-4 border-gray-600 rounded-lg p-6 max-w-lg w-full mx-4">
        {/* Retro border styling */}
        <div className="absolute inset-0 border-2 border-t-gray-400 border-l-gray-400 border-r-gray-700 border-b-gray-700 rounded-lg pointer-events-none"></div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center space-y-6">
          {rewards.alreadyCompleted ? (
            <>
              <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-xl font-bold text-white">Quest Already Completed</h2>
              
              <p className="text-gray-300">
                You've already completed this quest! You can redo it for practice, but no additional rewards will be given.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-xl font-bold text-white">Quest Completed!</h2>
              
              {rewards.questTitle && (
                <p className="text-gray-300">
                  You've successfully completed <span className="text-brand-orange font-semibold">"{rewards.questTitle}"</span>
                </p>
              )}

              {/* Rewards Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* XP Reward */}
                <div className="bg-gray-700 border-2 border-gray-600 rounded-lg p-4 text-center">
                  <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-yellow-400 font-bold text-lg">+{rewards.xpAwarded} XP</div>
                  <div className="text-xs text-gray-400">Total: {rewards.newXp} XP</div>
                </div>

                {/* Gold Reward */}
                <div className="bg-gray-700 border-2 border-gray-600 rounded-lg p-4 text-center">
                  <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-yellow-500 font-bold text-lg">+{rewards.goldAwarded} Gold</div>
                  <div className="text-xs text-gray-400">Total: {rewards.newGold} Gold</div>
                </div>
              </div>

              {/* Item Rewards */}
              {rewards.itemsAwarded && rewards.itemsAwarded.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center justify-center space-x-2">
                    <Gift className="w-4 h-4" />
                    <span>Items Received</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {rewards.itemsAwarded.map((item, index) => (
                      <div key={index} className="bg-gray-700 border border-gray-600 rounded p-2 text-center">
                        <div className="text-xs text-gray-300 font-medium">
                          {item.name || item.id}
                        </div>
                        <div className="text-xs text-gray-400">
                          x{item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          
          <button
            onClick={() => {
              onClose();
              if (onReturnToQuests) {
                onReturnToQuests();
              }
            }}
            className="w-full px-4 py-3 bg-brand-orange hover:bg-brand-orange/80 text-white rounded-md border-2 border-t-orange-400 border-l-orange-400 border-r-orange-800 border-b-orange-800 font-semibold"
          >
            {rewards.alreadyCompleted ? 'Return to Quest Selection' : 'Continue to Next Quest'}
          </button>
        </div>
      </div>
    </div>
  );
};