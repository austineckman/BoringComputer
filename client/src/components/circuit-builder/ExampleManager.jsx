import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Edit, Eye, Copy } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Example Manager Component for Founder Role
 * Allows creating, editing, and managing circuit examples
 */
const ExampleManager = ({ 
  components, 
  wires, 
  code, 
  onLoadExample, 
  currentUser 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingExample, setEditingExample] = useState(null);
  const [exampleName, setExampleName] = useState('');
  const [exampleDescription, setExampleDescription] = useState('');
  const [exampleCategory, setExampleCategory] = useState('general');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user has founder role
  const isFounder = currentUser?.roles?.includes('Founder') || currentUser?.roles?.includes('admin');

  // Fetch examples
  const { data: examples = [], isLoading } = useQuery({
    queryKey: ['/api/circuit-examples'],
    enabled: isFounder
  });

  // Create example mutation
  const createMutation = useMutation({
    mutationFn: async (exampleData) => {
      return apiRequest('/api/circuit-examples', {
        method: 'POST',
        body: JSON.stringify(exampleData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/circuit-examples']);
      toast({
        title: "Example Created",
        description: "Circuit example has been saved successfully."
      });
      setIsCreating(false);
      setExampleName('');
      setExampleDescription('');
      setExampleCategory('general');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create example",
        variant: "destructive"
      });
    }
  });

  // Update example mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...exampleData }) => {
      return apiRequest(`/api/circuit-examples/${id}`, {
        method: 'PUT',
        body: JSON.stringify(exampleData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/circuit-examples']);
      toast({
        title: "Example Updated",
        description: "Circuit example has been updated successfully."
      });
      setEditingExample(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update example",
        variant: "destructive"
      });
    }
  });

  // Delete example mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return apiRequest(`/api/circuit-examples/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/circuit-examples']);
      toast({
        title: "Example Deleted",
        description: "Circuit example has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete example",
        variant: "destructive"
      });
    }
  });

  const handleCreateExample = () => {
    if (!exampleName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an example name",
        variant: "destructive"
      });
      return;
    }

    const exampleData = {
      name: exampleName.trim(),
      description: exampleDescription.trim(),
      category: exampleCategory,
      code: code,
      circuit: {
        components: components,
        wires: wires
      },
      isExample: true,
      isPublic: true
    };

    createMutation.mutate(exampleData);
  };

  const handleUpdateExample = () => {
    if (!editingExample || !exampleName.trim()) return;

    const exampleData = {
      id: editingExample.id,
      name: exampleName.trim(),
      description: exampleDescription.trim(),
      category: exampleCategory,
      code: code,
      circuit: {
        components: components,
        wires: wires
      }
    };

    updateMutation.mutate(exampleData);
  };

  const handleLoadExample = (example) => {
    onLoadExample(example);
    toast({
      title: "Example Loaded",
      description: `Loaded "${example.name}" example`
    });
  };

  const handleEditExample = (example) => {
    setEditingExample(example);
    setExampleName(example.name);
    setExampleDescription(example.description || '');
    setExampleCategory(example.category || 'general');
    setIsCreating(true);
  };

  const handleDeleteExample = (example) => {
    if (window.confirm(`Are you sure you want to delete "${example.name}"?`)) {
      deleteMutation.mutate(example.id);
    }
  };

  const cancelEditing = () => {
    setIsCreating(false);
    setEditingExample(null);
    setExampleName('');
    setExampleDescription('');
    setExampleCategory('general');
  };

  if (!isFounder) {
    return null; // Don't render for non-founder users
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          📚 Circuit Examples Manager
        </h3>
        <div className="flex items-center gap-2">
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
            >
              <Plus size={16} />
              Create Example
            </button>
          )}
        </div>
      </div>

      {isCreating && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border">
          <h4 className="font-medium mb-3">
            {editingExample ? 'Update Example' : 'Create New Example'}
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Example Name
              </label>
              <input
                type="text"
                value={exampleName}
                onChange={(e) => setExampleName(e.target.value)}
                placeholder="e.g., LED Blink with Buzzer"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={exampleDescription}
                onChange={(e) => setExampleDescription(e.target.value)}
                placeholder="Brief description of what this example demonstrates..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={exampleCategory}
                onChange={(e) => setExampleCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="general">General</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Current circuit: {components.length} components, {wires.length} wires
              </div>
              <div className="flex gap-2">
                <button
                  onClick={cancelEditing}
                  className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={editingExample ? handleUpdateExample : handleCreateExample}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  <Save size={16} />
                  {editingExample ? 'Update' : 'Save'} Example
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Saved Examples ({examples.length})</h4>
        
        {isLoading ? (
          <div className="text-gray-500 text-sm">Loading examples...</div>
        ) : examples.length === 0 ? (
          <div className="text-gray-500 text-sm">No examples created yet</div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {examples.map((example) => (
              <div
                key={example.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{example.name}</div>
                  <div className="text-xs text-gray-600">
                    {example.description || 'No description'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Category: {example.category} • 
                    Components: {example.circuit?.components?.length || 0} •
                    Created: {new Date(example.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleLoadExample(example)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                    title="Load Example"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEditExample(example)}
                    className="p-2 text-yellow-600 hover:bg-yellow-100 rounded"
                    title="Edit Example"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteExample(example)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                    title="Delete Example"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExampleManager;