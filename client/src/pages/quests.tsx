import React, { useState } from "react";
import { useQuests } from "@/hooks/useQuests";
import QuestCard from "@/components/quest/QuestCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import PixelButton from "@/components/ui/pixel-button";
import { themeConfig } from "@/lib/themeConfig";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import AdventureImage from "@/components/adventure/AdventureImage";
import { Link } from "wouter";

const Quests = () => {
  const { quests, activeQuest, loading, startQuest, completeQuest, isStarting, isCompleting } = useQuests();
  const { toast } = useToast();
  const { sounds } = useSoundEffects();
  
  const playSound = (type: string) => {
    try {
      if (type === "click" && sounds.click) {
        sounds.click();
      } else if (type === "error" && sounds.error) {
        sounds.error();
      } else if (type === "success" && sounds.success) {
        sounds.success();
      } else if (type === "questStart" && sounds.questStart) {
        sounds.questStart();
      } else if (type === "questComplete" && sounds.questComplete) {
        sounds.questComplete();
      } else if (type === "reward" && sounds.reward) {
        sounds.reward();
      }
    } catch (e) {
      console.warn(`Could not play ${type} sound`, e);
    }
  };
  
  const [filter, setFilter] = useState("all");
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submission, setSubmission] = useState("");
  const [image, setImage] = useState<string | null>(null);
  
  // Filter quests by adventure line and status
  const filteredQuests = quests.filter(quest => {
    if (filter === "all") return true;
    return quest.adventureLine === filter;
  });
  
  // Group by status
  const activeQuests = filteredQuests.filter(q => q.status === "active");
  const availableQuests = filteredQuests.filter(q => q.status === "available");
  const completedQuests = filteredQuests.filter(q => q.status === "completed");
  const upcomingQuests = filteredQuests.filter(q => q.status === "upcoming" || q.status === "locked");
  
  // Group quests by adventure line
  const questsByAdventureLine = new Map<string, typeof quests>();
  quests.forEach(quest => {
    if (!questsByAdventureLine.has(quest.adventureLine)) {
      questsByAdventureLine.set(quest.adventureLine, []);
    }
    questsByAdventureLine.get(quest.adventureLine)?.push(quest);
  });
  
  // Get adventure lines from theme config
  const adventureLines = themeConfig.adventureLines;
  
  const handleStartQuest = (questId: string) => {
    playSound("click");
    startQuest(questId);
    setSelectedQuestId(questId);
  };
  
  const handleContinueQuest = (questId: string) => {
    playSound("click");
    setSelectedQuestId(questId);
    setShowSubmitDialog(true);
  };
  
  const handleSubmitQuest = () => {
    if (!selectedQuestId) return;
    
    if (!submission.trim()) {
      toast({
        title: "Submission Required",
        description: "Please describe how you completed the challenge",
        variant: "destructive",
      });
      return;
    }
    
    completeQuest({
      questId: selectedQuestId,
      submission,
      image: image
    });
    
    setShowSubmitDialog(false);
    setSubmission("");
    setImage(null);
    playSound("reward");
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const navigateToAdventureLine = (adventureLineId: string) => {
    playSound("click");
    setFilter(adventureLineId);
  };
  
  return (
    <div>
      <section className="mb-12">
        <div className="bg-space-mid rounded-lg p-6 pixel-border relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="font-pixel text-xl md:text-2xl text-brand-orange mb-2">QUEST ADVENTURES</h1>
              <p className="text-brand-light/80">Choose your next adventure from our collection of quests</p>
            </div>
            
            <div className="flex space-x-2 mt-4 md:mt-0">
              <Select 
                value={filter} 
                onValueChange={(value) => {
                  setFilter(value);
                  playSound("click");
                }}
              >
                <SelectTrigger className="w-[180px] bg-space-dark border-brand-orange/30">
                  <SelectValue placeholder="All Adventures" />
                </SelectTrigger>
                <SelectContent className="bg-space-dark border-brand-orange/30">
                  <SelectItem value="all">All Adventures</SelectItem>
                  {adventureLines.map((adventure) => (
                    <SelectItem key={adventure.id} value={adventure.id}>{adventure.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-brand-orange/10 blur-3xl"></div>
          <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-brand-yellow/10 blur-3xl"></div>
        </div>
      </section>
      
      {/* Adventure Lines Display */}
      <section className="mb-12">
        <h2 className="font-pixel text-lg text-brand-light mb-4">ADVENTURE LINES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {adventureLines.map((adventure) => (
            <div 
              key={adventure.id}
              className="bg-space-mid rounded-lg overflow-hidden cursor-pointer hover:bg-space-light transition-colors duration-300 pixel-border-sm"
              style={{ 
                boxShadow: `0 0 15px ${adventure.color}22`,
                borderColor: adventure.color
              }}
              onClick={() => navigateToAdventureLine(adventure.id)}
              onMouseEnter={() => sounds.hover()}
            >
              {/* Image container */}
              <div className="h-40 w-full overflow-hidden">
                <AdventureImage 
                  adventureId={adventure.id}
                  alt={adventure.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content area */}
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${adventure.color}22`, color: adventure.color }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        adventure.icon === 'rocket' ? 'M13 10V3L4 14h7v7l9-11h-7z' :
                        adventure.icon === 'cogs' ? 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' :
                        adventure.icon === 'box' ? 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' :
                        adventure.icon === 'lightbulb' ? 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' :
                        'M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64'
                      } />
                    </svg>
                  </div>
                  <h3 className="font-medium text-brand-light">{adventure.name}</h3>
                </div>
                <div className="mt-2 text-xs text-brand-light/70">
                  {adventure.id === 'lost-in-space' ? 'Survive 30 days stranded in space' :
                   adventure.id === 'cogsworth-city' ? 'Unravel the mysteries of a mechanical metropolis' :
                   adventure.id === 'pandoras-box' ? 'Contain the chaos of an ancient artifact' :
                   adventure.id === 'neon-realm' ? 'Navigate the digital world of light and energy' :
                   'Chart a course through dangerous stellar phenomena'}
                </div>
                
                {/* Quest Count */}
                <div className="mt-2 text-xs">
                  <span className="bg-space-dark text-brand-orange px-2 py-1 rounded-full">
                    {/* Check both by ID and by name to handle older quests */}
                    {(questsByAdventureLine.get(adventure.id)?.length || 
                      questsByAdventureLine.get(adventure.name)?.length || 0)} Quests
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Active Quests */}
          {activeQuests.length > 0 && (
            <section>
              <h2 className="font-pixel text-lg text-brand-light mb-4">ACTIVE QUESTS</h2>
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
                    onContinue={() => handleContinueQuest(quest.id)}
                  />
                ))}
              </div>
            </section>
          )}
          
          {/* Available Quests */}
          {availableQuests.length > 0 && (
            <section>
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
                    onStart={() => handleStartQuest(quest.id)}
                  />
                ))}
              </div>
            </section>
          )}
          
          {/* Completed Quests */}
          {completedQuests.length > 0 && (
            <section>
              <h2 className="font-pixel text-lg text-brand-light mb-4">COMPLETED QUESTS</h2>
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
          
          {/* Upcoming Quests */}
          {upcomingQuests.length > 0 && (
            <section>
              <h2 className="font-pixel text-lg text-brand-light mb-4">UPCOMING QUESTS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingQuests.slice(0, 3).map((quest) => (
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
          {filteredQuests.length === 0 && (
            <div className="text-center py-10 bg-space-dark rounded-lg">
              <p className="text-brand-light/70 mb-4">No quests found for the selected adventure line.</p>
              <Button 
                onClick={() => {
                  setFilter("all");
                  playSound("click");
                }}
                className="bg-brand-orange hover:bg-brand-yellow text-space-darkest"
              >
                Show All Adventures
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Submit Quest Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="bg-space-dark border-brand-orange/30">
          <DialogHeader>
            <DialogTitle className="font-pixel text-brand-orange">SUBMIT QUEST</DialogTitle>
            <DialogDescription>
              Describe how you completed the challenge. You can also attach an image of your build.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              placeholder="I solved this challenge by..."
              className="min-h-[120px] bg-space-mid border-brand-orange/30"
            />
            
            <div className="space-y-2">
              <label className="text-sm text-brand-light/70">Attach an image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full bg-space-mid rounded p-2 text-sm text-brand-light/70"
              />
              {image && (
                <div className="mt-2">
                  <img src={image} alt="Preview" className="max-h-[100px] rounded" />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowSubmitDialog(false);
                playSound("click");
              }}
              className="border-brand-orange/30 text-brand-light"
            >
              Cancel
            </Button>
            <PixelButton
              onClick={handleSubmitQuest}
              disabled={isCompleting || !submission.trim()}
            >
              {isCompleting ? "Submitting..." : "Submit Quest"}
            </PixelButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quests;
