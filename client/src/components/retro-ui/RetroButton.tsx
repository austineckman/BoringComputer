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
  const baseStyles = 'px-3 py-1 text-sm font-bold border-2 active:border-inset active:pt-[5px] active:pb-[3px] select-none';
  
  const variantStyles = {
    primary: 'bg-[#c0c0c0] border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] text-black',
    secondary: 'bg-[#d0d0d0] border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] text-black',
    danger: 'bg-[#ff0000] border-t-[#ffaaaa] border-l-[#ffaaaa] border-r-[#aa0000] border-b-[#aa0000] text-white'
  };
  
  const disabledStyles = disabled 
    ? 'opacity-50 cursor-not-allowed border-inset bg-[#c0c0c0] border-t-[#808080] border-l-[#808080] border-r-[#ffffff] border-b-[#ffffff]' 
    : 'cursor-pointer hover:bg-[#d0d0d0]';

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        disabledStyles,
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