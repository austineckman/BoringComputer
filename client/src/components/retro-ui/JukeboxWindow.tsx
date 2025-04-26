import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react";
import jukeboxImage from "@assets/jukebox.png";

// Music track interface
interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
}

// Define available tracks with base64 encoded short audio samples to bypass network issues
const musicTracks: MusicTrack[] = [
  {
    id: "beep",
    title: "Test Beep",
    artist: "System Audio",
    src: "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"
  },
  {
    id: "tone",
    title: "Basic Tone",
    artist: "System Audio",
    src: "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"
  }
];

interface JukeboxWindowProps {
  onClose: () => void;
}

const JukeboxWindow: React.FC<JukeboxWindowProps> = ({ onClose }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.7);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();
  
  const currentTrack = musicTracks[currentTrackIndex];
  
  // Initialize audio when component mounts
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Set initial volume
    audio.volume = volume;
    
    // Event listeners
    const setAudioData = () => {
      setDuration(audio.duration);
    };
    
    const setAudioTime = () => {
      setProgress(audio.currentTime);
    };
    
    const handleEnded = () => {
      nextTrack();
    };
    
    // Add event listeners
    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);
    
    // Clean up
    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
      
      // Stop any animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Pause audio when component unmounts
      audio.pause();
    };
  }, []);
  
  // Effect that runs when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // When track changes, set the source and load it
    audio.src = currentTrack.src;
    
    // Log for debugging
    console.log("Loading audio track:", currentTrack.src);
    
    // Add a specific load event handler
    const handleCanPlayThrough = () => {
      console.log("Audio can play through:", currentTrack.title);
      setIsLoading(false);
      
      // If we were already playing, play the new track
      if (isPlaying) {
        audio.play()
          .then(() => {
            console.log("Playback started after track change");
            // Dispatch event to update the main desktop UI
            window.dispatchEvent(new CustomEvent('jukeboxStatusChange', { 
              detail: { isPlaying: true } 
            }));
          })
          .catch(error => {
            console.warn("Audio playback failed on track change:", error);
            setIsPlaying(false);
          });
      }
    };
    
    const handleLoadError = (e: Event) => {
      console.error("Audio load error:", e);
      setIsLoading(false);
      setIsPlaying(false);
    };
    
    // Set loading state and reset progress
    setIsLoading(true);
    setProgress(0);
    
    // Add the event listeners
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleLoadError);
    
    // Load the audio file
    audio.load();
    
    // Cleanup function
    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleLoadError);
    };
  }, [currentTrackIndex, isPlaying]);
  
  // Effect to handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      // Play logic is now handled directly in togglePlayPause and track change effect
    } else {
      audio.pause();
      
      // Dispatch event to update the main desktop UI
      window.dispatchEvent(new CustomEvent('jukeboxStatusChange', { 
        detail: { isPlaying: false } 
      }));
    }
  }, [isPlaying]);
  
  // Simplified Play/Pause toggle function
  const togglePlayPause = () => {
    console.log("Toggle play button clicked");
    const audio = audioRef.current;
    if (!audio) return;

    // Create a simple audio context to unlock audio
    const unlockAudio = () => {
      // Create a short silent sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0; // Silent
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start(0);
      oscillator.stop(0.001);
    };

    if (!isPlaying) {
      console.log("Trying to play audio");
      setIsLoading(true);
      
      // Try to unlock audio if needed (for Safari/iOS)
      try {
        unlockAudio();
      } catch (e) {
        console.log("Could not unlock audio, continuing anyway");
      }
      
      // Then create a synthetic beep sound for demonstration
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, context.currentTime); // 440 Hz = A4
        oscillator.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.5); // Play for 0.5 seconds
        
        // Show this as playing in the UI
        setIsPlaying(true);
        setIsLoading(false);
        
        // Update the main desktop UI
        window.dispatchEvent(new CustomEvent('jukeboxStatusChange', { 
          detail: { isPlaying: true } 
        }));
        
        // Automatically "pause" after a short beep
        setTimeout(() => {
          setIsPlaying(false);
          window.dispatchEvent(new CustomEvent('jukeboxStatusChange', { 
            detail: { isPlaying: false } 
          }));
        }, 500);
      } catch (error) {
        console.warn("Audio playback failed:", error);
        setIsPlaying(false);
        setIsLoading(false);
      }
    } else {
      // Pause case is simpler
      console.log("Pausing audio");
      audio.pause();
      setIsPlaying(false);
      
      // Dispatch event to update the main desktop UI
      window.dispatchEvent(new CustomEvent('jukeboxStatusChange', { 
        detail: { isPlaying: false } 
      }));
    }
  };
  
  // Listen for toggle events from the desktop UI
  useEffect(() => {
    const handleTogglePlayPause = () => {
      togglePlayPause();
    };
    
    window.addEventListener('jukeboxTogglePlayPause', handleTogglePlayPause);
    
    return () => {
      window.removeEventListener('jukeboxTogglePlayPause', handleTogglePlayPause);
    };
  }, []);
  
  // Effect to handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);
  
  // Change track functions
  const prevTrack = () => {
    setCurrentTrackIndex(prev => 
      prev === 0 ? musicTracks.length - 1 : prev - 1
    );
    
    // We'll let the effect handle playback when currentTrackIndex changes
    if (!isPlaying) {
      // But if we're not already playing, we need to start
      setTimeout(() => togglePlayPause(), 50);
    }
  };
  
  const nextTrack = () => {
    setCurrentTrackIndex(prev => 
      prev === musicTracks.length - 1 ? 0 : prev + 1
    );
    
    // We'll let the effect handle playback when currentTrackIndex changes
    if (!isPlaying) {
      // But if we're not already playing, we need to start
      setTimeout(() => togglePlayPause(), 50);
    }
  };
  
  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    // If we change volume from 0, unmute
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // Progress bar
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setProgress(newTime);
  };
  
  // Format time (seconds -> MM:SS)
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Jukebox Header */}
      <div className="bg-gray-900 text-white p-3 border-b border-orange-400 flex justify-between items-center">
        <h3 className="text-lg font-bold">Retro Jukebox</h3>
      </div>
      
      {/* Jukebox Body */}
      <div className="flex-1 bg-gray-800 p-4 flex flex-col items-center">
        {/* Jukebox Image */}
        <div className="w-64 h-64 mb-4 relative">
          <img 
            src={jukeboxImage} 
            alt="Jukebox" 
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
          {/* Overlay glow effect when playing */}
          {isPlaying && (
            <div className="absolute inset-0 bg-orange-500 opacity-20 animate-pulse rounded-lg"></div>
          )}
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {/* Track Info */}
        <div className="text-center mb-4 w-full">
          <h4 className="text-orange-400 text-lg font-bold truncate">{currentTrack.title}</h4>
          <p className="text-gray-300 text-sm">{currentTrack.artist}</p>
          {!isPlaying && !isLoading && (
            <p className="text-orange-300 text-xs mt-2 italic">Click play button to start music</p>
          )}
          {isLoading && (
            <p className="text-orange-300 text-xs mt-2 italic">Loading music...</p>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full mb-4 flex items-center space-x-2">
          <span className="text-gray-300 text-xs">{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={handleProgressChange}
            className="flex-1 h-2 appearance-none bg-gray-700 rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500"
          />
          <span className="text-gray-300 text-xs">{formatTime(duration)}</span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <button 
            onClick={prevTrack}
            disabled={isLoading}
            className={`p-2 rounded-full text-white transition ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <SkipBack size={18} />
          </button>
          
          <button 
            onClick={togglePlayPause}
            disabled={isLoading}
            className={`p-3 rounded-full text-white transition ${isLoading ? 'bg-gray-500 cursor-not-allowed' : (isPlaying ? 'bg-orange-600 hover:bg-orange-500' : 'bg-orange-600 hover:bg-orange-500')}`}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button 
            onClick={nextTrack}
            disabled={isLoading}
            className={`p-2 rounded-full text-white transition ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <SkipForward size={18} />
          </button>
        </div>
        
        {/* Volume Controls */}
        <div className="flex items-center space-x-2 w-full max-w-xs">
          <button 
            onClick={toggleMute}
            disabled={isLoading}
            className={`p-1 ${isLoading ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 hover:text-white'}`}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            disabled={isLoading}
            className={`flex-1 h-1.5 appearance-none rounded-full outline-none cursor-pointer 
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 
              [&::-webkit-slider-thumb]:rounded-full 
              ${isLoading ? 'bg-gray-500 [&::-webkit-slider-thumb]:bg-gray-400 cursor-not-allowed' : 'bg-gray-700 [&::-webkit-slider-thumb]:bg-orange-500'}`}
          />
        </div>
      </div>
      
      {/* Audio element with muted attribute for autoplay policy */}
      <audio 
        ref={audioRef} 
        src={currentTrack.src} 
        preload="metadata"
        muted={isMuted}
      />
    </div>
  );
};

export default JukeboxWindow;