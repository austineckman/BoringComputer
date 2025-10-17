import { useState } from 'react';
import { X, Save, Globe, Lock } from 'lucide-react';

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, isPublic: boolean, guestName?: string) => void;
  currentProjectName: string;
  isAuthenticated: boolean;
}

export const SaveProjectModal: React.FC<SaveProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentProjectName,
  isAuthenticated
}) => {
  const [projectName, setProjectName] = useState(currentProjectName);
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [guestName, setGuestName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(projectName, description, isPublic, isAuthenticated ? undefined : guestName);
    // Reset form
    setDescription('');
    setGuestName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Save className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Save Project</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project name"
            />
          </div>

          {/* Guest Name (only if not authenticated) */}
          {!isAuthenticated && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Your Name (optional)
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name (for attribution)"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe your project..."
            />
          </div>

          {/* Public/Private Toggle */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Visibility
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md border-2 transition-all ${
                  !isPublic
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <Lock size={18} />
                <span className="font-medium">Private</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md border-2 transition-all ${
                  isPublic
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <Globe size={18} />
                <span className="font-medium">Public</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {isPublic
                ? 'Anyone can view and load your project'
                : 'Only you can access this project'}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>{isPublic ? 'Publish' : 'Save'} Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
