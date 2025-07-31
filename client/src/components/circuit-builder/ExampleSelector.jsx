import React, { useState } from 'react';
import { Play, Eye, Copy, Book } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

/**
 * Example Selector Component for all users
 * Displays published circuit examples that users can load and run
 */
const ExampleSelector = ({ onLoadExample }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  // Fetch published examples
  const { data: examples = [], isLoading } = useQuery({
    queryKey: ['/api/circuit-examples']
  });

  // Filter examples by category
  const filteredExamples = selectedCategory === 'all' 
    ? examples 
    : examples.filter(example => example.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Examples' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'general', name: 'General' }
  ];

  const handleLoadExample = (example) => {
    onLoadExample(example);
    toast({
      title: "Example Loaded",
      description: `Loaded "${example.name}" circuit example`
    });
  };

  const copyCodeToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied",
      description: "Arduino code copied to clipboard"
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading examples...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Book size={20} />
          Circuit Examples
        </h3>
        <div className="text-sm text-gray-600">
          {filteredExamples.length} example{filteredExamples.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded text-sm border transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Examples List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredExamples.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {selectedCategory === 'all' 
              ? 'No examples available yet' 
              : `No ${selectedCategory} examples found`}
          </div>
        ) : (
          filteredExamples.map((example) => (
            <div
              key={example.id}
              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800">{example.name}</h4>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {example.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {example.description || 'No description provided'}
                  </p>
                  <div className="text-xs text-gray-500">
                    Components: {example.circuit?.components?.length || 0} • 
                    Wires: {example.circuit?.wires?.length || 0} • 
                    Created: {new Date(example.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => handleLoadExample(example)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded"
                    title="Load Example"
                  >
                    <Play size={16} />
                  </button>
                  <button
                    onClick={() => copyCodeToClipboard(example.code)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                    title="Copy Code"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              
              {/* Code Preview */}
              <div className="mt-3 bg-gray-50 rounded p-2">
                <div className="text-xs font-medium text-gray-700 mb-1">Code Preview:</div>
                <pre className="text-xs text-gray-600 overflow-hidden">
                  {example.code?.split('\n').slice(0, 3).join('\n')}
                  {example.code?.split('\n').length > 3 && '\n...'}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExampleSelector;