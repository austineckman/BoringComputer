import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, Youtube } from 'lucide-react';

interface VideoPlayerProps {
  videoId?: string;
  title?: string;
  className?: string;
}

// Component for displaying YouTube videos with CSP-safe fallback
export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoId, 
  title = "Tutorial Video",
  className = "" 
}) => {
  const [processedVideoId, setProcessedVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) {
      setProcessedVideoId(null);
      return;
    }

    // Process the video ID from various YouTube URL formats
    let extractedId = videoId;
    
    // Handle full YouTube URLs
    if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
      // Extract video ID from various YouTube URL formats
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      ];
      
      for (const pattern of patterns) {
        const match = videoId.match(pattern);
        if (match && match[1]) {
          extractedId = match[1];
          break;
        }
      }
    }
    
    // Validate video ID format (should be 11 characters)
    if (extractedId && extractedId.length >= 10 && extractedId.length <= 12) {
      setProcessedVideoId(extractedId);
    } else {
      setProcessedVideoId(null);
    }
  }, [videoId]);

  if (!videoId || !processedVideoId) {
    return (
      <div className={`aspect-video bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <Play className="w-16 h-16 mx-auto mb-2 opacity-50" />
          <p>No video available</p>
        </div>
      </div>
    );
  }

  // Always use the thumbnail + link approach for reliability
  return (
    <div className={`relative aspect-video bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* YouTube Thumbnail with click to play */}
      <a
        href={`https://www.youtube.com/watch?v=${processedVideoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full h-full relative group"
      >
        {/* Video thumbnail */}
        <img 
          src={`https://img.youtube.com/vi/${processedVideoId}/maxresdefault.jpg`}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to standard quality if maxres doesn't exist
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${processedVideoId}/hqdefault.jpg`;
          }}
        />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-50 transition-all">
          <div className="bg-red-600 rounded-full p-4 group-hover:bg-red-700 transform group-hover:scale-110 transition-all shadow-xl">
            <Play className="w-12 h-12 text-white fill-white ml-1" />
          </div>
        </div>
        
        {/* YouTube branding */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 rounded-lg px-3 py-1.5 flex items-center space-x-2">
          <Youtube className="w-5 h-5 text-red-500" />
          <span className="text-white text-sm font-medium">Watch on YouTube</span>
        </div>
        
        {/* Video title */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-lg font-semibold drop-shadow-lg bg-black bg-opacity-50 rounded px-2 py-1 inline-block">
            {title}
          </h3>
        </div>
      </a>
    </div>
  );
};

// Export additional utility function for processing video IDs
export const processYouTubeUrl = (url: string): string | null => {
  if (!url) return null;
  
  // If already a video ID, return it
  if (!url.includes('youtube') && !url.includes('youtu.be') && url.length === 11) {
    return url;
  }
  
  // Extract from various URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

export default VideoPlayer;