import React from "react";
import { cn } from "@/lib/utils";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "disabled";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const PixelButton = React.forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth = false, children, disabled, ...props }, ref) => {
    const { playSound } = useSoundEffects();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        playSound("click");
        props.onClick?.(e);
      }
    };

    const handleMouseEnter = () => {
      if (!disabled) {
        playSound("hover");
      }
    };

    const variantStyles = {
      primary: "bg-brand-orange hover:bg-brand-yellow text-space-darkest font-bold",
      secondary: "bg-brand-gold hover:bg-brand-yellow text-space-darkest font-bold",
      accent: "bg-space-mid hover:bg-space-light text-brand-light",
      disabled: "bg-gray-500 text-gray-300 cursor-not-allowed"
    };

    const sizeStyles = {
      sm: "py-1 text-xs",
      md: "py-2 text-sm",
      lg: "py-3 text-base"
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "pixel-button transition-colors",
          variantStyles[disabled ? "disabled" : variant],
          sizeStyles[size],
          fullWidth ? "w-full" : "",
          className
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PixelButton.displayName = "PixelButton";

export default PixelButton;
