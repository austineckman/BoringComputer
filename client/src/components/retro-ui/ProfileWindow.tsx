import React, { useState } from 'react';
import { User, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import logoImage from "@assets/Asset 6@2x-8.png";

interface ProfileWindowProps {
  onClose: () => void;
}

const ProfileWindow: React.FC<ProfileWindowProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Mock update for now - would be connected to API later
      // In a real implementation, we would call an API endpoint to update the user profile
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-blue-900 text-white p-2 flex items-center">
        <User size={18} className="mr-2" />
        <span className="font-bold">Profile Settings</span>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 bg-gray-100 overflow-y-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500 mb-3">
            <img 
              src={logoImage} 
              alt="Profile" 
              className="w-14 h-14" 
            />
          </div>
          <div className="text-lg font-bold">{user?.username}</div>
          <div className="text-sm text-gray-500">Level {user?.level || 1} Adventurer</div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email (optional)
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-2">
              <h3 className="font-medium mb-3">Change Password (optional)</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="oldPassword">
                    Current Password
                  </label>
                  <input
                    id="oldPassword"
                    type="password"
                    className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="newPassword">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="bg-white rounded-md border border-gray-300 p-3 mb-4">
            <h3 className="font-medium mb-2 text-blue-900">Character Stats</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Level:</span>
                <span className="font-medium">{user?.level || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Items:</span>
                <span className="font-medium">{user?.inventory ? Object.keys(user.inventory).length : 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quests Completed:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Experience:</span>
                <span className="font-medium">0 XP</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileWindow;