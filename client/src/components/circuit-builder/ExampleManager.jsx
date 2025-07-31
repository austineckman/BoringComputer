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
    // For quick save, auto-generate a name if none provided
    const timestamp = new Date().toLocaleTimeString();
    const exampleName = `Circuit Example ${timestamp}`;
    
    const exampleData = {
      name: exampleName,
      description: `Circuit saved on ${new Date().toLocaleDateString()}`,
      category: 'general',
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

  // Render as compact admin buttons in toolbar
  return (
    <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-600">
      <span className="text-gray-400 text-xs">Admin:</span>
      <button
        onClick={handleCreateExample}
        disabled={createMutation.isPending}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
        title="Save current circuit as example"
      >
        <Save size={14} />
        {createMutation.isPending ? 'Saving...' : 'Save Example'}
      </button>
      
      {examples.length > 0 && (
        <select
          onChange={(e) => {
            const example = examples.find(ex => ex.id === e.target.value);
            if (example) onLoadExample(example);
          }}
          className="bg-gray-700 text-white px-2 py-1 rounded text-sm border border-gray-600"
          defaultValue=""
        >
          <option value="" disabled>Load Examples</option>
          {examples.map((example) => (
            <option key={example.id} value={example.id}>
              {example.name} ({example.category})
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default ExampleManager;