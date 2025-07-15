import React, { useState, useEffect } from 'react';
import { X, Play, Pause, MessageCircle, Heart, ThumbsUp, ThumbsDown, Reply, ChevronDown, ChevronUp, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

interface ActiveQuestScreenProps {
  questId: string;
  questData?: QuestData;
  onClose: () => void;
  onComplete?: () => void;
  onAbandon?: () => void;
}

interface QuestComment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  replies: QuestComment[];
  reactions: {
    emoji: string;
    count: number;
    userReacted: boolean;
  }[];
}

interface QuestData {
  id: string;
  title: string;
  description: string;
  missionBrief?: string;
  adventureLine: string;
  difficulty: number;
  orderInLine: number;
  xpReward: number;
  rewards: any[];
  status: string;
  content: {
    videos: string[];
    images: string[];
    codeBlocks: Array<{
      language: string;
      code: string;
    }>;
  };
  lootBoxRewards: Array<{
    type: string;
    quantity: number;
  }>;
  componentRequirements: any[];
  solutionCode?: string;
  wiringInstructions?: string;
  wiringDiagram?: string;
  solutionNotes?: string;
}

const ActiveQuestScreen: React.FC<ActiveQuestScreenProps> = ({ 
  questId, 
  questData,
  onClose, 
  onComplete, 
  onAbandon 
}) => {
  const [startTime] = useState(Date.now());
  const [cheatUnlocked, setCheatUnlocked] = useState(false);
  const [showCheat, setShowCheat] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Use passed quest data or fetch from API as fallback
  const { data: fetchedQuest, isLoading: questLoading, error: questError } = useQuery<QuestData>({
    queryKey: [`/api/quests/${questId}`],
    enabled: !questData, // Only fetch if questData is not provided
  });

  // Use provided questData or fallback to fetched data
  const quest = questData || fetchedQuest;

  // Fetch comments
  const { data: comments, isLoading: commentsLoading, refetch: refetchComments } = useQuery<QuestComment[]>({
    queryKey: [`/api/quests/${questId}/comments`],
  });

  // Timer for unlocking cheat
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);
      
      if (elapsed >= 5 * 60 * 1000) { // 5 minutes
        setCheatUnlocked(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: { content: string; parentId?: string }) => {
      console.log('Making API request to add comment:', data);
      return apiRequest('POST', `/api/quests/${questId}/comments`, data);
    },
    onSuccess: (data) => {
      console.log('Comment added successfully:', data);
      queryClient.invalidateQueries({ queryKey: [`/api/quests/${questId}/comments`] });
      refetchComments(); // Force immediate refresh
      setNewComment('');
      setReplyingTo(null);
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
    },
  });

  // React to comment mutation
  const reactToCommentMutation = useMutation({
    mutationFn: async (data: { commentId: string; emoji: string }) => {
      return apiRequest('POST', `/api/quests/${questId}/comments/${data.commentId}/reactions`, { emoji: data.emoji });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quests/${questId}/comments`] });
    },
  });

  // Complete quest mutation
  const completeQuestMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/quests/${questId}/complete`, {
        submission: "Quest completed via active quest screen",
        image: null
      });
    },
    onSuccess: () => {
      if (onComplete) onComplete();
    },
  });

  // Abandon quest mutation
  const abandonQuestMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/quests/${questId}/abandon`);
    },
    onSuccess: () => {
      if (onAbandon) onAbandon();
    },
  });

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleAddComment = () => {
    if (newComment.trim() && user) {
      console.log('Adding comment:', { content: newComment, parentId: replyingTo || undefined, questId });
      addCommentMutation.mutate({ 
        content: newComment,
        parentId: replyingTo || undefined
      });
    } else {
      console.log('Cannot add comment:', { newComment: newComment.trim(), user });
    }
  };

  const handleReaction = (commentId: string, emoji: string) => {
    reactToCommentMutation.mutate({ commentId, emoji });
  };

  if (questLoading && !questData) {
    return (
      <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-orange">Loading quest...</p>
        </div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
        <div className="text-center text-white">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl mb-4">Quest not found</p>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-brand-orange hover:bg-brand-orange/80 text-white rounded-md"
          >
            Return to Quest List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-black/90 border-b border-brand-orange/30 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-brand-orange">{quest.title}</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Time: {formatTime(elapsedTime)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => abandonQuestMutation.mutate()}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md flex items-center space-x-2"
          >
            <XCircle className="w-4 h-4" />
            <span>Abandon Quest</span>
          </button>
          <button 
            onClick={onClose}
            className="text-white hover:text-brand-orange"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Video Section */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold text-brand-orange mb-4">Tutorial Video</h2>
            {quest.content?.videos && quest.content.videos.length > 0 ? (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${quest.content.videos[0]}`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Quest Tutorial Video"
                ></iframe>
              </div>
            ) : (
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Play className="w-16 h-16 mx-auto mb-2" />
                  <p>Video tutorial coming soon</p>
                </div>
              </div>
            )}
          </div>

          {/* Mission Brief Section */}
          {quest.missionBrief && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-bold text-brand-orange mb-4">Mission Instructions</h2>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-300 whitespace-pre-wrap">{quest.missionBrief}</div>
              </div>
            </div>
          )}

          {/* Expected Result Section */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold text-brand-orange mb-4">Expected Result</h2>
            {quest.content?.images && quest.content.images.length > 1 && quest.content.images[1] ? (
              <div className="bg-black rounded-lg p-4 flex justify-center">
                <img 
                  src={quest.content.images[1]}
                  alt="Expected circuit result"
                  className="max-w-full max-h-64 rounded-lg"
                  style={{ imageRendering: quest.content.images[1]?.endsWith('.gif') ? 'auto' : 'pixelated' }}
                />
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
                <CheckCircle className="w-16 h-16 mx-auto mb-2" />
                <p>Upload an Expected Result GIF in the admin panel</p>
                <p className="text-sm mt-2">This will show the circuit behavior students should achieve</p>
              </div>
            )}
          </div>

          {/* Cheat Section */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-brand-orange">Solution Helper</h2>
              {!cheatUnlocked ? (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Unlocks in {formatTime(5 * 60 * 1000 - elapsedTime)}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Solution Available</span>
                </div>
              )}
            </div>
            
            {cheatUnlocked ? (
              <div className="space-y-4">
                <button
                  onClick={() => setShowCheat(!showCheat)}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-md flex items-center justify-center space-x-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{showCheat ? 'Hide Solution' : 'Show Solution'}</span>
                </button>
                
                {showCheat && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 space-y-4">
                    <div className="text-center text-red-400 text-sm mb-4">
                      ⚠️ Warning: Using the solution will reduce your XP rewards
                    </div>
                    
                    {quest.solutionCode && (
                      <div>
                        <h3 className="font-bold text-red-400 mb-2">Solution Code:</h3>
                        <pre className="bg-black/50 p-4 rounded-md text-sm overflow-x-auto font-mono">
                          <code>{quest.solutionCode}</code>
                        </pre>
                      </div>
                    )}
                    
                    {quest.wiringInstructions && (
                      <div>
                        <h3 className="font-bold text-red-400 mb-2">Wiring Instructions:</h3>
                        <div className="bg-black/50 p-4 rounded-md text-sm whitespace-pre-wrap">
                          {quest.wiringInstructions}
                        </div>
                      </div>
                    )}
                    
                    {quest.wiringDiagram && (
                      <div>
                        <h3 className="font-bold text-red-400 mb-2">Wiring Diagram:</h3>
                        <div className="bg-black/50 p-4 rounded-md">
                          <img 
                            src={quest.wiringDiagram} 
                            alt="Wiring Diagram" 
                            className="max-w-full h-auto rounded border border-gray-600"
                          />
                        </div>
                      </div>
                    )}
                    
                    {quest.solutionNotes && (
                      <div>
                        <h3 className="font-bold text-red-400 mb-2">Additional Notes:</h3>
                        <div className="bg-black/50 p-4 rounded-md text-sm whitespace-pre-wrap">
                          {quest.solutionNotes}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
                <Clock className="w-16 h-16 mx-auto mb-2" />
                <p>Solution will be available after 5 minutes</p>
                <p className="text-sm mt-2">Try to solve it yourself first!</p>
              </div>
            )}
          </div>
        </div>

        {/* Comments Sidebar */}
        <div className="w-96 bg-gray-900 border-l border-brand-orange/30 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-bold text-brand-orange flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Community Discussion
            </h3>
          </div>
          
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {commentsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-400">Loading comments...</p>
              </div>
            ) : comments && comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-start space-x-3">
                    <img 
                      src={comment.avatar} 
                      alt={comment.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{comment.username}</span>
                        <span className="text-xs text-gray-400">{comment.timestamp}</span>
                      </div>
                      <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
                      
                      {/* Reactions */}
                      <div className="flex items-center space-x-2 mt-2">
                        {comment.reactions.map(reaction => (
                          <button
                            key={reaction.emoji}
                            onClick={() => handleReaction(comment.id, reaction.emoji)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                              reaction.userReacted 
                                ? 'bg-brand-orange/20 text-brand-orange' 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            <span>{reaction.emoji}</span>
                            <span>{reaction.count}</span>
                          </button>
                        ))}
                        <button
                          onClick={() => handleReaction(comment.id, '👍')}
                          className="text-gray-400 hover:text-white"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setReplyingTo(comment.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleCommentExpansion(comment.id)}
                            className="text-xs text-brand-orange hover:text-brand-orange/80 flex items-center space-x-1"
                          >
                            {expandedComments.has(comment.id) ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                            <span>{comment.replies.length} replies</span>
                          </button>
                          
                          {expandedComments.has(comment.id) && (
                            <div className="ml-4 mt-2 space-y-2">
                              {comment.replies.map(reply => (
                                <div key={reply.id} className="bg-gray-700 rounded p-2">
                                  <div className="flex items-start space-x-2">
                                    <img 
                                      src={reply.avatar} 
                                      alt={reply.username}
                                      className="w-6 h-6 rounded-full"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-medium text-white text-sm">{reply.username}</span>
                                        <span className="text-xs text-gray-400">{reply.timestamp}</span>
                                      </div>
                                      <p className="text-gray-300 text-sm mt-1">{reply.content}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <MessageCircle className="w-16 h-16 mx-auto mb-2" />
                <p>No comments yet</p>
                <p className="text-sm">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
          
          {/* Add Comment */}
          <div className="p-4 border-t border-gray-700">
            {replyingTo && (
              <div className="mb-2 text-xs text-gray-400">
                Replying to comment...
                <button 
                  onClick={() => setReplyingTo(null)}
                  className="ml-2 text-brand-orange hover:text-brand-orange/80"
                >
                  Cancel
                </button>
              </div>
            )}
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <img 
                    src={user.avatar || 'https://via.placeholder.com/32'} 
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm text-gray-300">{user.username}</span>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:border-brand-orange focus:outline-none text-sm"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    className="px-4 py-2 bg-brand-orange hover:bg-brand-orange/80 disabled:bg-gray-600 text-white rounded-md"
                  >
                    Post
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-4">
                <p>Please log in to comment</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Complete Quest Button */}
      <div className="p-4 bg-black/90 border-t border-brand-orange/30 flex justify-center flex-shrink-0">
        <button
          onClick={() => completeQuestMutation.mutate()}
          disabled={completeQuestMutation.isPending}
          className="px-8 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-md flex items-center space-x-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Complete Quest</span>
        </button>
      </div>
    </div>
  );
};

export default ActiveQuestScreen;