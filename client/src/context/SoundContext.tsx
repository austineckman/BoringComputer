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
  
  // Effect to initialize background music after a short delay with improved error handling
  useEffect(() => {
    // Delay background music initialization to improve initial load time
    // Only initialize background music once
    if (!bgMusicInitialized.current) {
      // Use setTimeout to delay music initialization until after the app is rendered
      const timer = setTimeout(() => {
        try {
          // Start playing background music if it should be playing and not muted
          if (isBgMusicPlaying && !isMuted) {
            const musicId = soundLibrary.backgroundMusic.play();
            
            // Only update the ref and volume if we got a valid sound ID back
            if (musicId !== -1) {
              bgMusicId.current = musicId;
              soundLibrary.backgroundMusic.volume(volume * 0.5); // Half the main volume
              console.log('Background music initialized successfully');
            } else {
              console.warn('Background music initialized but returned invalid ID');
            }
          }
        } catch (err) {
          console.warn('Error initializing background music:', err);
        } finally {
          // Mark as initialized even if there was an error
          bgMusicInitialized.current = true;
        }
      }, 5000); // 5 second delay to prioritize UI rendering and ensure app is fully loaded
      
      return () => clearTimeout(timer);
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
      
      try {
        if (newState && !isMuted) {
          // Only start if we don't already have an ID
          if (bgMusicId.current === null) {
            const musicId = soundLibrary.backgroundMusic.play();
            // Only update if we got a valid sound ID back
            if (musicId !== -1) {
              bgMusicId.current = musicId;
              soundLibrary.backgroundMusic.volume(volume * 0.5);
            }
          } else {
            // Otherwise just resume
            soundLibrary.backgroundMusic.play(bgMusicId.current);
          }
        } else if (!newState && bgMusicId.current !== null) {
          // Pause instead of stop to maintain position
          soundLibrary.backgroundMusic.pause(bgMusicId.current);
        }
      } catch (err) {
        console.warn('Error toggling background music:', err);
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