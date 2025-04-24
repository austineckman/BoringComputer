import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { Loader2, Edit, Save, Plus, Trash, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { themeConfig } from '@/lib/themeConfig';
import MainLayout from '@/components/layout/MainLayout';
import { queryClient } from '@/lib/queryClient';

// YouTube embed component
const YouTubeEmbed = ({ videoId }: { videoId: string }) => {
  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden mb-4">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

// Image display component
const ImageDisplay = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <div className="mb-4">
      <img src={src} alt={alt} className="w-full rounded-lg" />
    </div>
  );
};

// Code block component
const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  return (
    <div className="mb-4">
      <div className="bg-gray-800 text-gray-200 rounded-t-lg px-4 py-2 text-sm font-mono">
        {language}
      </div>
      <pre className="bg-gray-900 text-gray-200 p-4 rounded-b-lg overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Main quest detail page
export default function QuestDetailPage() {
  // Get quest ID from URL parameters
  const params = useParams();
  const questId = params.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { sounds } = useSoundEffects();

  // States for showing/hiding content - now default to show
  const [showVideos, setShowVideos] = useState(true);
  const [showImages, setShowImages] = useState(true);
  const [showCode, setShowCode] = useState(true);

  // Auth state to check if user is admin
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('admin');
  
  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuest, setEditedQuest] = useState<any>(null);
  
  // Fetch quest details
  const { data: quest, isLoading, refetch } = useQuery({
    queryKey: ['/api/quests', questId],
    queryFn: () => fetch(`/api/quests/${questId}`).then(res => res.json()),
    enabled: !!questId,
  });
  
  // Fetch items for reward selection and display
  const itemsQuery = useQuery({
    queryKey: ['/api/admin/items'],
    enabled: !!questId, // Only fetch when we have a quest ID
  });
  
  // Fetch loot boxes for reward display
  const lootBoxesQuery = useQuery({
    queryKey: ['/api/admin/lootboxes'],
    enabled: !!questId, // Only fetch when we have a quest ID
  });
  
  // Fetch kits for kit details display
  const kitsQuery = useQuery({
    queryKey: ['/api/admin/kits'],
    enabled: !!questId, // Only fetch when we have a quest ID
  });
  
  // Start editing mode
  const handleStartEdit = () => {
    // Initialize content fields if not present
    const contentInit = quest.content || { videos: [], images: [], codeBlocks: [] };
    setEditedQuest({
      ...quest,
      content: contentInit
    });
    setIsEditing(true);
    sounds.click?.();
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedQuest(null);
    sounds.click?.();
  };
  
  // Update quest mutation
  const updateQuestMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const response = await fetch(`/api/quests/${questId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update quest');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Force refetch the quest data to get the latest updates including images
      refetch();
      
      // Invalidate the quest in the cache to ensure it's fresh everywhere
      queryClient.invalidateQueries({ queryKey: ['/api/quests', questId] });
      
      // Also invalidate the quest list to update any cards on the home page
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      
      setIsEditing(false);
      setEditedQuest(null);
      toast({
        title: "Quest Updated",
        description: "The quest has been successfully updated",
        variant: "default",
      });
      sounds.success?.();
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
      sounds.error?.();
    },
  });

  // Handle quest completion
  const handleCompleteQuest = async () => {
    try {
      sounds.questComplete();
      const res = await fetch(`/api/quests/${questId}/complete`, {
        method: 'POST',
      });
      
      if (res.ok) {
        const responseData = await res.json();
        
        // Extract reward information
        const { rewards, lootBoxRewards, xpGained, newLevel } = responseData;
        
        let rewardMessage = `You've earned ${xpGained} XP`;
        
        // Check if user leveled up
        if (newLevel) {
          rewardMessage += ` and reached level ${newLevel}!`;
        } else {
          rewardMessage += "!";
        }
        
        // Add reward info to message
        const hasRewards = (rewards && rewards.length > 0) || 
                          (lootBoxRewards && lootBoxRewards.length > 0);
        
        if (hasRewards) {
          rewardMessage += " Rewards have been added to your inventory.";
        }
        
        toast({
          title: "Quest Completed!",
          description: rewardMessage,
          variant: "default",
        });
        
        // Invalidate inventory queries to refresh with new rewards
        queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
        queryClient.invalidateQueries({ queryKey: ['/api/loot-boxes'] });
        
        // Navigate back to quests page
        setTimeout(() => navigate('/quests'), 2000);
      } else {
        // Try to parse error message
        try {
          const errorData = await res.json();
          toast({
            title: "Error",
            description: errorData.message || "Could not complete the quest.",
            variant: "destructive",
          });
        } catch {
          toast({
            title: "Error",
            description: "Could not complete the quest.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    }
  };

  // Toggle content visibility
  const toggleVideos = () => {
    sounds.click();
    setShowVideos(!showVideos);
  };

  const toggleImages = () => {
    sounds.click();
    setShowImages(!showImages);
  };

  const toggleCode = () => {
    sounds.click();
    setShowCode(!showCode);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Quest Not Found</h2>
          <p className="mb-4">The quest you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/quests')} onMouseEnter={sounds.hover}>
            Return to Quests
          </Button>
        </Card>
      </div>
    );
  }

  // Extract content from quest data (or use placeholders for now)
  const videos = quest.content?.videos || [];
  const images = quest.content?.images || [];
  const codeBlocks = quest.content?.codeBlocks || [];

  return (
      <div className="container mx-auto px-4 py-8">
        {/* Hero Image Display */}
        {quest.heroImage && (
          <div className="w-full mb-8 rounded-lg overflow-hidden shadow-lg">
            <img 
              src={quest.heroImage} 
              alt={quest.title}
              className="w-full h-auto max-h-[300px] object-cover object-center"
            />
          </div>
        )}
        
        {/* Fallback to content images if no hero image */}
        {!quest.heroImage && images.length > 0 && (
          <div className="w-full mb-8 rounded-lg overflow-hidden shadow-lg">
            <img 
              src={images[0]} 
              alt={quest.title}
              className="w-full h-auto max-h-[300px] object-cover object-center"
            />
          </div>
        )}
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          {/* Main content */}
          <div className="w-full md:w-2/3">
            <div className="mb-6">
              {/* Admin Edit Button */}
              {isAdmin && (
                <div className="flex justify-end mb-2">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleCancelEdit}
                        onMouseEnter={() => sounds.hover?.()}
                        className="border-red-500/30 text-red-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button 
                        onClick={() => updateQuestMutation.mutate(editedQuest)}
                        onMouseEnter={() => sounds.hover?.()}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={updateQuestMutation.isPending}
                      >
                        {updateQuestMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" /> Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              )}
              
              {isEditing ? (
                /* Editing Form */
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                    <Input 
                      value={editedQuest.title}
                      onChange={(e) => setEditedQuest({...editedQuest, title: e.target.value})}
                      className="bg-space-dark border-brand-orange/30 text-white font-medium placeholder:text-gray-500"
                    />
                  </div>
                  
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Adventure Line</label>
                      <select
                        value={editedQuest.adventureLine}
                        onChange={(e) => setEditedQuest({...editedQuest, adventureLine: e.target.value})}
                        className="w-full px-3 py-2 rounded-md bg-space-dark border border-brand-orange/30 text-white font-medium"
                      >
                        {themeConfig.adventureLines.map((line) => (
                          <option key={line.id} value={line.id}>{line.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Difficulty (1-5)</label>
                      <select
                        value={editedQuest.difficulty}
                        onChange={(e) => setEditedQuest({...editedQuest, difficulty: Number(e.target.value)})}
                        className="w-full px-3 py-2 rounded-md bg-space-dark border border-brand-orange/30 text-white font-medium"
                      >
                        {[1, 2, 3, 4, 5].map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                    <Textarea 
                      value={editedQuest.description}
                      onChange={(e) => setEditedQuest({...editedQuest, description: e.target.value})}
                      className="bg-space-dark border-brand-orange/30 min-h-[100px] text-white font-medium placeholder:text-gray-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-1">XP Reward</label>
                    <Input 
                      type="number"
                      value={editedQuest.xpReward}
                      onChange={(e) => setEditedQuest({...editedQuest, xpReward: Number(e.target.value)})}
                      className="bg-space-dark border-brand-orange/30 text-white font-medium placeholder:text-gray-500"
                    />
                  </div>
                  
                  {/* Content Editing Sections */}
                  <div className="border border-brand-orange/20 rounded-md p-4 space-y-4 mt-6">
                    <h3 className="text-lg font-semibold border-b border-brand-orange/20 pb-2">Quest Content</h3>
                    
                    {/* YouTube Videos Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-400">YouTube Videos</label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const content = editedQuest.content || { videos: [], images: [], codeBlocks: [] };
                            setEditedQuest({
                              ...editedQuest,
                              content: {
                                ...content,
                                videos: [...(content.videos || []), ""]
                              }
                            });
                          }}
                          className="h-8 px-2 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Video
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {(editedQuest.content?.videos || []).map((videoId: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={videoId}
                              placeholder="YouTube Video ID or full URL"
                              onChange={(e) => {
                                const videoUrl = e.target.value;
                                // Extract the video ID if a full URL is pasted
                                let videoId = videoUrl;
                                // Handle youtube.com/watch?v= format
                                const watchMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
                                if (watchMatch && watchMatch[1]) {
                                  videoId = watchMatch[1];
                                }
                                
                                const videos = [...(editedQuest.content?.videos || [])];
                                videos[index] = videoId;
                                setEditedQuest({
                                  ...editedQuest,
                                  content: {
                                    ...editedQuest.content,
                                    videos
                                  }
                                });
                              }}
                              className="flex-1 bg-space-dark border-brand-orange/30 text-brand-light placeholder:text-gray-500"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const videos = [...(editedQuest.content?.videos || [])];
                                videos.splice(index, 1);
                                setEditedQuest({
                                  ...editedQuest,
                                  content: {
                                    ...editedQuest.content,
                                    videos
                                  }
                                });
                              }}
                              className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-transparent"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {(editedQuest.content?.videos || []).length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-2 bg-space-dark rounded-md">
                            No videos added yet
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Images Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-400">Images</label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const content = editedQuest.content || { videos: [], images: [], codeBlocks: [] };
                            setEditedQuest({
                              ...editedQuest,
                              content: {
                                ...content,
                                images: [...(content.images || []), ""]
                              }
                            });
                          }}
                          className="h-8 px-2 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Image
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {(editedQuest.content?.images || []).map((image: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={image}
                              placeholder="Image URL"
                              onChange={(e) => {
                                const images = [...(editedQuest.content?.images || [])];
                                images[index] = e.target.value;
                                setEditedQuest({
                                  ...editedQuest,
                                  content: {
                                    ...editedQuest.content,
                                    images
                                  }
                                });
                              }}
                              className="flex-1 bg-space-dark border-brand-orange/30 text-brand-light placeholder:text-gray-500"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const images = [...(editedQuest.content?.images || [])];
                                images.splice(index, 1);
                                setEditedQuest({
                                  ...editedQuest,
                                  content: {
                                    ...editedQuest.content,
                                    images
                                  }
                                });
                              }}
                              className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-transparent"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {(editedQuest.content?.images || []).length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-2 bg-space-dark rounded-md">
                            No images added yet
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Code Blocks Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-400">Code Examples</label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const content = editedQuest.content || { videos: [], images: [], codeBlocks: [] };
                            setEditedQuest({
                              ...editedQuest,
                              content: {
                                ...content,
                                codeBlocks: [...(content.codeBlocks || []), { language: "javascript", code: "" }]
                              }
                            });
                          }}
                          className="h-8 px-2 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Code Block
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {(editedQuest.content?.codeBlocks || []).map((codeBlock: { language: string, code: string }, index: number) => (
                          <div key={index} className="border border-brand-orange/20 rounded-md p-3 space-y-2 bg-space-dark">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <label className="block text-xs text-gray-400 mb-1">Language</label>
                                <select
                                  value={codeBlock.language}
                                  onChange={(e) => {
                                    const codeBlocks = [...(editedQuest.content?.codeBlocks || [])];
                                    codeBlocks[index] = { ...codeBlock, language: e.target.value };
                                    setEditedQuest({
                                      ...editedQuest,
                                      content: {
                                        ...editedQuest.content,
                                        codeBlocks
                                      }
                                    });
                                  }}
                                  className="w-full px-2 py-1 rounded-md bg-space-mid border border-brand-orange/30 text-white font-medium text-sm"
                                >
                                  <option value="javascript">JavaScript</option>
                                  <option value="python">Python</option>
                                  <option value="css">CSS</option>
                                  <option value="html">HTML</option>
                                  <option value="c">C</option>
                                  <option value="cpp">C++</option>
                                  <option value="arduino">Arduino</option>
                                </select>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const codeBlocks = [...(editedQuest.content?.codeBlocks || [])];
                                  codeBlocks.splice(index, 1);
                                  setEditedQuest({
                                    ...editedQuest,
                                    content: {
                                      ...editedQuest.content,
                                      codeBlocks
                                    }
                                  });
                                }}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-transparent mt-6"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Code</label>
                              <Textarea
                                value={codeBlock.code}
                                onChange={(e) => {
                                  const codeBlocks = [...(editedQuest.content?.codeBlocks || [])];
                                  codeBlocks[index] = { ...codeBlock, code: e.target.value };
                                  setEditedQuest({
                                    ...editedQuest,
                                    content: {
                                      ...editedQuest.content,
                                      codeBlocks
                                    }
                                  });
                                }}
                                className="min-h-[120px] bg-space-mid border-brand-orange/30 font-mono text-sm text-white font-medium placeholder:text-gray-500"
                              />
                            </div>
                          </div>
                        ))}
                        
                        {(editedQuest.content?.codeBlocks || []).length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-2 bg-space-dark rounded-md">
                            No code examples added yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Display Mode */
                <>
                  <h1 className="text-3xl font-bold mb-2 text-brand-orange">{quest.title}</h1>
                  <div className="text-sm text-white mb-4 font-bold">
                    Adventure Line: <span className="font-medium">{quest.adventureLine}</span> • 
                    Difficulty: <span className="font-medium">{quest.difficulty}/5</span>
                  </div>
                  <div className="prose dark:prose-invert max-w-none mb-6 text-white">
                    <p>{quest.description}</p>
                  </div>
                </>
              )}
            </div>


          </div>

          {/* Sidebar */}
          <div className="w-full md:w-1/3">
            <Card className="p-6">
              {/* Check if there are any components to determine kit requirement */}
              {quest.componentRequirements && quest.componentRequirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Kit Required</h3>
                  <div className="bg-gray-800 p-3 rounded-md flex items-center gap-3">
                    {/* Find the kit in the kits list */}
                    {(() => {
                      const kitName = quest.componentRequirements[0].kitName;
                      const kit = kitsQuery.data?.find((k: any) => k.name === kitName);
                      
                      // Use the kit image if found, otherwise fall back to component image
                      const imagePath = kit?.imagePath || quest.componentRequirements[0].imagePath;
                      
                      return imagePath ? (
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-700 flex-shrink-0">
                          <img 
                            src={imagePath} 
                            alt={quest.componentRequirements[0].kitName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : null;
                    })()}
                    <p className="font-medium text-brand-accent">
                      {quest.componentRequirements[0].kitName}
                    </p>
                  </div>
                </div>
              )}
              
              <h3 className="text-xl font-semibold mb-4">Quest Rewards</h3>
              
              {isEditing && isAdmin ? (
                /* Admin editing reward section */
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">XP Reward</label>
                    <Input 
                      type="number"
                      value={editedQuest.xpReward || 0}
                      onChange={(e) => setEditedQuest({...editedQuest, xpReward: Number(e.target.value)})}
                      className="bg-space-dark border-brand-orange/30 text-white font-medium placeholder:text-gray-500"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-400">Rewards</label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const rewards = editedQuest.rewards || [];
                          setEditedQuest({
                            ...editedQuest, 
                            rewards: [
                              ...rewards, 
                              { type: 'item', id: 'circuit-board', quantity: 1 }
                            ]
                          });
                        }}
                        className="h-8 px-2 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Reward
                      </Button>
                    </div>
                    
                    {editedQuest.rewards && editedQuest.rewards.length > 0 ? (
                      <div className="space-y-2">
                        {editedQuest.rewards.map((reward: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 bg-space-dark p-2 rounded-md">
                            <select
                              value={reward.type}
                              onChange={(e) => {
                                const updatedRewards = [...editedQuest.rewards];
                                updatedRewards[index] = { 
                                  ...reward, 
                                  type: e.target.value, 
                                  // Reset ID when changing type to avoid invalid IDs
                                  id: e.target.value === 'lootbox' ? 'common' : 
                                       e.target.value === 'equipment' ? 'chainmail' : 'circuit-board'
                                };
                                setEditedQuest({...editedQuest, rewards: updatedRewards});
                              }}
                              className="w-28 px-2 py-1 rounded-md bg-space-mid border border-brand-orange/30 text-brand-light text-sm"
                            >
                              <option value="item">Item</option>
                              <option value="lootbox">Loot Box</option>
                              <option value="equipment">Equipment</option>
                            </select>
                            
                            {reward.type === 'lootbox' ? (
                              <select
                                value={reward.id}
                                onChange={(e) => {
                                  const updatedRewards = [...editedQuest.rewards];
                                  updatedRewards[index] = { ...reward, id: e.target.value };
                                  setEditedQuest({...editedQuest, rewards: updatedRewards});
                                }}
                                className="flex-1 px-2 py-1 rounded-md bg-space-mid border border-brand-orange/30 text-brand-light text-sm"
                              >
                                <option value="common">Common</option>
                                <option value="uncommon">Uncommon</option>
                                <option value="rare">Rare</option>
                                <option value="epic">Epic</option>
                                <option value="legendary">Legendary</option>
                              </select>
                            ) : (
                              <select
                                value={reward.id}
                                onChange={(e) => {
                                  const updatedRewards = [...editedQuest.rewards];
                                  updatedRewards[index] = { ...reward, id: e.target.value };
                                  setEditedQuest({...editedQuest, rewards: updatedRewards});
                                }}
                                className="flex-1 px-2 py-1 rounded-md bg-space-mid border border-brand-orange/30 text-brand-light text-sm"
                              >
                                {itemsQuery.data?.map((item: any) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            )}
                            
                            <Input 
                              type="number"
                              value={reward.quantity}
                              onChange={(e) => {
                                const updatedRewards = [...editedQuest.rewards];
                                updatedRewards[index] = { ...reward, quantity: Number(e.target.value) };
                                setEditedQuest({...editedQuest, rewards: updatedRewards});
                              }}
                              className="w-20 bg-space-mid border-brand-orange/30 text-sm h-8 text-brand-light placeholder:text-gray-500"
                              min={1}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const updatedRewards = [...editedQuest.rewards];
                                updatedRewards.splice(index, 1);
                                setEditedQuest({...editedQuest, rewards: updatedRewards});
                              }}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-transparent"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-2 bg-space-dark rounded-md">
                        No rewards added yet
                      </p>
                    )}
                  </div>
                  
                  {/* Keep backward compatibility with old loot box rewards */}
                  {editedQuest.lootBoxRewards && editedQuest.lootBoxRewards.length > 0 && (
                    <div className="border border-dashed border-yellow-500/50 p-3 rounded">
                      <p className="text-yellow-500 text-xs mb-2">Legacy Loot Box Rewards</p>
                      <div className="space-y-2">
                        {editedQuest.lootBoxRewards.map((reward: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 bg-space-dark p-2 rounded-md opacity-70">
                            <span className="flex-1 truncate">{reward.type} Loot Box</span>
                            <span className="text-sm">{reward.quantity}x</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // Convert to new format
                                const newRewards = editedQuest.rewards || [];
                                setEditedQuest({
                                  ...editedQuest,
                                  rewards: [
                                    ...newRewards,
                                    { type: 'lootbox', id: reward.type, quantity: reward.quantity }
                                  ]
                                });
                                
                                // Remove from old format
                                const updatedLootBoxRewards = [...editedQuest.lootBoxRewards];
                                updatedLootBoxRewards.splice(index, 1);
                                setEditedQuest(prev => ({...prev, lootBoxRewards: updatedLootBoxRewards}));
                              }}
                              className="h-8 px-2 text-xs"
                            >
                              Convert
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Regular display reward section */
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span>XP:</span>
                    <span className="font-medium">{quest.xpReward}</span>
                  </div>
                  
                  {/* New rewards display */}
                  {quest.rewards && quest.rewards.length > 0 ? (
                    <div className="space-y-2">
                      <p className="mb-2">Rewards:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {quest.rewards.map((reward, index) => {
                          // Determine item details based on reward type
                          let itemDetails;
                          
                          if (reward.type === 'lootbox') {
                            // For lootboxes, try to find the actual loot box from our query
                            const lootBoxData = lootBoxesQuery.data?.find((lb: any) => lb.id === reward.id);
                            
                            if (lootBoxData) {
                              // Use the actual data from the lootbox if available
                              itemDetails = { 
                                name: lootBoxData.name || `${reward.id.charAt(0).toUpperCase() + reward.id.slice(1)} Loot Box`, 
                                imagePath: lootBoxData.image || '/images/loot-crate.png',
                                rarity: lootBoxData.rarity || reward.id
                              };
                            } else {
                              // Fallback to defaults if the lootbox isn't found
                              const rarityName = reward.id.charAt(0).toUpperCase() + reward.id.slice(1);
                              itemDetails = { 
                                name: `${rarityName} Loot Box`, 
                                imagePath: '/images/loot-crate.png',
                                rarity: reward.id
                              };
                            }
                          } else if (reward.type === 'item' || reward.type === 'equipment') {
                            // For items and equipment, find the item in the items database
                            itemDetails = itemsQuery.data?.find((i: any) => i.id === reward.id);
                          }
                          
                          // Skip if no item details could be found
                          if (!itemDetails) return null;
                          
                          // Determine background color based on rarity
                          const rarityColors: Record<string, string> = {
                            common: 'bg-gray-700',
                            uncommon: 'bg-green-800/50',
                            rare: 'bg-blue-800/50',
                            epic: 'bg-purple-800/50',
                            legendary: 'bg-orange-800/50'
                          };
                          
                          const bgColor = itemDetails.rarity ? rarityColors[itemDetails.rarity] || 'bg-space-dark' : 'bg-space-dark';
                          
                          return (
                            <div key={index} className={`${bgColor} p-2 rounded-md text-center`}>
                              <div className="relative w-12 h-12 mx-auto mb-1">
                                <img 
                                  src={itemDetails.imagePath} 
                                  alt={itemDetails.name}
                                  className="w-full h-full object-contain"
                                />
                                {reward.quantity > 1 && (
                                  <span className="absolute bottom-0 right-0 bg-brand-orange/80 text-white text-xs rounded px-1">
                                    x{reward.quantity}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs truncate">{itemDetails.name}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : quest.lootBoxRewards && quest.lootBoxRewards.length > 0 ? (
                    // Legacy rewards display
                    <div>
                      <p className="mb-2">Loot Boxes:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {quest.lootBoxRewards.map((reward, index) => {
                          // Try to find the actual loot box image and details
                          const lootBoxData = lootBoxesQuery.data?.find((lb: any) => lb.id === reward.type);
                          
                          // Determine display name and image path
                          const displayName = lootBoxData?.name || 
                            `${reward.type.charAt(0).toUpperCase() + reward.type.slice(1)} Loot Box`;
                          
                          const imagePath = lootBoxData?.image || '/images/loot-crate.png';
                          
                          // Determine background color based on rarity
                          const rarityColors: Record<string, string> = {
                            common: 'bg-gray-700',
                            uncommon: 'bg-green-800/50',
                            rare: 'bg-blue-800/50',
                            epic: 'bg-purple-800/50',
                            legendary: 'bg-orange-800/50'
                          };
                          
                          const rarity = lootBoxData?.rarity || reward.type;
                          const bgColor = rarityColors[rarity] || 'bg-space-dark';
                          
                          return (
                            <div key={index} className={`${bgColor} p-2 rounded-md text-center`}>
                              <div className="relative w-12 h-12 mx-auto mb-1">
                                <img 
                                  src={imagePath} 
                                  alt={displayName}
                                  className="w-full h-full object-contain"
                                />
                                {reward.quantity > 1 && (
                                  <span className="absolute bottom-0 right-0 bg-brand-orange/80 text-white text-xs rounded px-1">
                                    x{reward.quantity}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs truncate">{displayName}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No rewards for this quest.</p>
                  )}
                </div>
              )}
              
              {/* Component Requirements Section */}
              {!isEditing && quest.componentRequirements && quest.componentRequirements.length > 0 && (
                <div className="mt-6 border-t border-gray-700 pt-6">
                  <h3 className="text-xl font-semibold mb-4">Required Components</h3>
                  <div className="space-y-3">
                    {quest.componentRequirements
                      .filter(component => !component.is_optional) // Only show required components
                      .map((component, index) => (
                      <div key={index} className="flex items-start p-3 rounded-md bg-gray-800">
                        {component.imagePath ? (
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-900 mr-3 flex-shrink-0">
                            <img 
                              src={component.imagePath} 
                              alt={component.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-gray-900 mr-3 flex-shrink-0 flex items-center justify-center">
                            <span className="text-2xl text-gray-600">?</span>
                          </div>
                        )}
                        <div className="flex-grow">
                          <div className="flex items-center">
                            <h4 className="text-sm font-medium">{component.name}</h4>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{component.description}</p>
                          {component.partNumber && (
                            <p className="text-xs text-gray-500 mt-1">Part #: {component.partNumber}</p>
                          )}
                          {component.quantity > 1 && (
                            <p className="text-xs text-gray-300 mt-1">Quantity: {component.quantity}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {!isEditing && (
                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handleCompleteQuest}
                  onMouseEnter={() => sounds.hover?.()}
                >
                  Complete Quest
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>
  );
}