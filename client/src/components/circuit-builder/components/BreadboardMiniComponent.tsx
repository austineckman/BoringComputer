import React from 'react';
import BaseComponent from './BaseComponent';
import CircuitPin from '../CircuitPin';
import { ComponentProps } from '../ComponentGenerator';
import breadboardMiniIconPath from '../../../assets/components/breadboard-mini.icon.png';

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
      <div className="relative w-full h-full">
        {/* Use real breadboard image */}
        <img
          src={breadboardMiniIconPath}
          alt="Breadboard Mini Component"
          className="w-full h-full object-contain"
          style={{
            opacity: 0.95,
          }}
        />
      </div>
      
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