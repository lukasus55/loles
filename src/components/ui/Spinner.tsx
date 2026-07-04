import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full border-neutral-800 animate-spin absolute`}
        style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
      ></div>
      <div 
        className={`${sizeClasses[size]} rounded-full border-red-600 animate-spin`}
        style={{ borderBottomColor: 'transparent', borderLeftColor: 'transparent', animationDirection: 'reverse', animationDuration: '1s' }}
      ></div>
    </div>
  );
};
