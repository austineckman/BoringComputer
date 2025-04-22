import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import MainLayout from '@/components/layout/MainLayout';

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

  // States for showing/hiding content
  const [showVideos, setShowVideos] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // Fetch quest details
  const { data: quest, isLoading } = useQuery({
    queryKey: ['/api/quests', questId],
    queryFn: () => fetch(`/api/quests/${questId}`).then(res => res.json()),
    enabled: !!questId,
  });

  // Handle quest completion
  const handleCompleteQuest = async () => {
    try {
      sounds.questComplete();
      const res = await fetch(`/api/quests/${questId}/complete`, {
        method: 'POST',
      });
      
      if (res.ok) {
        toast({
          title: "Quest Completed!",
          description: "You've earned XP and loot boxes!",
          variant: "success",
        });
        
        // Navigate back to quests page
        setTimeout(() => navigate('/quests'), 1500);
      } else {
        toast({
          title: "Error",
          description: "Could not complete the quest.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred.",
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
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!quest) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Quest Not Found</h2>
            <p className="mb-4">The quest you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/quests')} onMouseEnter={sounds.hover}>
              Return to Quests
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Extract content from quest data (or use placeholders for now)
  const videos = quest.content?.videos || [];
  const images = quest.content?.images || [];
  const codeBlocks = quest.content?.codeBlocks || [];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          {/* Main content */}
          <div className="w-full md:w-2/3">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{quest.title}</h1>
              <div className="text-sm text-muted-foreground mb-4">
                Adventure Line: <span className="font-medium">{quest.adventureLine}</span> • 
                Difficulty: <span className="font-medium">{quest.difficulty}/5</span>
              </div>
              <div className="prose dark:prose-invert max-w-none mb-6">
                <p>{quest.description}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {/* Content toggle buttons */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant={showVideos ? "default" : "outline"} 
                  onClick={toggleVideos}
                  onMouseEnter={sounds.hover}
                  disabled={videos.length === 0}
                >
                  {showVideos ? "Hide Videos" : "Show Videos"} ({videos.length})
                </Button>
                <Button 
                  variant={showImages ? "default" : "outline"} 
                  onClick={toggleImages}
                  onMouseEnter={sounds.hover}
                  disabled={images.length === 0}
                >
                  {showImages ? "Hide Images" : "Show Images"} ({images.length})
                </Button>
                <Button 
                  variant={showCode ? "default" : "outline"} 
                  onClick={toggleCode}
                  onMouseEnter={sounds.hover}
                  disabled={codeBlocks.length === 0}
                >
                  {showCode ? "Hide Code" : "Show Code"} ({codeBlocks.length})
                </Button>
              </div>

              {/* Content display areas */}
              {showVideos && videos.length > 0 && (
                <div className="mt-4 space-y-4">
                  <h3 className="text-xl font-semibold">Videos</h3>
                  {videos.map((videoId, index) => (
                    <YouTubeEmbed key={index} videoId={videoId} />
                  ))}
                </div>
              )}

              {showImages && images.length > 0 && (
                <div className="mt-4 space-y-4">
                  <h3 className="text-xl font-semibold">Images</h3>
                  {images.map((image, index) => (
                    <ImageDisplay key={index} src={image} alt={`Quest image ${index + 1}`} />
                  ))}
                </div>
              )}

              {showCode && codeBlocks.length > 0 && (
                <div className="mt-4 space-y-4">
                  <h3 className="text-xl font-semibold">Code Examples</h3>
                  {codeBlocks.map((codeBlock, index) => (
                    <CodeBlock 
                      key={index} 
                      language={codeBlock.language} 
                      code={codeBlock.code} 
                    />
                  ))}
                </div>
              )}

              {/* Placeholder message for empty sections */}
              {((showVideos && videos.length === 0) || 
                (showImages && images.length === 0) || 
                (showCode && codeBlocks.length === 0)) && (
                <Card className="p-4 mt-4">
                  <p className="text-center text-muted-foreground">
                    This quest doesn't have any content in this section yet.
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-1/3">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Quest Rewards</h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>XP:</span>
                  <span className="font-medium">{quest.xpReward}</span>
                </div>
                
                {quest.lootBoxRewards && quest.lootBoxRewards.length > 0 ? (
                  <div>
                    <p className="mb-2">Loot Boxes:</p>
                    <ul className="space-y-1 ml-4">
                      {quest.lootBoxRewards.map((reward, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{reward.type} Loot Box:</span>
                          <span>{reward.quantity}x</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No loot boxes for this quest.</p>
                )}
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCompleteQuest}
                onMouseEnter={sounds.hover}
              >
                Complete Quest
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}