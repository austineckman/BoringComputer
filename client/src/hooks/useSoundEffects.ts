import { useContext } from 'react';
import { SoundContext } from '@/context/SoundContext';

export function useSoundEffects() {
  const context = useContext(SoundContext);
  
  if (!context) {
    throw new Error('useSoundEffects must be used within a SoundProvider');
  }
  
  // Return a simplified interface with named methods for commonly used sounds
  // This makes it easier to change sound effects later without changing component code
  return {
    sounds: {
      // UI sounds
      click: () => context.playSound('click'),
      hover: () => context.playSound('hover'),
      success: () => context.playSound('success'),
      error: () => context.playSound('error'),
      
      // Achievement sounds
      achievement: () => context.playSound('achievement'),
      
      // Quest sounds
      questComplete: () => context.playSound('questComplete'),
      questAccept: () => context.playSound('questAccept'),
      questStart: () => context.playSound('questStart'),
      
      // Reward sounds
      reward: () => context.playSound('reward'),
      openBox: () => context.playSound('openBox'),
      boxOpen: () => context.playSound('boxOpen'),
      
      // Crafting sounds
      craftPickup: () => context.playSound('craftPickup'),
      craftDrop: () => context.playSound('craftDrop'),
      craftSuccess: () => context.playSound('craftSuccess'),
      craftFail: () => context.playSound('craftFail'),
      craftComplete: () => context.playSound('craftComplete')
      
      // Removed library access as it's not in the context type
    },
    
    // Pass through the rest of the context
    volume: context.volume,
    changeVolume: context.changeVolume, // Add the missing changeVolume function
    isMuted: context.isMuted,
    toggleMute: context.toggleMute,
    playSound: context.playSound,
    isBgMusicPlaying: context.isBgMusicPlaying,
    toggleBackgroundMusic: context.toggleBackgroundMusic
  };
}