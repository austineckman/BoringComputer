import React, { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, X } from "lucide-react";
import jukeboxImage from "@assets/jukebox.png";
import { useAudioPlayer, Track } from "@/contexts/AudioPlayerContext";

interface JukeboxWindowProps {
  onClose: () => void;
}

// Playlist with our music tracks from the "Taverns, Terrors, and Tiny Victories" album
const initialPlaylist: Track[] = [
  {
    id: "alexs-tesla",
    title: "Alex's Tesla",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/Alex's Tesla.mp3",
    durationSeconds: 180 // Approximate
  },
  {
    id: "chappy",
    title: "Chappy",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/Chappy.mp3",
    durationSeconds: 120 // Approximate
  },
  {
    id: "empty-arcade",
    title: "Empty Arcade",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/Empty Arcade.mp3",
    durationSeconds: 240 // Approximate
  },
  {
    id: "factory-new",
    title: "Factory New",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/Factory New.mp3",
    durationSeconds: 240 // Approximate
  },
  {
    id: "glitched-grid",
    title: "Glitched Grid",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/Glitched Grid.mp3",
    durationSeconds: 210 // Approximate
  },
  {
    id: "guildbank",
    title: "Guildbank",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/guildbank.mp3",
    durationSeconds: 150 // Approximate
  },
  {
    id: "heavy-is-the-head",
    title: "Heavy is the Head That Wears the Crown",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/Heavy is the head that wears the crown.mp3",
    durationSeconds: 240 // Approximate
  },
  {
    id: "heros-anthem",
    title: "HERO's Anthem",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/HERO's Anthem.mp3",
    durationSeconds: 160 // Approximate
  },
  {
    id: "trouble-feeling",
    title: "I Knew I Was In Trouble",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/I knew I was in trouble when your name became more of a feeling than a word.mp3",
    durationSeconds: 150 // Approximate
  },
  {
    id: "miss-tomorrow",
    title: "I Miss Tomorrow",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/I miss tomorrow.mp3",
    durationSeconds: 230 // Approximate
  },
  {
    id: "going-to-be-okay",
    title: "It's Going to Be Okay Stranger",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/It's going to be okay stranger. You are loved..mp3",
    durationSeconds: 170 // Approximate
  },
  {
    id: "lan-night",
    title: "LAN Night Jamboree",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/LAN Night Jamboree.mp3",
    durationSeconds: 240 // Approximate
  },
  {
    id: "pixel-hearth",
    title: "Pixel Hearth",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/Pixel Hearth.mp3",
    durationSeconds: 180 // Approximate
  },
  {
    id: "pixelated-warriors",
    title: "Pixelated Warriors",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/Pixelated Warriors.mp3",
    durationSeconds: 240 // Approximate
  },
  {
    id: "spooky-cat",
    title: "Spooky Cat",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/Spooky Cat.mp3",
    durationSeconds: 120 // Approximate
  },
  {
    id: "tavern-exe",
    title: "TAVERN.EXE",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/TAVERN.EXE.mp3",
    durationSeconds: 240 // Approximate
  },
  {
    id: "thief-in-the-fog",
    title: "Thief in the Fog",
    artist: "Taverns, Terrors, and Tiny Victories",
    path: "/sounds/Thief in the fog.mp3",
    durationSeconds: 190 // Approximate
  }
];

interface AudioContextState {
  instance: AudioContext | null;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode | null;
  buffer: AudioBuffer | null;
}

