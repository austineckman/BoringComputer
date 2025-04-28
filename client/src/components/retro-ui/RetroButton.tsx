import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const RetroButton: React.FC<RetroButtonProps> = ({
  children,
  className,
  variant = 'primary',
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'px-4 py-1 border-2 font-bold text-sm',
        'hover:opacity-90 active:border-inset active:pt-[5px] active:pb-[3px]',
        disabled && 'opacity-50 cursor-not-allowed',
        variant === 'primary' && 'bg-[#d4d0c8] border-outset text-black',
        variant === 'secondary' && 'bg-[#000080] border-outset text-white',
        variant === 'danger' && 'bg-[#aa0000] border-outset text-white',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default RetroButton;