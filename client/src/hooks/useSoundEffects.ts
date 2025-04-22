import { useCallback, useState, useEffect } from 'react';
import { playSound, SoundName, sounds as soundLibrary } from '@/lib/sound';
import { Howler } from 'howler';

export function useSoundEffects() {
  // Get saved volume from localStorage or default to 0.6 (60%)
  const [volume, setVolume] = useState<number>(() => {
    const savedVolume = localStorage.getItem('sound_volume');
    return savedVolume ? parseFloat(savedVolume) : 0.6;
  });
  
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    // Check if user has previously muted sounds and stored in localStorage
    const savedMute = localStorage.getItem('sound_muted');
    return savedMute === 'true';
  });

  // Effect to save mute preference to localStorage
  useEffect(() => {
    localStorage.setItem('sound_muted', isMuted.toString());
  }, [isMuted]);
  
  // Effect to save volume preference to localStorage and update global Howler volume
  useEffect(() => {
    localStorage.setItem('sound_volume', volume.toString());
    Howler.volume(volume);
  }, [volume]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  const changeVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
  }, []);

  const playSoundSafely = useCallback(
    (name: SoundName) => {
      if (isMuted) return; // Don't play sounds if muted
      
      try {
        playSound(name);
      } catch (error) {
        console.warn(`Failed to play sound ${name}:`, error);
      }
    },
    [isMuted]
  );

  // Create sound wrapper functions with error handling
  const sounds = {
    click: useCallback(() => playSoundSafely('click'), [playSoundSafely]),
    hover: useCallback(() => playSoundSafely('hover'), [playSoundSafely]),
    success: useCallback(() => playSoundSafely('success'), [playSoundSafely]),
    error: useCallback(() => playSoundSafely('error'), [playSoundSafely]),
    questComplete: useCallback(() => playSoundSafely('questComplete'), [playSoundSafely]),
    questStart: useCallback(() => playSoundSafely('questStart'), [playSoundSafely]),
    questAccept: useCallback(() => playSoundSafely('questAccept'), [playSoundSafely]),
    reward: useCallback(() => playSoundSafely('reward'), [playSoundSafely]),
    levelUp: useCallback(() => playSoundSafely('levelUp'), [playSoundSafely]),
    fanfare: useCallback(() => playSoundSafely('fanfare'), [playSoundSafely]),
    open: useCallback(() => playSoundSafely('open'), [playSoundSafely]),
    craftSuccess: useCallback(() => playSoundSafely('craftSuccess'), [playSoundSafely]),
    craftFail: useCallback(() => playSoundSafely('craftFail'), [playSoundSafely]),
    loginSuccess: useCallback(() => playSoundSafely('loginSuccess'), [playSoundSafely]),
    loginFail: useCallback(() => playSoundSafely('loginFail'), [playSoundSafely]),
    achievement: useCallback(() => playSoundSafely('achievement'), [playSoundSafely]),
    powerUp: useCallback(() => playSoundSafely('powerUp'), [playSoundSafely]),
    spaceDoor: useCallback(() => playSoundSafely('spaceDoor'), [playSoundSafely]),
    boostEngine: useCallback(() => playSoundSafely('boostEngine'), [playSoundSafely]),
  };

  return { 
    sounds, 
    playSoundSafely, 
    isMuted, 
    toggleMute,
    volume,
    changeVolume
  };
}