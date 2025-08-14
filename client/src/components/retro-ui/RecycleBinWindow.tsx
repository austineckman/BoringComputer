import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Lock, X } from 'lucide-react';

interface RecycleBinWindowProps {
  onClose: () => void;
}

interface TextFile {
  id: string;
  name: string;
  content: string;
  isPasswordProtected: boolean;
  password?: string;
}

const RecycleBinWindow: React.FC<RecycleBinWindowProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<TextFile | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [accessDeniedFile, setAccessDeniedFile] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Three simple text files
  const textFiles: TextFile[] = [
    {
      id: 'system_log',
      name: 'system_log.txt',
      content: 'ACCESS DENIED\n\nThis file contains sensitive system information and cannot be accessed.',
      isPasswordProtected: false
    },
    {
      id: 'debug_trace',
      name: 'debug_trace.txt', 
      content: 'ACCESS DENIED\n\nDebug trace files are restricted to authorized personnel only.',
      isPasswordProtected: false
    },
    {
      id: 'secret_notes',
      name: 'secret_notes.txt',
      content: 'Welcome, Gamer!\n\nYou found the secret file! This hidden area contains special notes from the developers.\n\nCongratulations on discovering the password. Keep exploring - there are more secrets to find in the system.\n\n- The Development Team',
      isPasswordProtected: true,
      password: 'hellogamer'
    }
  ];

  const handleFileClick = (file: TextFile) => {
    if (file.isPasswordProtected) {
      setSelectedFile(file);
      setShowPasswordDialog(true);
      setPasswordInput("");
    } else {
      // Show access denied message for non-password protected files
      setAccessDeniedFile(file.name);
      setSelectedFile(file);
      setTimeout(() => setAccessDeniedFile(null), 3000);
    }
  };

  const handlePasswordSubmit = () => {
    if (selectedFile && passwordInput === selectedFile.password) {
      setShowPasswordDialog(false);
      setPasswordInput("");
      setPasswordError(null);
      // File content will be shown in preview
    } else {
      setPasswordInput("");
      setPasswordError("Incorrect password! Access denied.");
      setTimeout(() => setPasswordError(null), 3000);
    }
  };

  const handleClosePasswordDialog = () => {
    setShowPasswordDialog(false);
    setSelectedFile(null);
    setPasswordInput("");
    setPasswordError(null);
  };

  return (
    <div className="h-full bg-white relative" style={{ fontFamily: 'MS Sans Serif, sans-serif' }}>
      {/* Windows-style Menu Bar */}
      <div className="bg-gray-200 border-b border-gray-400 px-2 py-1">
        <div className="flex space-x-4 text-xs">
          <span className="cursor-pointer hover:bg-gray-300 px-2 py-1">File</span>
          <span className="cursor-pointer hover:bg-gray-300 px-2 py-1">Edit</span>
          <span className="cursor-pointer hover:bg-gray-300 px-2 py-1">View</span>
          <span className="cursor-pointer hover:bg-gray-300 px-2 py-1">Help</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-200 border-b border-gray-400 px-2 py-1 flex items-center space-x-1">
        <div className="w-6 h-6 bg-gray-300 border border-gray-400 flex items-center justify-center text-xs cursor-pointer hover:bg-gray-400">
          ↺
        </div>
        <div className="w-6 h-6 bg-gray-300 border border-gray-400 flex items-center justify-center text-xs cursor-pointer hover:bg-gray-400">
          ⌂
        </div>
        <div className="border-l border-gray-400 h-6 mx-2"></div>
        <div className="text-xs text-gray-600">3 object(s)</div>
      </div>

      {/* File Icons Area */}
      <div className="p-4 bg-white flex-1 overflow-auto" style={{ minHeight: '300px' }}>
        <div className="grid grid-cols-4 gap-6">
          {textFiles.map((file) => (
            <div
              key={file.id}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => handleFileClick(file)}
              onDoubleClick={() => handleFileClick(file)}
            >
              {/* File Icon */}
              <div className="relative mb-2 group-hover:bg-blue-100 p-1 rounded">
                {file.isPasswordProtected ? (
                  <div className="w-8 h-10 bg-yellow-100 border border-gray-400 flex items-center justify-center relative">
                    <FileText className="w-6 h-6 text-gray-600" />
                    <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full border border-gray-400" />
                  </div>
                ) : (
                  <div className="w-8 h-10 bg-gray-100 border border-gray-400 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-600" />
                  </div>
                )}
              </div>
              {/* File Name */}
              <div className="text-xs text-center text-black max-w-16 group-hover:bg-blue-600 group-hover:text-white px-1 py-0.5 rounded">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-200 border-t border-gray-400 px-2 py-1 text-xs text-gray-600">
        {selectedFile ? `Selected: ${selectedFile.name}` : '3 object(s)'}
      </div>

      {/* File Preview (Windows Notepad style) */}
      {selectedFile && !showPasswordDialog && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="bg-white border-2 border-gray-400 shadow-lg" style={{ width: '400px', height: '300px', fontFamily: 'MS Sans Serif, sans-serif' }}>
            {/* Notepad Title Bar */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-2 py-1 flex justify-between items-center text-xs">
              <span>{selectedFile.name} - Notepad</span>
              <button 
                className="w-4 h-4 bg-gray-300 text-black flex items-center justify-center text-xs hover:bg-red-500 hover:text-white"
                onClick={() => setSelectedFile(null)}
              >
                ×
              </button>
            </div>
            
            {/* Notepad Menu */}
            <div className="bg-gray-200 border-b border-gray-400 px-2 py-1">
              <div className="flex space-x-4 text-xs">
                <span className="cursor-pointer hover:bg-gray-300 px-1">File</span>
                <span className="cursor-pointer hover:bg-gray-300 px-1">Edit</span>
                <span className="cursor-pointer hover:bg-gray-300 px-1">Search</span>
                <span className="cursor-pointer hover:bg-gray-300 px-1">Help</span>
              </div>
            </div>
            
            {/* Text Content */}
            <div className="p-2 h-full overflow-auto bg-white font-mono text-xs" style={{ height: 'calc(100% - 60px)' }}>
              {accessDeniedFile === selectedFile.name ? (
                <div className="text-red-600 font-bold">
                  {selectedFile.content}
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-black">{selectedFile.content}</pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Password Dialog (Windows 95 style) */}
      {showPasswordDialog && selectedFile && (
        <div className="absolute inset-0 bg-gray-200 bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-200 border-2 border-gray-400 shadow-lg" style={{ width: '320px', fontFamily: 'MS Sans Serif, sans-serif' }}>
            {/* Dialog Title Bar */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-2 py-1 flex justify-between items-center text-xs">
              <span>Password Required</span>
              <button 
                className="w-4 h-4 bg-gray-300 text-black flex items-center justify-center text-xs hover:bg-red-500 hover:text-white"
                onClick={handleClosePasswordDialog}
              >
                ×
              </button>
            </div>
            
            {/* Dialog Content */}
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-yellow-400 border border-gray-600 flex items-center justify-center mr-3 text-black font-bold">
                  !
                </div>
                <div className="text-xs text-black">
                  This file is password protected.<br/>
                  Please enter the password to continue.
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-xs text-black mb-1">Password:</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  className="w-full px-2 py-1 border border-gray-600 text-xs"
                  style={{ fontFamily: 'MS Sans Serif, sans-serif' }}
                  autoFocus
                />
              </div>
              
              {passwordError && (
                <div className="mb-3 text-xs text-red-600">
                  {passwordError}
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <button 
                  className="px-4 py-1 bg-gray-300 border border-gray-600 text-xs hover:bg-gray-400"
                  onClick={handleClosePasswordDialog}
                  style={{ fontFamily: 'MS Sans Serif, sans-serif' }}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-1 bg-gray-300 border border-gray-600 text-xs hover:bg-gray-400"
                  onClick={handlePasswordSubmit}
                  style={{ fontFamily: 'MS Sans Serif, sans-serif' }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecycleBinWindow;