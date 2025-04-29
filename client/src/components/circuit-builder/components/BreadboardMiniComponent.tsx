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
        {/* Breadboard body */}
        <rect x="0" y="0" width="190" height="100" rx="5" ry="5" fill="#f0f0f0" stroke="#ccc" strokeWidth="1" />
        
        {/* Center divider */}
        <rect x="85" y="30" width="20" height="40" fill="#e0e0e0" />
        
        {/* Power rail markings */}
        <rect x="5" y="5" width="180" height="20" fill="#eef" stroke="#ddd" strokeWidth="0.5" />
        <rect x="5" y="75" width="180" height="20" fill="#eef" stroke="#ddd" strokeWidth="0.5" />
        
        {/* Power rail labels */}
        <text x="5" y="15" fontSize="8" fill="#f00">+</text>
        <text x="5" y="25" fontSize="8" fill="#000">-</text>
        <text x="5" y="85" fontSize="8" fill="#f00">+</text>
        <text x="5" y="95" fontSize="8" fill="#000">-</text>
        
        {/* Column labels */}
        <text x="185" y="40" fontSize="6" fill="#999" textAnchor="end">a</text>
        <text x="185" y="50" fontSize="6" fill="#999" textAnchor="end">b</text>
        <text x="185" y="60" fontSize="6" fill="#999" textAnchor="end">c</text>
        <text x="185" y="70" fontSize="6" fill="#999" textAnchor="end">d</text>
        
        {/* Row numbers - show every 5th column */}
        {[1, 5, 10, 15].map(num => (
          <text key={`col-${num}`} x={10 + (num-1) * 10} y="40" fontSize="6" fill="#999">{num}</text>
        ))}
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