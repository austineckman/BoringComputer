import React from "react";
import { cn } from "@/lib/utils";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "disabled";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  soundEffect?: "click" | "laser" | "magic" | "success" | "achievement" | "quest";
}

const PixelButton = React.forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth = false, children, disabled, soundEffect = "click", ...props }, ref) => {
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
