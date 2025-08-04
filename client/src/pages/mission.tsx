import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Play, Eye, MessageCircle, CheckCircle, ArrowLeft, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Quest } from '@shared/schema';

interface MissionPageProps {}

export default function MissionPage({}: MissionPageProps) {
  const [, params] = useRoute('/mission/:questId');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // States
  const [showCheatsheet, setShowCheatsheet] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

  const questId = params?.questId ? parseInt(params.questId) : null;

  // Fetch quest details
  const { data: quest, isLoading: questLoading } = useQuery({
    queryKey: ['/api/quests', questId],
    enabled: !!questId,
  });

  // Mock comments data for now (until backend is ready)
  const mockComments = [
    {
      id: 1,
      content: "Great tutorial! The LED wiring part was really helpful. Thanks for the clear instructions!",
      username: "maker_alex",
      discordUsername: "AlexMaker#1234",
      avatar: "https://cdn.discordapp.com/avatars/123/avatar1.png",
      createdAt: new Date().toISOString(),
      replies: [
        {
          id: 2,
          content: "Agreed! The diagram at 2:35 really clarified the resistor placement for me.",
          username: "techie_sarah",
          discordUsername: "TechSarah#5678",
          avatar: "https://cdn.discordapp.com/avatars/456/avatar2.png",
          createdAt: new Date().toISOString(),
        }
      ]
    },
    {
      id: 3,
      content: "Quick question - what's the best way to troubleshoot if the LED doesn't light up?",
      username: "newbie_dev",
      discordUsername: "DevNewbie#9012",
      avatar: "https://cdn.discordapp.com/avatars/789/avatar3.png",
      createdAt: new Date().toISOString(),
      replies: []
    }
  ];

  // Mock diagrams data for now
  const mockDiagrams = [
    {
      id: 1,
      title: "LED Circuit Breadboard Layout",
      description: "Complete wiring diagram for the LED circuit",
      imageUrl: "/images/led-circuit-diagram.png",
      cheatsheetImageUrl: "/images/led-circuit-cheatsheet.png",
      cheatsheetCode: `// LED Control Code
int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);  // Turn LED on
  delay(1000);                 // Wait 1 second
  digitalWrite(ledPin, LOW);   // Turn LED off
  delay(1000);                 // Wait 1 second
}`
    }
  ];

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // Complete mission mutation
  const completeMissionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/quests/${questId}/complete`, {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      // Show completion notification and redirect back to quests
      alert(`Mission completed! You earned ${data.xpGained} XP and received rewards!`);
      setLocation('/');
    },
  });

  // Handle comment submission (placeholder for now)
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    // For now, just clear the comment and show a message
    alert('Comment feature coming soon! Your comment: ' + newComment);
    setNewComment('');
    setReplyingTo(null);
  };

  // Toggle comment replies
  const toggleCommentExpanded = (commentId: number) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  if (questLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading mission...</p>
        </div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Mission Not Found</h1>
          <button
            onClick={() => setLocation('/')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
          >
            Back to Quests
          </button>
        </div>
      </div>
    );
  }

  // Get main video from quest content
  const mainVideo = quest.content?.videos?.[0];
  const videoId = mainVideo ? getYouTubeVideoId(mainVideo) : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setLocation('/')}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Quests
          </button>
          
          <h1 className="text-2xl font-bold text-center flex-1">{quest.title}</h1>
          
          <button
            onClick={() => completeMissionMutation.mutate()}
            disabled={completeMissionMutation.isPending}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-6 py-2 rounded-lg font-medium flex items-center transition-colors"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {completeMissionMutation.isPending ? 'Completing...' : 'Complete Mission'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Mission Brief */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-400">Mission Objectives</h2>
              <div className="space-y-4">
                {quest.missionBrief && (
                  <p className="text-gray-200 leading-relaxed">{quest.missionBrief}</p>
                )}
                {quest.description && (
                  <p className="text-gray-300 text-sm leading-relaxed">{quest.description}</p>
                )}
              </div>
            </div>

            {/* YouTube Video Section */}
            {videoId ? (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Play className="w-5 h-5 mr-2 text-red-500" />
                  Tutorial Video
                </h2>
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0`}
                    title="Mission Tutorial"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="w-full h-full"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Play className="w-5 h-5 mr-2 text-red-500" />
                  Tutorial Video
                </h2>
                <div className="aspect-video rounded-lg bg-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">Video content coming soon</p>
                    <p className="text-sm text-gray-500">YouTube embed will appear here</p>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Diagrams */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-blue-500" />
                Circuit Diagrams
              </h2>
              <div className="space-y-6">
                {mockDiagrams.map((diagram) => (
                  <div key={diagram.id} className="relative">
                    <h3 className="font-medium mb-2">{diagram.title}</h3>
                    {diagram.description && (
                      <p className="text-gray-400 text-sm mb-4">{diagram.description}</p>
                    )}
                    
                    <div className="relative rounded-lg overflow-hidden bg-gray-900">
                      {/* Placeholder diagram */}
                      <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                        <div className="text-center">
                          <Eye className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                          <p className="text-blue-200 font-medium">Circuit Diagram</p>
                          <p className="text-blue-300 text-sm">{diagram.title}</p>
                        </div>
                      </div>
                      
                      {/* Cheatsheet Overlay */}
                      {showCheatsheet === diagram.id.toString() && (
                        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4">
                          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-full overflow-auto">
                            <h3 className="text-gray-900 font-bold mb-4">Circuit Cheatsheet</h3>
                            {diagram.cheatsheetCode && (
                              <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                                <code>{diagram.cheatsheetCode}</code>
                              </pre>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Reveal Button */}
                      <button
                        onClick={() => setShowCheatsheet(showCheatsheet === diagram.id.toString() ? null : diagram.id.toString())}
                        className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        {showCheatsheet === diagram.id.toString() ? 'Hide' : 'Show'} Cheatsheet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Comments */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-purple-500" />
                Maker Community ({mockComments.length})
              </h2>
              
              {/* Add Comment */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <div className="flex items-start space-x-3">
                  <img
                    src={user?.avatar || '/images/default-avatar.png'}
                    alt={user?.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={replyingTo ? 'Write a reply...' : 'Share your thoughts or ask for help...'}
                      className="w-full bg-gray-600 border border-gray-500 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        Posting as <span className="text-blue-400">@{user?.username}</span>
                      </span>
                      <div className="flex space-x-2">
                        {replyingTo && (
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-1 rounded text-sm font-medium flex items-center"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {mockComments.map((comment) => (
                  <div key={comment.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <img
                        src={comment.avatar}
                        alt={comment.discordUsername || comment.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-blue-400">
                            @{comment.discordUsername || comment.username}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-200 mt-1">{comment.content}</p>
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <button
                            onClick={() => setReplyingTo(comment.id)}
                            className="text-xs text-gray-400 hover:text-blue-400"
                          >
                            Reply
                          </button>
                          {comment.replies && comment.replies.length > 0 && (
                            <button
                              onClick={() => toggleCommentExpanded(comment.id)}
                              className="text-xs text-gray-400 hover:text-blue-400 flex items-center"
                            >
                              {expandedComments.has(comment.id) ? (
                                <>
                                  <ChevronUp className="w-3 h-3 mr-1" />
                                  Hide {comment.replies.length} replies
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3 mr-1" />
                                  Show {comment.replies.length} replies
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Replies */}
                        {comment.replies && expandedComments.has(comment.id) && (
                          <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-600">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start space-x-3">
                                <img
                                  src={reply.avatar}
                                  alt={reply.discordUsername || reply.username}
                                  className="w-6 h-6 rounded-full"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-blue-400 text-sm">
                                      @{reply.discordUsername || reply.username}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(reply.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-200 text-sm mt-1">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quest Progress */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quest Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Difficulty</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full mr-1 ${
                          i < quest.difficulty ? 'bg-orange-500' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">XP Reward</span>
                  <span className="text-yellow-400 font-medium">{quest.xpReward} XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Adventure Line</span>
                  <span className="text-purple-400 text-sm">{quest.adventureLine}</span>
                </div>
              </div>
            </div>

            {/* Required Components */}
            {quest.componentRequirements && quest.componentRequirements.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Required Components</h3>
                <div className="space-y-3">
                  {quest.componentRequirements
                    .filter(comp => !comp.is_optional)
                    .map((component, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      {component.imagePath && (
                        <img
                          src={component.imagePath}
                          alt={component.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{component.name}</p>
                        <p className="text-xs text-gray-400">{component.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}