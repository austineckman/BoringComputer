import { useState, useCallback, useEffect } from 'react';
import { playSound, SoundName } from '@/lib/sound';

/**
 * Hook for managing sound effects in the application
 * Provides methods for playing sounds and toggling mute state
 */
export const useSoundEffects = () => {
  // Get initial muted state from localStorage or default to false
  const [muted, setMuted] = useState<boolean>(() => {
    const savedMute = localStorage.getItem('quest-giver-muted');
    return savedMute ? JSON.parse(savedMute) : false;
  });

  // Save muted state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('quest-giver-muted', JSON.stringify(muted));
  }, [muted]);

  // Toggle muted state
  const toggleMute = useCallback(() => {
    setMuted(prev => !prev);
  }, []);

  // Play a sound unless muted
  const playSoundEffect = useCallback((name: SoundName) => {
    if (!muted) {
      playSound(name);
    }
  }, [muted]);

  // Play a sequence of sounds with delay
  const playSoundSequence = useCallback((names: SoundName[], delay = 400) => {
    if (muted) return;
    
    names.forEach((name, index) => {
      setTimeout(() => {
        playSound(name);
      }, index * delay);
    });
  }, [muted]);

  // Special sound effects for common events
  const playLevelUpSound = useCallback(() => {
    if (muted) return;
    playSoundSequence(['levelUp', 'fanfare'], 300);
  }, [muted, playSoundSequence]);

  const playQuestCompleteSound = useCallback(() => {
    if (muted) return;
    playSoundSequence(['questComplete', 'reward'], 500);
  }, [muted, playSoundSequence]);

  // Play adventure-specific sound based on which adventure line the user is interacting with
  const playAdventureSound = useCallback((adventureLine: string) => {
    if (muted) return;
    
    switch(adventureLine) {
      case 'lost-in-space':
        playSound("spaceDoor");
        break;
      case 'cogsworth-city':
        playSound("craftSuccess");
        break;
      case 'pandoras-box':
        playSound("achievement");
        break;
      case 'neon-realm':
        playSound("powerUp");
        break;
      case 'nebula-raiders':
        playSound("boostEngine");
        break;
      default:
        playSound("click");
    }
  }, [muted]);

  return {
    playSound: playSoundEffect,
    playSoundSequence,
    playLevelUpSound,
    playQuestCompleteSound,
    playAdventureSound,
    muted,
    toggleMute
  };
};