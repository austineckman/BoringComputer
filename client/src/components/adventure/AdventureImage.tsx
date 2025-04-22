import React from 'react';

// Import the adventure images
import lostInSpaceImg from '/public/images/adventure-lines/30-days-pixelart.png';
import cogsworthCityImg from '/public/images/adventure-lines/cogsworth-pixelart.png';
import pandorasBoxImg from '/public/images/adventure-lines/pandora-pixelart.png';
import neonRealmImg from '/public/images/adventure-lines/neon-realm-pixelart.png';
import nebulaRaidersImg from '/public/images/adventure-lines/nebula-pixelart.png';

// Create a mapping for the adventure IDs to their images
const adventureImages: Record<string, string> = {
  'lost-in-space': lostInSpaceImg,
  'cogsworth-city': cogsworthCityImg,
  'pandoras-box': pandorasBoxImg,
  'neon-realm': neonRealmImg,
  'nebula-raiders': nebulaRaidersImg
};

interface AdventureImageProps {
  adventureId: string;
  className?: string;
  alt?: string;
}

const AdventureImage: React.FC<AdventureImageProps> = ({ 
  adventureId,
  className = "w-full h-full object-cover",
  alt = "Adventure Image"
}) => {
  const imagePath = adventureImages[adventureId];
  
  if (!imagePath) {
    // Return a placeholder or null if no image found
    return null;
  }
  
  return (
    <img 
      src={imagePath}
      alt={alt}
      className={className}
    />
  );
};

export default AdventureImage;