import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from "lucide-react";
import bgMusicPath from "@assets/Fantasy Guild Hall.mp3";
import pixelDreamsPath from "@assets/Pixel Dreams.mp3";
import jukeboxImage from "@assets/jukebox.png";

// Track interface for the playlist
interface Track {
  id: string;
  title: string;
  artist: string;
  path: string;
  durationSeconds: number;
}

// Initial playlist with our current music files
const initialPlaylist: Track[] = [
  {
    id: "fantasy-guild-hall",
    title: "Fantasy Guild Hall",
    artist: "ChipTune Music",
    path: bgMusicPath,
    durationSeconds: 193
  },
  {
    id: "pixel-dreams",
    title: "Pixel Dreams",
    artist: "ChipTune Music",
    path: pixelDreamsPath,
    durationSeconds: 190
  }
];

interface AudioContextState {
  instance: AudioContext | null;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode | null;
  buffer: AudioBuffer | null;
}

const JukeboxWindow: React.FC = () => {
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // State
  const [playlist, setPlaylist] = useState<Track[]>(initialPlaylist);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5); // 0 to 1
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0); // 0 to 100
  const [prevVolume, setPrevVolume] = useState<number>(volume); // For mute toggle

  // Get current track
  const currentTrack = playlist[currentTrackIndex];
  
  // Initialize progress with default 0 to avoid NaN
  useEffect(() => {
    // Reset progress when changing tracks to prevent NaN values
    setPlaybackProgress(0);
    setCurrentTime(0);
  }, [currentTrackIndex]);

  // Play/pause track
  const togglePlay = useCallback(() => {
    console.log("Toggle play button clicked");
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      console.log("Trying to play audio");
      audio.play().catch(err => {
        console.error("Play failed:", err);
        setIsPlaying(false);
      });
    }
  }, [isPlaying]);

  // Skip to next track
  const playNextTrack = useCallback(() => {
    setCurrentTrackIndex(prev => (prev + 1) % playlist.length);
  }, [playlist.length]);

  // Skip to previous track
  const playPreviousTrack = useCallback(() => {
    setCurrentTrackIndex(prev => (prev === 0 ? playlist.length - 1 : prev - 1));
  }, [playlist.length]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      setVolume(prevVolume);
      audio.volume = prevVolume;
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume, prevVolume]);

  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
    }
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  // Handle progress bar change (seeking)
  const handleProgressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * audio.duration;
    
    audio.currentTime = newTime;
    setPlaybackProgress(newProgress);
    setCurrentTime(newTime);
  }, []);

  // Update state when audio ends to move to next track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      playNextTrack();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setPlaybackProgress((audio.currentTime / audio.duration) * 100);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [playNextTrack]);

  // Effect to handle source changes and autoplay
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Set the audio source
    audio.src = currentTrack.path;
    audio.volume = volume;
    audio.load();

    // If we were already playing, don't auto-start - this prevents unwanted autoplay
    // We're intentionally not auto-playing even if isPlaying is true
    // Music should only start when the user explicitly clicks play
    setIsPlaying(false);
  }, [currentTrack.path, currentTrackIndex, volume, isPlaying]);
  
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
              className="w-full h-auto max-w-[320px] mx-auto image-rendering-pixelated"
              style={{ imageRendering: 'pixelated' }}
            />
            
            {/* Light glow effect when playing */}
            {isPlaying && (
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-orange-500 rounded-full opacity-10 animate-pulse blur-lg"></div>
            )}
            
            {/* Visualizer effect on jukebox display */}
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
          </div>
          
          {/* Controls below jukebox */}
          <div className="mt-4 flex flex-col items-center">
            <div className="text-lg font-bold text-orange-400 mb-2">{currentTrack.title}</div>
            <div className="text-sm text-gray-400 mb-4">{currentTrack.artist}</div>
            
            {/* Playback controls */}
            <div className="flex items-center space-x-4 mb-4">
              <button 
                onClick={playPreviousTrack}
                className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800"
              >
                <SkipBack size={20} />
              </button>
              
              <button 
                onClick={togglePlay}
                className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <button 
                onClick={playNextTrack}
                className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800"
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
              <h2 className="text-lg font-bold">Retro Jukebox</h2>
            </div>
            <span className="text-xs text-gray-400">Playing {playlist.length} tracks</span>
          </div>
          
          {/* Now Playing */}
          <div className="bg-gray-800 rounded-md p-3 mb-4">
            <div className="mb-2">
              <div className="text-sm text-gray-400">Now Playing</div>
              <div className="text-orange-400 font-bold">{currentTrack.title}</div>
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
              <span className="text-xs w-8">{formatTime(currentTrack.durationSeconds)}</span>
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
                    setCurrentTrackIndex(index);
                    // Changed to not auto-play when selecting tracks
                    setIsPlaying(false);
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

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
};

export default JukeboxWindow;