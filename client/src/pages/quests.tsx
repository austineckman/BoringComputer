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
  
  // Filter quests by adventure kit and status
  const filteredQuests = quests.filter(quest => {
    if (filter === "all") return true;
    return quest.adventureKit === filter;
  });
  
  // Group by status
  const activeQuests = filteredQuests.filter(q => q.status === "active");
  const availableQuests = filteredQuests.filter(q => q.status === "available");
  const completedQuests = filteredQuests.filter(q => q.status === "completed");
  const upcomingQuests = filteredQuests.filter(q => q.status === "upcoming" || q.status === "locked");
  
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
  
  return (
    <div>
      <section className="mb-12">
        <div className="bg-space-mid rounded-lg p-6 pixel-border relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="font-pixel text-xl md:text-2xl text-brand-orange mb-2">AVAILABLE QUESTS</h1>
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
                  <SelectValue placeholder="All Adventure Kits" />
                </SelectTrigger>
                <SelectContent className="bg-space-dark border-brand-orange/30">
                  <SelectItem value="all">All Adventure Kits</SelectItem>
                  {themeConfig.adventureKits.map((kit) => (
                    <SelectItem key={kit.id} value={kit.id}>{kit.name}</SelectItem>
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
                    kitRequired={quest.kitRequired}
                    difficulty={quest.difficulty}
                    rewards={quest.rewards}
                    status={quest.status}
                    adventureKit={quest.adventureKit}
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
                    kitRequired={quest.kitRequired}
                    difficulty={quest.difficulty}
                    rewards={quest.rewards}
                    status={quest.status}
                    adventureKit={quest.adventureKit}
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
                    kitRequired={quest.kitRequired}
                    difficulty={quest.difficulty}
                    rewards={quest.rewards}
                    status={quest.status}
                    adventureKit={quest.adventureKit}
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
                    kitRequired={quest.kitRequired}
                    difficulty={quest.difficulty}
                    rewards={quest.rewards}
                    status={quest.status}
                    adventureKit={quest.adventureKit}
                  />
                ))}
              </div>
            </section>
          )}
          
          {/* No quests message */}
          {filteredQuests.length === 0 && (
            <div className="text-center py-10 bg-space-dark rounded-lg">
              <p className="text-brand-light/70 mb-4">No quests found for the selected filter.</p>
              <Button 
                onClick={() => {
                  setFilter("all");
                  playSound("click");
                }}
                className="bg-brand-orange hover:bg-brand-yellow text-space-darkest"
              >
                Show All Quests
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
