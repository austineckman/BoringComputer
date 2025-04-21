import { useQuery } from "@tanstack/react-query";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  tier: string;
  icon: string;
  requirement: {
    type: string;
    value: number;
  };
}

export interface UserAchievement {
  id: string;
  achievementId: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

export const useAchievements = () => {
  const { playSound } = useSoundEffects();

  // Get all achievements
  const { data: achievements = [], isLoading: loadingAchievements } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
    retry: false
  });

  // Get user's achievements
  const { data: userAchievements = [], isLoading: loadingUserAchievements } = useQuery<UserAchievement[]>({
    queryKey: ['/api/user/achievements'],
    retry: false
  });

  // Combine achievements with user progress
  const achievementsWithProgress = achievements.map(achievement => {
    const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
    
    return {
      ...achievement,
      unlocked: userAchievement?.unlocked || false,
      progress: userAchievement?.progress || 0,
      unlockedAt: userAchievement?.unlockedAt,
      total: achievement.requirement.value
    };
  });

  // Get achievements by tier
  const getAchievementsByTier = (tier: string) => {
    return achievementsWithProgress.filter(a => a.tier === tier);
  };

  // Get unlocked count
  const unlockedCount = userAchievements.filter(ua => ua.unlocked).length;
  const totalCount = achievements.length;

  return {
    achievements: achievementsWithProgress,
    loading: loadingAchievements || loadingUserAchievements,
    getAchievementsByTier,
    unlockedCount,
    totalCount,
    playUnlockSound: () => playSound("achievement")
  };
};
