import React, { useState } from "react";
import { useAchievements } from "@/hooks/useAchievements";
import AchievementCard from "@/components/achievements/AchievementCard";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { themeConfig } from "@/lib/themeConfig";

const Achievements = () => {
  const { achievements, loading, unlockedCount, totalCount } = useAchievements();
  const { playSound } = useSoundEffects();
  const [activeTab, setActiveTab] = useState("all");
  
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    playSound("click");
  };
  
  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === "all") return true;
    return achievement.tier === activeTab;
  });
  
  return (
    <div>
      <section className="mb-12">
        <div className="bg-space-mid rounded-lg p-6 pixel-border relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="font-pixel text-xl md:text-2xl text-brand-orange mb-2">ACHIEVEMENTS</h1>
              <p className="text-brand-light/80 mb-4">Track your progress and earn badges of honor</p>
            </div>
            
            <div className="text-sm text-brand-light/70">
              <span>Unlocked: </span>
              <span className="text-brand-orange font-bold">{unlockedCount}/{totalCount}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Achievement Progress</span>
              <span>{Math.round((unlockedCount / totalCount) * 100)}%</span>
            </div>
            <Progress 
              value={(unlockedCount / totalCount) * 100} 
              className="h-2 bg-space-dark"
              indicatorClassName="bg-gradient-to-r from-brand-orange to-brand-yellow"
            />
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-brand-orange/10 blur-3xl"></div>
          <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-brand-yellow/10 blur-3xl"></div>
        </div>
      </section>
      
      {/* Achievements Container */}
      <section>
        <div className="bg-space-mid rounded-lg p-6 pixel-border">
          {/* Achievement Tabs */}
          <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
            <Button
              onClick={() => handleTabClick("all")}
              className={activeTab === "all" 
                ? "bg-brand-orange/20 text-brand-orange hover:bg-brand-orange/30" 
                : "bg-transparent hover:bg-space-light text-brand-light"
              }
              variant="ghost"
            >
              All Tiers
            </Button>
            
            {themeConfig.achievementTiers.map((tier) => (
              <Button
                key={tier.id}
                onClick={() => handleTabClick(tier.id)}
                className={activeTab === tier.id
                  ? "bg-brand-orange/20 text-brand-orange hover:bg-brand-orange/30" 
                  : "bg-transparent hover:bg-space-light text-brand-light"
                }
                variant="ghost"
              >
                <i className="fas fa-award text-xs mr-2"></i>
                <span>{tier.name}</span>
              </Button>
            ))}
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAchievements.length > 0 ? (
                filteredAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    id={achievement.id}
                    name={achievement.name}
                    description={achievement.description}
                    icon={achievement.icon}
                    tier={achievement.tier}
                    unlocked={achievement.unlocked}
                    progress={achievement.progress}
                    total={achievement.total}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-brand-light/50">
                  No achievements found in this category
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Achievements;
