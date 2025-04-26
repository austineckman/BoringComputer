import React, { useState } from "react";
import { Music } from "lucide-react";
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
    id: "pixel-hearth",
    title: "Pixel Hearth",
    artist: "Digital Bard",
    src: "/music/Pixel Hearth.mp3"
  },
  {
    id: "guildbank",
    title: "Guild Bank",
    artist: "Epic Fantasy",
    src: "/music/guildbank.mp3"
  },
  {
    id: "pixel-dreams",
    title: "Pixel Dreams",
    artist: "Pixel Composer",
    src: "/music/Pixel Dreams.mp3"
  },
  {
    id: "alex-tesla",
    title: "Alex's Tesla",
    artist: "Synth Wave",
    src: "/music/Alex's Tesla.mp3"
  },
  {
    id: "empty-arcade",
    title: "Empty Arcade",
    artist: "Retro Wave",
    src: "/music/Empty Arcade.mp3"
  },
  {
    id: "factory-new",
    title: "Factory New",
    artist: "Industrial Beat",
    src: "/music/Factory New.mp3"
  },
  {
    id: "fantasy-guild-hall",
    title: "Fantasy Guild Hall",
    artist: "Epic Fantasy",
    src: "/music/Fantasy Guild Hall.mp3"
  },
  {
    id: "heavy-crown",
    title: "Heavy is the Head",
    artist: "Royal Beats",
    src: "/music/Heavy is the head that wears the crown.mp3"
  },
  {
    id: "trouble-name",
    title: "Your Name Became Feeling",
    artist: "Emotional Beat",
    src: "/music/I knew I was in trouble when your name became more of a feeling than a word.mp3"
  },
  {
    id: "miss-tomorrow",
    title: "I Miss Tomorrow",
    artist: "Future Wave",
    src: "/music/I miss tomorrow.mp3"
  },
  {
    id: "okay-stranger",
    title: "It's Going to Be Okay",
    artist: "Comfort Beat",
    src: "/music/It's going to be okay stranger. You are loved..mp3"
  },
  {
    id: "lan-night",
    title: "LAN Night Jamboree",
    artist: "Retro Beats",
    src: "/music/LAN Night Jamboree.mp3"
  },
  {
    id: "glitched-grid",
    title: "Glitched Grid",
    artist: "Cyber Core",
    src: "/music/Glitched Grid.mp3"
  },
  {
    id: "thief-fog",
    title: "Thief in the Fog",
    artist: "Epic Fantasy",
    src: "/music/Thief in the fog.mp3"
  }
];

interface JukeboxWindowProps {
  onClose: () => void;
}

const JukeboxWindow: React.FC<JukeboxWindowProps> = ({ onClose }) => {
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
  
  const currentTrack = musicTracks[selectedTrackIndex];
  
  return (
    <div className="flex flex-col h-full">
      {/* Jukebox Header */}
      <div className="bg-gray-900 text-white p-3 border-b border-orange-400 flex justify-between items-center">
        <h3 className="text-lg font-bold">Retro Jukebox</h3>
      </div>
      
      {/* Jukebox Body */}
      <div className="flex-1 bg-gray-800 p-4 flex flex-col items-center overflow-auto">
        {/* Jukebox Image */}
        <div className="w-64 h-64 mb-4 relative">
          <img 
            src={jukeboxImage} 
            alt="Jukebox" 
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
        
        {/* Track Info */}
        <div className="text-center mb-4 w-full">
          <h4 className="text-orange-400 text-lg font-bold truncate">{currentTrack.title}</h4>
          <p className="text-gray-300 text-sm">{currentTrack.artist}</p>
          <p className="text-orange-300 text-xs mt-2 italic">Select a track below to play</p>
        </div>
        
        {/* Audio player for direct browser control */}
        <div className="w-full mb-6">
          <audio 
            controls 
            src={currentTrack.src}
            className="w-full"
            preload="auto"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
        
        {/* Track selector */}
        <div className="w-full pb-2 bg-gray-700 rounded-md overflow-hidden">
          <h4 className="text-white text-sm mb-2 p-2 bg-gray-800">Track Collection (18 tracks)</h4>
          <div className="max-h-64 overflow-y-auto pr-2 pl-2 custom-scrollbar">
            {musicTracks.map((track, index) => (
              <div 
                key={track.id}
                onClick={() => setSelectedTrackIndex(index)}
                className={`p-2 rounded mb-1 cursor-pointer hover:bg-gray-600 transition ${selectedTrackIndex === index ? 'bg-gray-600 border-l-4 border-orange-500' : 'bg-gray-700'}`}
              >
                <div className="flex items-center">
                  <div className="mr-2 text-orange-400">
                    <Music size={16} />
                  </div>
                  <div className="truncate">
                    <p className="text-xs text-white truncate">{track.title}</p>
                    <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-3 text-center text-gray-400 text-xs">
          <p>Music playback may require user interaction due to browser security policies.</p>
          <p>Use the native browser audio controls above for best results.</p>
        </div>
      </div>
    </div>
  );
};

export default JukeboxWindow;