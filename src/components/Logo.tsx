import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-8',
    md: 'w-10',
    lg: 'w-16',
    xl: 'w-24 md:w-32'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/logo-192.png"
        width={96}
        height={96} 
        alt="Ocean Tribe Foundation Logo" 
        className={`${sizeClasses[size]} h-auto transition-transform duration-300 hover:scale-105`}
      />
      {showText && (
        <span className="text-base sm:text-xl font-bold text-foreground ml-2 sm:ml-3 leading-tight transition-colors duration-300">
          Ocean Tribe Foundation
        </span>
      )}
    </div>
  );
};

export default Logo;

