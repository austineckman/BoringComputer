import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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

  // Forward declarations for functions that will be used in useEffect
  const play = () => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play()
        .catch(err => {
          console.error('Play failed:', err);
          setIsPlaying(false);
        });
    }
  };

  const playTrack = useCallback((index: number) => {
    if (playlist.length === 0) return;
    
    // Ensure index is within bounds
    const safeIndex = Math.max(0, Math.min(index, playlist.length - 1));
    setCurrentTrackIndex(safeIndex);
    setCurrentTrack(playlist[safeIndex]);
    
    if (audioRef.current) {
      audioRef.current.src = playlist[safeIndex].path;
      audioRef.current.load();
      
      // Auto-play when track is selected
      play();
    }
  }, [playlist]);

  // Define event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    }
  };

  // Forward reference for playTrack function
  const playTrackRef = useRef<(index: number) => void>();
  
  // Update the ref when playTrack changes
  useEffect(() => {
    playTrackRef.current = playTrack;
  }, [playTrack]);
  
  // Use useCallback to ensure reference stability across renders
  const handleEnded = useCallback(() => {
    console.log("Track ended, autoPlayEnabled:", autoPlayEnabled);
    if (playlist.length > 0 && autoPlayEnabled) {
      console.log("Auto-playing next track...");
      // Use setTimeout to ensure we're not trying to play immediately after 'ended'
      // which can sometimes cause issues with the browser's autoplay policy
      setTimeout(() => {
        const nextIndex = (currentTrackIndex + 1) % playlist.length;
        console.log(`Playing next track at index ${nextIndex}`);
        
        // Use the ref to avoid circular dependency
        if (playTrackRef.current) {
          playTrackRef.current(nextIndex);
        }
      }, 100);
    } else {
      console.log("Autoplay is disabled or playlist is empty");
    }
  }, [autoPlayEnabled, playlist.length, currentTrackIndex]);

  const handleLoaded = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleError = (e: any) => console.error('Audio playback failed:', e);

  // Create audio element on mount
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      
      // Add event listeners
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('loadedmetadata', handleLoaded);
      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('pause', handlePause);
      audioRef.current.addEventListener('error', handleError);
    }
    
    return () => {
      if (audioRef.current) {
        // Properly remove event listeners
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', handleLoaded);
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('pause', handlePause);
        audioRef.current.removeEventListener('error', handleError);
        
        // Stop any playing audio before cleanup
        audioRef.current.pause();
      }
    };
  }, []);
  
  // Add a separate effect for the 'ended' event to ensure it updates when autoPlayEnabled changes
  useEffect(() => {
    if (audioRef.current) {
      // Remove previous listener to prevent duplicates
      audioRef.current.removeEventListener('ended', handleEnded);
      // Add the updated listener
      audioRef.current.addEventListener('ended', handleEnded);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [handleEnded, autoPlayEnabled, playlist.length, currentTrackIndex]);

  // Player controls
  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        setVolumeState(previousVolume);
        audioRef.current.volume = previousVolume;
        setIsMuted(false);
      } else {
        setPreviousVolume(volume);
        setVolumeState(0);
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const setVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolumeState(newVolume);
      
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
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

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setPlaylist = (tracks: Track[]) => {
    setPlaylistState(tracks);
    
    // If we now have tracks but had none before, select the first one
    if (tracks.length > 0 && !currentTrack) {
      setCurrentTrack(tracks[0]);
      setCurrentTrackIndex(0);
      
      if (audioRef.current) {
        audioRef.current.src = tracks[0].path;
        audioRef.current.load();
      }
    }
  };
  
  // Toggle auto-play setting
  const toggleAutoPlay = () => {
    setAutoPlayEnabled(!autoPlayEnabled);
  };

  // When current track changes, load it
  useEffect(() => {
    if (audioRef.current && currentTrack && currentTrack.path) {
      audioRef.current.src = currentTrack.path;
      audioRef.current.volume = volume;
      audioRef.current.load();
      
      if (isPlaying) {
        play();
      }
    }
  }, [currentTrack]);

  // When volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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