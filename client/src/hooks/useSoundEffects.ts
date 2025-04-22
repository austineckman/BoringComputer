import { useCallback, useState } from 'react';
import { playSound, SoundName } from '@/lib/sound';

// Hook for playing sound effects throughout the application
export function useSoundEffects() {
  const [isMuted, setIsMuted] = useState(false);
  
  // Toggle mute state
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  // Function to play a sound by name (respects mute state)
  const playSoundEffect = useCallback((name: SoundName) => {
    if (!isMuted) {
      playSound(name);
    }
  }, [isMuted]);

  // Predefined sound effects
  const sounds = {
    // UI sounds
    click: () => playSoundEffect('click'),
    hover: () => playSoundEffect('hover'),
    error: () => playSoundEffect('error'),
    success: () => playSoundEffect('success'),
    
    // Quest-related sounds
    questComplete: () => playSoundEffect('questComplete'),
    questAccept: () => playSoundEffect('questAccept'),
    questStart: () => playSoundEffect('questStart'),
    
    // Achievement sounds
    achievement: () => playSoundEffect('achievement'),
    reward: () => playSoundEffect('reward'),
    
    // Crafting sounds
    craftSuccess: () => playSoundEffect('craftSuccess'),
    craftFail: () => playSoundEffect('craftFail'),
    
    // Adventure-specific sounds
    spaceDoor: () => playSoundEffect('spaceDoor'),
    boostEngine: () => playSoundEffect('boostEngine'),
    powerUp: () => playSoundEffect('powerUp'),
    
    // Level up and fanfare
    levelUp: () => playSoundEffect('levelUp'),
    fanfare: () => playSoundEffect('fanfare'),
    
    // Login sounds
    loginSuccess: () => playSoundEffect('loginSuccess'),
    loginFail: () => playSoundEffect('loginFail'),
  };

  // Play adventure-specific sounds
  const playAdventureSound = useCallback((adventureLine: string) => {
    switch(adventureLine.toLowerCase()) {
      case 'lost-in-space':
        playSoundEffect('spaceDoor');
        break;
      case 'cogsworth-city':
        playSoundEffect('boostEngine');
        break;
      case 'pandoras-box':
        playSoundEffect('powerUp');
        break;
      case 'neon-realm':
        playSoundEffect('fanfare');
        break;
      case 'nebula-raiders':
        playSoundEffect('spaceDoor');
        break;
      default:
        playSoundEffect('click');
    }
  }, [playSoundEffect]);

  return {
    playSound: playSoundEffect,
    playAdventureSound,
    sounds,
    isMuted,
    toggleMute,
    
    // Event handlers for direct binding to React components
    handlers: {
      onClick: sounds.click,
      onMouseEnter: sounds.hover,
    }
  };
}

// Export interface for sound names
export type { SoundName } from '@/lib/sound';