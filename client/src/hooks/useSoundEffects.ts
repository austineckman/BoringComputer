import { useCallback } from 'react';
import { playSound } from '@/lib/sound';

export function useSoundEffects() {
  const sounds = {
    click: useCallback(() => playSound('click'), []),
    hover: useCallback(() => playSound('hover'), []),
    success: useCallback(() => playSound('success'), []),
    error: useCallback(() => playSound('error'), []),
    questComplete: useCallback(() => playSound('questComplete'), []),
    reward: useCallback(() => playSound('reward'), []),
    levelUp: useCallback(() => playSound('levelUp'), []),
    open: useCallback(() => playSound('open'), []),
  };

  return { sounds };
}