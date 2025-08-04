import React, { useState, useRef } from 'react';
import { Package, Check, X } from 'lucide-react';
import axios from 'axios';

interface LibraryUploaderProps {
  onUploadComplete?: (success: boolean, message?: string) => void;
  className?: string;
}

const LibraryUploader: React.FC<LibraryUploaderProps> = ({ onUploadComplete, className = '' }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.zip')) {
      const errorMessage = 'Please upload a .zip library file';
      setMessage({ type: 'error', text: errorMessage });
      onUploadComplete?.(false, errorMessage);
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
        const successMessage = `${response.data.libraryName} added successfully`;
        setMessage({ type: 'success', text: successMessage });
        onUploadComplete?.(true, successMessage);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorMessage = response.data.message || 'Upload failed';
        setMessage({ type: 'error', text: errorMessage });
        onUploadComplete?.(false, errorMessage);
      }
    } catch (error) {
      console.error('Library upload error:', error);
      const errorMessage = 'Network error occurred';
      setMessage({ type: 'error', text: errorMessage });
      onUploadComplete?.(false, errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`${className}`}>
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-white mb-2 flex items-center justify-center">
            <Package className="w-5 h-5 mr-2" />
            Upload Arduino Library
          </h3>
          <p className="text-sm text-gray-400">
            Upload a .zip file containing your Arduino library
          </p>
        </div>
        
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 
              file:rounded-lg file:border-0 file:text-sm file:bg-blue-600 file:text-white 
              file:hover:bg-blue-700 file:transition-colors file:cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600 
              rounded-lg bg-gray-800/50 p-2"
          />

          {uploading && (
            <div className="flex items-center justify-center space-x-2 text-sm text-blue-300">
              <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading library...</span>
            </div>
          )}

          {message && (
            <div className={`text-sm p-3 rounded-lg flex items-center ${
              message.type === 'success' 
                ? 'bg-green-900/50 text-green-200 border border-green-500/50' 
                : 'bg-red-900/50 text-red-200 border border-red-500/50'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-4 h-4 mr-2 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 mr-2 flex-shrink-0" />
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