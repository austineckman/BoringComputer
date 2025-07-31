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

  // Render as horizontal buttons instead of sidebar
  return (
    <div className="flex items-center space-x-2">
      {/* Category Filter Dropdown */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="bg-gray-700 text-white px-2 py-1 rounded text-sm border border-gray-600"
      >
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {/* Example buttons */}
      {filteredExamples.slice(0, 5).map((example) => (
        <button
          key={example.id}
          onClick={() => handleLoadExample(example)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm whitespace-nowrap"
          title={example.description}
        >
          {example.name}
        </button>
      ))}
      
      {filteredExamples.length > 5 && (
        <span className="text-gray-400 text-sm">
          +{filteredExamples.length - 5} more
        </span>
      )}
    </div>
  );
};

export default ExampleSelector;