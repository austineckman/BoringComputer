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
    <div className="h-full bg-gray-100 p-4 relative">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-black mb-2">Recycle Bin</h2>
        <p className="text-sm text-gray-600">Select a file to view its contents</p>
      </div>

      {/* File List */}
      <div className="grid grid-cols-1 gap-2 mb-4">
        {textFiles.map((file) => (
          <div
            key={file.id}
            className="flex items-center p-3 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleFileClick(file)}
          >
            <div className="flex items-center flex-1">
              {file.isPasswordProtected ? (
                <Lock className="w-4 h-4 mr-2 text-yellow-600" />
              ) : (
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
              )}
              <span className="text-sm font-medium text-black">{file.name}</span>
            </div>
            {file.isPasswordProtected && (
              <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                Protected
              </span>
            )}
          </div>
        ))}
      </div>

      {/* File Preview */}
      {selectedFile && !showPasswordDialog && (
        <div className="bg-white border border-gray-300 rounded p-4 mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-black">{selectedFile.name}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="bg-gray-50 p-3 rounded font-mono text-sm whitespace-pre-wrap text-black border">
            {accessDeniedFile === selectedFile.name ? (
              <div className="text-red-600 font-bold">
                {selectedFile.content}
              </div>
            ) : (
              selectedFile.content
            )}
          </div>
        </div>
      )}

      {/* Password Dialog */}
      {showPasswordDialog && selectedFile && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded border border-gray-300 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-black">Enter Password</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClosePasswordDialog}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This file requires a password to access: {selectedFile.name}
            </p>
            <div className="flex gap-2 mb-3">
              <Input
                type="password"
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                className="flex-1"
                autoFocus
              />
              <Button onClick={handlePasswordSubmit}>
                Open
              </Button>
            </div>
            {passwordError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                {passwordError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rummage Button */}
      <div className="mt-6 pt-4 border-t border-gray-300">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            // Simple non-intrusive feedback
            const button = document.activeElement as HTMLButtonElement;
            if (button) {
              const originalText = button.textContent;
              button.textContent = "Nothing found...";
              button.disabled = true;
              setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
              }, 2000);
            }
          }}
        >
          Rummage Through Bin
        </Button>
      </div>
    </div>
  );
};

export default RecycleBinWindow;