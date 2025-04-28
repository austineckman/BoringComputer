import React from 'react';
import { cn } from '@/lib/utils';

interface RetroDividerProps {
  className?: string;
}

const RetroDivider: React.FC<RetroDividerProps> = ({ className }) => {
  return (
    <div className={cn('h-[2px] w-full border-t border-b', 'border-t-[#808080] border-b-[#ffffff]', className)} />
  );
};

export default RetroDivider;