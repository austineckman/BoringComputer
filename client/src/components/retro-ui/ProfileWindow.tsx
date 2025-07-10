import React from 'react';
import { Award, CheckCircle, Shield, Crown, Star, Users, Zap, Trophy, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTitles } from '@/hooks/useTitles';
import { useQuery } from '@tanstack/react-query';
import logoImage from "@assets/Asset 6@2x-8.png";

interface ProfileWindowProps {
  onClose: () => void;
}

const ProfileWindow: React.FC<ProfileWindowProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { 
    titles, 
    activeTitle, 
    setActiveTitle, 
    isSetting 
  } = useTitles();
  
  // Fetch user's Discord roles
  const { data: discordRoles, isLoading: rolesLoading, error: rolesError } = useQuery({
    queryKey: ['/api/user/discord-roles'],
    retry: false,
    enabled: !!user && !!user.discordId, // Only fetch if user exists and has Discord ID
  });

  // Debug logging and trigger user data refetch on mount
  React.useEffect(() => {
    console.log('Profile window state:', {
      user: user ? { id: user.id, username: user.username, discordId: user.discordId } : null,
      authenticated: !!user,
      rolesData: discordRoles,
      rolesLoading,
      rolesError
    });
  }, [user, discordRoles, rolesLoading, rolesError]);

  // Trigger a refetch of user data when component mounts to get latest Discord ID
  React.useEffect(() => {
    import('@/lib/queryClient').then(({ queryClient }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    });
  }, []);

  const getRoleIcon = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name.includes('admin') || name.includes('owner')) return <Crown className="w-4 h-4" />;
    if (name.includes('mod') || name.includes('staff')) return <Shield className="w-4 h-4" />;
    if (name.includes('premium') || name.includes('vip') || name.includes('supporter')) return <Star className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
  };
  
  const getRoleColor = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name.includes('admin') || name.includes('owner')) return 'bg-red-500/20 text-red-300 border-red-500/50';
    if (name.includes('mod') || name.includes('staff')) return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
    if (name.includes('premium') || name.includes('vip') || name.includes('supporter')) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    if (name.includes('member') || name.includes('user')) return 'bg-green-500/20 text-green-300 border-green-500/50';
    return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-lg shadow-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-blue-500">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Discord Connection
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* User Profile Section */}
        <div className="text-center mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex justify-center mb-4">
            <img 
              src={logoImage} 
              alt="Profile" 
              className="w-16 h-16 rounded-full border-2 border-blue-400" 
            />
          </div>
          <div className="text-xl font-bold text-white">{user?.username}</div>
          <div className="text-sm text-blue-300">Level {user?.level || 1} Adventurer</div>
          
          {/* Discord Connection Status */}
          <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Connected to CraftingTable Discord</span>
          </div>
        </div>

        {/* Discord Server Roles */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Discord Server Roles
          </h3>
          
          {rolesLoading && (
            <div className="text-center py-4 text-gray-400">
              <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm">Loading Discord roles...</p>
            </div>
          )}
          
          {rolesError && (
            <div className="text-center py-4 text-red-400">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Failed to load Discord roles</p>
              <p className="text-xs text-gray-500 mt-1">
                {!user?.discordId ? 
                  'Connect your Discord account to see server roles' :
                  'Make sure you\'re in the CraftingTable Discord server'
                }
              </p>
            </div>
          )}
          
          {discordRoles?.roles && discordRoles.roles.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {discordRoles.roles.map((role: any) => (
                <div
                  key={role.id}
                  className={`p-3 rounded-lg border flex items-center gap-3 ${getRoleColor(role.name)}`}
                  style={{ 
                    backgroundColor: role.color ? `#${role.color.toString(16).padStart(6, '0')}20` : undefined,
                    borderColor: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : undefined 
                  }}
                >
                  {getRoleIcon(role.name)}
                  <div className="flex-1">
                    <div className="font-medium">{role.name}</div>
                    {role.permissions && (
                      <div className="text-xs opacity-75 mt-1">
                        {role.permissions.includes('Administrator') && 'Full Administrator'}
                        {role.permissions.includes('ManageGuild') && !role.permissions.includes('Administrator') && 'Server Manager'}
                        {role.permissions.includes('ModerateMembers') && !role.permissions.includes('ManageGuild') && 'Moderator'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !rolesLoading && !rolesError && (
              <div className="text-center py-4 text-gray-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {!user?.discordId ? 'Discord not connected' : 'No Discord roles found'}
                </p>
                <p className="text-xs text-gray-500 mt-1 mb-3">
                  {!user?.discordId ? 
                    'Connect your Discord account to see CraftingTable server roles' :
                    'Join the CraftingTable Discord server to see your roles'
                  }
                </p>
                {!user?.discordId && (
                  <button
                    onClick={() => window.location.href = '/api/auth/discord'}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                    </svg>
                    Connect Discord
                  </button>
                )}
              </div>
            )
          )}
        </div>

        {/* App Permission Roles */}
        {user?.roles && user.roles.length > 0 && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              App Permissions
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <span
                  key={role}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    role === 'admin' 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/50' 
                      : role === 'moderator'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                      : role === 'premium'
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                  }`}
                >
                  {role === 'admin' && <Crown className="w-4 h-4" />}
                  {role === 'moderator' && <Shield className="w-4 h-4" />}
                  {role === 'premium' && <Star className="w-4 h-4" />}
                  {role === 'user' && <Users className="w-4 h-4" />}
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Character Stats */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Character Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-400">{user?.level || 1}</div>
              <div className="text-xs text-gray-400">Level</div>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400">{user?.inventory ? Object.keys(user.inventory).length : 0}</div>
              <div className="text-xs text-gray-400">Items</div>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-400">0</div>
              <div className="text-xs text-gray-400">Quests</div>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-400">0</div>
              <div className="text-xs text-gray-400">XP</div>
            </div>
          </div>
        </div>

        {/* Active Titles */}
        {titles.length > 0 && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Active Titles
            </h3>
            {activeTitle ? (
              <div className="flex items-center justify-between p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium text-yellow-300">{activeTitle}</span>
                </div>
                <button
                  onClick={() => setActiveTitle(null)}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                  disabled={isSetting}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active title selected</p>
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileWindow;