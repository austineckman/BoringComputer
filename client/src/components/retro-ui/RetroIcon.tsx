import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RetroIconProps {
  icon: ReactNode;
  className?: string;
}

const RetroIcon: React.FC<RetroIconProps> = ({ icon, className }) => {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      {icon}
    </div>
  );
};

export default RetroIcon;