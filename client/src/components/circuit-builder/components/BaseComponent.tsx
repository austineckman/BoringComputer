import React from 'react';

interface BaseComponentProps {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  rotate: number;
  isActive: boolean;
  handleMouseDown: (id: string, isActive: boolean) => void;
  handleDelete: () => void;
  children: React.ReactNode;
}

const BaseComponent: React.FC<BaseComponentProps> = ({
  id,
  left,
  top,
  width,
  height,
  rotate,
  isActive,
  handleMouseDown,
  handleDelete,
  children
}) => {
  // Options for the context menu
  const [showContextMenu, setShowContextMenu] = React.useState(false);
  const [contextMenuPos, setContextMenuPos] = React.useState({ x: 0, y: 0 });
  
  // Handle right-click for context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };
  
  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(false);
    };
    
    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContextMenu]);
  
  // Handle rotation from context menu
  const handleRotate = () => {
    // Trigger rotation logic
    // This will be implemented in the parent component
    setShowContextMenu(false);
    
    // Simulate pressing 'r' key to trigger rotation
    const event = new KeyboardEvent('keydown', { key: 'r' });
    window.dispatchEvent(event);
  };
  
  return (
    <div 
      className={`absolute transition-shadow ${isActive ? 'shadow-lg ring-2 ring-blue-500' : ''}`}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: 'center center',
        zIndex: isActive ? 50 : 10,
        cursor: 'move'
      }}
      onMouseDown={(e) => {
        // Only handle left-click for dragging
        if (e.button === 0) {
          e.stopPropagation();
          handleMouseDown(id, true);
        }
      }}
      onContextMenu={handleContextMenu}
    >
      {children}
      
      {/* Context Menu */}
      {showContextMenu && (
        <div 
          className="fixed bg-gray-800 text-white rounded shadow-lg border border-gray-700 z-50"
          style={{ 
            left: `${contextMenuPos.x}px`, 
            top: `${contextMenuPos.y}px`,
            minWidth: '120px'
          }}
        >
          <div className="py-1">
            <button 
              className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors"
              onClick={handleRotate}
            >
              Rotate
            </button>
            <button 
              className="block w-full text-left px-4 py-2 hover:bg-red-700 transition-colors text-red-400"
              onClick={() => {
                handleDelete();
                setShowContextMenu(false);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseComponent;