import { useCallback } from 'react';
import { useLocation } from 'wouter';
import { useSoundEffects } from './useSoundEffects';
import { themeConfig } from '@/lib/themeConfig';

export function useAdventureNavigation() {
  const [, navigate] = useLocation();
  const { playAdventureSound } = useSoundEffects();
  
  const navigateToAdventure = useCallback((adventureLine: string) => {
    // Play adventure-specific sound using our specialized function
    playAdventureSound(adventureLine);
    
    // Navigate to the quests page with the adventure line as a query parameter
    navigate(`/quests?adventure=${adventureLine}`);
  }, [navigate, playAdventureSound]);
  
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