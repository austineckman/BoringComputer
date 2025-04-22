import React from "react";
import { cn } from "@/lib/utils";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "disabled" | "danger" | "warning" | "success";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  soundEffect?: "click" | "laser" | "magic" | "success" | "achievement" | "quest" | "powerUp" | "teleport" | "engine" | "error";
  glow?: boolean;
  animated?: boolean;
}

const PixelButton = React.forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ 
    className, 
    variant = "primary", 
    size = "md", 
    fullWidth = false, 
    children, 
    disabled, 
    soundEffect = "click", 
    glow = false,
    animated = false,
    ...props 
  }, ref) => {
    const { sounds } = useSoundEffects();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        // Play different sounds based on button type
        switch(soundEffect) {
          case "laser":
            sounds.spaceDoor();
            break;
          case "magic":
            sounds.powerUp();
            break;
          case "success":
            sounds.success();
            break;
          case "achievement":
            sounds.achievement();
            break;
          case "quest":
            sounds.questAccept();
            break;
          case "powerUp":
            sounds.powerUp();
            break;
          case "teleport":
            sounds.spaceDoor();
            break;
          case "engine":
            sounds.boostEngine();
            break;
          case "error":
            sounds.error();
            break;
          default:
            sounds.click();
        }
        
        props.onClick?.(e);
      }
    };

    const handleMouseEnter = () => {
      if (!disabled) {
        sounds.hover();
      }
    };

    const variantStyles = {
      primary: "bg-brand-orange hover:bg-brand-yellow text-space-darkest font-bold",
      secondary: "bg-brand-gold hover:bg-brand-yellow text-space-darkest font-bold",
      accent: "bg-space-mid hover:bg-space-light text-brand-light",
      danger: "bg-red-600 hover:bg-red-500 text-white font-bold",
      warning: "bg-yellow-500 hover:bg-yellow-400 text-space-darkest font-bold",
      success: "bg-green-600 hover:bg-green-500 text-white font-bold",
      disabled: "bg-gray-500 text-gray-300 cursor-not-allowed"
    };

    const sizeStyles = {
      sm: "py-1 px-2 text-xs",
      md: "py-2 px-3 text-sm",
      lg: "py-3 px-4 text-base",
      xl: "py-4 px-6 text-lg"
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "pixel-button transition-colors",
          variantStyles[disabled ? "disabled" : variant as keyof typeof variantStyles],
          sizeStyles[size as keyof typeof sizeStyles],
          fullWidth ? "w-full" : "",
          glow && !disabled && "button-glow",
          animated && !disabled && "button-animated",
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
