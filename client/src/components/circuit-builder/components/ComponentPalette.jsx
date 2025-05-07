import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { componentOptions } from '../constants/componentOptions';

/**
 * Component palette for displaying available circuit components
 * 
 * @param {Object} props
 * @param {Function} props.onAddComponent - Callback when a component is selected
 */
const ComponentPalette = ({ onAddComponent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filteredComponents, setFilteredComponents] = useState(componentOptions);
  
  // Unique categories from component options
  const categories = ['all', ...new Set(componentOptions.map(c => c.category))];
  
  // Filter and search components based on current filters
  useEffect(() => {
    let filtered = componentOptions;
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(c => c.category === filterCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.displayName.toLowerCase().includes(searchLower) || 
        c.description.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredComponents(filtered);
  }, [searchTerm, filterCategory]);
  
  return (
    <div className="component-palette h-full flex flex-col">
      <h3 className="font-semibold text-lg mb-3">Component Palette</h3>
      
      {/* Search bar */}
      <div className="mb-3 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Category filters */}
      <div className="mb-3 flex flex-wrap gap-1">
        {categories.map(category => (
          <button
            key={category}
            className={`px-2 py-1 text-xs rounded-md ${
              filterCategory === category 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilterCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Component grid */}
      <div className="overflow-y-auto flex-1 grid grid-cols-2 gap-2">
        {filteredComponents.map(component => (
          <div 
            key={component.name}
            className="border border-gray-300 rounded-md p-2 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors"
            onClick={() => onAddComponent(component.name)}
          >
            <div className="aspect-square flex items-center justify-center mb-1 bg-gray-100 rounded overflow-hidden">
              <img 
                src={component.imagePath} 
                alt={component.displayName} 
                className="max-w-full max-h-full p-1"
              />
            </div>
            <div className="text-xs font-medium text-center truncate">
              {component.displayName}
            </div>
          </div>
        ))}
        
        {filteredComponents.length === 0 && (
          <div className="col-span-2 text-center text-gray-500 p-4">
            No components found
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentPalette;