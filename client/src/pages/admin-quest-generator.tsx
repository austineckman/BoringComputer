import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import PixelLoader from "@/components/ui/pixel-loader";
import {
  Loader2,
  Save,
  Wand2,
  Sparkles,
  Brain,
  Image as ImageIcon,
  MessageSquarePlus,
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

// Types for the quest generator interface
interface Component {
  id: number;
  name: string;
  description: string;
  kitId?: string;
}

interface Kit {
  id: string;
  name: string;
  description: string;
  components: Component[];
}

interface QuestGenRequest {
  kitId: string;
  theme?: string;
  missionKeywords?: string;
  difficulty?: number;
  includeImage?: boolean;
}

interface GeneratedQuest {
  title: string;
  description: string;
  imageUrl?: string;
  components: string[];
  xpReward: number;
  lootSuggestion: string;
  adventureLine?: string;
}

const difficultyLabels: Record<number, string> = {
  1: "Very Easy",
  2: "Easy",
  3: "Medium",
  4: "Hard",
  5: "Very Hard",
};

const AdminQuestGenerator = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState("configure");
  
  // Form state
  const [selectedKit, setSelectedKit] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const [missionKeywords, setMissionKeywords] = useState<string>("");
  const [difficulty, setDifficulty] = useState<number>(3);
  const [includeImage, setIncludeImage] = useState<boolean>(true);
  const [adventureLine, setAdventureLine] = useState<string>("");

  // Result state
  const [generatedQuest, setGeneratedQuest] = useState<GeneratedQuest | null>(null);
  const [editedQuest, setEditedQuest] = useState<GeneratedQuest | null>(null);
  
  // Fetch kits data
  const { data: kits, isLoading: isLoadingKits } = useQuery<Kit[]>({
    queryKey: ['/api/admin/kits'],
    staleTime: 60000, // 1 minute
  });

  // Fetch adventure lines for dropdown
  const { data: adventureLines } = useQuery<{id: string, name: string}[]>({
    queryKey: ['/api/adventure-lines'],
    staleTime: 60000, // 1 minute
  });
  
  // Generate quest mutation
  const generateQuestMutation = useMutation({
    mutationFn: async (request: QuestGenRequest) => {
      const response = await apiRequest('POST', '/api/admin/generate-quest', request);
      return await response.json();
    },
    onSuccess: (data: GeneratedQuest) => {
      setGeneratedQuest(data);
      setEditedQuest(data);
      setTab("preview");
      toast({
        title: "Quest Generated!",
        description: "Your quest has been successfully created.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "There was an error generating your quest.",
        variant: "destructive",
      });
    }
  });

  // Save quest mutation
  const saveQuestMutation = useMutation({
    mutationFn: async (quest: GeneratedQuest & { kitId: string }) => {
      const response = await apiRequest('POST', '/api/admin/quests', quest);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quest Saved!",
        description: "Your quest has been saved to the database.",
        variant: "default",
      });
      // Reset the form
      setSelectedKit("");
      setTheme("");
      setMissionKeywords("");
      setDifficulty(3);
      setGeneratedQuest(null);
      setEditedQuest(null);
      setTab("configure");
      
      // Invalidate quests cache
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message || "There was an error saving your quest.",
        variant: "destructive",
      });
    }
  });

  // Update edited quest when generated quest changes
  useEffect(() => {
    if (generatedQuest) {
      setEditedQuest(generatedQuest);
    }
  }, [generatedQuest]);
  
  // Handle generate button click
  const handleGenerate = () => {
    if (!selectedKit) {
      toast({
        title: "Kit Required",
        description: "Please select a kit to generate a quest.",
        variant: "destructive",
      });
      return;
    }
    
    generateQuestMutation.mutate({
      kitId: selectedKit,
      theme: theme || undefined,
      missionKeywords: missionKeywords || undefined,
      difficulty,
      includeImage
    });
  };
  
  // Handle save button click
  const handleSave = () => {
    if (!editedQuest || !selectedKit) return;
    
    saveQuestMutation.mutate({
      ...editedQuest,
      kitId: selectedKit,
      adventureLine: adventureLine || undefined
    });
  };
  
  // Find selected kit details
  const selectedKitDetails = kits?.find(kit => kit.id === selectedKit);

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold text-brand-orange mb-6">GPT-4 Quest Generator</h1>
        
        <Tabs value={tab} onValueChange={setTab} className="mb-8">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="configure">
              <ShieldAlert className="w-4 h-4 mr-2" />
              Configure
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedQuest}>
              <MessageSquarePlus className="w-4 h-4 mr-2" />
              Preview & Edit
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="configure">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quest Parameters</CardTitle>
                  <CardDescription>
                    Configure the parameters for your generated quest
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="kit">Component Kit (Required)</Label>
                    <Select 
                      value={selectedKit} 
                      onValueChange={setSelectedKit}
                      disabled={isLoadingKits || generateQuestMutation.isPending}
                    >
                      <SelectTrigger id="kit">
                        <SelectValue placeholder="Select a kit" />
                      </SelectTrigger>
                      <SelectContent>
                        {kits?.map(kit => (
                          <SelectItem key={kit.id} value={kit.id}>
                            {kit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme (Optional)</Label>
                    <Input
                      id="theme"
                      placeholder="e.g. Steampunk, Space, Medieval"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      disabled={generateQuestMutation.isPending}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Mission Keywords (Optional)</Label>
                    <Input
                      id="keywords"
                      placeholder="e.g. rescue, escape, explore"
                      value={missionKeywords}
                      onChange={(e) => setMissionKeywords(e.target.value)}
                      disabled={generateQuestMutation.isPending}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <span className="text-sm text-brand-light">{difficultyLabels[difficulty]}</span>
                    </div>
                    <Slider
                      id="difficulty"
                      min={1}
                      max={5}
                      step={1}
                      value={[difficulty]}
                      onValueChange={(values) => setDifficulty(values[0])}
                      disabled={generateQuestMutation.isPending}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="includeImage"
                      checked={includeImage}
                      onCheckedChange={(checked) => 
                        setIncludeImage(checked as boolean)
                      }
                      disabled={generateQuestMutation.isPending}
                    />
                    <Label
                      htmlFor="includeImage"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Generate Hero Image (Pixel Art Style)
                    </Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleGenerate}
                    disabled={!selectedKit || generateQuestMutation.isPending}
                    className="w-full"
                  >
                    {generateQuestMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Quest
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Kit Components</CardTitle>
                  <CardDescription>
                    Components that will be used in quest generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingKits ? (
                    <div className="flex justify-center py-8">
                      <PixelLoader size="md" />
                    </div>
                  ) : !selectedKitDetails ? (
                    <div className="text-center py-8 text-brand-light/60">
                      <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a kit to view its components</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-brand-orange mb-1">
                          {selectedKitDetails.name}
                        </h3>
                        <p className="text-sm text-brand-light/80">
                          {selectedKitDetails.description}
                        </p>
                      </div>
                      
                      <ScrollArea className="h-[300px] rounded border border-brand-orange/20 p-4">
                        <div className="space-y-4">
                          {selectedKitDetails.components.map((component) => (
                            <div
                              key={component.id}
                              className="p-3 rounded bg-space-mid border border-brand-orange/10"
                            >
                              <h4 className="font-medium text-brand-light">
                                {component.name}
                              </h4>
                              <p className="text-xs text-brand-light/70 mt-1">
                                {component.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            {!editedQuest ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-brand-light/50" />
                <h3 className="text-lg font-medium text-brand-orange mb-2">No Quest Generated</h3>
                <p className="text-brand-light/70 mb-4">
                  Configure and generate a quest first.
                </p>
                <Button variant="outline" onClick={() => setTab("configure")}>
                  Back to Configure
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Quest</CardTitle>
                    <CardDescription>
                      Make changes to the generated quest before saving
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="quest-title">Quest Title</Label>
                      <Input
                        id="quest-title"
                        value={editedQuest.title}
                        onChange={(e) =>
                          setEditedQuest({
                            ...editedQuest,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quest-description">Quest Description</Label>
                      <Textarea
                        id="quest-description"
                        rows={6}
                        value={editedQuest.description}
                        onChange={(e) =>
                          setEditedQuest({
                            ...editedQuest,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adventure-line">Adventure Line</Label>
                      <Select 
                        value={adventureLine} 
                        onValueChange={setAdventureLine}
                      >
                        <SelectTrigger id="adventure-line">
                          <SelectValue placeholder="Select adventure line" />
                        </SelectTrigger>
                        <SelectContent>
                          {adventureLines?.map(line => (
                            <SelectItem key={line.id} value={line.id}>
                              {line.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="xp-reward">XP Reward</Label>
                      <Input
                        id="xp-reward"
                        type="number"
                        value={editedQuest.xpReward}
                        onChange={(e) =>
                          setEditedQuest({
                            ...editedQuest,
                            xpReward: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="loot-suggestion">Loot Suggestion</Label>
                      <Input
                        id="loot-suggestion"
                        value={editedQuest.lootSuggestion}
                        onChange={(e) =>
                          setEditedQuest({
                            ...editedQuest,
                            lootSuggestion: e.target.value,
                          })
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Required Components</Label>
                      <div className="flex flex-wrap gap-2 p-3 rounded bg-space-dark/50 min-h-[100px]">
                        {editedQuest.components.map((component, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-space-mid text-brand-light"
                          >
                            {component}
                            <button
                              className="ml-1 text-brand-light/70 hover:text-brand-light"
                              onClick={() => {
                                const updatedComponents = [...editedQuest.components];
                                updatedComponents.splice(index, 1);
                                setEditedQuest({
                                  ...editedQuest,
                                  components: updatedComponents,
                                });
                              }}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Reset edits to original generated quest
                        if (generatedQuest) {
                          setEditedQuest(generatedQuest);
                        }
                      }}
                      disabled={saveQuestMutation.isPending}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" /> Reset
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saveQuestMutation.isPending || !adventureLine}
                    >
                      {saveQuestMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Quest
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Quest Preview</CardTitle>
                    <CardDescription>
                      Preview how your quest will appear
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 rounded-lg border border-brand-orange/20 bg-space-mid">
                      <div className="mb-4">
                        {editedQuest.imageUrl ? (
                          <div className="mb-4 rounded-lg overflow-hidden w-full aspect-square bg-space-dark">
                            <img
                              src={editedQuest.imageUrl}
                              alt="Quest Hero"
                              className="w-full h-full object-cover"
                              style={{ imageRendering: "pixelated" }}
                            />
                          </div>
                        ) : (
                          <div className="mb-4 rounded-lg bg-space-dark w-full aspect-square flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-brand-light/30" />
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-brand-orange mb-2">
                        {editedQuest.title}
                      </h3>
                      
                      <div className="text-sm text-brand-light mb-4 space-y-2 whitespace-pre-line">
                        {editedQuest.description}
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-brand-yellow mb-2">
                          Required Components:
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {editedQuest.components.map((component, index) => (
                            <Badge
                              key={index}
                              className="bg-brand-orange/10 border-brand-orange/40 text-brand-light"
                            >
                              {component}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        <div className="flex items-center">
                          <Sparkles className="h-4 w-4 mr-1 text-brand-yellow" />
                          <span>
                            <span className="text-brand-yellow">{editedQuest.xpReward}</span>{" "}
                            <span className="text-brand-light/70">XP</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <Brain className="h-4 w-4 mr-1 text-brand-orange" />
                          <span className="text-brand-light/70">
                            Loot: {editedQuest.lootSuggestion}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminQuestGenerator;