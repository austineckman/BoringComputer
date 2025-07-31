import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Trash2, Edit, Play } from 'lucide-react';
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

interface CircuitExamplesWindowProps {
  onClose: () => void;
  onLoadExample?: (example: CircuitExample) => void;
}

const CircuitExamplesWindow: React.FC<CircuitExamplesWindowProps> = ({ onClose, onLoadExample }) => {
  const { user } = useAuth();
  const [examples, setExamples] = useState<CircuitExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'public' | 'admin'>('public');
  
  // Check if user has admin/founder privileges
  const hasAdminAccess = user?.roles?.includes('admin') || user?.roles?.includes('Founder') || user?.roles?.includes('CraftingTable');

  // Load examples
  const loadExamples = async () => {
    setLoading(true);
    try {
      const endpoint = selectedTab === 'admin' && hasAdminAccess 
        ? '/api/circuit-examples/admin' 
        : '/api/circuit-examples';
      
      const response = await fetch(endpoint);
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
  }, [selectedTab]);

  // Toggle publish status (admin only)
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

  // Delete example (admin only)
  const deleteExample = async (id: string) => {
    if (!confirm('Are you sure you want to delete this circuit example?')) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border-2 border-gray-600 rounded-lg shadow-lg w-5/6 h-5/6 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 p-4 flex items-center justify-between border-b border-gray-600 rounded-t-lg">
          <h2 className="text-xl font-bold text-white">Circuit Examples</h2>
          <button 
            onClick={onClose}
            className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedTab('public')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                selectedTab === 'public'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Public Examples
            </button>
            {hasAdminAccess && (
              <button
                onClick={() => setSelectedTab('admin')}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  selectedTab === 'admin'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Admin Management
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading examples...</div>
            </div>
          ) : examples.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">
                {selectedTab === 'admin' ? 'No examples found.' : 'No public examples available.'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {examples.map((example) => (
                <div key={example.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white truncate">{example.name}</h3>
                    <div className="flex items-center space-x-1 ml-2">
                      {selectedTab === 'admin' && (
                        <>
                          <button
                            onClick={() => togglePublishStatus(example.id, example.isPublished)}
                            className={`p-1 rounded text-xs ${
                              example.isPublished 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-gray-600 hover:bg-gray-500'
                            }`}
                            title={example.isPublished ? 'Published (click to unpublish)' : 'Draft (click to publish)'}
                          >
                            {example.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button
                            onClick={() => deleteExample(example.id)}
                            className="p-1 rounded text-xs bg-red-600 hover:bg-red-700"
                            title="Delete example"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {example.description && (
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{example.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span>Created: {new Date(example.createdAt).toLocaleDateString()}</span>
                    {selectedTab === 'admin' && (
                      <span className={`px-2 py-1 rounded ${
                        example.isPublished ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}>
                        {example.isPublished ? 'Published' : 'Draft'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {onLoadExample && (
                      <button
                        onClick={() => onLoadExample(example)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                      >
                        <Play size={14} className="mr-1" />
                        Load Example
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircuitExamplesWindow;