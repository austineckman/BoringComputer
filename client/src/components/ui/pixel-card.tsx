import React from "react";
import { cn } from "@/lib/utils";

interface PixelCardProps {
  className?: string;
  children: React.ReactNode;
  active?: boolean;
  interactive?: boolean;
}

const PixelCard = ({
  className,
  children,
  active = false,
  interactive = false,
}: PixelCardProps) => {
  return (
    <div
      className={cn(
        "pixel-border bg-space-mid rounded-lg overflow-hidden",
        interactive && "quest-card",
        active && "border-2 border-brand-orange",
        className
      )}
    >
      {children}
    </div>
  );
};

export const PixelCardHeader = ({
  className,
  children,
  color = "bg-space-light",
}: {
  className?: string;
  children: React.ReactNode;
  color?: string;
}) => {
  return (
    <div
      className={cn(
        `${color} px-4 py-2 flex justify-between items-center`,
        className
      )}
    >
      {children}
    </div>
  );
};

export const PixelCardContent = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return <div className={cn("p-5", className)}>{children}</div>;
};

export default PixelCard;
