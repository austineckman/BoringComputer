// This is now a wrapper hook to use the SoundContext
// The actual implementation is in the SoundContext.tsx file
import { useSound } from '@/context/SoundContext';
import { sounds as soundLibrary } from '@/lib/sound';

export function useSoundEffects() {
  const soundContext = useSound();
  
  // Create a sounds object with methods that call the playSound function
  const sounds = {
    // UI sounds
    click: () => soundContext.playSound('click'),
    hover: () => soundContext.playSound('hover'),
    error: () => soundContext.playSound('error'),
    success: () => soundContext.playSound('success'),
    
    // Achievement sounds
    achievement: () => soundContext.playSound('achievement'),
    
    // Quest sounds
    questComplete: () => soundContext.playSound('questComplete'),
    questAccept: () => soundContext.playSound('questAccept'),
    questStart: () => soundContext.playSound('questStart'),
    reward: () => soundContext.playSound('reward'),
    
    // Crafting sounds
    craftSuccess: () => soundContext.playSound('craftSuccess'),
    craftFail: () => soundContext.playSound('craftFail'),
    craft: () => soundContext.playSound('craft'),
    drop: () => soundContext.playSound('drop'),
    remove: () => soundContext.playSound('remove'),
    
    // Login sounds
    loginSuccess: () => soundContext.playSound('loginSuccess'),
    loginFail: () => soundContext.playSound('loginFail'),
    
    // Adventure-specific sounds
    spaceDoor: () => soundContext.playSound('spaceDoor'),
    boostEngine: () => soundContext.playSound('boostEngine'),
    powerUp: () => soundContext.playSound('powerUp'),
    
    // Level up sounds
    levelUp: () => soundContext.playSound('levelUp'),
    fanfare: () => soundContext.playSound('fanfare'),
    
    // Loot box sounds
    open: () => soundContext.playSound('open'),
    
    // Direct access to the original sound library if needed
    library: soundLibrary
  };
  
  // Return the same interface as before to maintain backward compatibility with existing components
  return {
    volume: soundContext.volume * 100, // Convert from 0-1 to 0-100 for backward compatibility
    changeVolume: soundContext.changeVolume,
    isMuted: soundContext.isMuted,
    toggleMute: soundContext.toggleMute, 
    isBgMusicPlaying: soundContext.isBgMusicPlaying,
    toggleBackgroundMusic: soundContext.toggleBackgroundMusic,
    playSoundSafely: soundContext.playSound,
    sounds // The new sounds object with methods
  };
}