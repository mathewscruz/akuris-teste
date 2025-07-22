
import React from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  type?: 'fade' | 'slide' | 'scale';
  delay?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className,
  type = 'fade',
  delay = 0
}) => {
  const getAnimationClass = () => {
    switch (type) {
      case 'slide':
        return 'animate-slide-in';
      case 'scale':
        return 'animate-scale-in';
      default:
        return 'animate-fade-in';
    }
  };

  const style = delay > 0 ? { animationDelay: `${delay}ms` } : undefined;

  return (
    <div 
      className={cn(getAnimationClass(), className)} 
      style={style}
    >
      {children}
    </div>
  );
};
