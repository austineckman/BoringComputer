import { useState } from 'react';
import { X, FolderOpen, Download, Globe, Lock, User, Calendar, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface CircuitProject {
  id: number;
  userId?: number;
  guestName?: string;
  name: string;
  description?: string;
  circuit: any;
  code: string;
  boardCodes?: Record<string, string>;
  thumbnail?: string;
  isPublic: boolean;
  tags?: string[];
  views?: number;
  likes?: number;
  createdAt: string;
  updatedAt: string;
}

interface BrowseProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProject: (project: CircuitProject) => void;
}

export const BrowseProjectsModal: React.FC<BrowseProjectsModalProps> = ({
  isOpen,
  onClose,
  onLoadProject
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch public projects
  const { data: publicProjects = [], isLoading } = useQuery<CircuitProject[]>({
    queryKey: ['/api/circuit-projects/public'],
    enabled: isOpen
  });

  // Filter projects based on search query
  const filteredProjects = publicProjects.filter(project => {
    const query = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const handleLoadProject = (project: CircuitProject) => {
    onLoadProject(project);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Browse Public Projects</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-700">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, description, or tags..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Loading projects...</div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FolderOpen size={48} className="mb-2 opacity-50" />
              <p>No public projects found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-all cursor-pointer group"
                  onClick={() => handleLoadProject(project)}
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors">
                      {project.name}
                    </h4>
                    {project.isPublic ? (
                      <Globe size={16} className="text-green-400 flex-shrink-0" title="Public" />
                    ) : (
                      <Lock size={16} className="text-gray-400 flex-shrink-0" title="Private" />
                    )}
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <User size={12} />
                        <span>{project.guestName || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {project.views !== undefined && (
                        <div className="flex items-center space-x-1">
                          <Eye size={12} />
                          <span>{project.views}</span>
                        </div>
                      )}
                      <Download size={14} className="text-blue-400 group-hover:text-blue-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 text-center text-sm text-gray-400">
          {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
        </div>
      </div>
    </div>
  );
};
