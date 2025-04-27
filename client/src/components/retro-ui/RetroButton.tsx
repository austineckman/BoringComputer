import React, { ButtonHTMLAttributes } from 'react';

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

const RetroButton: React.FC<RetroButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = "flex items-center justify-center font-sans cursor-pointer border-2 shadow-sm active:translate-y-px";
  
  const variantClasses = {
    primary: "bg-[#d4d0c8] border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] text-black hover:bg-[#e0dcd4] active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff]",
    secondary: "bg-[#e8e8e8] border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] text-gray-700 hover:bg-[#f4f4f4] active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff]",
    destructive: "bg-[#ff5050] border-t-[#ff8080] border-l-[#ff8080] border-r-[#880000] border-b-[#880000] text-white hover:bg-[#ff6060] active:border-t-[#880000] active:border-l-[#880000] active:border-r-[#ff8080] active:border-b-[#ff8080]",
  };
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };
  
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default RetroButton;