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
  
  // Fetch Discord server roles
  const { data: discordRoles } = useQuery({
    queryKey: ['/api/debug/server-roles'],
    retry: false,
    enabled: !!user,
  });

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
        {discordRoles?.roles && discordRoles.roles.length > 0 && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Discord Server Roles
            </h3>
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
          </div>
        )}

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