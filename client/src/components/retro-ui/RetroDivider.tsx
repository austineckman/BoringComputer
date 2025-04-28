import React from 'react';
import { cn } from '@/lib/utils';

interface RetroDividerProps {
  className?: string;
}

const RetroDivider: React.FC<RetroDividerProps> = ({ className }) => {
  return (
    <div className={cn('w-full h-[2px] my-1', className)}>
      <div className="w-full h-[1px] border-t border-[#808080]" />
      <div className="w-full h-[1px] border-t border-white" />
    </div>
  );
};

export default RetroDivider;