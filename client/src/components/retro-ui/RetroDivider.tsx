import React from 'react';

interface RetroDividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const RetroDivider: React.FC<RetroDividerProps> = ({ 
  className = '',
  orientation = 'horizontal' 
}) => {
  const baseClasses = orientation === 'horizontal' 
    ? 'h-[2px] w-full my-2' 
    : 'w-[2px] h-full mx-2';
  
  return (
    <div className={`flex ${baseClasses} ${className}`}>
      <div className="flex-1 bg-[#808080]"></div>
      <div className="flex-1 bg-[#ffffff]"></div>
    </div>
  );
};

export default RetroDivider;