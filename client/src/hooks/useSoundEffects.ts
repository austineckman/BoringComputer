// This is now a wrapper hook to use the SoundContext
// The actual implementation is in the SoundContext.tsx file
import { useSound } from '@/context/SoundContext';
import { sounds } from '@/lib/sound';

export function useSoundEffects() {
  const soundContext = useSound();
  
  // Return the same interface as before to maintain backward compatibility with existing components
  return {
    volume: soundContext.volume * 100, // Convert from 0-1 to 0-100 for backward compatibility
    changeVolume: soundContext.changeVolume,
    isMuted: soundContext.isMuted,
    toggleMute: soundContext.toggleMute, 
    isBgMusicPlaying: soundContext.isBgMusicPlaying,
    toggleBackgroundMusic: soundContext.toggleBackgroundMusic,
    playSoundSafely: soundContext.playSound,
    sounds // Keep access to the sound library for direct sound access
  };
}