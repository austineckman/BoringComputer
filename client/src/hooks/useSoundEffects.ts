import { useContext } from 'react';
import { SoundContext, useSound } from '@/context/SoundContext';

/**
 * Custom hook to access sound effects from the SoundContext
 * with additional crafting-specific sounds
 */
export function useSoundEffects() {
  const context = useSound(); // Use the existing useSound hook
  
  // Create a sounds object with the extended crafting sounds
  const sounds = {
    // Expose all the original sound methods
    click: context.playSound.bind(null, 'click'),
    hover: context.playSound.bind(null, 'hover'),
    success: context.playSound.bind(null, 'success'),
    error: context.playSound.bind(null, 'error'),
    achievement: context.playSound.bind(null, 'achievement'),
    questComplete: context.playSound.bind(null, 'questComplete'),
    questAccept: context.playSound.bind(null, 'questAccept'),
    questStart: context.playSound.bind(null, 'questStart'),
    reward: context.playSound.bind(null, 'reward'),
    openBox: context.playSound.bind(null, 'openBox'),
    boxOpen: context.playSound.bind(null, 'boxOpen'),
    levelUp: context.playSound.bind(null, 'levelUp'),
    
    // Crafting-specific sounds
    craftSuccess: () => {
      if (!context.isMuted) {
        context.playSound('success');
      }
    },
    
    craftFail: () => {
      if (!context.isMuted) {
        context.playSound('error');
      }
    },
    
    craftDrop: () => {
      if (!context.isMuted) {
        context.playSound('click');
      }
    },
    
    craftPickup: () => {
      if (!context.isMuted) {
        context.playSound('click');
      }
    },
    
    // Library sounds
    library: {
      backgroundMusic: null // Reference to the background music (not exposed)
    }
  };
  
  return {
    ...context,
    sounds
  };
}

export default useSoundEffects;