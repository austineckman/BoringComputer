import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Play, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface CircuitExample {
  id: string;
  name: string;
  description: string;
  arduinoCode: string;
  circuitData: any;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CircuitExamplesOracleViewProps {
  onCreateNew: () => void;
  onEditExample: (example: CircuitExample) => void;
}

const CircuitExamplesOracleView: React.FC<CircuitExamplesOracleViewProps> = ({ 
  onCreateNew, 
  onEditExample 
}) => {
  const { user } = useAuth();
  const [examples, setExamples] = useState<CircuitExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Load examples
  const loadExamples = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/circuit-examples/admin');
      if (response.ok) {
        const data = await response.json();
        setExamples(data);
      }
    } catch (error) {
      console.error('Error loading circuit examples:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamples();
  }, []);

  // Toggle publish status
  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/circuit-examples/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isPublished: !currentStatus
        })
      });

      if (response.ok) {
        await loadExamples();
      }
    } catch (error) {
      console.error('Error updating publish status:', error);
    }
  };

  // Delete example
  const deleteExample = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/circuit-examples/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadExamples();
      }
    } catch (error) {
      console.error('Error deleting circuit example:', error);
    }
  };

  // Filter examples
  const filteredExamples = examples.filter(example => {
    const matchesSearch = example.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         example.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && example.isPublished) ||
                         (statusFilter === 'draft' && !example.isPublished);
    
    return matchesSearch && matchesStatus;
  });

  // Generate circuit preview (simplified representation)
  const generateCircuitPreview = (circuitData: any) => {
    if (!circuitData?.components?.length) {
      return '/attached_assets/circuit-placeholder.png'; // Fallback image
    }
    
    // For now, return a placeholder. In the future, this could generate
    // a thumbnail of the actual circuit layout
    return '/attached_assets/circuit-example-preview.png';
  };

  return (
    <div className="h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-orange-400">Circuit Examples Management</h2>
            <p className="text-gray-400 mt-1">Create and manage circuit examples for students</p>
          </div>
          <button
            onClick={onCreateNew}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Create New Example</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search examples..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto h-[calc(100%-200px)]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400 text-lg">Loading examples...</div>
          </div>
        ) : filteredExamples.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-gray-400 text-lg mb-4">
              {examples.length === 0 ? "No circuit examples yet" : "No examples match your filters"}
            </div>
            {examples.length === 0 && (
              <button
                onClick={onCreateNew}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Create Your First Example</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredExamples.map((example) => (
              <div key={example.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-orange-500 transition-colors">
                {/* Circuit Preview Image */}
                <div className="relative h-48 bg-gray-700">
                  <img
                    src={generateCircuitPreview(example.circuitData)}
                    alt={`${example.name} circuit`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/attached_assets/circuit-placeholder.png';
                    }}
                  />
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-semibold ${
                    example.isPublished 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {example.isPublished ? 'PUBLISHED' : 'DRAFT'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                    {example.name}
                  </h3>
                  
                  {example.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {example.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 mb-4">
                    Created: {new Date(example.createdAt).toLocaleDateString()}
                    {example.updatedAt !== example.createdAt && (
                      <span className="ml-2">
                        • Updated: {new Date(example.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditExample(example)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium flex items-center justify-center space-x-1"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => togglePublishStatus(example.id, example.isPublished)}
                      className={`px-3 py-2 rounded text-sm font-medium flex items-center space-x-1 ${
                        example.isPublished
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                      title={example.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {example.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    
                    <button
                      onClick={() => deleteExample(example.id, example.name)}
                      className="px-3 py-2 rounded text-sm font-medium bg-red-600 hover:bg-red-700 flex items-center"
                      title="Delete Example"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            {filteredExamples.length} of {examples.length} examples shown
          </span>
          <span>
            {examples.filter(e => e.isPublished).length} published • {examples.filter(e => !e.isPublished).length} drafts
          </span>
        </div>
      </div>
    </div>
  );
};

export default CircuitExamplesOracleView;