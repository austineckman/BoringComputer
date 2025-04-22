import { useCallback } from 'react';
import { useLocation } from 'wouter';
import { useSoundEffects } from './useSoundEffects';
import { themeConfig } from '@/lib/themeConfig';

export function useAdventureNavigation() {
  const [, navigate] = useLocation();
  const { playSound } = useSoundEffects();
  
  const navigateToAdventure = useCallback((adventureLine: string) => {
    // Play different sounds based on the adventure line
    switch(adventureLine) {
      case 'lost-in-space':
        playSound('spaceDoor');
        break;
      case 'cogsworth-city':
        playSound('craftSuccess');
        break;
      case 'pandoras-box':
        playSound('achievement');
        break;
      case 'neon-realm':
        playSound('powerUp');
        break;
      case 'nebula-raiders':
        playSound('boostEngine');
        break;
      default:
        playSound('click');
    }
    
    // Navigate to the quests page with the adventure line as a query parameter
    navigate(`/quests?adventure=${adventureLine}`);
  }, [navigate, playSound]);
  
  // Get adventure line details from theme config
  const getAdventureDetails = useCallback((adventureId: string) => {
    return themeConfig.adventureLines.find(adv => adv.id === adventureId);
  }, []);
  
  return {
    navigateToAdventure,
    getAdventureDetails,
    adventureLines: themeConfig.adventureLines
  };
}