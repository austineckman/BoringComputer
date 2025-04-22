import { cn } from '@/lib/utils';
import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('container mx-auto px-4 sm:px-6 lg:px-8', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';