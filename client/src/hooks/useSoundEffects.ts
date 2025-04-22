import { useCallback, useState, useEffect, useRef } from 'react';
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
  
  // Track if background music is playing
  const [isBgMusicPlaying, setIsBgMusicPlaying] = useState<boolean>(() => {
    const savedBgMusic = localStorage.getItem('bg_music_playing');
    // Default to true if no saved preference (enable background music by default)
    return savedBgMusic === null ? true : savedBgMusic === 'true';
  });
  
  // Keep track of the background music ID
  const bgMusicId = useRef<number | null>(null);

  // Effect to save mute preference to localStorage
  useEffect(() => {
    localStorage.setItem('sound_muted', isMuted.toString());
    
    // If muted, pause background music; otherwise resume if it was playing
    if (isMuted) {
      if (bgMusicId.current !== null) {
        soundLibrary.backgroundMusic.pause(bgMusicId.current);
      }
    } else if (isBgMusicPlaying && bgMusicId.current !== null) {
      soundLibrary.backgroundMusic.play(bgMusicId.current);
    }
  }, [isMuted, isBgMusicPlaying]);
  
  // Effect to save background music preference
  useEffect(() => {
    localStorage.setItem('bg_music_playing', isBgMusicPlaying.toString());
  }, [isBgMusicPlaying]);
  
  // Effect to save volume preference to localStorage and update global Howler volume
  useEffect(() => {
    localStorage.setItem('sound_volume', volume.toString());
    Howler.volume(volume);
    
    // Also update the background music volume if it's playing
    if (isBgMusicPlaying && bgMusicId.current !== null) {
      soundLibrary.backgroundMusic.volume(volume * 0.5);
    }
  }, [volume, isBgMusicPlaying]);
  
  // Effect to play background music on mount if enabled
  useEffect(() => {
    // Start playing background music if it should be playing and not muted
    if (isBgMusicPlaying && !isMuted) {
      if (bgMusicId.current === null) {
        // If music is not already playing, start it
        bgMusicId.current = soundLibrary.backgroundMusic.play();
        soundLibrary.backgroundMusic.volume(volume * 0.5); // Set background music at half the main volume
      }
    }
    
    // Cleanup function to stop background music when component unmounts
    return () => {
      if (bgMusicId.current !== null) {
        soundLibrary.backgroundMusic.stop(bgMusicId.current);
        bgMusicId.current = null;
      }
    };
  }, [isBgMusicPlaying, isMuted, volume]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  const changeVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
  }, []);
  
  const toggleBackgroundMusic = useCallback(() => {
    setIsBgMusicPlaying(prev => {
      const newState = !prev;
      
      if (newState && !isMuted) {
        // Start playing background music
        bgMusicId.current = soundLibrary.backgroundMusic.play();
        soundLibrary.backgroundMusic.volume(volume * 0.5); // Set background music at half the main volume
      } else if (!newState && bgMusicId.current !== null) {
        // Stop background music
        soundLibrary.backgroundMusic.stop(bgMusicId.current);
        bgMusicId.current = null;
      }
      
      return newState;
    });
  }, [isMuted, volume]);

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
    changeVolume,
    isBgMusicPlaying,
    toggleBackgroundMusic
  };
}