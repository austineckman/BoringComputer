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

  // Debug logging to verify Discord roles functionality
  React.useEffect(() => {
    console.log('Profile window state:', {
      user: user ? { id: user.id, username: user.username, discordId: user.discordId, roles: user.roles } : null,
      discordRolesEnabled: !!user && !!user.discordId,
      rolesData: discordRoles,
      rolesLoading,
      rolesError: rolesError ? rolesError.message : null
    });
  }, [user, discordRoles, rolesLoading, rolesError]);

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
    <div className="retro-window-content h-full overflow-y-auto bg-gray-100 p-4">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            User Profile
          </h2>
        </div>
        
        {/* User Info */}
        <div className="text-center mb-6 p-4 bg-white border-2 border-gray-300 retro-inset">
          <div className="flex justify-center mb-4">
            <img 
              src={user?.avatar || logoImage} 
              alt="Profile" 
              className="w-20 h-20 rounded border-2 border-gray-400" 
            />
          </div>
          <div className="text-xl font-bold text-black">{user?.username}</div>
          <div className="text-blue-600 mb-2">Level {user?.level || 1} Adventurer</div>
          {activeTitle && (
            <div className="inline-block px-3 py-1 bg-yellow-200 border border-yellow-400 text-yellow-800 text-sm">
              "{activeTitle}"
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white p-3 border-2 border-gray-300 retro-inset">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-black">Level</span>
            </div>
            <div className="text-xl font-bold text-blue-600">{user?.level || 1}</div>
          </div>
          
          <div className="bg-white p-3 border-2 border-gray-300 retro-inset">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-black">Items</span>
            </div>
            <div className="text-xl font-bold text-purple-600">
              {user?.inventory ? Object.values(user.inventory).reduce((a, b) => a + b, 0) : 0}
            </div>
          </div>
          
          <div className="bg-white p-3 border-2 border-gray-300 retro-inset">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-black">Quests</span>
            </div>
            <div className="text-xl font-bold text-green-600">12</div>
          </div>
          
          <div className="bg-white p-3 border-2 border-gray-300 retro-inset">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-black">XP</span>
            </div>
            <div className="text-xl font-bold text-orange-600">2,340</div>
          </div>
        </div>

        {/* Title Selection */}
        {titles && titles.length > 0 && (
          <div className="mb-6 p-3 bg-white border-2 border-gray-300 retro-inset">
            <h3 className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-600" />
              Titles
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {titles.map((title) => (
                <button
                  key={title}
                  onClick={() => setActiveTitle(title)}
                  disabled={isSetting}
                  className={`p-2 border text-left transition-all ${
                    activeTitle === title
                      ? 'bg-yellow-200 border-yellow-400 text-yellow-800'
                      : 'bg-gray-100 border-gray-300 text-black hover:bg-gray-200'
                  } ${isSetting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">"{title}"</span>
                    {activeTitle === title && (
                      <CheckCircle className="w-3 h-3 text-yellow-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Discord Roles - Small Section */}
        <div className="p-3 bg-white border-2 border-gray-300 retro-inset">
          <h3 className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            Discord Roles
          </h3>
          
          {discordRoles?.roles && discordRoles.roles.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {discordRoles.roles.map((role: any) => (
                <span
                  key={role.id}
                  className="px-2 py-1 bg-blue-100 border border-blue-300 text-blue-800 text-xs font-medium"
                >
                  {role.name}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-600">
              {!user?.discordId ? 'Not connected' : 'No roles found'}
            </div>
          )}
        </div>



    </div>
  );
};

export default ProfileWindow;