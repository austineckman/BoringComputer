import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

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

  // Player controls
  const play = () => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play()
        .catch(err => {
          console.error('Play failed:', err);
          setIsPlaying(false);
        });
    }
  };

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

  const playTrack = (index: number) => {
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

  // Define event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    }
  };

  const handleEnded = () => {
    console.log("Track ended, autoPlayEnabled:", autoPlayEnabled);
    if (playlist.length > 0 && autoPlayEnabled) {
      console.log("Auto-playing next track...");
      nextTrack();
    } else {
      console.log("Autoplay is disabled or playlist is empty");
    }
  };

  const handleLoaded = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleError = (e: any) => console.error('Audio playback failed:', e);

  // Create audio element on mount and handle event listeners
  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }
    
    // Set up all event listeners
    const audio = audioRef.current;
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoaded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    
    // Clean up function
    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('loadedmetadata', handleLoaded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('error', handleError);
        audio.pause();
      }
    };
  }, [autoPlayEnabled]); // Re-add listeners when autoPlayEnabled changes

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
  }, [currentTrack, isPlaying, volume]);

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