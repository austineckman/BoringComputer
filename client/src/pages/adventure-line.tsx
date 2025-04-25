import { useState, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useQuests } from "@/hooks/useQuests";
import QuestCard from "@/components/quest/QuestCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, MapPin, Lock, Calendar, Star, Award } from "lucide-react";
import { themeConfig } from "@/lib/themeConfig";

const AdventureLine = () => {
  const [, params] = useRoute("/adventure/:id");
  const [, navigate] = useLocation();
  const { quests, loading } = useQuests();
  const { toast } = useToast();
  const { sounds } = useSoundEffects();
  
  // Get the adventure ID from the URL params
  const adventureId = params?.id;
  
  // Find the adventure config from theme config
  const adventureConfig = themeConfig.adventureLines.find(
    (adventure) => adventure.id === adventureId
  );
  
  // Filter quests by this adventure line
  const adventureQuests = quests.filter(
    (quest) => quest.adventureLine === adventureId || quest.adventureLine === adventureConfig?.name
  );
  
  // Sort quests by their order in the adventure line
  const sortedQuests = [...adventureQuests].sort((a, b) => 
    (a.orderInLine || 999) - (b.orderInLine || 999)
  );

  // Group quests by status
  const activeQuests = sortedQuests.filter(q => q.status === "active");
  const availableQuests = sortedQuests.filter(q => q.status === "available");
  const completedQuests = sortedQuests.filter(q => q.status === "completed");
  const upcomingQuests = sortedQuests.filter(q => q.status === "upcoming" || q.status === "locked");
  
  // Handle navigation back to main quests page
  const handleBackClick = () => {
    try {
      sounds.click?.();
    } catch (e) {
      console.warn('Could not play click sound', e);
    }
    navigate("/quests");
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!adventureConfig) {
    return (
      <div className="container mx-auto p-6">
        <Button 
          onClick={handleBackClick}
          variant="outline" 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Quests
        </Button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-brand-orange mb-4">Adventure Line Not Found</h2>
          <p className="text-brand-light mb-6">The adventure line you're looking for doesn't exist or has been moved.</p>
          <Button onClick={handleBackClick}>Return to Quest Hub</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      {/* Back button and header */}
      <div className="flex items-center mb-6">
        <Button 
          onClick={handleBackClick}
          variant="outline" 
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        
        <h1 className="text-2xl font-bold text-brand-orange">{adventureConfig.name}</h1>
        
        <Badge 
          variant="outline" 
          className="ml-3 bg-space-mid border-brand-orange/50 text-brand-light"
        >
          {adventureConfig.difficulty || "Mixed"}
        </Badge>
      </div>
      
      {/* Adventure description */}
      <div className="bg-space-mid rounded-lg p-4 mb-8 border border-brand-orange/30">
        <div className="flex items-start">
          {adventureConfig.image && (
            <img 
              src={adventureConfig.image} 
              alt={adventureConfig.name} 
              className="w-20 h-20 object-cover rounded-md mr-4"
              style={{ imageRendering: 'pixelated' }}
            />
          )}
          <div>
            <div className="flex items-center mb-2">
              <MapPin className="h-4 w-4 text-brand-orange mr-2" />
              <span className="text-sm text-brand-light">{adventureConfig.location || "Unknown Location"}</span>
            </div>
            <p className="text-brand-light text-sm mb-3">{adventureConfig.description || "No description available."}</p>
            <div className="flex items-center gap-3 text-xs text-brand-light/70">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{sortedQuests.length} Quests</span>
              </div>
              <div className="flex items-center">
                <Star className="h-3 w-3 mr-1" />
                <span>{adventureConfig.difficulty || "Mixed"} Difficulty</span>
              </div>
              <div className="flex items-center">
                <Award className="h-3 w-3 mr-1" />
                <span>{completedQuests.length}/{sortedQuests.length} Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <section className="mb-8">
          <h2 className="font-pixel text-lg text-brand-yellow mb-4">ACTIVE QUESTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                id={quest.id}
                title={quest.title}
                description={quest.description}
                adventureLine={quest.adventureLine}
                difficulty={quest.difficulty}
                rewards={quest.rewards}
                status={quest.status}
                orderInLine={quest.orderInLine}
                xpReward={quest.xpReward}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Available Quests */}
      {availableQuests.length > 0 && (
        <section className="mb-8">
          <h2 className="font-pixel text-lg text-brand-light mb-4">AVAILABLE QUESTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                id={quest.id}
                title={quest.title}
                description={quest.description}
                adventureLine={quest.adventureLine}
                difficulty={quest.difficulty}
                rewards={quest.rewards}
                status={quest.status}
                orderInLine={quest.orderInLine}
                xpReward={quest.xpReward}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <section className="mb-8">
          <h2 className="font-pixel text-lg text-brand-light/80 mb-4">COMPLETED QUESTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                id={quest.id}
                title={quest.title}
                description={quest.description}
                adventureLine={quest.adventureLine}
                difficulty={quest.difficulty}
                rewards={quest.rewards}
                status={quest.status}
                orderInLine={quest.orderInLine}
                xpReward={quest.xpReward}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Upcoming/Locked Quests */}
      {upcomingQuests.length > 0 && (
        <section>
          <h2 className="font-pixel text-lg text-brand-light/70 flex items-center mb-4">
            <Lock className="h-4 w-4 mr-2 opacity-70" />
            LOCKED QUESTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                id={quest.id}
                title={quest.title}
                description={quest.description}
                adventureLine={quest.adventureLine}
                difficulty={quest.difficulty}
                rewards={quest.rewards}
                status={quest.status}
                orderInLine={quest.orderInLine}
                xpReward={quest.xpReward}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* No quests message */}
      {sortedQuests.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-lg font-bold text-brand-orange mb-2">No Quests Found</h2>
          <p className="text-brand-light mb-6">This adventure line doesn't have any quests yet.</p>
        </div>
      )}
    </div>
  );
};

export default AdventureLine;