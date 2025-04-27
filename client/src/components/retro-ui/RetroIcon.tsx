import React, { ReactNode } from 'react';

interface RetroIconProps {
  icon: ReactNode;
  className?: string;
  onClick?: () => void;
}

const RetroIcon: React.FC<RetroIconProps> = ({ 
  icon, 
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`inline-flex items-center justify-center ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {icon}
    </div>
  );
};

export default RetroIcon;