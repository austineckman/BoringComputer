import React, { useState, useEffect } from 'react';
import { X, Play, Pause, MessageCircle, Heart, ThumbsUp, ThumbsDown, Reply, ChevronDown, ChevronUp, Clock, AlertTriangle, CheckCircle, XCircle, Send, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { QuestCompletionConfirmDialog, QuestRewardsDialog } from './QuestCompletionDialog';

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
  displayName?: string;
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
  const [showCheat, setShowCheat] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [cheatUsed, setCheatUsed] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [showRewardsDialog, setShowRewardsDialog] = useState(false);
  const [questRewards, setQuestRewards] = useState<any>(null);

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  // Use passed quest data or fetch from API as fallback
  const { data: fetchedQuest, isLoading: questLoading, error: questError } = useQuery<QuestData>({
    queryKey: [`/api/quests/${questId}`],
    enabled: !questData, // Only fetch if questData is not provided
  });

  // Use provided questData or fallback to fetched data
  const quest = questData || fetchedQuest;

  // Fetch comments
  const { data: comments, isLoading: commentsLoading, error: commentsError } = useQuery<QuestComment[]>({
    queryKey: ['/api/quests', questId, 'comments'],
    refetchOnWindowFocus: false,
    staleTime: 0,
    refetchInterval: false,
  });





  // Handle revealing cheat with gold penalty
  const handleRevealCheat = () => {
    if (cheatUsed) {
      setShowCheat(!showCheat);
    } else {
      setShowConfirmDialog(true);
    }
  };

  const confirmRevealCheat = () => {
    setCheatUsed(true);
    setShowCheat(true);
    setShowConfirmDialog(false);
  };

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: { content: string; parentId?: string }) => {
      return apiRequest('POST', `/api/quests/${questId}/comments`, data);
    },
    onMutate: async (newComment) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/quests', questId, 'comments'] });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData(['/api/quests', questId, 'comments']);

      // Get the latest user data from the query cache
      const latestUser = queryClient.getQueryData(['/api/auth/me']) as any;
      const currentUser = latestUser || user;
      
      // Optimistically update to the new value
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        userId: currentUser?.id.toString() || '',
        username: currentUser?.username || '',
        displayName: currentUser?.displayName || currentUser?.username || '',
        avatar: currentUser?.avatar || '',
        roles: currentUser?.roles || [],
        content: newComment.content,
        timestamp: new Date().toISOString(),
        parentId: newComment.parentId,
        reactions: [],
        replies: []
      };

      queryClient.setQueryData(['/api/quests', questId, 'comments'], (old: any) => {
        if (!old || !Array.isArray(old)) return [optimisticComment];
        
        // If this is a reply, add it to the parent's replies array
        if (newComment.parentId && !newComment.parentId.startsWith('temp-')) {
          return old.map((comment: any) => {
            if (comment.id === newComment.parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), optimisticComment]
              };
            }
            return comment;
          });
        }
        
        // Otherwise, add as a new top-level comment
        return [...old, optimisticComment];
      });

      // Return a context with the previous and new comment
      return { previousComments, optimisticComment };
    },
    onError: (err, newComment, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousComments) {
        queryClient.setQueryData(['/api/quests', questId, 'comments'], context.previousComments);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['/api/quests', questId, 'comments'] });
      setNewComment('');
      setReplyingTo(null);
    },
  });

  // React to comment mutation
  const reactToCommentMutation = useMutation({
    mutationFn: async (data: { commentId: string; emoji: string }) => {
      return apiRequest('POST', `/api/quests/${questId}/comments/${data.commentId}/reactions`, { emoji: data.emoji });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quests', questId, 'comments'] });
    },
  });

  // Complete quest mutation
  const completeQuestMutation = useMutation({
    mutationFn: async () => {
      // Get CSRF token first
      const tokenResponse = await fetch('/api/csrf-token', { credentials: 'include' });
      const tokenData = await tokenResponse.json();
      
      const response = await fetch(`/api/quests/${questId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': tokenData.token,
        },
        credentials: 'include',
        body: JSON.stringify({ cheatUsed })
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete quest');
      }
      
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      console.log('Quest completion response:', data);
      setQuestRewards(data);
      setShowConfirmDialog(false);
      setShowRewardsDialog(true);
      
      // Invalidate queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
    },
    onError: (error) => {
      console.error('Quest completion error:', error);
      toast({
        title: "Error",
        description: "Failed to complete quest. Please try again.",
        variant: "destructive",
      });
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
      const commentData: { content: string; parentId?: string } = { 
        content: newComment.trim()
      };
      
      // Only add parentId if we're actually replying to a comment
      if (replyingTo && !replyingTo.startsWith('temp-')) {
        commentData.parentId = replyingTo;
      }
      
      addCommentMutation.mutate(commentData);
    }
  };

  const handleReaction = (commentId: string, emoji: string) => {
    // Don't allow reactions on temporary comments
    if (commentId.startsWith('temp-')) return;
    reactToCommentMutation.mutate({ commentId, emoji });
  };

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return apiRequest('DELETE', `/api/quests/${questId}/comments/${commentId}`);
    },
    onSuccess: () => {
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: ['/api/quests', questId, 'comments'] });
      toast({
        title: "Comment deleted",
        description: "Comment has been removed successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle delete comment
  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  // Check if user can delete comments (admin, Founder, or CraftingTable member)
  const canDeleteComments = user && user.roles && (
    user.roles.includes('admin') || 
    user.roles.includes('Founder') || 
    user.roles.includes('CraftingTable')
  );

  // Get role-based name color
  const getRoleColor = (user: any) => {
    if (!user?.roles) return 'text-white';
    
    // Priority order for role colors (highest priority first)
    if (user.roles.includes('Founder')) return 'text-purple-400';
    if (user.roles.includes('admin')) return 'text-red-400';
    if (user.roles.includes('Mod')) return 'text-red-400';
    if (user.roles.includes('CraftingTable')) return 'text-blue-400';
    if (user.roles.includes('Beta Tester')) return 'text-purple-400';
    if (user.roles.includes('Academy')) return 'text-yellow-400';
    if (user.roles.includes('moderator')) return 'text-green-400';
    if (user.roles.includes('premium')) return 'text-yellow-400';
    if (user.roles.includes('Server Booster')) return 'text-pink-400';
    return 'text-white';
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
      <div className="bg-black/90 border-b border-brand-orange/30 p-2 sm:p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <button 
            onClick={() => {
              abandonQuestMutation.mutate();
              onClose();
            }}
            className="px-2 py-1 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-500 text-white rounded-md flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm flex-shrink-0"
          >
            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Abandon Quest</span>
            <span className="sm:hidden">Abandon</span>
          </button>
          <h1 className="text-lg sm:text-2xl font-bold text-brand-orange truncate">{quest.title}</h1>
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Time: {formatTime(elapsedTime)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            onClick={() => setShowConfirmDialog(true)}
            disabled={completeQuestMutation.isPending}
            className="px-2 py-1 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-md flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
          >
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Complete Quest</span>
            <span className="sm:hidden">Complete</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Video Section */}
          <div className="bg-gray-900 rounded-lg p-3 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-brand-orange mb-3 sm:mb-4">Tutorial Video</h2>
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

          {/* Solution Helper Section */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-brand-orange">Solution Helper</h2>
              {cheatUsed && (
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Gold Penalty Applied</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleRevealCheat}
                className={`w-full px-4 py-3 rounded-md flex items-center justify-center space-x-2 ${
                  cheatUsed 
                    ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                    : 'bg-yellow-600 hover:bg-yellow-500 text-white'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {cheatUsed 
                    ? (showCheat ? 'Hide Solution' : 'Show Solution')
                    : 'Reveal Answer (No Gold Reward)'
                  }
                </span>
              </button>
              
              {showCheat && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 space-y-4">
                  <div className="text-center text-red-400 text-sm mb-4">
                    ⚠️ Using this solution means you won't receive any gold when completing the quest
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
          </div>
        </div>

        {/* Comments Sidebar - Sticky */}
        <div className="w-full lg:w-96 bg-gray-900 border-t lg:border-t-0 lg:border-l border-brand-orange/30 flex flex-col lg:h-full">
          <div className="p-3 sm:p-4 border-b border-gray-700 flex-shrink-0">
            <h3 className="text-base sm:text-lg font-bold text-brand-orange flex items-center">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Community Discussion
            </h3>
          </div>
          
          {/* Comments List */}
          <div className="flex-1 p-3 sm:p-4 space-y-2 sm:space-y-3 overflow-y-auto min-h-0">
            {commentsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-400">Loading comments...</p>
              </div>
            ) : commentsError ? (
              <div className="text-center py-8 text-red-400">
                <p>Error loading comments</p>
                <p className="text-sm mt-2">Please refresh to try again</p>
              </div>
            ) : comments && Array.isArray(comments) && comments.length > 0 ? (
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
                        <span className={`font-medium ${getRoleColor(comment)}`}>{comment.displayName || comment.username}</span>
                        {comment.roles && comment.roles.includes('Founder') && (
                          <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded">FOUNDER</span>
                        )}
                        {comment.roles && comment.roles.includes('admin') && !comment.roles.includes('Founder') && (
                          <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded">ADMIN</span>
                        )}
                        {comment.roles && comment.roles.includes('Mod') && !comment.roles.includes('Founder') && !comment.roles.includes('admin') && (
                          <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded">MOD</span>
                        )}
                        {comment.roles && comment.roles.includes('CraftingTable') && !comment.roles.includes('Founder') && !comment.roles.includes('admin') && !comment.roles.includes('Mod') && (
                          <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">CRAFTINGTABLE</span>
                        )}
                        {comment.roles && comment.roles.includes('Beta Tester') && !comment.roles.includes('Founder') && !comment.roles.includes('admin') && !comment.roles.includes('Mod') && !comment.roles.includes('CraftingTable') && (
                          <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded">BETA TESTER</span>
                        )}
                        {comment.roles && comment.roles.includes('Academy') && !comment.roles.includes('Founder') && !comment.roles.includes('admin') && !comment.roles.includes('Mod') && !comment.roles.includes('CraftingTable') && !comment.roles.includes('Beta Tester') && (
                          <span className="text-xs bg-yellow-600 text-white px-1.5 py-0.5 rounded">ACADEMY</span>
                        )}
                        <span className="text-xs text-gray-400">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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
                        {canDeleteComments && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Delete comment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
                                        <span className={`font-medium text-sm ${getRoleColor(reply)}`}>{reply.displayName || reply.username}</span>
                                        {reply.roles && reply.roles.includes('Founder') && (
                                          <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded">FOUNDER</span>
                                        )}
                                        {reply.roles && reply.roles.includes('admin') && !reply.roles.includes('Founder') && (
                                          <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded">ADMIN</span>
                                        )}
                                        {reply.roles && reply.roles.includes('Mod') && !reply.roles.includes('Founder') && !reply.roles.includes('admin') && (
                                          <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded">MOD</span>
                                        )}
                                        {reply.roles && reply.roles.includes('CraftingTable') && !reply.roles.includes('Founder') && !reply.roles.includes('admin') && !reply.roles.includes('Mod') && (
                                          <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">CRAFTINGTABLE</span>
                                        )}
                                        {reply.roles && reply.roles.includes('Beta Tester') && !reply.roles.includes('Founder') && !reply.roles.includes('admin') && !reply.roles.includes('Mod') && !reply.roles.includes('CraftingTable') && (
                                          <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded">BETA TESTER</span>
                                        )}
                                        {reply.roles && reply.roles.includes('Academy') && !reply.roles.includes('Founder') && !reply.roles.includes('admin') && !reply.roles.includes('Mod') && !reply.roles.includes('CraftingTable') && !reply.roles.includes('Beta Tester') && (
                                          <span className="text-xs bg-yellow-600 text-white px-1.5 py-0.5 rounded">ACADEMY</span>
                                        )}
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
          <div className="p-3 sm:p-4 border-t border-gray-700 flex-shrink-0">
            {replyingTo && (
              <div className="mb-3 p-2 bg-gray-800 rounded border-l-4 border-brand-orange">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    <Reply className="w-3 h-3 inline mr-1" />
                    Replying to <span className="text-brand-orange">@{comments?.find(c => c.id === replyingTo)?.displayName || comments?.find(c => c.id === replyingTo)?.username || 'someone'}</span>
                  </div>
                  <button 
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
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
                  <span className={`text-sm font-medium ${getRoleColor(user)}`}>{user.displayName || user.username}</span>
                  {user.roles?.includes('Founder') && (
                    <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded">FOUNDER</span>
                  )}
                  {user.roles?.includes('admin') && !user.roles?.includes('Founder') && (
                    <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded">ADMIN</span>
                  )}
                  {user.roles?.includes('Mod') && !user.roles?.includes('Founder') && !user.roles?.includes('admin') && (
                    <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded">MOD</span>
                  )}
                  {user.roles?.includes('CraftingTable') && !user.roles?.includes('Founder') && !user.roles?.includes('admin') && !user.roles?.includes('Mod') && (
                    <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">CRAFTINGTABLE</span>
                  )}
                  {user.roles?.includes('Beta Tester') && !user.roles?.includes('Founder') && !user.roles?.includes('admin') && !user.roles?.includes('Mod') && !user.roles?.includes('CraftingTable') && (
                    <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded">BETA TESTER</span>
                  )}
                  {user.roles?.includes('Academy') && !user.roles?.includes('Founder') && !user.roles?.includes('admin') && !user.roles?.includes('Mod') && !user.roles?.includes('CraftingTable') && !user.roles?.includes('Beta Tester') && (
                    <span className="text-xs bg-yellow-600 text-white px-1.5 py-0.5 rounded">ACADEMY</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder={replyingTo ? "Write a reply..." : "Message #quest-discussion"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:border-brand-orange focus:outline-none text-sm"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    className="px-4 py-2 bg-brand-orange hover:bg-brand-orange/80 disabled:bg-gray-600 text-white rounded-md flex items-center space-x-1"
                  >
                    <Send className="w-4 h-4" />
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
      
      {/* Quest Completion Dialogs */}
      <QuestCompletionConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => completeQuestMutation.mutate()}
        isPending={completeQuestMutation.isPending}
      />
      
      <QuestRewardsDialog
        isOpen={showRewardsDialog}
        onClose={() => {
          setShowRewardsDialog(false);
          setQuestRewards(null);
        }}
        onReturnToQuests={() => {
          setShowRewardsDialog(false);
          setQuestRewards(null);
          if (onComplete) onComplete();
        }}
        rewards={questRewards ? questRewards : {
          questTitle: quest?.title || 'Unknown Quest',
          xpAwarded: 0,
          goldAwarded: 0,
          itemsAwarded: [],
          newXp: user?.xp || 0,
          newGold: user?.inventory?.gold || 0,
          alreadyCompleted: false
        }}
      />

      {/* Reveal Answer Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <h3 className="text-xl font-bold text-white">Reveal Answer Warning</h3>
            </div>
            
            <div className="mb-6 space-y-3">
              <p className="text-gray-300">
                Are you sure you want to reveal the answer? 
              </p>
              <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                <p className="text-red-400 font-medium">
                  ⚠️ Warning: You will NOT receive any gold when completing this quest if you proceed.
                </p>
              </div>
              <p className="text-gray-400 text-sm">
                This penalty encourages learning through experimentation. You'll still get XP and items, just no gold reward.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmRevealCheat}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md font-medium"
              >
                Reveal Answer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ActiveQuestScreen;