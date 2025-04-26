import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react";
import jukeboxImage from "@assets/jukebox.png";

// Music track interface
interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
}

// Define available tracks
const musicTracks: MusicTrack[] = [
  {
    id: "chappy",
    title: "Chappy",
    artist: "Pixel Composer",
    src: "/music/Chappy.mp3" // Path will be in the public folder
  },
  {
    id: "pixelated-warriors",
    title: "Pixelated Warriors",
    artist: "Pixel Composer",
    src: "/music/Pixelated Warriors.mp3" // Path will be in the public folder
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
  
  // Effect to handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.play().catch(error => {
        console.warn("Audio playback failed:", error);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrackIndex]);
  
  // Effect to handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);
  
  // Play/Pause toggle
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Change track
  const prevTrack = () => {
    setCurrentTrackIndex(prev => 
      prev === 0 ? musicTracks.length - 1 : prev - 1
    );
    setIsPlaying(true);
  };
  
  const nextTrack = () => {
    setCurrentTrackIndex(prev => 
      prev === musicTracks.length - 1 ? 0 : prev + 1
    );
    setIsPlaying(true);
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
        </div>
        
        {/* Track Info */}
        <div className="text-center mb-4 w-full">
          <h4 className="text-orange-400 text-lg font-bold truncate">{currentTrack.title}</h4>
          <p className="text-gray-300 text-sm">{currentTrack.artist}</p>
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
            className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 text-white transition"
          >
            <SkipBack size={18} />
          </button>
          
          <button 
            onClick={togglePlayPause}
            className="p-3 bg-orange-600 rounded-full hover:bg-orange-500 text-white transition"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button 
            onClick={nextTrack}
            className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 text-white transition"
          >
            <SkipForward size={18} />
          </button>
        </div>
        
        {/* Volume Controls */}
        <div className="flex items-center space-x-2 w-full max-w-xs">
          <button 
            onClick={toggleMute}
            className="p-1 text-gray-300 hover:text-white"
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
            className="flex-1 h-1.5 appearance-none bg-gray-700 rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500"
          />
        </div>
      </div>
      
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        src={currentTrack.src} 
        preload="metadata"
      />
    </div>
  );
};

export default JukeboxWindow;