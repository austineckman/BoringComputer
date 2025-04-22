import { useCallback } from 'react';
import { playSound, SoundName } from '@/lib/sound';

export function useSoundEffects() {
  const playSoundSafely = useCallback((name: SoundName) => {
    try {
      playSound(name);
    } catch (error) {
      console.warn(`Failed to play sound ${name}:`, error);
    }
  }, []);

  const sounds = {
    click: useCallback(() => playSoundSafely('click'), [playSoundSafely]),
    hover: useCallback(() => playSoundSafely('hover'), [playSoundSafely]),
    success: useCallback(() => playSoundSafely('success'), [playSoundSafely]),
    error: useCallback(() => playSoundSafely('error'), [playSoundSafely]),
    questComplete: useCallback(() => playSoundSafely('questComplete'), [playSoundSafely]),
    reward: useCallback(() => playSoundSafely('reward'), [playSoundSafely]),
    levelUp: useCallback(() => playSoundSafely('levelUp'), [playSoundSafely]),
    open: useCallback(() => playSoundSafely('open'), [playSoundSafely]),
  };

  return { sounds };
}