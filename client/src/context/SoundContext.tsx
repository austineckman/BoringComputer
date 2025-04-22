import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';
import { sounds as soundLibrary } from '@/lib/sound';

interface SoundContextType {
  volume: number;
  isMuted: boolean;
  isBgMusicPlaying: boolean;
  toggleMute: () => void;
  changeVolume: (volume: number) => void;
  toggleBackgroundMusic: () => void;
  playSound: (name: string) => void;
}

export const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  
  // Keep track of the background music ID - using ref to persist across renders
  const bgMusicId = useRef<number | null>(null);
  const bgMusicInitialized = useRef<boolean>(false);

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
    if (bgMusicId.current !== null) {
      soundLibrary.backgroundMusic.volume(volume * 0.5);
    }
  }, [volume]);
  
  // Effect to initialize background music once on mount
  useEffect(() => {
    // Only initialize background music once
    if (!bgMusicInitialized.current) {
      // Start playing background music if it should be playing and not muted
      if (isBgMusicPlaying && !isMuted) {
        bgMusicId.current = soundLibrary.backgroundMusic.play();
        soundLibrary.backgroundMusic.volume(volume * 0.5); // Half the main volume
      }
      
      bgMusicInitialized.current = true;
    }
    
    // Cleanup function when app unmounts (rarely happens in SPA)
    return () => {
      if (bgMusicId.current !== null) {
        soundLibrary.backgroundMusic.stop(bgMusicId.current);
        bgMusicId.current = null;
      }
    };
  }, []);  // Empty dependency array - only run once on mount

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };
  
  const changeVolume = (newVolume: number) => {
    setVolume(newVolume);
  };
  
  const toggleBackgroundMusic = () => {
    setIsBgMusicPlaying(prev => {
      const newState = !prev;
      
      if (newState && !isMuted) {
        // Only start if we don't already have an ID
        if (bgMusicId.current === null) {
          bgMusicId.current = soundLibrary.backgroundMusic.play();
          soundLibrary.backgroundMusic.volume(volume * 0.5);
        } else {
          // Otherwise just resume
          soundLibrary.backgroundMusic.play(bgMusicId.current);
        }
      } else if (!newState && bgMusicId.current !== null) {
        // Pause instead of stop to maintain position
        soundLibrary.backgroundMusic.pause(bgMusicId.current);
      }
      
      return newState;
    });
  };

  const playSound = (name: string) => {
    if (isMuted) return; // Don't play sounds if muted
    
    try {
      if (soundLibrary[name as keyof typeof soundLibrary]) {
        soundLibrary[name as keyof typeof soundLibrary].play();
      }
    } catch (error) {
      console.warn(`Failed to play sound ${name}:`, error);
    }
  };

  return (
    <SoundContext.Provider
      value={{
        volume,
        isMuted,
        isBgMusicPlaying,
        toggleMute,
        changeVolume,
        toggleBackgroundMusic,
        playSound
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};