const JukeboxWindow: React.FC<JukeboxWindowProps> = ({ onClose }) => {
  // Use our global audio player context
  const {
    isPlaying,
    currentTrack,
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
    togglePlay,
    toggleMute,
    setVolume,
    playTrack,
    nextTrack,
    prevTrack,
    seekTo,
    setPlaylist,
    toggleAutoPlay
  } = useAudioPlayer();
  
  // Set playlist on component mount if empty
  useEffect(() => {
    if (playlist.length === 0) {
      setPlaylist(initialPlaylist);
    }
  }, [playlist.length, setPlaylist]);
  
  // Convert progress (0-100) to currentTime for the progress bar
  const playbackProgress = progress;
  
  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  }, [setVolume]);

  // Handle progress bar change (seeking)
  const handleProgressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * (duration || 0);
    seekTo(newTime);
  }, [duration, seekTo]);
  
  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <div className="flex h-full">
        {/* Left side - Jukebox image and controls */}
        <div className="w-1/2 p-4 flex flex-col items-center justify-center relative">
          <div className="relative">
            <img 
              src={jukeboxImage} 
              alt="Vintage Jukebox" 
              className={`w-full h-auto max-w-[320px] mx-auto image-rendering-pixelated ${isPlaying ? 'jukebox-playing' : ''}`}
              style={{ imageRendering: 'pixelated' }}
            />
            
            {/* Top display visualizer (golden area) */}
            {isPlaying && (
              <div className="absolute top-[16%] left-1/2 transform -translate-x-1/2 w-[40%] h-[5%] flex items-center justify-center">
                <div className="flex space-x-1">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-orange-300 rounded-full animate-visualizer"
                      style={{ 
                        height: `${Math.random() * 8 + 2}px`,
                        animationDelay: `${i * 0.15}s`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Middle display visualizer */}
            <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 w-[40%] h-[8%] flex items-center justify-center">
              <div className={`flex space-x-1 ${isPlaying ? 'animate-pulse' : ''}`}>
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1 bg-orange-400 rounded-full ${
                      isPlaying ? 'animate-visualizer' : 'h-1'
                    }`}
                    style={{ 
                      height: isPlaying ? `${Math.random() * 12 + 3}px` : '2px',
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
            
            {/* Green tube pulsing effects (left) */}
            {isPlaying && (
              <div className="absolute top-[35%] left-[14%] w-[4%] h-[28%] opacity-20 bg-green-400 rounded-full animate-slow-pulse"></div>
            )}
            
            {/* Green tube pulsing effects (right) */}
            {isPlaying && (
              <div className="absolute top-[35%] right-[14%] w-[4%] h-[28%] opacity-20 bg-green-400 rounded-full animate-slow-pulse-delayed"></div>
            )}
            
            {/* Record spinning effect */}
            {isPlaying && (
              <div className="absolute top-[66%] left-1/2 transform -translate-x-1/2 w-[26%] h-[14%] overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-700 bg-gray-800 animate-spin-slow relative">
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-600"></div>
                    <div className="absolute top-0 left-1/2 w-[2px] h-full bg-gray-600"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[4px] h-[4px] rounded-full bg-gray-600"></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Pixel dust effect */}
            {isPlaying && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-[2px] h-[2px] bg-orange-300 rounded-full animate-float-up"
                    style={{
                      left: `${30 + Math.random() * 40}%`,
                      bottom: `${10 + Math.random() * 60}%`,
                      opacity: 0.6 + Math.random() * 0.4,
                      animationDelay: `${i * 2 + Math.random() * 5}s`,
                      animationDuration: `${4 + Math.random() * 6}s`
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>
          
          {/* Controls below jukebox */}
          <div className="mt-4 flex flex-col items-center">
            <div className="text-lg font-bold text-orange-400 mb-2">{currentTrack?.title || "No track selected"}</div>
            <div className="text-sm text-gray-400 mb-4">{currentTrack?.artist || ""}</div>
            
            {/* Playback controls */}
            <div className="flex items-center space-x-4 mb-4">
              <button 
                onClick={prevTrack}
                disabled={playlist.length === 0}
                className={`p-2 rounded-full ${playlist.length === 0 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                <SkipBack size={20} />
              </button>
              
              <button 
                onClick={togglePlay}
                disabled={playlist.length === 0}
                className={`p-3 rounded-full ${playlist.length === 0 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 text-white hover:bg-orange-600'}`}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <button 
                onClick={nextTrack}
                disabled={playlist.length === 0}
                className={`p-2 rounded-full ${playlist.length === 0 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                <SkipForward size={20} />
              </button>
            </div>
            
            {/* Volume control */}
            <div className="flex items-center space-x-2 w-full max-w-[200px]">
              <button 
                onClick={toggleMute} 
                className="p-1 rounded-full hover:bg-gray-800"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-grow h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
        
        {/* Right side - Track information and playlist */}
        <div className="w-1/2 bg-gray-900 p-4 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
            <div className="flex items-center">
              <Music className="mr-2 text-orange-400" />
              <h2 className="text-lg font-bold">Taverns, Terrors, and Tiny Victories</h2>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-400 mr-4">Playing {playlist.length} tracks</span>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-red-700 rounded-full p-1"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          {/* Now Playing */}
          <div className="bg-gray-800 rounded-md p-3 mb-4">
            <div className="mb-2">
              <div className="text-sm text-gray-400">Now Playing</div>
              <div className="text-orange-400 font-bold">{currentTrack?.title || "No track selected"}</div>
            </div>
            
            {/* Progress bar */}
            <div className="flex items-center space-x-2">
              <span className="text-xs w-8">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={playbackProgress}
                onChange={handleProgressChange}
                className="flex-grow h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs w-8">{formatTime(currentTrack?.durationSeconds || 0)}</span>
            </div>
            
            {/* Auto-play toggle */}
            <div className="flex items-center justify-end mt-2">
              <span className="text-xs text-gray-400 mr-2">Auto-play next</span>
              <button 
                onClick={toggleAutoPlay}
                className={`px-2 py-1 text-xs rounded ${
                  autoPlayEnabled 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {autoPlayEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
          
          {/* Playlist */}
          <div className="flex-grow overflow-y-auto">
            <h3 className="text-sm font-bold mb-2 text-gray-400">PLAYLIST</h3>
            <ul className="divide-y divide-gray-700">
              {playlist.map((track, index) => (
                <li 
                  key={track.id}
                  className={`py-2 px-3 flex justify-between items-center hover:bg-gray-800 rounded cursor-pointer ${
                    currentTrackIndex === index ? 'bg-gray-800 border-l-4 border-orange-500 pl-2' : ''
                  }`}
                  onClick={() => {
                    playTrack(index);
                  }}
                >
                  <div>
                    <div className={`font-medium ${currentTrackIndex === index ? 'text-orange-400' : 'text-white'}`}>
                      {track.title}
                    </div>
                    <div className="text-xs text-gray-400">{track.artist}</div>
                  </div>
                  <div className="text-xs text-gray-400">{formatTime(track.durationSeconds)}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JukeboxWindow;