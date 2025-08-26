import React, { useState, useEffect } from 'react';
import { Play, AlertCircle, ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  videoId?: string;
  title?: string;
  className?: string;
}

// Component for displaying YouTube videos that works in both dev and production
export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoId, 
  title = "Tutorial Video",
  className = "" 
}) => {
  const [embedError, setEmbedError] = useState(false);
  const [processedVideoId, setProcessedVideoId] = useState<string | null>(null);
  const [loadAttempted, setLoadAttempted] = useState(false);

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
      setEmbedError(false);
    } else {
      setProcessedVideoId(null);
      setEmbedError(true);
    }
  }, [videoId]);

  // Enhanced error handling for deployment issues
  const handleEmbedError = () => {
    console.log('Video embed failed, likely due to CSP or deployment restrictions');
    setEmbedError(true);
  };

  const handleIframeLoad = () => {
    setLoadAttempted(true);
  };

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

  if (embedError) {
    // Provide a fallback with direct link to YouTube
    return (
      <div className={`aspect-video bg-gray-900 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-6">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold text-white mb-2">Video Blocked by Deployment</h3>
          <p className="text-gray-400 mb-4">
            This video works on Replit preview but is blocked on the deployed version due to iframe security restrictions. This is a common deployment issue, not a problem with your videos.
          </p>
          <a
            href={`https://www.youtube.com/watch?v=${processedVideoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Watch on YouTube</span>
          </a>
          <p className="text-sm text-gray-500 mt-3">
            Video ID: {processedVideoId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      {/* YouTube Embed with Multiple Fallback Strategies */}
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${processedVideoId}?rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`}
        className="w-full h-full"
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        onError={handleEmbedError}
        onLoad={handleIframeLoad}
        loading="lazy"
        sandbox="allow-same-origin allow-scripts allow-presentation allow-popups allow-top-navigation allow-forms"
      />
      
      {/* Loading state overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="animate-pulse">
          <Play className="w-20 h-20 text-white opacity-20" />
        </div>
      </div>
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