import React, { useState, useRef } from 'react';
import { Upload, Package, Check, X, Plus } from 'lucide-react';
import axios from 'axios';

interface LibraryUploaderProps {
  onLibraryAdded: (libraryName: string) => void;
  className?: string;
}

const LibraryUploader: React.FC<LibraryUploaderProps> = ({ onLibraryAdded, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.zip')) {
      setMessage({ type: 'error', text: 'Please upload a .zip library file' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('library', file);

      const response = await axios.post('/api/arduino-libraries/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: `${response.data.libraryName} added successfully` });
        onLibraryAdded(response.data.libraryName);
        setIsExpanded(false);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Upload failed' });
      }
    } catch (error) {
      console.error('Library upload error:', error);
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isExpanded) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 
            border border-blue-500/30 rounded text-blue-300 transition-colors"
          title="Add Arduino Library"
        >
          <Plus className="w-3 h-3" />
          <span>Library</span>
        </button>
        
        {message && (
          <div className={`absolute top-8 left-0 z-50 px-2 py-1 text-xs rounded shadow-lg ${
            message.type === 'success' 
              ? 'bg-green-900/90 text-green-200 border border-green-500/50' 
              : 'bg-red-900/90 text-red-200 border border-red-500/50'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="bg-gray-900/95 border border-gray-600 rounded-lg p-3 shadow-xl min-w-64">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-white flex items-center">
            <Package className="w-4 h-4 mr-1" />
            Add Library
          </h4>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-gray-400">
            Upload Arduino library (.zip file)
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-xs text-gray-300 file:mr-2 file:py-1 file:px-2 
              file:rounded file:border-0 file:text-xs file:bg-blue-600 file:text-white 
              file:hover:bg-blue-700 file:transition-colors file:cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {uploading && (
            <div className="flex items-center space-x-2 text-xs text-blue-300">
              <div className="w-3 h-3 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading...</span>
            </div>
          )}

          {message && (
            <div className={`text-xs p-2 rounded ${
              message.type === 'success' 
                ? 'bg-green-900/50 text-green-200' 
                : 'bg-red-900/50 text-red-200'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-3 h-3 inline mr-1" />
              ) : (
                <X className="w-3 h-3 inline mr-1" />
              )}
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryUploader;