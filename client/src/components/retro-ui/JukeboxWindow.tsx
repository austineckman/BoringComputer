import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react";
import { Howl, Howler } from 'howler';
import jukeboxImage from "@assets/jukebox.png";

// Music track interface
interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
}

// Define available tracks with their URLs
const musicTracks: MusicTrack[] = [
  {
    id: "chappy",
    title: "Chappy",
    artist: "Pixel Composer",
    src: "/music/Chappy.mp3"
  },
  {
    id: "pixelated-warriors",
    title: "Pixelated Warriors",
    artist: "Pixel Composer",
    src: "/music/Pixelated Warriors.mp3"
  },
  {
    id: "spooky-cat",
    title: "Spooky Cat",
    artist: "Retro Wave",
    src: "/music/Spooky Cat.mp3"
  },
  {
    id: "tavern-exe",
    title: "TAVERN.EXE",
    artist: "Digital Bard",
    src: "/music/TAVERN.EXE.mp3"
  },
  {
    id: "guildbank",
    title: "Guild Bank",
    artist: "Epic Fantasy",
    src: "/music/guildbank.mp3"
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
  
  // Reference to the sound object
  const soundRef = useRef<Howl | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  const currentTrack = musicTracks[currentTrackIndex];
  
  // Initialize sound when component mounts or when track changes
  useEffect(() => {
    // Clean up previous sound instance
    if (soundRef.current) {
      soundRef.current.unload();
    }
    
    // Clean up previous interval
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    
    setIsLoading(true);
    console.log("Loading track:", currentTrack.src);
    
    // Create a new Howl instance
    const sound = new Howl({
      src: [currentTrack.src],
      html5: true, // Use HTML5 Audio to help with mobile playback
      format: ['mp3'],
      volume: isMuted ? 0 : volume,
      xhr: {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
        withCredentials: false,
      },
      onload: () => {
        console.log("Track loaded:", currentTrack.title);
        setIsLoading(false);
        setDuration(sound.duration());
        
        // If we were playing before, resume playback
        if (isPlaying) {
          sound.play();
        }
      },
      onplay: () => {
        setIsPlaying(true);
        
        // Set up an interval to update the progress
        intervalRef.current = window.setInterval(() => {
          setProgress(sound.seek());
        }, 100);
        
        // Update the main desktop UI
        window.dispatchEvent(new CustomEvent('jukeboxStatusChange', { 
          detail: { isPlaying: true } 
        }));
      },
      onpause: () => {
        setIsPlaying(false);
        
        // Clear the progress update interval
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Update the main desktop UI
        window.dispatchEvent(new CustomEvent('jukeboxStatusChange', { 
          detail: { isPlaying: false } 
        }));
      },
      onstop: () => {
        setIsPlaying(false);
        setProgress(0);
        
        // Clear the progress update interval
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Update the main desktop UI
        window.dispatchEvent(new CustomEvent('jukeboxStatusChange', { 
          detail: { isPlaying: false } 
        }));
      },
      onend: () => {
        // Play the next track when current one ends
        nextTrack();
      },
      onloaderror: (id, err) => {
        console.error("Error loading sound:", err);
        setIsLoading(false);
      },
      onplayerror: (id, err) => {
        console.error("Error playing sound:", err);
        setIsLoading(false);
        setIsPlaying(false);
      }
    });
    
    // Store the Howl instance
    soundRef.current = sound;
    
    // Cleanup function
    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
      
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [currentTrackIndex]);
  
  // Effect to handle volume/mute changes
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);
  
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
  
  // Play/Pause toggle function
  const togglePlayPause = () => {
    console.log("Toggle play button clicked");
    
    if (!soundRef.current) return;
    
    if (!isPlaying) {
      console.log("Trying to play audio");
      // Unmute if muted when trying to play
      if (isMuted) {
        setIsMuted(false);
        soundRef.current.volume(volume);
      }
      soundRef.current.play();
    } else {
      console.log("Pausing audio");
      soundRef.current.pause();
    }
  };
  
  // Change track functions
  const prevTrack = () => {
    setCurrentTrackIndex(prev => 
      prev === 0 ? musicTracks.length - 1 : prev - 1
    );
  };
  
  const nextTrack = () => {
    setCurrentTrackIndex(prev => 
      prev === musicTracks.length - 1 ? 0 : prev + 1
    );
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
    if (!soundRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    soundRef.current.seek(newTime);
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
    </div>
  );
};

export default JukeboxWindow;