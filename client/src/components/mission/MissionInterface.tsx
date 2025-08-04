import React, { useState, useEffect } from 'react';
import { Play, Eye, MessageCircle, CheckCircle, ArrowLeft, Send, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Quest, MissionComment, MissionDiagram } from '@shared/schema';

interface MissionInterfaceProps {
  quest: Quest;
  onComplete: () => void;
  onBack: () => void;
}

interface CommentWithUser extends MissionComment {
  username: string;
  avatar: string | null;
  replies?: CommentWithUser[];
}

export default function MissionInterface({ quest, onComplete, onBack }: MissionInterfaceProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // States
  const [showCheatsheet, setShowCheatsheet] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // Fetch mission comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['/api/missions', quest.id, 'comments'],
    enabled: !!quest.id,
  });

  // Fetch mission diagrams
  const { data: diagrams = [], isLoading: diagramsLoading } = useQuery({
    queryKey: ['/api/missions', quest.id, 'diagrams'],
    enabled: !!quest.id,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (commentData: { content: string; parentCommentId?: number }) => {
      return await apiRequest(`/api/missions/${quest.id}/comments`, {
        method: 'POST',
        body: JSON.stringify(commentData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/missions', quest.id, 'comments'] });
      setNewComment('');
      setReplyingTo(null);
    },
  });

  // Complete mission mutation
  const completeMissionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/missions/${quest.id}/complete`, {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      // Show completion rewards and redirect
      onComplete();
    },
  });

  // Handle comment submission
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    addCommentMutation.mutate({
      content: newComment,
      parentCommentId: replyingTo || undefined,
    });
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

  // Get main video from quest content
  const mainVideo = quest.content?.videos?.[0];
  const videoId = mainVideo ? getYouTubeVideoId(mainVideo) : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
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
            {videoId && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Play className="w-5 h-5 mr-2 text-red-500" />
                  Tutorial Video
                </h2>
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0&origin=${encodeURIComponent(window.location.origin)}`}
                    title="Mission Tutorial"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Interactive Diagrams */}
            {!diagramsLoading && diagrams.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-blue-500" />
                  Circuit Diagrams
                </h2>
                <div className="space-y-6">
                  {diagrams.map((diagram: MissionDiagram) => (
                    <div key={diagram.id} className="relative">
                      <h3 className="font-medium mb-2">{diagram.title}</h3>
                      {diagram.description && (
                        <p className="text-gray-400 text-sm mb-4">{diagram.description}</p>
                      )}
                      
                      <div className="relative rounded-lg overflow-hidden bg-gray-900">
                        <img
                          src={diagram.imageUrl}
                          alt={diagram.title}
                          className="w-full h-auto"
                        />
                        
                        {/* Cheatsheet Overlay */}
                        {showCheatsheet === diagram.id && diagram.cheatsheetImageUrl && (
                          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg p-4 max-w-2xl w-full max-h-full overflow-auto">
                              <img
                                src={diagram.cheatsheetImageUrl}
                                alt={`${diagram.title} Cheatsheet`}
                                className="w-full h-auto mb-4"
                              />
                              {diagram.cheatsheetCode && (
                                <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                                  <code>{diagram.cheatsheetCode}</code>
                                </pre>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Reveal Button */}
                        {(diagram.cheatsheetImageUrl || diagram.cheatsheetCode) && (
                          <button
                            onClick={() => setShowCheatsheet(showCheatsheet === diagram.id ? null : diagram.id)}
                            className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            {showCheatsheet === diagram.id ? 'Hide' : 'Show'} Cheatsheet
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Comments */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-purple-500" />
                Maker Community ({comments.length})
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
                          disabled={!newComment.trim() || addCommentMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-1 rounded text-sm font-medium flex items-center"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          {addCommentMutation.isPending ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {commentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading comments...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No comments yet. Be the first to share your experience!</p>
                  </div>
                ) : (
                  comments.map((comment: CommentWithUser) => (
                    <div key={comment.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <img
                          src={comment.discordAvatar || comment.avatar || '/images/default-avatar.png'}
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
                                    src={reply.discordAvatar || reply.avatar || '/images/default-avatar.png'}
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
                  ))
                )}
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