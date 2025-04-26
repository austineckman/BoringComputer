import React from "react";
import { Play, Pause, SkipBack, SkipForward, Music } from "lucide-react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

interface MiniPlayerProps {
  onOpenJukebox: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ onOpenJukebox }) => {
  const { 
    isPlaying, 
    currentTrack,
    togglePlay, 
    prevTrack, 
    nextTrack, 
    progress
  } = useAudioPlayer();
  
  // If no track is playing, show a minimal control
  if (!currentTrack) {
    return (
      <div className="flex items-center mr-3">
        <button
          onClick={onOpenJukebox}
          className="flex items-center bg-blue-800 hover:bg-blue-700 border border-blue-500 
                     px-3 py-1.5 text-xs text-white rounded-sm transition-colors"
        >
          <Music size={16} className="mr-2" />
          <span>Jukebox</span>
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center mr-3 bg-blue-900 border border-blue-500 rounded-sm overflow-hidden">
      {/* Controls */}
      <div className="flex items-center space-x-1 px-2">
        <button 
          onClick={prevTrack}
          className="text-blue-200 hover:text-white p-1 transition-colors"
          title="Previous track"
        >
          <SkipBack size={14} />
        </button>
        
        <button 
          onClick={togglePlay}
          className="text-blue-200 hover:text-white p-1 transition-colors"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        
        <button 
          onClick={nextTrack}
          className="text-blue-200 hover:text-white p-1 transition-colors"
          title="Next track"
        >
          <SkipForward size={14} />
        </button>
      </div>
      
      {/* Track info with progress bar */}
      <div 
        className="relative flex items-center px-3 py-1.5 cursor-pointer hover:bg-blue-800 transition-colors"
        onClick={onOpenJukebox}
        title="Open Jukebox"
      >
        {/* Track title - scrolling if too long */}
        <div className="w-32 overflow-hidden whitespace-nowrap text-xs text-white">
          <div className={currentTrack.title.length > 20 ? "animate-marquee" : ""}>
            {currentTrack.title}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-cyan-500" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
};

export default MiniPlayer;