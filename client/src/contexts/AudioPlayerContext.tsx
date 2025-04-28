import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Howl } from 'howler';

// Define the Track interface
export interface Track {
  id: string;
  title: string;
  artist: string;
  path: string;
  durationSeconds: number;
}

// Define the AudioPlayer context interface
interface AudioPlayerContextType {
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playlist: Track[];
  currentTrackIndex: number;
  progress: number;
  autoPlayEnabled: boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  playTrack: (index: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (time: number) => void;
  setPlaylist: (tracks: Track[]) => void;
  toggleAutoPlay: () => void;
}

// Create the context with default values
const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

// Default empty track
const emptyTrack: Track = {
  id: "",
  title: "No track selected",
  artist: "",
  path: "",
  durationSeconds: 0
};

// Provider component
export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  // Refs
  const soundRef = useRef<Howl | null>(null);
  const soundIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playlist, setPlaylistState] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [previousVolume, setPreviousVolume] = useState<number>(volume);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState<boolean>(true);

  // Clear time update interval
  const clearTimeUpdateInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Start time update interval
  const startTimeUpdateInterval = () => {
    clearTimeUpdateInterval();
    
    if (soundRef.current && soundIdRef.current) {
      intervalRef.current = setInterval(() => {
        if (soundRef.current && soundIdRef.current) {
          const time = soundRef.current.seek() as number;
          setCurrentTime(time);
          
          if (duration > 0) {
            setProgress((time / duration) * 100);
          }
        }
      }, 100);
    }
  };

  // Player controls
  const play = () => {
    console.log("Play called");
    if (soundRef.current) {
      if (soundIdRef.current === null) {
        soundIdRef.current = soundRef.current.play();
      } else {
        soundRef.current.play(soundIdRef.current);
      }
      setIsPlaying(true);
      startTimeUpdateInterval();
    }
  };

  const pause = () => {
    if (soundRef.current && soundIdRef.current !== null) {
      soundRef.current.pause(soundIdRef.current);
      setIsPlaying(false);
      clearTimeUpdateInterval();
    }
  };

  const stop = () => {
    if (soundRef.current && soundIdRef.current !== null) {
      soundRef.current.stop(soundIdRef.current);
      soundIdRef.current = null;
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
      clearTimeUpdateInterval();
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const playTrack = (index: number) => {
    console.log("PlayTrack called with index:", index);
    if (playlist.length === 0) return;
    
    // Stop current track if it exists
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.unload();
      soundRef.current = null;
      soundIdRef.current = null;
      clearTimeUpdateInterval();
    }
    
    // Ensure index is within bounds
    const safeIndex = Math.max(0, Math.min(index, playlist.length - 1));
    setCurrentTrackIndex(safeIndex);
    setCurrentTrack(playlist[safeIndex]);
    
    // Create new Howl instance
    const trackPath = playlist[safeIndex].path;
    console.log("Creating new Howl for track:", trackPath);
    
    const newSound = new Howl({
      src: [trackPath],
      html5: true,
      volume: volume,
      onplay: () => {
        console.log('Track started playing');
        setIsPlaying(true);
        startTimeUpdateInterval();
      },
      onpause: () => {
        console.log('Track paused');
        setIsPlaying(false);
        clearTimeUpdateInterval();
      },
      onstop: () => {
        console.log('Track stopped');
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
        clearTimeUpdateInterval();
      },
      onend: () => {
        console.log('Track ended, autoPlayEnabled:', autoPlayEnabled);
        clearTimeUpdateInterval();
        
        if (autoPlayEnabled) {
          console.log('Auto-playing next track...');
          // Use setTimeout to ensure we don't have timing issues
          setTimeout(() => {
            const nextIndex = (safeIndex + 1) % playlist.length;
            console.log(`Playing next track at index ${nextIndex}`);
            playTrack(nextIndex);
          }, 100);
        } else {
          console.log('Autoplay is disabled');
        }
      },
      onload: () => {
        console.log('Track loaded');
        setDuration(newSound.duration());
      },
      onloaderror: (id, error) => {
        console.error('Error loading track:', error);
      },
      onplayerror: (id, error) => {
        console.error('Error playing track:', error);
        
        // Try to recover by creating a new instance
        setTimeout(() => {
          if (soundRef.current) {
            soundRef.current.stop();
            soundRef.current.unload();
            soundRef.current = null;
            soundIdRef.current = null;
            playTrack(safeIndex);
          }
        }, 300);
      }
    });
    
    soundRef.current = newSound;
    
    // Auto-play when track is selected
    soundIdRef.current = newSound.play();
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    playTrack(nextIndex);
  };

  const prevTrack = () => {
    if (playlist.length === 0) return;
    
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    playTrack(prevIndex);
  };

  const toggleMute = () => {
    if (soundRef.current) {
      if (isMuted) {
        soundRef.current.volume(previousVolume);
        setVolumeState(previousVolume);
        setIsMuted(false);
      } else {
        setPreviousVolume(volume);
        soundRef.current.volume(0);
        setVolumeState(0);
        setIsMuted(true);
      }
    }
  };

  const setVolume = (newVolume: number) => {
    if (soundRef.current) {
      soundRef.current.volume(newVolume);
    }
    setVolumeState(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const seekTo = (time: number) => {
    if (soundRef.current && soundIdRef.current !== null) {
      soundRef.current.seek(time, soundIdRef.current);
      setCurrentTime(time);
      
      if (duration > 0) {
        setProgress((time / duration) * 100);
      }
    }
  };

  const setPlaylist = (tracks: Track[]) => {
    setPlaylistState(tracks);
    
    // If we now have tracks but had none before, select the first one
    if (tracks.length > 0 && !currentTrack) {
      setCurrentTrack(tracks[0]);
      setCurrentTrackIndex(0);
    }
  };
  
  // Toggle auto-play setting
  const toggleAutoPlay = () => {
    console.log("Toggling autoplay from", autoPlayEnabled, "to", !autoPlayEnabled);
    setAutoPlayEnabled(!autoPlayEnabled);
  };

  // When component unmounts, clean up
  useEffect(() => {
    return () => {
      clearTimeUpdateInterval();
      
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.unload();
        soundRef.current = null;
        soundIdRef.current = null;
      }
    };
  }, []);

  // Create context value
  const value: AudioPlayerContextType = {
    isPlaying,
    currentTrack: currentTrack || emptyTrack,
    currentTime,
    duration,
    volume,
    isMuted,
    playlist,
    currentTrackIndex,
    progress,
    autoPlayEnabled,
    play,
    pause,
    stop,
    togglePlay,
    toggleMute,
    setVolume,
    playTrack,
    nextTrack,
    prevTrack,
    seekTo,
    setPlaylist,
    toggleAutoPlay,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

// Custom hook to use the audio player context
export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};