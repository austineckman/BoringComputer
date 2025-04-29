import React from 'react';
import BaseComponent from './BaseComponent';
import CircuitPin from '../CircuitPin';
import { ComponentProps } from '../ComponentGenerator';

const BreadboardMiniComponent: React.FC<ComponentProps> = ({
  componentData,
  onPinClicked,
  isActive,
  handleMouseDown,
  handleDeleteComponent
}) => {
  const { id, attrs } = componentData;
  const { rotate = 0, top, left } = attrs;
  
  // Define pin rows and columns
  const pinRows = 5;  // 5 rows (a-e)
  const pinCols = 17; // 17 columns (1-17)
  
  // Breadboard connections follow these rules:
  // - Each half of each row is connected (a1-a17 are two separate rails)
  // - The power rails at the top and bottom run the full length
  
  // Generate pins based on row/column configuration
  const generatePins = () => {
    const pins = [];
    const startX = 10;
    const startY = 10;
    const pinSpacingX = 10;
    const pinSpacingY = 10;
    const midpoint = Math.floor(pinCols / 2);
    
    // Top power rail (positive)
    for (let col = 0; col < pinCols; col++) {
      pins.push({
        id: `plus-${col+1}`,
        x: startX + col * pinSpacingX,
        y: startY,
        color: '#ff6666', // Red for positive
        group: 'positive-rail'
      });
    }
    
    // Top power rail (negative)
    for (let col = 0; col < pinCols; col++) {
      pins.push({
        id: `minus-${col+1}`,
        x: startX + col * pinSpacingX,
        y: startY + pinSpacingY,
        color: '#aaaaaa', // Gray for negative
        group: 'negative-rail'
      });
    }
    
    // Component rows (a-e)
    const rowLabels = ['a', 'b', 'c', 'd', 'e'];
    for (let row = 0; row < rowLabels.length; row++) {
      for (let col = 0; col < pinCols; col++) {
        const rowLabel = rowLabels[row];
        const colNum = col + 1;
        
        // Determine which group this pin belongs to
        // Pins in a row are connected in two groups: 1-midpoint and midpoint+1-end
        const group = col < midpoint ? `${rowLabel}-left` : `${rowLabel}-right`;
        
        pins.push({
          id: `${rowLabel}${colNum}`,
          x: startX + col * pinSpacingX,
          y: startY + (row + 3) * pinSpacingY, // +3 to skip power rails and gap
          color: '#66ccff', // Blue for component pins
          group: group
        });
      }
    }
    
    // Bottom power rails (positive and negative)
    for (let col = 0; col < pinCols; col++) {
      pins.push({
        id: `plus-bottom-${col+1}`,
        x: startX + col * pinSpacingX,
        y: startY + (pinRows + 4) * pinSpacingY,
        color: '#ff6666', // Red for positive
        group: 'positive-rail-bottom'
      });
      
      pins.push({
        id: `minus-bottom-${col+1}`,
        x: startX + col * pinSpacingX,
        y: startY + (pinRows + 5) * pinSpacingY,
        color: '#aaaaaa', // Gray for negative
        group: 'negative-rail-bottom'
      });
    }
    
    return pins;
  };
  
  const pins = generatePins();
  
  return (
    <BaseComponent
      id={id}
      left={left}
      top={top}
      rotate={rotate}
      width={190}
      height={100}
      isActive={isActive}
      handleMouseDown={handleMouseDown}
      handleDelete={() => handleDeleteComponent(id)}
    >
      <svg width="190" height="100" viewBox="0 0 190 100" xmlns="http://www.w3.org/2000/svg">
        {/* Background patterns and textures */}
        <defs>
          <pattern id={`breadboard-dots-${id}`} width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="0.8" fill="#ddd" />
          </pattern>
          
          <linearGradient id={`breadboard-grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f3f3" />
            <stop offset="100%" stopColor="#e7e7e7" />
          </linearGradient>
        </defs>
        
        {/* Breadboard body - realistic plastic case */}
        <rect 
          x="0" 
          y="0" 
          width="190" 
          height="100" 
          rx="5" 
          ry="5" 
          fill={`url(#breadboard-grad-${id})`} 
          stroke="#ccc" 
          strokeWidth="1.5" 
        />
        <rect 
          x="2" 
          y="2" 
          width="186" 
          height="96" 
          rx="4" 
          ry="4" 
          fill="none" 
          stroke="#e0e0e0" 
          strokeWidth="0.5" 
        />
        
        {/* Pin matrix with subtle dot pattern */}
        <rect 
          x="5" 
          y="30" 
          width="180" 
          height="40" 
          fill={`url(#breadboard-dots-${id})`} 
          stroke="#ddd" 
          strokeWidth="0.5" 
        />
        
        {/* Center gap/channel */}
        <rect 
          x="85" 
          y="30" 
          width="20" 
          height="40" 
          fill="#e6e6e6" 
          stroke="#d4d4d4" 
          strokeWidth="0.5" 
        />
        <line 
          x1="85" 
          y1="30" 
          x2="85" 
          y2="70" 
          stroke="#ccc" 
          strokeWidth="0.5" 
          strokeDasharray="2,1" 
        />
        <line 
          x1="105" 
          y1="30" 
          x2="105" 
          y2="70" 
          stroke="#ccc" 
          strokeWidth="0.5" 
          strokeDasharray="2,1" 
        />
        
        {/* Power rails - color coded */}
        <rect x="5" y="5" width="180" height="20" rx="2" ry="2" fill="#f5f5ff" stroke="#d0d0e8" strokeWidth="0.5" />
        <rect x="5" y="75" width="180" height="20" rx="2" ry="2" fill="#f5f5ff" stroke="#d0d0e8" strokeWidth="0.5" />
        
        {/* Power rail markings */}
        <line x1="5" y1="15" x2="185" y2="15" stroke="#ff0000" strokeWidth="0.5" strokeOpacity="0.3" />
        <line x1="5" y1="85" x2="185" y2="85" stroke="#ff0000" strokeWidth="0.5" strokeOpacity="0.3" />
        <line x1="5" y1="25" x2="185" y2="25" stroke="#0000ff" strokeWidth="0.5" strokeOpacity="0.3" />
        <line x1="5" y1="95" x2="185" y2="95" stroke="#0000ff" strokeWidth="0.5" strokeOpacity="0.3" />
        
        {/* Power rail labels */}
        <text x="5" y="18" fontSize="7" fill="#ff0000" fontWeight="bold">+</text>
        <text x="5" y="28" fontSize="7" fill="#0000ff" fontWeight="bold">-</text>
        <text x="5" y="88" fontSize="7" fill="#ff0000" fontWeight="bold">+</text>
        <text x="5" y="98" fontSize="7" fill="#0000ff" fontWeight="bold">-</text>
        
        {/* Column labels for terminal strips */}
        <text x="185" y="40" fontSize="6" fill="#777" textAnchor="end" fontWeight="bold">a</text>
        <text x="185" y="50" fontSize="6" fill="#777" textAnchor="end" fontWeight="bold">b</text>
        <text x="185" y="60" fontSize="6" fill="#777" textAnchor="end" fontWeight="bold">c</text>
        <text x="185" y="70" fontSize="6" fill="#777" textAnchor="end" fontWeight="bold">d</text>
        <text x="185" y="40" fontSize="6" fill="#777" textAnchor="end" fontWeight="bold">a</text>
        <text x="185" y="50" fontSize="6" fill="#777" textAnchor="end" fontWeight="bold">b</text>
        <text x="185" y="60" fontSize="6" fill="#777" textAnchor="end" fontWeight="bold">c</text>
        <text x="185" y="70" fontSize="6" fill="#777" textAnchor="end" fontWeight="bold">d</text>
        <text x="185" y="40" fontSize="6" fill="#777" textAnchor="end" fontWeight="bold">a</text>
        
        {/* Row numbers - every 5 columns for readability */}
        {[1, 5, 10, 15].map(num => (
          <text 
            key={`col-${num}`} 
            x={10 + (num-1) * 10} 
            y="28" 
            fontSize="6" 
            fill="#777" 
            fontWeight="bold"
          >
            {num}
          </text>
        ))}
        
        {/* Border highlighting for 3D effect */}
        <rect 
          x="0" 
          y="0" 
          width="190" 
          height="100" 
          rx="5" 
          ry="5" 
          fill="none" 
          stroke="#fff" 
          strokeWidth="1" 
          opacity="0.5" 
          strokeDasharray="0 190 100 190" 
        />
        
        {/* Logo/branding */}
        <text 
          x="95" 
          y="50" 
          fontSize="7" 
          fill="#aaa" 
          textAnchor="middle" 
          fontWeight="bold"
        >
          HERO
        </text>
        <text 
          x="95" 
          y="57" 
          fontSize="5" 
          fill="#bbb" 
          textAnchor="middle"
        >
          MINI BREADBOARD
        </text>
      </svg>
      
      {/* Connection pins */}
      {pins.map(pin => (
        <CircuitPin
          key={`${id}-${pin.id}`}
          id={`${id}-${pin.id}`}
          x={pin.x}
          y={pin.y}
          onClick={() => onPinClicked(`${id}-${pin.id}`)}
          color={pin.color}
          size={4}
        />
      ))}
    </BaseComponent>
  );
};

export default BreadboardMiniComponent;